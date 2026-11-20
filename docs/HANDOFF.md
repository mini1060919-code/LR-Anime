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
