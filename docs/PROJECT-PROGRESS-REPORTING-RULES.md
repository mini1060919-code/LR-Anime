# LR-Anime｜全專案總進度與 Codex 接續固定規則 v1.0

建立：2026-11-20（Asia/Taipei）｜責任：工程、企劃、美術、治理共同遵守
此文件是持續性**回報規則**，非整合放行；每次報告均以最新 GitHub PR、commit、CI、文件及交付物為準。

## 每次開發成果回報固定章節（不可省略）
1. **LR-Anime｜全專案開發總進度**：A～E 工作包和子項、M0～M11（含 M5-A/B/C、M6-A～D）、G1、UX-01；將「規劃／設計／實作／單獨測試／整合／正式發布」區分。未取得可靠分母時不使用虛構的全案完成百分比。
2. **本次已完成／未完成工作**：工作 ID、GitHub 檔案路徑、PR、完整 commit SHA、實際變更；不把設計、工作區成果當作正式程式已合併。
3. **實測及證據**：同一 Git commit 或 PR merge ref 的 `npm ci`、`npm test`、`npm run build`、Playwright 全套（PASS/FAIL/SKIP/RETRY）、v4/v5/v6／未知版存檔防覆寫、CI run／Job URL、trace 與 artifacts；沒有新測試須清楚標示。
4. **錯誤、風險、權限**：P0/P1/P2、已驗證根因、待查問題、HTTP 403 受限端點／權限、資產與授權、存檔相容及回復方式。
5. **GitHub 合併治理**：相關 PR state、Draft、Base/Head SHA、依賴、reviews、required checks、branch protection/rulesets、擁有者待操作事項。測試 PASS 不代表 GO。
6. **G1 GO／NO-GO**：明確列出證據及尚欠門檻；任一必備門檻無法確認一律 NO-GO，不合併／部署。
7. **下一個工作編號**：一個首要工程任務、可並行的企劃／美術任務、各自交付與驗收條件；先讀最新狀態，避免重做。
8. **「Codex｜下一階段可執行指令」**：每次必須附完整可複製內容（repository、基準 ref、先讀文件、明確工作目標、可直接執行事項、禁止事項、命令／驗收、失敗處置、GitHub commit/PR、交接文件更新和最終回報格式）。不得只提供原則、口號或簡略建議。
9. **交接文件同步**：相關 `docs/plans/`、`docs/milestones/`、`docs/DEVELOPMENT-STATUS.md`、`docs/HANDOFF.md`、`docs/CHANGELOG-PLAN.md`；涉及 G1 同步 `docs/milestones/G1.md` 和 `docs/milestones/G1-RELEASE-CHECKLIST.md`。歷史採追加式，保留先前失敗／修補，不覆寫過往快照。

## 不可更動的產品與整合底線
- 保留 Vite／JavaScript／Three.js 3D 基地玩法、繁中及英文切換、玩家原有 v4/v5/v6 存檔、未知版本防覆寫、角色穩定 ID；不依賴付費 AI API。
- 不重做既有功能、重新生成／覆蓋既有正式人物資產，不擅自使用未授權素材。
- 原工程順序：`G1 → UX-01 → M5-C → M6-A → M6-B → M6-C → M6-D → M7 → M8 → M9 → M10 → M11`。
- 原企劃線：`B-03 → B-04 → B-05 → B-06 → C → D`，A/E 先核對原稿。B-03 v0.1 草案已建；企劃下一步 B-04。
- 功能 PR 原依賴：`#1(M1) → #2(M2) → #4(M3) → #3(M4) → #5(M5-A) → #6(M5-B)`。#7/#8 修補已在 #9 統一候選中，不重複合併；#11 在 #9 上加 CI。#10 為獨立治理文件。
- 未取得 G1 完整放行及明確授權：不得修改／合併 `main`、`develop`，不得部署、刪除分支／PR、降低失敗測試門檻、強制推送或觸碰玩家資料。
- 合併前重新鎖定最新 SHA、檢查 merge ref/diff/規則，依序 Merge Commit；每段重新驗證。異常即停止，需回復時以受審 revert PR 回復，不以 force reset 取代。
- 只允許把可查證的 GitHub CI 結果寫為「CI PASS」，不可擅自把「G1 NO-GO」改為 GO。

## 本規則生效時的進度基準（必須在未來回報時重新核對）
- G1-CI-02 既有證據：GitHub Actions run [44724242042](https://github.com/mini1060919-code/LR-Anime/actions/runs/44724242042) completed/success；Vitest 701/701、E2E 24/24，build PASS；不是已合併／發布。
- 2026-11-20 本輪查核：PR #1～#11 全部仍 Open／未合併；#9/#10/#11 Draft；其 reviews 尚無核准。G1 仍 NO-GO。
- G1-GOV-01 待辦：required checks／review／ruleset 是否強制生效尚缺擁有者有權限證據；之前詳細端點因 `administration:read` 不足回 HTTP 403。
- 歷史上曾以 G1-GOV-02 為下一階段；依 2026-11-20 晚間最新 G1-GOV-02 紀錄，**當前下一工作為 G1-GOV-03**：擁有者提交 Settings／保護規則／required checks／review／Pages 的實際證據及記名授權。工程 G1 解除前不進入 UX-01 功能整合。
- [全專案總進度快照（2026-11-20）](PROJECT-PROGRESS-SNAPSHOT-2026-11-20.md) 是範例及歷史基準；每次回報須先查最新 GitHub。

## 每一階段必須提交 GitHub 的交接閘門（強制）
- **階段成果與交接同時入庫**：工程、企劃、美術、UI、測試及治理任一階段，結束時必須將成果或驗收證據 commit＋push 至 GitHub 可查分支，以新 PR 或現有 PR 留痕；不可只存在聊天、截圖或未推送的 Codex 工作區。
- **採 [單階段交接模板](STAGE-GITHUB-HANDOFF-TEMPLATE.md)**：填工作編號、完成／未完成、檔案路徑、Base/Head SHA、Commit、PR、測試（或未測）、存檔相容、美術授權、風險、GO/NO-GO、回復與下一工作。
- **同步三個全域入口**：每階段更新對應 `docs/plans/` 或 `docs/milestones/`、`docs/DEVELOPMENT-STATUS.md`、`docs/HANDOFF.md` 和追加式 `docs/CHANGELOG-PLAN.md`；G1 同步 `G1.md` 及放行清單。新對話必須由 `HANDOFF.md` 找到最新工作編號與證據。
- **交接讀回驗證**：提交後重新透過 GitHub 查詢 URL、Head SHA、Commit 和文件存在。只有 GitHub 可見且交接入口已同步才能標記「**GitHub 交接完成**」；本地成功但遠端失敗須註明「GitHub 交接未完成」並保留未交付清單。
- **不能偷換完成定義**：階段檔已提交不等於功能已整合或驗收通過；未通過 G1 及正式授權，不動 main/develop、不部署。舊失敗與修復紀錄只可追加不刪除。
- **每次給 Codex 的指令都要包含上述落盤流程**；最後輸出 GitHub PR、完整 SHA、證據 URL、交接狀態及下一階段 Codex 可執行指令。
