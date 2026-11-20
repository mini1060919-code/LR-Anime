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
