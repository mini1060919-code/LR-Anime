# LR-Anime｜單階段 GitHub 永久交接紀錄模板 v1.0

> 使用方式：每完成一個開發或企劃階段，複製本模板內容至對應 `docs/milestones/<ID>.md` 或 `docs/plans/<A-E>.md` 的**追加式階段紀錄**；涉及跨階段事項可另建 `docs/records/<YYYY-MM-DD>-<WORK-ID>.md`。不得以聊天記錄、未推送本地檔案或僅提供 Codex 文字回覆代替 GitHub commit。

## 階段識別
- 工作編號／名稱：
- 日期／時區：Asia/Taipei
- 企劃／工程／美術負責線與審查人：
- 前置工作、依賴與完成定義：
- 此輪狀態：規劃中／設計產出待核對／已開發待驗證／驗收通過／已整合／已發布（須附相應證據）

## 實際交付清冊
- 需求／UI／美術／程式／測試檔案的 GitHub 路徑：
- 分支、PR URL、Base SHA、Head SHA、Commit URL（完整 SHA）：
- 已完成與未完成事項、相對上一版的變更、確認未重做既有成果：
- 素材來源、SHA／尺寸／透明度與授權（不適用則註明）：

## 驗證及相容
- 對應 GitHub Actions run／Job／Artifact URL：
- `npm ci`、`npm test`、`npm run build`、Playwright 完整命令／PASS／FAIL／SKIP／RETRY／trace：
- v4／v5／v6 與未知版本存檔保護、角色穩定 ID：
- 人工驗收與未執行事項（不得假設通過）：
- 合併／發布狀態（兩者不得與「測試 PASS」混淆）：

## 風險、決策及回復
- P0/P1/P2 風險、錯誤根因、權限（含 403）：
- GO／NO-GO 決策與審查批准（沒有證據即 NO-GO）：
- 合併前後 SHA、受保護分支與 revert PR 方案；不改動玩家存檔：

## 下一個 Codex 任務交接
- 下一工作編號（工程／並行企劃）：
- 待處理事項、預期輸出路徑及驗收標準：
- **Codex｜下一階段可執行指令**：完整可複製內容或 GitHub 上的固定指令文件連結。
- 新對話首讀：`docs/HANDOFF.md`、`docs/DEVELOPMENT-STATUS.md`、`docs/MASTER-PLAN.md`、本工作包階段文件、`docs/CHANGELOG-PLAN.md`、`docs/PROJECT-PROGRESS-REPORTING-RULES.md`。

## GitHub 提交完成確認
- [ ] 階段本體成果及本紀錄已 commit＋push 至可查的 GitHub 分支，產生 PR 或更新既有 PR。
- [ ] 已以 GitHub API 重新讀回，確認檔案／PR／commit 仍可存取（避免只在 Codex 工作區）。
- [ ] 同步更新 `docs/DEVELOPMENT-STATUS.md`、`docs/HANDOFF.md`、`docs/CHANGELOG-PLAN.md`；G1 相關另同步 G1 與放行清單。
- [ ] `docs/HANDOFF.md` 有**最新下一步**，舊狀態保留為歷史；本階段資料不可被新對話誤當正式整合。
- [ ] 最後報告列出新 Commit SHA、PR URL、測試證據與新對話 Codex 指令。
- [ ] 如 GitHub 寫入失敗，明確標示「**未完成 GitHub 交接**」，不得宣稱階段交接完成。
