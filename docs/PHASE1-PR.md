## Save protection and manual dawn checkpoints

The original loader silently treats unknown/broken saves as a fresh run, and the next autosave overwrites the original. This change reads v4 and v5, validates and reconstructs checkpoints before accepting them, and archives the exact prior bytes before replacement or explicit restart/defeat removal. Unknown versions, malformed data and storage/backup failures block automatic overwrites and show a visible error. Explicit recovery requires the user's checkbox plus confirmation and a successful archive.

Adds three independent manual slots, JSON import/export and downloadable recovery backups in a modal that pauses play. Slots intentionally store the most recent **dawn checkpoint**: the original game does not serialize live enemies or battle state. No renderer, simulation, economy, building, research or night-attack behavior was rewritten; no dependencies changed.

Base is `develop`, newly created from original/upstream commit `f6faebbb8096967854bacf0708b196ffac2712b9` because no develop branch existed. This PR must not merge into `main` or deploy automatically.

Validation:

- 440 unit tests passed across 23 files, including 24 new migration, backup, corruption, quota, slots and explicit-recovery cases.
- Production build passed; the pre-existing >500 kB chunk warning remains.
- Full browser regression: 3 passed using system Chromium and the external cloud setup config, with `E2E_SLOW_WEBGL=1` allowing the original day/night cycle more time on software WebGL. The final targeted browser rerun also passed (1 test), including explicit recovery and archival of the protected original.
- Development HTML/module requests and `git diff --check` passed.

Compatibility, licenses, versions, changed-file inventory and rollback are documented in `docs/SAVE-PROTECTION.md`. Backups are retained without automatic pruning; browser quota can stop new saves, and exports provide independent recovery. Use one playing tab. Reverting code requires preserving exports and restoring a validated v4 payload first, since the original application cannot read a v5 envelope. MIT and the existing asset attribution notices are preserved.
