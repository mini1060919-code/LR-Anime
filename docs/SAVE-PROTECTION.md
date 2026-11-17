# Phase 1: save protection and development baseline

## Baseline (2026-11-17)

- Repository: `mini1060919-code/LR-Anime`.
- Initial local branch: `work`; initial remote branches: `main` only.
- Initial commit: `f6faebbb8096967854bacf0708b196ffac2712b9`.
- The upstream `D590900/city-builder-survival` HEAD was the same commit when checked. Therefore no code difference existed at the baseline. No pre-existing `develop` branch was available to compare; `develop` was created from this exact baseline, with the feature on `feature/save-protection-v5`.
- Runtime: Node.js `24.22.1`, npm `11.9.0`. Project documentation/CI require Node 22+ and use Node 22 in CI.
- Locked direct dependencies: `@gltf-transform/core` 4.4.1, `@gltf-transform/functions` 4.4.1, `three` 0.185.1, `@playwright/test` 1.61.1, `vite` 8.1.5, `vitest` 4.1.10. `package-lock.json` remains unchanged and records transitive versions/integrities.
- Code license: MIT, copyright 2026 Domenico Ricciotti. Preserve the license. Assets have separate CC0/CC-BY 3.0 obligations, including required attribution listed in `CREDITS.md`; this change does not replace or redistribute assets or add Hearthfall assets/code.
- Original checks: 416 unit tests passed; production build passed with the existing >500 kB chunk warning.
- Browser runtime: system Chromium 156.0.8078.79, software WebGL. Playwright's pinned browser download was blocked by the current network policy. A setup-only config outside the repository uses `/usr/bin/chromium`, one worker and device scale factor 0.5. Original browser checks: HUD/build menu passed; the dawn test exceeded 150 seconds while still progressing through night. A lower device scale alone did not resolve that deadline. `E2E_SLOW_WEBGL=1` allows up to 300 seconds for the same day transition without changing assertions or simulation.

## Data contract and compatibility

The original game saves at dawn and reconstructs from seed, buildings, survivors and changed tiles. It does **not** serialize an in-progress battle, zombie positions, projectiles, phase time, or transient rendering state. This implementation retains that checkpoint contract. Three manual slots copy the most recent dawn autosave, not live gameplay. Their UI explicitly explains that loading restarts the saved day. All original simulation, buildings, research, economy, night attacks and rendering code remain in place.

A v5 save is an envelope:

```json
{
  "format": "last-refuge",
  "version": 5,
  "checkpoint": "dawn",
  "savedAt": "2026-11-17T00:00:00.000Z",
  "payload": { "version": 4, "seed": 42, "day": 1 }
}
```

The abbreviated payload above is illustrative, not an importable fixture. The actual payload contains the original resources, survivor/workplace links, buildings and upgrade/priority/on-off/repair fields, changed tiles, research, kills and reputation. Keeping the v4 payload allows pure migration and straightforward recovery. The existing defaults for optional fields introduced during v4 remain supported. Resources retain the original restoration caps/clamps. Original worker-roster rebuilding and weather reroll behavior are retained.

- `readSave` reads either v4 or v5 without writing. Migration creates a new envelope without mutating the input. Boot's normal dawn write backs up the exact original v4 bytes before writing v5.
- Validation checks versions, finite numbers, day/seed, building definitions/footprints/IDs/overlap, survivor IDs/workplaces, research definitions and changed tiles, then exercises actual restoration. Unrecognized/inconsistent input is protected instead of silently dropping buildings or research.
- `cbs-save` remains the active key; manual slots use `cbs-slot-1` through `cbs-slot-3`; `cbs-record` is unaffected.
- Before replacement or explicit restart/defeat removal, the prior raw bytes are archived in a new `cbs-backup:<UUID>` record with source key, timestamp and reason. The archive write is verified before modifying the active/slot key. Read, backup, quota or validation failure returns an error and blocks replacement. There is no automatic backup pruning or deletion.
- Unknown/corrupt existing saves block autosave, normal imports, slot loading and restart. A visible warning explains the problem. Raw JSON export remains available. Only the user's explicit recovery checkbox plus confirmed valid JSON import allows replacement of protected data, and only after its exact raw bytes have been backed up successfully.
- JSON imports are limited to 2 MiB and pass the same validation/restoration path. Export downloads the exact stored bytes, including corrupt/unknown data. Recovery backups can be exported separately and re-imported if valid.
- Existing old-version inputs with unknown definitions/invalid coordinates are intentionally rejected rather than partly loaded. This is a safety restriction, not a silent migration.

## Usage and recovery

Open **Saves** during gameplay. The modal pauses the simulation and restores its previous pause state when closed. Choose a slot to save/load, export autosave/slot JSON, or choose an import file. Slot replacement and loading/importing require confirmation. Recovery archives appear in the same modal.

If an autosave is protected, first export its raw bytes. Investigate/correct a separate copy or select a known-good exported checkpoint. To restore it, explicitly select the recovery checkbox, import the valid JSON and confirm. If backup storage is full/unavailable, recovery refuses to overwrite; export backups to independent files before deciding what browser storage to manage. The application does not remove backups on your behalf.

Local storage is per browser origin; changing host/port does not transfer saves. JSON transfer supports that workflow. Backups in the same localStorage are not independent protection against browser profile deletion, disk loss or manual clearing; export important checkpoints off-browser. Multiple simultaneous tabs are not a transactionally synchronized game session. Each replacement archives the preceding observed value, but use one playing tab to avoid conflicting progress.

## Validation and rollback

Run from the checkout:

```sh
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm test
npm run build
E2E_SLOW_WEBGL=1 npm run test:e2e -- --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs
```

On CI, use the repository's regular Playwright config and pinned browser (`npx playwright install --with-deps chromium`). `E2E_SLOW_WEBGL` only lengthens the natural day/night wait on slow renderers; all assertions remain active. New tests cover pure v4 migration, default fields, exact-byte backups, schema rejection, unavailable/quota-limited storage, failed writes, slot isolation, JSON round trips, explicit recovery and browser UI integration.

Rollback has two independent parts:

1. Before reverting code, export the active checkpoint, manual slots and relevant recovery backups. Check the downloaded JSON files. Do not clear browser storage.
2. Revert the feature commit(s) on the feature/development branch using `git revert`; run the baseline tests/build. The original application accepts v4 only, so do not start the old application over a v5 active key. Restore an exported original v4 backup, or extract the validated v5 envelope's `payload` into a separate JSON file and verify it using this version first. Preserve the v5 original off-browser before deliberately placing the v4 JSON at `cbs-save` with browser developer tools. Retain all `cbs-slot-*` and `cbs-backup:*` keys; the old application ignores them.

No merge to main or production deployment is part of this change. Test results and PR delivery status are recorded in the phase-1 delivery report.

## Phase-1 validation results

- Final unit suite: **440 passed**, 23 files (416 original tests plus 24 save-protection cases).
- Final production build: **passed**; the existing large-chunk warning remains. No dependency/lockfile or rendering/simulation changes were made.
- Full browser regression: **3 passed** with the external system-Chromium config and `E2E_SLOW_WEBGL=1`: v4/slots/JSON/protected-save UI, original HUD/build menu, and actual dawn autosave plus reload. After the final explicit-recovery UI additions, the targeted browser test was rerun: **1 passed** (v4 migration, slots, JSON transfer, protection and confirmed recovery with exact-original archive).
- Development server: HTML and JavaScript requests succeeded on port 5173 at `/city-builder-survival/`.
- `git diff --check` passed. `develop` is identical to the original baseline and was pushed independently; `main` was not modified.

Changed files:

- `src/persistence.js`: v5 envelope, validation, migration, archive-before-write, three slots, JSON transfer and explicit recovery.
- `src/main.js`: save status reporting, management-panel wiring, protected restart/defeat behavior.
- `src/ui/savepanel.js`: accessible paused management modal, slot controls, JSON/backup downloads, confirmed import/recovery.
- `src/style.css`: scoped save controls/modal styles.
- `tests/save-protection.test.js`: 24 migration/preservation/slot/import/storage-failure cases.
- `e2e/smoke.spec.js`: v5 payload expectations and opt-in slow-renderer deadline.
- `e2e/save-protection.spec.js`: browser integration of migration, slots, transfers and protected-save recovery.
- `docs/SAVE-PROTECTION.md`: baseline, license review, compatibility, evidence, risks and rollback.
- `docs/PHASE1-PR.md`: reviewable PR description and validation summary.

Remaining limitations: checkpoints are dawn-only, backups consume browser quota and are never automatically pruned, localStorage is not cloud storage, and multi-tab synchronization is not implemented. A plain HTTP non-localhost origin may not expose `crypto.randomUUID`; use HTTPS or localhost. The system browser differs from Playwright's pinned CI browser, so local results do not claim a GitHub-hosted CI run. No production deployment, environment publication or fresh-task restoration has been performed.
