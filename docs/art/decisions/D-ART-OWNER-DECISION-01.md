# LR-Anime｜D-ART-OWNER-DECISION-01｜立石怜正式母版治理決策

- Decision ID: `D-ART-OWNER-REI-MASTER-2026-11-23`
- Source stage: `D-ART-PRODUCTION-28`; governance handoff: `D-ART-OWNER-DECISION-01`
- Owner decision date: 2026-11-23 (Asia/Taipei)
- Authority: LR-Anime Repository Owner, explicit statement in the project conversation
- Character ID: `chr_recruit_rei` — 立石怜 / Rei Tateishi
- Selected appearance master: **灰紫戰術研究服（gray-purple tactical research outfit）**, D14 → D26 → D27 → D28 lineage.
- Non-selected variant: **白色研究外套** retained as historical alternative, not deleted or silently substituted.
- Scope: **appearance master selection only**. This does **not** approve any individual PNG, authorize game asset import, merge, deployment, changes to main/develop, or player save modifications.
- Official image state: 64/64 PNG files found, 64 CANDIDATE, **0 APPROVED**, 0 MISSING (at the D28 audit snapshot); visual/rights review pending.
- G1: **NO-GO**.

## Source validation

- D28 ZIP: `LR-Anime-DART-PRODUCTION-28-Rei-master-decision-review-v0.1.zip`
- D28 ZIP SHA-256: `905649ad01005a533100e6c279c13d528ca1da016b686cbdcfa304eefa520103`
- Verified 2026-11-23: ZIP CRC test passed, 64 asset PNG paths present, and 64/64 actual PNG SHA-256 hashes match D28 `manifest.csv`.
- This GitHub commit contains **documentation only**, not binary PNGs; the archive is an external evidence attachment from the user conversation and must be retained for reproducibility.
- Each of the following eight slots came from the D14 gray-purple candidate lineage; all remain CANDIDATE.

| Asset slot | SHA-256 (64 hex digits) | Status |
| --- | --- | --- |
| full | `519cc36f2854c8b1c45b2e748f78526b8d1c6f74444280b842866a2571bf9ec5` | CANDIDATE |
| half | `2c61a5ce6643e1ca57c8caaea7275d516a7677ee6a12b2241261d8ee2effc8de` | CANDIDATE |
| icon | `617c48ecfb7991bd6385806961b1bb5ee78f24b908389e3bc914054c2a714110` | CANDIDATE |
| neutral | `617c48ecfb7991bd6385806961b1bb5ee78f24b908389e3bc914054c2a714110` | CANDIDATE |
| happy | `6434a1acf0a00724bed20ed22f1bd0efc1787cd896f0a58379ecbce8466454ea` | CANDIDATE |
| alert | `20e8cbdd5144b165ee8db11157931bf6db5c517c7f26c4eb746a5a8d02805846` | CANDIDATE |
| tired | `ba6e7252463ae2fd2bbed6037a678becb24e171e90eadcacf5a3f9a3220d01a5` | CANDIDATE |
| injured | `f108a5acc289e671cf4256bb1d621c842576b6ad2445d1d447205c850bfa7482` | CANDIDATE |

**Note:** `icon` and `neutral` are byte-identical; this is a documented reuse, not evidence of independently illustrated assets. Owner must accept or request separate artwork during per-slot review.

## Remaining Owner acceptance gates

1. Review full, half, icon, neutral, happy, alert, tired, injured against the selected gray-purple master (face, hair, eyes, outfit and props).
2. Confirm expression semantics, cropping and alpha/color halos on light/dark UI; test 48px and 64px legibility.
3. Confirm provenance and game usage rights for each asset.
4. Log each approved asset using character ID + slot + version + **full SHA-256** + reviewer + date/timezone + decision evidence; no bulk implicit approval.
5. Any edit changes the SHA and requires a new review; keep history and the white-coat historical alternative.
6. No code changes, app tests, merges, deployments, forced pushes, deletions or v4/v5/v6 save modifications are authorized by this decision.

## GitHub handoff

This record is proposed by an independent **docs-only Draft PR** targeting `docs/ae-master-plan-v1-governance`. It does not change `main` or `develop`. G1 remains NO-GO. Future Codex import only after separate image-level Owner approvals and separate engineering authorization.
