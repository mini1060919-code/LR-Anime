# M2 — Traditional Chinese and anime survival interface

## Branch and dependency

M2 branches from the latest M1 head `642c8d2fb1c6faddcfdd1b10e0c69d7231c53eec` on `feature/save-protection-v5`. The M2 branch is `feature/m2-zh-tw-anime-ui`.

**Depends on M1 PR #1:** https://github.com/mini1060919-code/LR-Anime/pull/1

The independent M2 PR should target **`feature/save-protection-v5`**, keeping its diff limited to M2. Do not merge PR #1, retarget branches or deploy automatically. After M1 is accepted, a maintainer can retarget M2 to `develop` and resolve any later M1 changes before acceptance.

## Completed translation scope

Traditional Chinese (`zh-TW`) is the default. English remains available through the language control or `?lang=en`.

- Title, introduction, controls, start/restart/confirmation, defeat and record screens.
- Day/night, countdown, weather and effects, all six resource names and daily balance labels/rates, population and control tooltips.
- All six building categories and **40 building names/descriptions**, production/consumption, storage, workers, beds, damage and research-lock tooltips.
- All **8 technologies**, their descriptions, unlocked buildings, effect labels and completion state.
- Worker management, building inspector/repair/upgrades, tutorial steps and common gameplay notifications.
- M1 save-management labels, slot controls, import/export, permanent/rotating backups, confirmations and contextual safety/error messages. Unknown low-level browser/engine diagnostics intentionally retain a readable English fallback rather than being discarded.

`src/ui/i18n/zh-TW.js` owns the translations, with building/technology entries indexed by existing IDs. The UI-only adapter in `src/ui/i18n/index.js` maps the original names/descriptions without modifying the definitions. Existing DOM factories translate their text/title/accessibility fields. Known dynamic English contracts have explicitly registered, anchored templates; numeric fields are constrained to avoid matching unrelated diagnostic text. There is no DOM text observer, HTML rewriting, translation of storage keys or mutation of game objects.

Add a new message/template to the catalog, use `t(message, values)` at a presentation boundary, and add a coverage/formatting assertion. English source text is the deterministic fallback. The language is resolved from a supported `?lang=` value, then `lr-ui-locale`, then the default. Unsupported values fall back safely. Preference reads/writes may fail without stopping gameplay.

Changing language while playing requires confirmation and returns to the most recent dawn checkpoint. It is not an in-place locale mutation and does not serialize in-progress combat. Cancelling preserves the current UI and run. The `new`/`autostart` parameters are removed during this navigation to avoid silently creating a new colony.

## Theme and character architecture

The original Three.js canvas, models, camera, rendering, buildings, economy, research rules and night attacks are retained. New styles are isolated in `src/ui/anime-theme.css`; the visual theme uses dark navy command panels, teal accents, readable Chinese system-font fallbacks and original CSS silhouette art. No image, font, UI library or remote asset dependency was added.

The HUD wraps resource/control rows instead of pushing commands out of the viewport. UI-only ResizeObservers publish HUD/build-menu heights for the utility toolbar, resource breakdown and tutorial. Research/inspector panels remain scrollable and reachable. Reduced-motion preferences are respected.

`createCharacterPanel` receives `getState`, `onOpen`, `onClose` and optional `resolvePortrait(id)` callbacks. Opening snapshots the paused survivor roster; closing restores the previous pause state. A read-only view model derives existing IDs, workplace, hunger and thirst. Selection and portraits never modify survivors, grant abilities or enter the save.

The default portrait is an original CSS silhouette with accessible alternative text, clearly labelled as a prototype. A future portrait descriptor may contain:

```js
{
  src: 'assets/portraits/operator.webp',
  alt: 'An operator portrait',
  credit: 'Project artist',
  license: 'Original'
}
```

Local files under `assets/portraits/` must provide alt text, attribution and an explicitly supported license (`Original`, `CC0`, `CC-BY-4.0`, or `MIT`). Unsupported/remote/missing metadata falls back to the silhouette. Descriptor validation is a presentation contract; the maintainer must still verify the actual license before adding artwork. This change adds no such image files and uses no Hearthfall imagery or copyrighted anime characters.

## Save compatibility and rollback

`src/persistence.js` is unchanged from M1, as are simulation, world, rendering, building and zombie modules. Save version stays v5, v4 remains readable, and migration/permanent backups continue to use M1's exact-byte protections. Building/research IDs remain unchanged. Locale preference is stored separately as `lr-ui-locale`; no locale, portrait or character-display fields are added to v4/v5 payloads.

Tests compare restored v4/v5 state across languages, preserve original definitions, prove character-panel interactions do not change resources/survivors/save bytes, and compare active save bytes before/after a locale switch and reload. Original M1 browser tests explicitly select English in their isolated browser preferences, preserving their original assertions; the M2 suite exercises the actual default Chinese UI separately.

To roll back M2, export important checkpoints as usual, then revert the M2 commit(s) on its feature/development branch. No save migration reversal or deletion is needed: M1 reads the same v4/v5 data and ignores the extra UI preference key. Do not reset or overwrite user data. The earlier M1 retention/compatibility contract remains documented in `SAVE-PROTECTION.md` and `M1-PREMERGE-REVIEW.md`.

## Validation and limitations

Final validation on 2026-11-17:

- `npm test`: **466 passed**, 24 files. All original M1 tests remain passing; 10 M2 unit cases cover catalogs, locale resolution/fallbacks, read-only character data, portrait metadata and cross-language v4/v5 restoration.
- `npm run build`: **passed**. The existing large-chunk warning remains (approximately 796 kB JS / 218 kB gzip).
- Full browser regression: **6 passed in one final run** (9.1 minutes), with no skipped tests or disabled assertions. Includes both Chinese desktop/compact cases, the M1 migration/slots/JSON/corruption case, actual browser quota/permanent-backup recovery, original HUD/build menu, and the natural day/night dawn-save/reload cycle.
- Visual checks confirmed Chinese glyphs, the character placeholder, reachable controls and the compact modal. Safety notices no longer intercept recovery controls; research headers remain inside the viewport and tutorial placement tracks the build menu height.
- `git diff --check`: **passed**. The renderer/world/simulation/building/zombie modules, persistence module, public assets, manifest and lockfile are unchanged relative to M1.

Commands from `/workspace/LR-Anime`:

```sh
npm test
npm run build
E2E_SLOW_WEBGL=1 npm run test:e2e -- --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs
```

The prepared external config uses system Chromium, software WebGL, a 0.5 device scale and one worker. It leaves repository tests/assertions enabled. CI can use its normal repository config with the pinned Playwright browser. Local results do not establish GitHub-hosted CI success. Generated visual checks are `/tmp/lr-m2-title.png`, `/tmp/lr-m2-game.png`, `/tmp/lr-m2-character.png` and `/tmp/lr-m2-mobile.png`.

Known boundaries:

- Character art is a replaceable silhouette prototype, not a new narrative cast or combat system.
- Language changes reload the dawn checkpoint after confirmation; live combat still is not saved.
- Uncatalogued browser/engine diagnostics fall back to English. Fonts come from the device; no web font is downloaded.
- Desktop and a 390×844 viewport are tested. This does not introduce a full touch-only control scheme for the original keyboard/mouse game.
- M1's finite origin storage, protected backup policy and single-playing-tab limitation remain in effect.
- The existing production chunk-size warning remains; no rendering/dependency changes were made to suppress it.
- No merge, production deployment or environment publication is performed.

## Changed files

- `docs/M2-INTERFACE.md`
- `docs/M2-PR.md`
- `e2e/m2-interface.spec.js`
- `e2e/save-protection.spec.js`
- `e2e/smoke.spec.js`
- `index.html`
- `src/bootstrap.js`
- `src/main.js`
- `src/ui/anime-theme.css`
- `src/ui/buildmenu.js`
- `src/ui/characterpanel.js`
- `src/ui/hud.js`
- `src/ui/i18n/index.js`
- `src/ui/i18n/zh-TW.js`
- `src/ui/inspector.js`
- `src/ui/interface-shell.js`
- `src/ui/laborpanel.js`
- `src/ui/researchpanel.js`
- `src/ui/savepanel.js`
- `src/ui/screens.js`
- `src/ui/tutorial.js`
- `tests/i18n.test.js`
