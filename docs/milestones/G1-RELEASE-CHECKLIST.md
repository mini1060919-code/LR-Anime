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


## 2026-11-21 13:14 Asia/Taipei｜G1-GOV-05｜單人治理與 develop CI 引導

工程治理。入庫基準 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `27d0ccca532b9d680922e2da4bae75a431d6477c`；候選開於 [Draft PR #12](https://github.com/mini1060919-code/LR-Anime/pull/12) `ci/g1-develop-bootstrap`，Base `f6faebbb8096967854bacf0708b196ffac2712b9`、Head `af558e85afc3c32345ca000c423816358cfaba58`。只新增 `.github/workflows/g1-validation.yml`，逐字沿用 #11。無遊戲、存檔或素材變更。

[Run 44869606630](https://github.com/mini1060919-code/LR-Anime/actions/runs/44869606630) completed/success；兩個 checks 由 github-actions（App 15368）產生。[Unit/Build job 136740938540](https://github.com/mini1060919-code/LR-Anime/actions/runs/44869606630/job/136740938540) npm ci、416/416（22 檔）、正式建置通過。[E2E job 136740938366](https://github.com/mini1060919-code/LR-Anime/actions/runs/44869606630/job/136740938366) 現行 develop 完整 Smoke 2/2（約 2.6 分鐘），單 worker、零失敗、零跳過、零重試，含自然黎明 autosave 與重載。兩份日誌均確認 checkout `63212337c730031496f15e0d0b3c7978cc30665b`，父提交為 develop baseline 與 #12 Head，tree `805d17777e80e31b06910642b28a1928afe26e3d` 與 #12 Head 一致。成功無失敗 trace，upload 無檔，artifacts 0。原始日誌與八段試算存於 `/workspace/work/gov05/`。

擁有者設定步驟：
1. 待 #12 兩項 checks 完成後，在 [Settings → Rules → Rulesets](https://github.com/mini1060919-code/LR-Anime/rulesets) 開啟適用 develop 的生效規則；若使用 classic protection，至 [Settings → Branches](https://github.com/mini1060919-code/LR-Anime/settings/branches) 編輯 develop。核對 Active、目標只涵蓋預期分支，先檢查是否有其他重疊規則。
2. 開啟 Require status checks to pass，選 `Unit tests and production build` 與 `Complete Playwright E2E`，兩者來源均選 GitHub Actions（`github-actions` App 15368），避免同名檢查由其他 App 滿足。若清單找不到，確認 #12 的 run 已完成、App 來源正確，再重查；不以其他名稱取代。
3. 保留 Require a pull request 與 Require conversation resolution；單人不強制批准（Ruleset 0，classic 關閉 Require approvals）。保留禁止 bypass／force push／刪除及管理員適用限制。核對 strict/up-to-date；如有 merge queue，現有 workflow 缺 merge_group，須先在獨立 PR 驗證支援再啟用。使用 Merge Commit，定案前維持 NO-GO。
4. 儲存後保留 develop 規則、兩個 checks/App 與 #12 checks 頁的截圖或具權限 API 證據。核對 #12 實際 merge ref 能滿足門檻，再就 #12 取得記名整合批准。Pages 保持停用，main 不在本次設定或整合範圍。

- [ ] 擁有者證實 required checks 強制性及單人規則。
- [ ] #12 與逐段功能候選取得正式整合授權。
- [ ] main 的發布操作另行授權，Pages 維持停用。

**G1 NO-GO。下一工程 G1-GOV-06：擁有者核對並設定兩項 Required Checks，讀回證據，確認 #12 的實際 merge ref 與記名整合授權。企劃並行 B-04。**


## 2026-11-21 13:17 Asia/Taipei｜G1-GOV-06｜Required Checks 與引導候選核驗

工程治理查核基準為 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `0c2b0dcb1efb8cd9b1c0f87ca48d81cbfebd3952`。本輪只追加治理文件。素材、授權及玩家資料無變更。

- [x] #11/#12 實際 merge ref 與既有成功證據吻合。
- [ ] 核實 develop 生效 rules、兩項 Required Checks/App、單人門檻及管理員／queue。
- [ ] 核實 Pages 停用、部署防護與 #12 記名授權。

請擁有者從 [Rulesets](https://github.com/mini1060919-code/LR-Anime/rulesets)／[Branches](https://github.com/mini1060919-code/LR-Anime/settings/branches) 提供適用 develop 的 Active 規則、兩個 checks 及 GitHub Actions App 15368、0 approvals、PR/對話、strict、queue、管理員與禁止 bypass/force push/刪除。從 [Pages](https://github.com/mini1060919-code/LR-Anime/settings/pages)／[Environments](https://github.com/mini1060919-code/LR-Anime/settings/environments) 提供停用與發布隔離證據。附 #12 最新 SHA、記名決策人／操作人、整合授權與獨立發布授權；勿分享憑證。

**G1 NO-GO。下一工程 G1-GOV-07：收到擁有者的 develop 強制 checks 設定與 #12 記名授權後核證；企劃並行 B-04。**


## 2026-11-21 16:14 Asia/Taipei｜G1-GOV-07｜Required Checks 儲存前驗證

治理基準 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `a8cc1b3d8d955d9421a7721754fd48645717b515`。擁有者回報已選取兩項 GitHub Actions checks 與 Require branches to be up to date before merging，是否儲存未確認。develop 分支摘要顯示 protected:true、required checks off、contexts/checks 空；`GET /branches/develop/protection` 回 HTTP 403（administration:read），有效規則端點可見清單空。實際生效仍待讀回。

[#13 run 44882092433](https://github.com/mini1060919-code/LR-Anime/actions/runs/44882092433) completed/success。兩原始日誌確認 checkout 實際 PR merge ref ab81f06e0ce6212caee82f96a5db68b472ad8ed3；兩 checks 來源 github-actions（App 15368）。[Unit/Build 136779384642](https://github.com/mini1060919-code/LR-Anime/actions/runs/44882092433/job/136779384642) npm ci、Vitest 701/701、正式建置通過。[E2E 136779384464](https://github.com/mini1060919-code/LR-Anime/actions/runs/44882092433/job/136779384464) 完整 Playwright 24/24（21.7 分），單 worker、零 fail/skip/retry，含 M3 1280px／390px neutral 備援、M4/M5、v4/v5/v6 存檔及 Smoke；未知版本拒寫由同版單元測試涵蓋。保留失敗 trace 模式，本次無失敗。[Artifact 14698773290](https://github.com/mini1060919-code/LR-Anime/actions/runs/44882092433/artifacts/14698773290) 已上傳。原始兩 job 日誌保留於 /workspace/work/gov07/。CI 通過後分支摘要仍見 required checks off，Owner 儲存讀回與記名授權待辦。

- [ ] 擁有者儲存後讀回 develop 規則、兩 checks/App、strict。
- [ ] 確認 #12 名義授權及 Pages 隔離，未取得授權前維持 Draft。

擁有者可核對 [Settings → Branches](https://github.com/mini1060919-code/LR-Anime/settings/branches) 的目標為 develop，兩項 context 為 `Unit tests and production build`、`Complete Playwright E2E`，來源 GitHub Actions（App 15368），strict 已選，保留單人 0 approvals、PR／對話解決及禁止 bypass／force push／刪除。逐項對照 #13 結果與 #12 引導 checks，儲存後重新開啟規則並留存 branch、兩 checks／App、strict 和執行狀態證據。strict 可能暫阻已落後的堆疊 PR：獲正式授權才接續 #12→#1→#2→#4→#3→#5→#6→一次性 #9/#11。逐段核對 Base/Head/merge ref、取得新 checks，若落後以經批准的不改寫歷史更新分支流程重新觸發。缺檢查、未保存或缺授權即停止。保留 Merge Commit、第一父 Revert PR、原始存檔與備份策略。

**G1 NO-GO。下一工程 G1-GOV-08：儲存後驗證 develop 生效規則與 #12 記名整合授權。並行企劃 B-04。**
