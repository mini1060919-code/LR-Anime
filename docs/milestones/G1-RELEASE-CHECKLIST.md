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


## 2026-11-20 20:50 Asia/Taipei｜G1-GOV-02｜正式整合治理查核

治理基準 [PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `53b8f569535c5f77a3553dd0a983f08697d1a27c`。G1 候選 [PR #9](https://github.com/mini1060919-code/LR-Anime/pull/9) `a2000b4e4700cd187aa0b1d2b2186364743850dc`，CI [PR #11](https://github.com/mini1060919-code/LR-Anime/pull/11) `cfa103c659aeb68aa97b448746ac944bbb16fd0d`。

- [x] 同一候選的兩個 Actions job 成功，701/701、24/24。
- [x] 最新 Base/Head、逐段合併與倒序回復演練完成。
- [ ] 擁有者提供 develop/main 生效規則與 required checks 來源；詳細端點 403。
- [ ] 核對 required approving reviews、對話解決、strict、queue／merge_group、bypass、force push／delete 與管理員範圍。
- [ ] 核對 Pages 實際來源與環境保護（API 404）、發布授權與分段整合批准。
- [ ] 整合各段的實際 merge ref 與 after SHA 另取得全套適用測試和審查。

### 擁有者待提供證據

- [Settings → Rules → Rulesets](https://github.com/mini1060919-code/LR-Anime/rulesets) 與 [Settings → Branches](https://github.com/mini1060919-code/LR-Anime/settings/branches)：分別提供 develop、main 的完整適用規則截圖或有權限 API 回應，含 Active/Evaluate/Disabled、分支範圍、兩個 required contexts 與 App、strict、merge queue、批准人數、撤銷過期批准、最新推送審查、對話解決、force push/delete、限制推送、bypass 名單與管理員套用。API 證據需 repository Administration read，勿交付憑證。
- [Settings → General → Pull Requests](https://github.com/mini1060919-code/LR-Anime/settings) 核對 merge 方法與 auto-merge／自動刪除；[Settings → Pages](https://github.com/mini1060919-code/LR-Anime/settings/pages) 和 [Settings → Environments → github-pages](https://github.com/mini1060919-code/LR-Anime/settings/environments) 提供 Pages 來源、允許分支、發佈保護與審查人。任何 main 更新（包含文件）另需發布授權。
- 提供 reviewer、正式決策人、操作人，以及綁定實際 merge ref 的批准與檢查；缺任一項維持 NO-GO。

**G1 NO-GO。下一工作 G1-GOV-03：擁有者提交上述證據、確認實際 merge ref 門檻及記名批准。**


## 2026-11-20 21:54 Asia/Taipei｜G1-GOV-03｜治理與發布門檻重核

治理輸入為 PR #10 `bb78324e08382f2597a45bbbbe252c27e486b190`，已讀總計畫、固定回報規則、晚間快照與五份治理紀錄。

- [x] 重核候選 SHA、GitHub Actions 與既有七段演練適用性。
- [ ] 提供生效保護規則、兩項 checks/App、批准及 queue 設定（詳細端點 403）。
- [ ] 提供 Pages 設定與 github-pages 環境防護（兩端點 404）。
- [ ] 完成記名審查、整合與獨立發布授權。

擁有者從 [Settings → Rules → Rulesets](https://github.com/mini1060919-code/LR-Anime/rulesets) 及 [Settings → Branches](https://github.com/mini1060919-code/LR-Anime/settings/branches) 提供兩分支的適用規則與 enforcement、checks/App、批准人數及撤銷過期批准、對話、strict/queue、force push/delete、bypass 與管理員範圍。由 [Settings → General → Pull Requests](https://github.com/mini1060919-code/LR-Anime/settings) 核對 merge 方法。從 [Settings → Pages](https://github.com/mini1060919-code/LR-Anime/settings/pages) 及 [Settings → Environments → github-pages](https://github.com/mini1060919-code/LR-Anime/settings/environments) 提供來源、環境規則、允許分支及審查人。附日期、分支、適用範圍、記名決策與授權，無須分享憑證。

**G1 NO-GO。下一工程工作 G1-GOV-04：接收擁有者實際設定證據，核驗發布隔離及記名授權。企劃可並行 B-04。**


## 2026-11-20 22:23 Asia/Taipei｜G1-GOV-04｜保護規則與擁有者證據查核

工程治理查核。文件基準為 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `ce597a0e47b47f69d03296d538f048bbcccd15f2`，前次 G1 紀錄 `ca97a1c40ba45934fef1983c44fca661bfc6dcc6` 後只有治理文件變更。本輪未更動程式、美術、授權或存檔。

- [x] 確認同一 CI merge ref、結果及既有演練適用性。
- [ ] 生效 Rulesets／保護及 checks/reviews 取證，詳情 403。
- [ ] Pages 與 github-pages 環境取證，兩端點 404。
- [ ] 記名審查、整合及獨立發布授權。

擁有者待提供：在 [Rulesets](https://github.com/mini1060919-code/LR-Anime/rulesets) 與 [Branches](https://github.com/mini1060919-code/LR-Anime/settings/branches) 分別提供 develop/main 的生效範圍、enforcement、兩 checks/App 及其餘審查、隊列與權限設定；在 [General](https://github.com/mini1060919-code/LR-Anime/settings) 核對 merge 政策；於 [Pages](https://github.com/mini1060919-code/LR-Anime/settings/pages) 和 [Environments](https://github.com/mini1060919-code/LR-Anime/settings/environments) 提供來源、允許分支、部署審查與環境防護。GET `/pages` 與 `/environments/github-pages` 均 HTTP 404，端點標示 pages:read／actions:read，原因無法從 404 判定。main push 會觸發有 build/E2E 前置的 Pages workflow，文件 #10 同樣需獨立發布授權。本輪沒有收到擁有者設定證據、記名 reviewer、整合決策人／操作人或正式授權。可交付截圖或具權限的 API 回應，勿分享憑證。

**G1 NO-GO。下一工程 G1-GOV-05 在收到擁有者實際設定或授權後啟動，完成逐項證據驗證。並行企劃 B-04。**
