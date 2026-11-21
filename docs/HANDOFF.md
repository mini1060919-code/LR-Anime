# LR-Anime｜新對話／Codex 標準交接
最後更新：2026-11-20；請**先重新讀 GitHub 最新版本**，不可把本頁日期當成即時狀態。

## 專案
`mini1060919-code/LR-Anime`。Vite／JavaScript／Three.js；繁體中文優先，保留英文；Windows 網頁 3D 末日基地經營；不依賴付費 AI API。

## 先讀文件
1. [總計畫](MASTER-PLAN.md)
2. [A～E v1.0](plans/AE-V1.0.md) 與 [各階段](plans/README.md)
3. [M0～M11 里程碑](milestones/README.md)
4. [G1 驗收](milestones/G1.md)
5. [最新狀態](DEVELOPMENT-STATUS.md) 與 [變更日誌](CHANGELOG-PLAN.md)

## 本次交接狀態
- 第一階段 M0～M5-B 已有程式成果，仍未完成 G1 放行。
- PR #7：M3；PR #8：M4～M5-B；PR #9：統一驗證；最後一份是 G1 主驗證候選。
- PR #8 Codex 曾回報 E2E 6/6、單元 701/701、建置成功；不代表 PR #9 最新版本已通過。
- A～E 的編號、需求和限制已永久拆檔，但實際美術／設計交付須逐項補證據。
- 下一步：完成 G1 回歸及存檔安全審核；G1 仍 NO-GO。

## 新對話接續口令
「接續 LR-Anime 開發。請先讀取 GitHub `docs/HANDOFF.md`、`docs/MASTER-PLAN.md`、`docs/DEVELOPMENT-STATUS.md`、`docs/milestones/G1.md` 與相關 A～E 階段檔案，依最新 PR/Commit/測試更新狀態。沿用既有計畫，不重做已完成成果；可直接執行已授權的非正式合併工作；未滿足 G1 前不可合併 main/develop 或部署。」

## 完成一階段時必須輸出
- 已完成項目、可檢視成果路徑與 GitHub commit/PR。
- 設計決策、風險、存檔相容與授權。
- 測試命令與實際結果、尚未完成項目、下一工作編號。
- 同步更新對應階段、總狀態、變更日誌。
- 不能執行的操作必須誠實標記，不得臆測 PASS。

## 2026-11-20 六大盤點補充
- 盤點報告：[AUDIT-2026-11-20.md](AUDIT-2026-11-20.md)。
- **G1 P0：** GitHub PR #9 目前仍使用等待整個 Day 2 的舊版 `e2e/smoke.spec.js`；先前 Codespaces 曾在本機 `fix/g1-smoke-dawn-save` 修正並得到 2/2 PASS，但此修正**尚未併入 PR #9**。全版回歸前務必對齊；切勿直接判定煙霧測試已通過。
- 目前文件在 PR #10 的 `docs/ae-master-plan-v1-governance` 分支，**尚未合併 main**。新對話請先指定此分支讀取。


## 2026-11-20｜交接狀態更新（PR #9 全部自動化測試 PASS）
- **最新的驗收事實以此節優先**；上方 PR #9「尚未重測」與 Smoke「待對齊」屬較早時間的歷史快照。
- 分支 `review/g1-unified-validation`，Head `a2000b4e4700cd187aa0b1d2b2186364743850dc`：Codex 報告 Vitest **701/701**、Playwright **24/24**、建置 PASS；M3 neutral 備援 trace 補跑 **2/2**；Smoke **2/2**；v4/v5/v6 相容驗證通過。
- Codex 將報告更新於 PR #9；原始本機資料 `/workspace/work/g1-unified-evidence/`。
- **自動化回歸 PASS ≠ G1 放行**：required checks／review 規則查詢 HTTP 403，合併依賴與正式放行尚未確認；PR #9 Draft，沒有合併或部署。
- 文件仍在 PR #10 的 `docs/ae-master-plan-v1-governance` 分支，跨對話請指定此分支讀取，並重新查 GitHub 最新 PR。


## 2026-11-20｜CI 新狀態與接手方式
- G1 已新增 [CI Draft PR #11](https://github.com/mini1060919-code/LR-Anime/pull/11)，Head `cfa103c659aeb68aa97b448746ac944bbb16fd0d`，相對 PR #9 僅新增 GitHub Actions workflow。
- CI run `44724242042` 已啟動；最初核對單元／建置 SUCCESS、完整 Playwright E2E IN_PROGRESS。接手後應先重新讀當下 GitHub Actions 狀態，不能沿用這個過渡狀態。
- [G1 正式放行檢查表](milestones/G1-RELEASE-CHECKLIST.md) 列出 required checks／審查／合併順序尚未完成之項目；不得直接合併 develop/main。

## 2026-11-20｜新對話交接：G1-CI-01 最新查核
- **請以再次讀取 GitHub 為準**；此段記錄查核當下狀態，不保證未來不變。PR #9 Open/Draft Head `a2000b4e4700cd187aa0b1d2b2186364743850dc`；PR #10 Open/Draft（本文件分支）；PR #11 Open/Draft Head `cfa103c659aeb68aa97b448746ac944bbb16fd0d`。
- PR #11 僅新增 GitHub Actions workflow；[run 44724242042](https://github.com/mini1060919-code/LR-Anime/actions/runs/44724242042) 最後查核仍 **in_progress**；Unit/Build job **success**（直接 GitHub log：701/701、build 成功）；Complete Playwright E2E **in_progress**，不是已通過。E2E job log 此時回傳 404 BlobNotFound；無 artifact。
- #9 先前 Codex 曾在同一 Head 回報 24/24 E2E、Smoke 2/2、存檔 v4/v5/v6；不能取代 #11 這輪 GitHub CI 結果。
- PR #9 與 #11 reviews 各為 `[]`；combined statuses `[]` 不能證明 required checks；先前 Rules API 有 403 紀錄，本次 connector 無保護規則讀取功能，**請擁有者至 Settings → Rules → Rulesets / Branches 核對 main/develop enforcement、必需 checks、review、merge-commit**。
- 功能鏈 #1 M1 → #2 M2 → #4 M3 → #3 M4 → #5 M5-A → #6 M5-B；#7/#8 為測試修補，已匯入 #9，不得雙重匯入。統一候選與 develop 相比 ahead 13 / behind 0。
- **下個任務：G1-CI-02** 重新抓取 run 44724242042 最終狀態、24 項 E2E 明細、logs/traces；若 failure，先定位根因再由獨立分支提交測試或程式修復，保留既有斷言及零重試原則。其次 **G1-GOV-01** 核查擁有者保護規則、required reviews、逐段合併與 revert PR 計畫。
- **始終 NO-GO**：不得合併或直接更動 develop/main；不得部署、刪 PR/分支、觸碰玩家存檔。必要時參見 [G1 放行檢查表](milestones/G1-RELEASE-CHECKLIST.md)。


## 2026-11-20 19:34 Asia/Taipei｜G1-CI-02 GitHub CI 與整合前驗收

- [PR #9](https://github.com/mini1060919-code/LR-Anime/pull/9) `a2000b4e4700cd187aa0b1d2b2186364743850dc`；[PR #11](https://github.com/mini1060919-code/LR-Anime/pull/11) `cfa103c659aeb68aa97b448746ac944bbb16fd0d`；[PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) 文件查核基準 `28cc1e452dd3e08e8789004cf7a895e07fdd17ee`。
- [Actions run 44724242042](https://github.com/mini1060919-code/LR-Anime/actions/runs/44724242042) attempt 1，狀態 `completed/success`。Unit/Build job [136247490058](https://github.com/mini1060919-code/LR-Anime/actions/runs/44724242042/job/136247490058) 為 `success`，GitHub 原始日誌確認 30 檔、Vitest 701/701 及正式建置成功。Complete Playwright E2E job [136247489680](https://github.com/mini1060919-code/LR-Anime/actions/runs/44724242042/job/136247489680) 為 `success`。 完整 E2E 原始日誌證實 **24/24 PASS、0 fail、0 skip、0 retry**（30.4 分鐘）；M2 2/2、M3 美術 10/10（1280px、390px neutral 各 1/1）、M3 角色 2/2、M4/M5-A/M5-B 各 2/2、存檔保護 2/2、Smoke 2/2。原始兩 Job 日誌皆記錄同一 PR merge ref。進行中的 log 曾回 404 BlobNotFound，結束後 connector 成功讀取；CLI 下載 redirect 的 Forbidden 以 connector 取回 ZIP，已驗證完整性，內有 10 張截圖。無測試失敗，留存模式未產生失敗 trace，無須修復分支。保存 GitHub 原始日誌、ZIP 及 checksum 於執行工作區 `/workspace/work/g1-ci02/`。
- 下一工作 **G1-GOV-01**。在新 Codex 任務先指定 `docs/ae-master-plan-v1-governance` 讀 [G1](milestones/G1.md) 與 [正式放行檢查表](milestones/G1-RELEASE-CHECKLIST.md)，重抓 PR #1～#11 Base／Head／SHA／reviews／checks 及 [Actions run 44724242042](https://github.com/mini1060919-code/LR-Anime/actions/runs/44724242042)。將後續 CI 綁到實際 merge ref，核對 head、tree、完整 24 案例、零重試、v4/v5/v6 及未知版本保護。若有可定位失敗，獨立分支做最小修正，完整重跑後送 Draft PR。
- 擁有者須提供 develop/main 生效規則、兩 job 的 required checks 與 App、批准 review／對話解決、bypass、force push、deletion 及 merge 政策證據。按 G1 演練順序複核逐段 merge tree／回復計畫，取得授權前維持 **NO-GO**，不得合併、部署或操作玩家資料。

## 2026-11-20｜G1-GOV-01 接續與永久回報規則
- 已建立 [全專案總進度／Codex 回報規則](PROJECT-PROGRESS-REPORTING-RULES.md)。**每次任務結束必須輸出 A～E、M0～M11、G1／UX-01 全專案總進度及完整「Codex｜下一階段可執行指令」**，並附 GitHub PR、commit、測試證據、風險、決策、更新文檔。
- 最新重核 PR #1～#11 均 Open 未合併，#9/#10/#11 Draft；run 44724242042 completed/success、兩 jobs success，既有 G1-CI-02 完整 Playwright 24/24、單元 701/701、build PASS。
- PR #9/#10/#11 reviews 皆無批准；分支保護及 required checks 強制性仍缺擁有者的有權限證據，先前詳細端點 HTTP 403（需 administration:read）。**G1 NO-GO**。
- 下一 **G1-GOV-02**：取得 develop/main ruleset enforcement、兩 required jobs 與 App、review 人數/對話、strict/merge queue、force push/delete、bypass/管理員適用、merge 方法及 main Pages 部署隔離的擁有者證據；記錄審核人與 G1 放行決定。禁止未核准合併、部署及更動玩家存檔。


## 2026-11-20 20:50 Asia/Taipei｜G1-GOV-02｜正式整合治理查核

治理基準 [PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `53b8f569535c5f77a3553dd0a983f08697d1a27c`。G1 候選 [PR #9](https://github.com/mini1060919-code/LR-Anime/pull/9) `a2000b4e4700cd187aa0b1d2b2186364743850dc`，CI [PR #11](https://github.com/mini1060919-code/LR-Anime/pull/11) `cfa103c659aeb68aa97b448746ac944bbb16fd0d`。

**G1 NO-GO。下一工作 G1-GOV-03：擁有者提交上述證據、確認實際 merge ref 門檻及記名批准。**

在新 Codex 任務先重抓治理分支，讀總計畫、固定回報規則、G1 和[放行檢查表](milestones/G1-RELEASE-CHECKLIST.md)。重查 #1～#11 與 run 44724242042；相同 merge ref 沿用原始證據，變更則重驗。擁有者依 G1 的設定連結提供帶分支名、適用範圍、App、reviews、queue、保護、Pages 與決策人的證據。沿 #1→#2→#4→#3→#5→#6 再接一份統一 CI，核對每段 SHA/tree 與 revert 計畫。保留歷史並追加本次五份治理文件。證據或授權不足時保持 NO-GO，禁止合併、部署及動玩家資料。並行企劃 B-04；A/E 僅盤點原稿與權利。

## 2026-11-20｜全專案總進度與 Codex 必附指令規則
- 每次交接及階段回報必須先讀 [固定九項回報規則](PROJECT-PROGRESS-REPORTING-RULES.md) 和 [最新進度快照（歷史基準）](PROJECT-PROGRESS-SNAPSHOT-2026-11-20.md)，並重新查 PR/CI/Commit。所有輸出均須包括 A～E、M0～M11、G1/UX-01、成果證據、風險、下個任務編號，以及可直接複製的完整 **「Codex｜下一階段可執行指令」**。
- 最新既有 G1-GOV-02 紀錄指出下一工程任務為 **G1-GOV-03**（擁有者核對規則和正式授權）；並行企劃 **B-04**。不重作已完成的 G1-CI-02／G1-GOV-01／G1-GOV-02。
- 目前 **NO-GO**；不得合併、部署、修改 main/develop 或觸碰玩家存檔。


## 2026-11-20 21:54 Asia/Taipei｜G1-GOV-03｜治理與發布門檻重核

治理輸入為 PR #10 `bb78324e08382f2597a45bbbbe252c27e486b190`，已讀總計畫、固定回報規則、晚間快照與五份治理紀錄。

**G1 NO-GO。下一工程工作 G1-GOV-04：接收擁有者實際設定證據，核驗發布隔離及記名授權。企劃可並行 B-04。**

先讀治理分支的總計畫、固定回報規則、晚間快照、G1 與放行清單，重查 GitHub PR #1～#11、run 44724242042、實際 merge ref。已有 CI 701/701、24/24 與 build PASS；候選不變則沿用。依 [放行清單](milestones/G1-RELEASE-CHECKLIST.md) 取得兩分支與 Pages 環境設定證據，缺證或授權時保持 NO-GO。先查後寫，保留歷史；禁止合併、部署或操作玩家資料。

## 2026-11-20｜永久交接規則：每階段必須 GitHub 入庫
- 詳見 [固定開發回報規則](PROJECT-PROGRESS-REPORTING-RULES.md) 和 [單階段 GitHub 交接模板](STAGE-GITHUB-HANDOFF-TEMPLATE.md)。
- 從本次起工程／企劃／美術／UI／治理任何階段結束，**成果及階段證據必須 commit＋push 至 GitHub 並重讀驗證**；需同時同步本檔、DEVELOPMENT-STATUS、CHANGELOG 及對應階段文件。只在聊天或 Codex 本機留存不算交接完成。
- 未能寫入 GitHub 必須明示「GitHub 交接未完成」，保留後續補提交任務。後續報告仍須附完整「Codex｜下一階段可執行指令」，含 GitHub 入庫步驟。
- 工作狀態延續：**G1 NO-GO**；當前下一工程編號 **G1-GOV-03**，並行企劃 **B-04**。請以每次重新讀取的最新 GitHub 狀態為準。


## 2026-11-20 22:23 Asia/Taipei｜G1-GOV-04｜保護規則與擁有者證據查核

工程治理查核。文件基準為 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `ce597a0e47b47f69d03296d538f048bbcccd15f2`，前次 G1 紀錄 `ca97a1c40ba45934fef1983c44fca661bfc6dcc6` 後只有治理文件變更。本輪未更動程式、美術、授權或存檔。

**G1 NO-GO。下一工程 G1-GOV-05 在收到擁有者實際設定或授權後啟動，完成逐項證據驗證。並行企劃 B-04。**

收到擁有者證據後，從本治理分支重讀總計畫、固定回報規則、快照、G1 與放行清單，再查 PR #1～#11、run 44724242042 和 merge ref。按 [放行清單](milestones/G1-RELEASE-CHECKLIST.md) 核對規則、Pages 與記名授權。候選未變則沿用 CI 701/701、24/24、build 與既有七段演練；有變更才重驗。完成後追加同五份文件、commit＋push，重新以 GitHub 讀回文件及 PR #10 Head。缺證維持 NO-GO，不合併、不部署。


## 2026-11-21 13:14 Asia/Taipei｜G1-GOV-05｜單人治理與 develop CI 引導

工程治理。入庫基準 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `27d0ccca532b9d680922e2da4bae75a431d6477c`；候選開於 [Draft PR #12](https://github.com/mini1060919-code/LR-Anime/pull/12) `ci/g1-develop-bootstrap`，Base `f6faebbb8096967854bacf0708b196ffac2712b9`、Head `af558e85afc3c32345ca000c423816358cfaba58`。只新增 `.github/workflows/g1-validation.yml`，逐字沿用 #11。無遊戲、存檔或素材變更。

[Run 44869606630](https://github.com/mini1060919-code/LR-Anime/actions/runs/44869606630) completed/success；兩個 checks 由 github-actions（App 15368）產生。[Unit/Build job 136740938540](https://github.com/mini1060919-code/LR-Anime/actions/runs/44869606630/job/136740938540) npm ci、416/416（22 檔）、正式建置通過。[E2E job 136740938366](https://github.com/mini1060919-code/LR-Anime/actions/runs/44869606630/job/136740938366) 現行 develop 完整 Smoke 2/2（約 2.6 分鐘），單 worker、零失敗、零跳過、零重試，含自然黎明 autosave 與重載。兩份日誌均確認 checkout `63212337c730031496f15e0d0b3c7978cc30665b`，父提交為 develop baseline 與 #12 Head，tree `805d17777e80e31b06910642b28a1928afe26e3d` 與 #12 Head 一致。成功無失敗 trace，upload 無檔，artifacts 0。原始日誌與八段試算存於 `/workspace/work/gov05/`。

**G1 NO-GO。下一工程 G1-GOV-06：擁有者核對並設定兩項 Required Checks，讀回證據，確認 #12 的實際 merge ref 與記名整合授權。企劃並行 B-04。**

先重讀總計畫、固定回報規則、G1 與放行清單，重查 #1～#12 和兩個 Actions runs。取得 develop 有效規則、兩 checks/App、單人批准政策和 #12 授權。功能逐段流程與回復見 G1。追加五文件並以 GitHub 讀回 commit、PR 和檔案。缺證保持 NO-GO，不合併、不部署。


## 2026-11-21 13:17 Asia/Taipei｜G1-GOV-06｜Required Checks 與引導候選核驗

工程治理查核基準為 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `0c2b0dcb1efb8cd9b1c0f87ca48d81cbfebd3952`。本輪只追加治理文件。素材、授權及玩家資料無變更。

**G1 NO-GO。下一工程 G1-GOV-07：收到擁有者的 develop 強制 checks 設定與 #12 記名授權後核證；企劃並行 B-04。**

先讀總計畫、固定規則、G1、放行清單與交接模板。重查 #1～#12、run 44869606630／44724242042 與實際 merge ref；候選未變沿用驗收。按 [放行清單](milestones/G1-RELEASE-CHECKLIST.md) 核驗擁有者證據。追加五份文件並 GitHub 讀回 PR #10、commit 和檔案。缺證維持 NO-GO；本輪不得合併或部署。


## 2026-11-21 16:14 Asia/Taipei｜G1-GOV-07｜Required Checks 儲存前驗證

治理基準 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `a8cc1b3d8d955d9421a7721754fd48645717b515`。擁有者回報已選取兩項 GitHub Actions checks 與 Require branches to be up to date before merging，是否儲存未確認。develop 分支摘要顯示 protected:true、required checks off、contexts/checks 空；`GET /branches/develop/protection` 回 HTTP 403（administration:read），有效規則端點可見清單空。實際生效仍待讀回。

**G1 NO-GO。下一工程 G1-GOV-08：儲存後驗證 develop 生效規則與 #12 記名整合授權。並行企劃 B-04。**

重查 #11、#12、#13 的最新 Base/Head、實際 merge ref、checks 與擁有者儲存後證據，詳見 [G1](milestones/G1.md) 及 [放行清單](milestones/G1-RELEASE-CHECKLIST.md)。保留測試、歷史、儲存隔離及逐階段回復方案。缺證保持 NO-GO。


## 2026-11-21 20:38 Asia/Taipei｜G1-GOV-08｜儲存後驗證

治理基準 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `5148f2f46ac0303da56a3d43cf1187bab65008f0`。Owner 確認重新設定並按 Save changes。本輪只追加治理紀錄。

`GET /repos/mini1060919-code/LR-Anime/branches/develop` HTTP 200，`protected:true`，`required_status_checks.enforcement_level: everyone`，contexts 及 checks 精確列出 `Unit tests and production build` 與 `Complete Playwright E2E`，均綁 App 15368（github-actions）。相比儲存前 off，兩項 Required Checks 已證實生效。

**G1 NO-GO。下一工程 G1-GOV-09：讀回 strict（Owner 可提供儲存後規則截圖或具權限結果），核對 #12 最新 SHA 記名整合授權及 Pages 隔離。企劃並行 B-04。**

先重讀規則與 G1 放行清單。核對 #12 最新 SHA、CI、Owner 儲存後 strict 證據、Pages 隔離和記名授權。只追加治理紀錄並讀回 PR #10。保持 NO-GO，未授權不得合併或部署。


## 2026-11-21 20:42 Asia/Taipei｜G1-GOV-09｜設定與記名授權核證

治理基準 [Draft PR #10](https://github.com/mini1060919-code/LR-Anime/pull/10) `407deb4292f1aaaa52d17e722340da707744776f`。本輪只核證與追加文件。

**G1 NO-GO。下一工程 G1-GOV-10：收到 Owner 的 strict／單人規則、Pages 隔離或 #12 記名授權證據後核證，不重複執行相同查核。企劃並行 B-04。**

收到證據後依 [G1](milestones/G1.md) 與 [放行清單](milestones/G1-RELEASE-CHECKLIST.md) 核證有效規則及授權。重查 #12 的實際候選與 CI，候選未變沿用既有證據。追加五份紀錄並讀回 Draft PR #10。
