## M2: Traditional Chinese and anime survival UI

**Depends on #1 (M1 save protection).** Base this PR on `feature/save-protection-v5` at `642c8d2`, not main. Keep it separate from M1 and do not merge/deploy automatically. Retarget to develop only after M1 acceptance.

Adds default Traditional Chinese with an English preference, translating the main screens, HUD/resources, all 40 buildings and 8 technologies, worker/inspector/tutorial panels and M1 save-management controls. UI catalogs and explicit templates keep the simulation definitions, IDs and v4/v5 persistence unchanged. Language changes require confirmation and reload the dawn checkpoint.

Adds a dark anime survival command theme and a paused, read-only survivor dossier. The portrait adapter supports future local artwork with license, attribution and alt text. The current original CSS silhouette requires no external assets. No Three.js renderer, map, economy, building, research or zombie rules changed; no dependency was added.

Validation: **466 unit tests passed**, **production build passed**, and **6 browser regression tests passed** in the final full run (including v4/v5 compatibility, actual quota failure/permanent backup protection and natural dawn autosave/reload). The existing chunk-size warning remains.

Details and the full changed-file list are in `docs/M2-INTERFACE.md`. It covers language formatting/defaults/fallbacks, complete definition translation, read-only character presentation, cross-locale v4/v5 restoration, desktop/compact UI and original M1 browser regression. The known boundaries are checkpoint-based language switching, English fallback for unknown diagnostics, prototype portraits, and M1's existing storage/single-tab constraints.
