# G1｜正式整合放行前檢查表（2026-11-20）

> **目前 NO-GO**。本表供擁有者及審查人使用；不是 merge 授權，也不是已完成驗收聲明。

## A. 已有證據
- 統一回歸分支 `review/g1-unified-validation`；Head `a2000b4e4700cd187aa0b1d2b2186364743850dc`。
- [PR #9](https://github.com/mini1060919-code/LR-Anime/pull/9) Codex 報告：Vitest 701/701、E2E 24/24、安裝／建置 PASS，v4/v5/v6 相容與 Smoke 2/2 PASS。
- GitHub API 再核對：此 Head 的 combined statuses `[]`、Actions workflow runs `[]`；PR #9 reviews `[]`。**無法據此判斷 required checks 規則是否存在，亦不能將 Codex 工作區測試等同 GitHub CI。**
- `develop` 到統一驗證分支為 13 commits ahead、0 behind（本次比對），**不代表准許直接合併**。
- 舊 `docs/integration/MERGE-RUNBOOK.md` 的「M5-B 尚無 PR」已過時：目前 [PR #6](https://github.com/mini1060919-code/LR-Anime/pull/6) 已存在。

## B. GitHub 擁有者待核對（尚未完成）
- [ ] Settings → Branches 或 Rules → Rulesets：確認 **develop** 與 **main** 的保護規則、生效狀態與 enforcement。
- [ ] 確認 required status checks 名稱及對應 CI workflow；不得以「無回報」當作通過。
- [ ] 確認批准 review、對話 resolved、禁止 force push／刪除受保護分支等條件。
- [ ] Settings → General → Pull Requests：確認允許 **Create a merge commit** 並避免 auto merge。
- [ ] 指定實際合併操作人與最終放行審查人。

## C. PR 依賴與合併策略（需放行後執行）
- 原功能順序：**#1 M1 → #2 M2 → #4 M3 → #3 M4 → #5 M5-A → #6 M5-B**。
- #7（M3 測試）、#8（M4～M5-B 測試）已在 #9 統一驗證中包含相應變更；不得盲目把 #7/#8/#9 逐個合併並重複引入相同修改。
- 每段合入 `develop` 前後都須記錄 before/after SHA、比較實際 diff、重新進行當版適用的單元／建置／瀏覽器與存檔測試。
- Head 或 Base 變更會使既有測試證據不能自動沿用；必須重新比對與驗證。

## D. 存檔與失敗回復
- [ ] 保存 v4/v5/v6 合成／測試 JSON 與存檔遷移報告，不觸碰真實玩家存檔。
- [ ] 記錄每次合併前 SHA；有異常以經審查的 revert PR 回復，不使用遠端 `reset --hard`。
- [ ] 核對角色 UID、授權清冊及影響正式發布的素材權利。

## E. 放行紀錄（待填）
| 日期 | 操作 | Before / After SHA | Required checks | Reviewer | 測試結果 | 決議 |
|---|---|---|---|---|---|---|
| 2026-11-20 | 準備放行前查核 | PR #9 `a2000b4e` | 尚未確認（403） | 尚無 review | 自動回歸通過 | **NO-GO** |

詳細工作：參考 [G1](G1.md)、[整合操作書](../integration/MERGE-RUNBOOK.md) 與 [交接](../HANDOFF.md)。