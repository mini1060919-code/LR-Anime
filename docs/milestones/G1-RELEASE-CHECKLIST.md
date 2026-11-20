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

## 2026-11-20｜CI 觸發補充
- [PR #11](https://github.com/mini1060919-code/LR-Anime/pull/11) 是 GitHub CI 導入分支；workflow run `44724242042` 已開始。
- 最初查核 `Unit tests and production build` SUCCESS；`Complete Playwright E2E` 仍在執行。
- [ ] CI 兩個 Job 最終 SUCCESS（不得以進行中當作 PASS）。
- [ ] 在 `develop/main` 的實際保護規則中核對 required checks、review 及 merge commit policy。
- [ ] 合併順序、每階段檢查與回復計畫再審；維持 NO-GO。

## 2026-11-20｜G1-GOV-01｜擁有者核准待證清單
- [x] GitHub Actions run [44724242042](https://github.com/mini1060919-code/LR-Anime/actions/runs/44724242042) completed/success；兩 jobs 成功，既有 G1-CI-02 證據：Vitest 701/701、Playwright 24/24。
- [x] 最新重查 PR #1～#11 均 Open／未合併；#9/#10/#11 Draft 且 reviews API 均為空。
- [x] `develop...ci/g1-required-checks` ahead 14、behind 0；不構成整合批准。
- [ ] 擁有者提供 develop 與 main 的 Rulesets／Branch protection 生效畫面，核實 required checks 精確名稱及 GitHub Actions App、批准人數、對話解決、最新推送審查、up-to-date／merge queue、bypass、force push／delete、管理員適用範圍。
- [ ] 若使用 merge queue，驗證 workflow `merge_group` 支援；目前 #11 的 CI 需另行查核是否支援。
- [ ] 確認合併方法為 Merge Commit、auto-merge 設定、main 更新可能觸發 Pages 發布與獨立部署授權。
- [ ] 指定核准 reviewer、最終 G1 決策人和整合操作人，保存規則證據與正式審查紀錄。
- [ ] 真正合併前以最新 SHA 分段重驗 #1→#2→#4→#3→#5→#6，再一次性導入 #9/#11 的測試及 CI；逐段存 before/after SHA、merge tree、CI、v4/v5/v6 與未知版安全證據；失敗以獨立 revert PR，勿 reset 或 force push。
先前詳細規則端點 HTTP 403 `Resource not accessible by integration`，需 `administration:read`；本輪連線未提供規則詳細讀取，不能視作已證實生效。請見 [全專案固定回報規則](../PROJECT-PROGRESS-REPORTING-RULES.md)。**G1 NO-GO；下一工作 G1-GOV-02。**
