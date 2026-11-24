# LR-Anime｜新 Codex 對話接續入口（PLAYTEST-02）

**這是跨對話索引，不是自動工程授權。**

## 專案與依據

- Repository: `mini1060919-code/LR-Anime`
- 本輪文件提案基於 `docs/ae-master-plan-v1-governance` 之 GitHub Head `ddafe7e5e8d02be642f9387b4fc6ba447b548979`（建立候選 docs 分支時的快照）。
- 歷史治理 PR #10；G1 基線 Draft #12、全回歸 Draft #13；UX-01 Draft #19；立石怜母版治理 Draft #24（這些 PR 不代表已合併）。
- 先看 [Owner 回饋與清單](PLAYTEST-02-OWNER-FEEDBACK-AND-BACKLOG.md)，再看 [執行及驗收路線圖](PLAYTEST-02-EXECUTION-AND-ACCEPTANCE-PLAN.md)。
- 前次美術 `D-ART-OWNER-REVIEW-03`：64/64 PNG `VISUAL_PASSED`，正式 `APPROVED=0/64`，使用權證據尚待完整追溯；D28 立石怜灰紫戰術研究服母版已由 Owner 選定。
- 舊 UX-BUILDING-VISIBILITY-02 有隔離 patch + Owner「有條件視覺 PASS」紀錄；**最新 PLAYTEST-01 實際試玩卻回報建築「否，不夠明顯」**，不可掩蓋衝突。先確認試玩版本，未核對不能宣告修復成功。
- Codex 先前報告隔離版 701/701 單元、24/24 Playwright、build 成功；此為**前次候選歷史證據**，不是 PLAYTEST-02 新修正的測試。
- G1 **NO-GO**，遊戲正式整合及部署仍待獨立記名決議。

## 本輪新 Owner 試玩要求

`PT02-06` P0 新手教學資源不足；`PT02-01` P1 建築仍不明顯；`PT02-03` P1 居民作用／派工及教學員未出現；`PT02-05` P1 中央選單取消與收合；`PT02-04` UI 遮擋尚未測試；`PT02-02` 建造選取取消拆除 PASS 要保留；`PT02-07` P2 背景音樂需求。

## 新 Codex 第一輪「只讀」任務

1. `git fetch` 僅取回資訊（不修改正式分支），查最新 docs PR 與 G1 狀態。
2. 讀三份歷史索引、G1 放行清單、上述兩份 PLAYTEST-02 文件與 Owner 回饋原文。
3. 找出 Owner 實玩 commit + patch 是否含 UX-BUILDING-VISIBILITY-02，防止錯誤地認定候選修正版已失敗或已通過。
4. 復現 P0 教學資源不足，讀開局資源和建築成本、tutorial 觸發；調查教學員與居民手動/自主工作；確認中央選單狀態。
5. 整理優先修正的精確檔案、設計取捨、影響範圍、驗收案例與隔離回復策略。
6. 另整理背景音樂的原創或權利可證來源及 Audio 模組計畫。
7. 提交 read-only 分析與下一輪「隔離實作授權」提案，**不得直接寫 GitHub、啟動 GitHub PR、合併、部署或更動存檔**。

## 統一回報契約

每次回報：工作編號、Owner 原文與來源、狀態、優先級、當下 Base/Head SHA、實際操作、修改檔案、測試與日志、證據路徑、風險、下次工作及待 Owner 決策。不得將既有 PASS 當新修正 PASS；不得擅自批准 PNG。

**G1 NO-GO**；`main`/`develop` 不修改、PR Draft 不合併、無部署、無強制推送與分支刪除、不得讀寫真實玩家 v4/v5/v6 存檔。
