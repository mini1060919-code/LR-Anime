# LR-Anime｜全專案開發總進度｜2026-11-20 晚間快照

> 工作基準：GitHub 分支 `docs/ae-master-plan-v1-governance` 及 PR #1～#11、G1-CI-02／G1-GOV-02 已歸檔證據。本文件是**時點快照**，非永久即時數值、非正式 GO。每次新回報先讀最新 GitHub 並依 [固定規則](PROJECT-PROGRESS-REPORTING-RULES.md) 重核。
> **不得產生無可靠分母的全案完成百分比。** 下表區分「有成果」與「驗收／整合／發布」。

## 1. 整體階段總覽

| 面向 | 已有成果／證據 | 未完成及不可誤判 |
|---|---|---|
| 基礎工程 M0 | Codespaces／Vite／JavaScript／Three.js 環境及開發歷史 | 環境一致性與 M0 最終驗收待核 |
| M1 | v4→v5 保護、存檔槽、匯入／匯出功能分支 PR #1 | 未合併 develop |
| M2 | 繁中＋英文介面與動漫 UI 功能分支 PR #2 | 未合併 develop |
| M3 | 凜、悠真、紗月、蓮的人物與美術整合 PR #4、E2E 修補 #7 | 正式美術權利／完整整合待放行 |
| M4 | 居民職業、技能、成長及工作 PR #3 | 未合併 develop |
| M5-A | 疲勞、健康、士氣 PR #5 | 未合併 develop |
| M5-B | 自主休息與工作優先級 PR #6 | 未合併 develop |
| G1 | PR #9 統一候選、#11 CI；GitHub Actions run 44724242042 兩 Job success，Vitest 701/701、E2E 24/24、build PASS；依賴及 merge/revert 演練有記錄 | **NO-GO：required checks 生效、review／分支保護、正式授權未核；PR 均未合併** |
| UX-01 | E 工作包原先設計完成的歷史說明 | 原稿與程式落地／使用性驗收待核 |
| M5-C | 長期生存平衡有預定範圍 | 待開發 |
| M6-A | 參謀澪與教學企劃，有 B-03 v0.1 草案 | 程式未完成，A 素材與 B-01/B-02 原稿待核 |
| M6-B | 日報、每日結算與參謀建議的企劃需求 | 程式待開發 |
| M6-C | 漸進招募與角色養成企劃需求 | 程式待開發 |
| M6-D | 劇情、基地事件與選擇企劃需求 | 程式待開發 |
| M7 | 行動推進時間／日夜機制規劃 | 待開發，現行連續日夜不是 M7 完成 |
| M8 | 世界探索、地區與陣營規劃 | 待開發 |
| M9 | 進階基地建設及生產鏈規劃 | 待開發 |
| M10 | 人物、建築、事件模組擴充規劃 | 待開發 |
| M11 | 效能、安全、授權與正式發布驗收規劃 | 待開發 |

## 2. A～E 工作包逐線進度

| 工作包 | 子項 | 目前交付層級 | 下一步 |
|---|---|---|---|
| A 參謀澪美術 | A-01～A-06 | 設計先前有成果回報，但正式透明圖、alpha、SHA、manifest／授權未完整核實 | 核對原檔，禁止重製／覆蓋既有素材 |
| B 新手教學 | B-01～B-06 | B-03 v0.1 企劃草案已入庫；B-01/B-02 原稿待核；B-04～B-06 待企劃 | **B-04** 夜襲與黎明報告設計；與 C 防重複結算 |
| C 基地日報 | C-01～C-06 | 需求已建檔，未宣稱實作 | 定義真實快照、一次性結算與雙語介面契約 |
| D 角色招募 | D-01～D-06 | 需求已建檔，未宣稱實作 | D-01 身分分類，再 D-02 八位具名倖存者；保留既有四角色 |
| E UI／UX | E-01～E-06 | 原設計首版有完成紀錄，原稿／程式驗收待核 | G1 解除後 UX-01 工程落地與驗收 |

## 3. 工程與治理目前狀態
- 程式及功能 PR 依賴：#1 M1 → #2 M2 → #4 M3 → #3 M4 → #5 M5-A → #6 M5-B；#7/#8 測試修補經 #9 統一候選，#11 加入 CI；#10 是獨立文件治理。**不可按 PR 數字盲目合併，亦不可重複引入修補**。
- G1-CI-02：GitHub Actions [run 44724242042](https://github.com/mini1060919-code/LR-Anime/actions/runs/44724242042) 已完成成功；同一測試候選含 M2／M3／M4／M5-A／M5-B、存檔保護及 Smoke 的 24 項 E2E；v4/v5/v6 與未知版本安全依既有合成存檔證據驗證。此為測試證據，不是正式整合。
- G1-GOV-02：develop/main 曾顯示 `protected:true`，但 required checks 摘要 off；詳細 protection API HTTP 403、須 `administration:read`。GitHub Pages 設定查詢 404，main push 有部署工作流，不能擅自推 main。
- 過去本機七段 merge／revert 演練通過；此為預演，不代表七段已正式合併。正式合併仍須每段實際 PR merge ref 的 checks／批准、before/after SHA、回復及存檔隔離。
- **G1 NO-GO**。工程首要下一編號 **G1-GOV-03**：由擁有者補齊 Rulesets/Branch protection、兩 Job required checks、review／bypass／merge queue、Pages 發布防護及記名放行授權。並行企劃 B-04；A/E 原檔與權利盤點。

## 4. 每次輸出固定格式
每一次階段回報均以 [全專案總進度與 Codex 固定回報規則](PROJECT-PROGRESS-REPORTING-RULES.md) 的九項章節為準，**最後必附「Codex｜下一階段可執行指令」**；指令需可複製，明訂 Repo／Base／工作編號／可執行命令／驗收／GitHub 留存／失敗處置／禁止合併部署等限制。舊快照不得替代最新 PR、Commit、CI。
