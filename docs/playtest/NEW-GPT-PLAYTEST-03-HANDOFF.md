# LR-Anime｜新 GPT 對話完整接續索引｜PLAYTEST-03

這是新 GPT／Codex 對話的必讀入口。**工作區檔案 ≠ 已入 GitHub；文件入庫 ≠ 程式已合併；測試通過 ≠ Owner 驗收。**

## 產品、技術與原路線

- Repository：`mini1060919-code/LR-Anime`，Vite／JavaScript／Three.js，末日單人網頁基地經營，繁體中文優先、英文保留，Windows 瀏覽器先行。
- 原始 [總計畫](../MASTER-PLAN.md)、[A～E v1.0](../plans/AE-V1.0.md)、[M0～M11 索引](../milestones/README.md)、[固定九項回報規則](../PROJECT-PROGRESS-REPORTING-RULES.md)。
- A＝參謀澪美術，B＝新手與對話，C＝基地日報/參謀，D＝新角色招募，E＝建築選單/角色 UX；原始 A→E→B→C→D 為美術企劃建議順序。
- M0～M5-B 已有工程候選，功能 PR #1→#2→#4→#3→#5→#6；G1 NO-GO 仍阻正式整合。原正式開發順序 G1→UX-01→M5-C→M6-A/B/C/D→M7→M8→M9→M10→M11。
- 原始「正式開發總計畫 v2.0」的完整原文在 MASTER-PLAN 中標示**尚未收錄**；不得自行重建成已保存原文。

## 過往可追溯 GitHub

- PR #10：原始規劃／治理 `docs/ae-master-plan-v1-governance`（Draft）。
- PR #25：PLAYTEST-02 Owner 回饋/修正計畫 `docs/playtest-02-owner-feedback-handoff-20261125`（Draft）。
- 本輪新增：PLAYTEST-03 Owner 人工試玩觀察與跨對話指引（見 PR 對應 Head；完成後須重新核對）。
- PR #12 CI bootstrap、#13 full regressions、#19 UX-01 設計、#24 D-ART 母版，各自需重查當下 Base/Head/狀態，不能把 Draft 當 merged。
- D-ART 64/64 `VISUAL_PASSED`，正式 `APPROVED` 0/64；立石怜灰紫戰術研究服母版為視覺決策，不等於所有 PNG 正式放行。

## 已知新事實與不確定

- Owner 已成功啟動試玩包，於對話上傳兩張實際畫面。
- Owner 最新 7 項回饋：[PLAYTEST-03 紀錄](PLAYTEST-03-OWNER-REVIEW-20261125.md)；分批執行：[PLAYTEST-03 計畫](PLAYTEST-03-ACTION-PLAN-AND-ACCEPTANCE.md)。
- P0 **不是**「無法完成教學建造」的舊問題，而是「**即使能建造，教學後食水不足以繼續生存**」；原低成本路徑 3/3 過關不能蓋過新失敗。
- P1 建築與先前無差、教學面板遮住施工、中央選單不能收合、派工與特殊角色價值不明、教學員未出現。
- Owner 人工存檔讀檔驗收延後；工程存檔安全仍必須保留。
- 新增音樂是 P2 功能需求，待核心問題穩定後再做。
- 先證明 Owner ZIP 包含哪個 commit 與建築改善補丁；不得直接把「視覺曾有條件 PASS」當最新結論。

## 新 GPT 第一輪應做的事

1. 從最新 Draft PR 實際 **讀取**本檔、PLAYTEST-03 紀錄與計畫，並讀 PR #10 原始規劃、PR #25 舊回饋、G1 與九項報告規則。
2. 重查全部相關 PR/SHA/CI；查 2 張圖的 Owner 反映，但截圖只有對話內，若 GPT 無法查看，標示未取得原圖。
3. 先完成唯讀技術盤點：真實 ZIP 版本、資源收支、建築 patch、教學面板與選單事件、居民工作、參謀澪出場契約。
4. 提供精確可執行的分批工程方案／可能檔案／回復計畫／驗收門檻，先向 Owner 請求**隔離實作**獨立授權。
5. 不要回頭重做角色美術，亦不得只修改文件就宣稱遊戲已變好。
6. 若 Owner 要求工程實作，先核實授權範圍，仍不得修改 main/develop、合併、部署或玩家存檔。

## 每次交接回報格式

按照 `docs/PROJECT-PROGRESS-REPORTING-RULES.md` 的九項：
全專案 A～E/M0～M11/G1；完成/未完成；證據及測試；風險和權限；PR治理；G1 GO/NO-GO；唯一下一工作 ID（可並行子工作）；完整可複製的下一輪 Codex 指令；GitHub 文件同步（若經授權）。

G1 **NO-GO**，不得合併、部署、修改正式玩家 v4/v5/v6 存檔或將 64 張素材視為正式核准。
