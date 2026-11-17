## Save protection and manual dawn checkpoints

The original loader silently treats unknown/broken saves as a fresh run, and the next autosave overwrites the original. This change reads v4 and v5, validates and reconstructs checkpoints before accepting them, and archives the exact prior bytes before replacement or explicit restart/defeat removal. Unknown versions, malformed data and storage/backup failures block automatic overwrites and show a visible error. Explicit recovery requires the user's checkbox plus confirmation and a successful archive.

Adds three independent manual slots, JSON import/export and downloadable recovery backups in a modal that pauses play. Slots intentionally store the most recent **dawn checkpoint**: the original game does not serialize live enemies or battle state. No renderer, simulation, economy, building, research or night-attack behavior was rewritten; no dependencies changed.

Base is `develop`, newly created from original/upstream commit `f6faebbb8096967854bacf0708b196ffac2712b9` because no develop branch existed. This PR must not merge into `main` or deploy automatically.

Validation:

- Pre-merge review: 456 unit tests passed across 23 files, including migration, backup rotation, permanent pins, corruption, actual reconstruction failure, quota, slots and explicit recovery.
- Production build passed; the pre-existing >500 kB chunk warning remains.
- Pre-merge browser regression: initial full run had 3 passes and revealed one collapsed-backup-section UI failure. The UI was fixed, then that case passed its targeted rerun, including permanent pins across reload, actual browser quota exhaustion, exact exported JSON and successful retry. All four cases are covered by these runs; the other three were not repeated after the two-line UI-only fix. Uses system Chromium, the external cloud config and `E2E_SLOW_WEBGL=1` without disabling assertions.
- Development HTML/module requests and `git diff --check` passed.

Compatibility, licenses, versions, changed-file inventory and rollback are documented in `docs/SAVE-PROTECTION.md`. Normal v5 backups rotate in a shared pool of three. Permanent pins, existing legacy archives, v4 migration originals and unknown/corrupt recovery originals are never automatically rotated. Unchanged v5 checkpoints are not rewritten. Browser quota can still stop saves when protected archives/slots/other data fill the origin; errors preserve the active save and pins, and exports provide independent recovery. The detailed review is in `docs/M1-PREMERGE-REVIEW.md`. Use one playing tab. Reverting code requires preserving exports and restoring a validated v4 payload first, since the original application cannot read a v5 envelope. MIT and the existing asset attribution notices are preserved.
