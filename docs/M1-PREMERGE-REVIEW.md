# M1 pre-merge review — PR #1

Reviewed 2026-11-17 (Asia/Taipei). PR: https://github.com/mini1060919-code/LR-Anime/pull/1

The initial PR head was `3d5082f9d9a2a31eb5dd214061821e48aee9ebbe`, on `feature/save-protection-v5`, targeting `develop` (confirmed from the PR page and Git pull ref). Corrections remain on that same branch. This review does not merge or deploy anything.

## Findings and corrections

| Severity | Finding in the initial M1 implementation | Correction and evidence |
| --- | --- | --- |
| High | Every changed dawn/boot stored another immutable UUID archive. Lifetime storage use was unbounded, eventually blocking saves. | Known v5 backups now share a **three-record rotation pool**. Reuse the oldest eligible key via atomic `localStorage.setItem`; verify the archive before touching the active save. A 200-dawn test under a 16 KiB simulated quota keeps the last three checkpoints and saves day 200 successfully. Unchanged v5 payloads do not rewrite the timestamp or create archives. |
| High | There was no persistent way to exempt an important backup from a future retention policy. | **Keep permanently** persists a pin on the archive. Rotation cannot select pins. Releasing protection requires **Allow rotation** plus confirmation. Tests preserve exact pinned bytes through later rotation and verify failed pin writes do not report success. |
| Medium | A single malformed archive caused `listBackups` to fail, hiding every other recovery download. | Parse records separately. Malformed/future/unrestorable archives remain protected and downloadable; other archives stay visible. Never infer that missing/unrecognized metadata means safe to rotate. |
| Medium | Storage failures were surfaced but quota recovery guidance was generic. | `QuotaExceededError` explicitly reports **Storage full**, that saving stopped, and that existing progress/permanent backups remain protected. Main-save failure after a successful archive retains both the active bytes and that archive. No eviction of pinned records to make room. |
| Medium | A crafted legacy payload mixing absent and explicit building IDs could reconstruct duplicate IDs. | Reject mixed IDs through the validated storage path, preserving the raw original. Normal v4 saves contain IDs, and all-absent legacy fixtures retain their supported default path. |

## Retention and failure contract

- The pool of three is shared by normal autosave, manual-slot replacement, load/import rollback and explicit restart/defeat archives. It is bounded by record count, not a promise of unlimited space for arbitrary-sized saves.
- New archive metadata is `{format: "last-refuge-backup", version: 1, key, raw, reason, savedAt, sequence, pinned}`. A monotonic sequence determines recency even when wall-clock timestamps tie or move backward.
- Previously created M1 archives have no retention metadata, so they are **permanent by default**. Valid legacy archives can only become eligible after the user explicitly allows rotation. Upgrading does not automatically delete a user's existing collection.
- The exact v4 bytes archived during migration are permanent by default. Explicit recovery of malformed/unknown input also preserves the raw original permanently. Invalid/future archive formats and archives that cannot reconstruct their saved world are never eligible for automatic rotation.
- Automatic operations never unpin an archive. Pinned bytes survive later saves and reloads. Protection is against the application's rotation, not browser profile clearing, eviction, disk failure or deliberate external edits; export independent copies.
- First validate the proposed save, then inspect the current value, archive/verify the preceding bytes, and only then replace the primary key. A full quota or failed reconstruction leaves the primary key untouched. If rotation's archive write itself fails, browser `setItem` atomicity preserves its old value too. If primary replacement fails after archiving, the active save and pinned archives remain, with the preceding active bytes also recoverable from the archive. An older unpinned rotating record may already have been replaced as permitted by the rotation policy.
- Releasing many legacy pins can temporarily produce more than three rotation candidates. Only after a successful primary write/removal are excess eligible records pruned, with a re-read to reject changed records. A cleanup failure is a warning on a successful save, not a claim that the save failed. Unknown archives and pins are never cleanup candidates.
- Comparisons reject observed changes between archive selection and replacement, including a newly pinned record. This remains **single-tab gameplay**, not a transaction across multiple tabs: localStorage provides no compare-and-swap or multi-key transaction. Avoid simultaneous playing tabs. Introducing fully coordinated cross-tab writes is a separate task.
- Permanent/legacy backups, the three manual slots, a larger save or unrelated origin data can still fill localStorage. At capacity, saving stops visibly; the application does not remove protected data. Existing full installations may need exported archives and deliberate browser storage management before they can save or change legacy retention metadata.

## Compatibility and transfer review

The v5 envelope and v4 payload schema are unchanged. Read-only v4 migration does not alter the source; the first actual upgrade archives its exact bytes. Existing optional-field defaults, resource cap restoration, workers, upgrades, priorities, changed terrain, research, kills and reputation remain covered by the original tests.

JSON exports retain exact stored bytes. Imports validate syntax, supported versions, data schema, size and actual map reconstruction before replacement. Corrupt/unknown active saves block normal autosave/import/slot load/restart. Only explicit confirmed recovery can replace them, after a successful permanent archive. The added reconstruction-failure test forces `generateMap` to throw and verifies the v4 raw input remains exportable with no writes/removals.

Three manual slots still store the last dawn checkpoint, rather than incomplete combat state. No rendering, simulation, economy, research, building or zombie logic changed. No dependency or lockfile changes were needed.

## Validation

- `npm test`: **456 passed**, 23 files. This includes 16 new pre-merge retention/failure tests in addition to the initial 440.
- Explicit `npm run build`: **passed** after the final UI fix; the existing >500 kB chunk warning remains.
- Browser regression: initial full run **3 passed, 1 failed**. The new permanent-backup test revealed that pinning rebuilt and collapsed the backup details section, hiding the next control. Fixed refresh to retain the expanded state. The targeted rerun then **1 passed**, exercising pin persistence, cancelled unpin, real quota failure, exact downloaded bytes, and successful retry after removing only test filler. All four cases have passed their relevant checks; the other three were not rerun after this two-line UI-only fix. Uses the prepared external system-Chromium config, one worker, software WebGL and `E2E_SLOW_WEBGL=1`; no assertions are disabled. Coverage includes the real day/night cycle, HUD/build menu, v4 migration, slots, JSON and protected recovery, permanent pins across reload, cancellation of unpin, real browser quota exhaustion, and downloaded JSON content.
- `git diff --check`: passed. Dependency/lockfile and renderer/simulation/building/zombie files remain unchanged.

Commands from `/workspace/LR-Anime`:

```sh
npm test
npm run build
E2E_SLOW_WEBGL=1 npm run test:e2e -- --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs
# Final targeted rerun after fixing the collapsed backup section:
E2E_SLOW_WEBGL=1 npm run test:e2e -- --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs --grep 'permanent backup'
```

The system Chromium version differs from CI's Playwright-pinned browser. These are local cloud-machine results, not a claim that GitHub CI completed.

## Rollback and merge recommendation

To undo only this review's corrections, export important checkpoints/archives, then `git revert` its corrective commit on the feature/development branch. The v5 save schema stays compatible with the preceding M1 implementation; the old implementation retains all archives but reintroduces unbounded backup growth. Do not clear storage. To revert the entire PR to the original v4-only game, use the separately documented export/validated-v4-payload procedure in `SAVE-PROTECTION.md`.

**Recommendation: ready for human review and manual merge into `develop` for M1 scope.** The identified merge-blocking growth/retention problems are corrected and no unexplained test failure remains. Retain the documented single-tab/dawn-checkpoint contract and export important permanent archives off-browser. Browser quota remains finite; deliberately protecting many backups can still stop new saves rather than destroy protected data. GitHub-hosted CI with its pinned browser remains independent of these local results. No automated merge, base-branch change or deployment was performed.


## Corrective files

- `src/persistence.js`: bounded archives, persistent retention choices, quota errors, safe record classification, unchanged-checkpoint deduplication and mixed-ID rejection.
- `src/ui/savepanel.js`: pin/unpin controls, permanent/rotating labels, protected archive exports and retained disclosure state.
- `src/main.js`: surface successful-save cleanup warnings.
- `src/style.css`: backup-row styles.
- `tests/save-protection.test.js`: 16 added pre-merge regression cases.
- `e2e/save-protection.spec.js`: permanent pin/reload, cancelled unpin, actual quota failure, exact JSON download and retry.
- `docs/SAVE-PROTECTION.md`, `docs/PHASE1-PR.md`, `docs/M1-PREMERGE-REVIEW.md`: current retention policy, review evidence, risks and rollback.
