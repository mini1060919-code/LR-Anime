# LR-Anime｜PLAYTEST-02｜修正順序、驗收流程與回復計畫

## 啟動準備（只讀，先做）

1. 讀取 [Owner 回饋與清單](PLAYTEST-02-OWNER-FEEDBACK-AND-BACKLOG.md)、本頁、`docs/HANDOFF.md`、`docs/DEVELOPMENT-STATUS.md`、`docs/CHANGELOG-PLAN.md`、`docs/milestones/G1.md`。
2. 讀取 PR #12/#13/#19/#24 的當前 **Base/Head/狀態**；不得沿用未重查的 SHA 作放行。
3. 以 **read-only** 核對 PLAYTEST-01 真正執行的 commit／patch／工作樹，分辨場景改善候選是否被載入。前次 UX-BUILDING-VISIBILITY-02 的 `candidate.patch` SHA-256 據 Codex 截圖：`d1867d93d2d71a7e305cc6845d9a9adac53fe2294001a60b75a3bed0796345ba`。此為歷史報告資訊，仍應現場驗證。
4. 核查 Codex 工作區 `work/visibility-evidence/`、`shared/downloads/LR-Anime-UX-BUILDING-VISIBILITY-02-Owner-Review.zip` 是否實際可讀；沒有檔案不能宣稱已看原圖。
5. 建立一份本輪唯讀「實際試玩 build / preview URL / test seed / save isolation / branch & SHA / date」基準紀錄，避免跨分支判斷。

## P0：新手教學卡關

- 先復現資源不足與資源建築要求，記錄成本／初始庫存／先前教學支出。
- 提供最小修正選項：提高新遊戲開局資源／教學暫時補助／調整教學順序；需比較平衡性。
- 驗收：新遊戲初始資源能完成指定資源建築與教程步驟；不造成負資源、不意外修改既有玩家存檔，重播／略過不產生重複結算。
- 交付：重現步驟、根因、修正方案、測試草案與本地回復策略。

## P1：建築不明顯 + 中央選單 + 居民／教學員

- 建築：先核對「Owner 玩到的版本」是否真的含有修正 patch；若不是，提供**正確候選**的隔離預覽；若是，再針對模型本體與地面對比，非僅圖示文字進行局部方案。優先手機夜間密集與桌面白晝密集，不點選也能辨識。
- 中央選單：提供取消、收合、展開及快捷鍵（Escape）和手機觸控路徑；不破壞已 PASS 的建造、選取、取消、拆除。
- 居民：區分「已正常自主工作但 UI 不清楚」和「手動派工被覆蓋／效率無效」；明確顯示指派、實際工作、產出與優先序。
- 教學員：查角色是否應出場（觸發契約）、圖像 ID / neutral 備援與對話呈現；不以未獲 APPROVED 的新角色 PNG 逕行接線。
- UI 遮擋：1280×900、390×844 實際畫面與操作測試；兼查 390×320 窄屏。
- 每項均保留候選前後同場景畫面，避免因畫面版本不同而誤判。

## P2：原創背景音樂規格

- 只做規格與合法來源盤點，除非另有實作授權；規劃基地日常／夜晚危機／黎明結算三個場景音樂。
- 需要 BGM 與 SFX 分離、靜音/音量、使用者互動後播放、過場淡入淡出、裝置偏好保存，並確認效能和授權來源。不得擅用商業曲目。

## 階段交付與 Gate

| Gate | 前置證據 | 允許的下一步 |
| --- | --- | --- |
| G-READ | 原始反饋＋目前分支/patch＋問題復現紀錄 | Owner 審閱根因與修正順序 |
| G-PLAN | 實作方案／風險／修改檔案／回復計畫 | 取得獨立「隔離候選實作」授權 |
| G-LOCAL | 隔離候選 patch + SHA + 701/701 或當期適用測試 + build + 實際 Playwright + 截圖/trace | Owner 實際試玩 |
| G-OWNER | Owner 對具體候選 SHA、畫面與工作範圍的驗收 | 再取得 GitHub docs/feature PR 授權 |
| G-G1 | #12 Base/Head/merge ref/tree、Required Checks、Strict、部署隔離、記名合併授權、存檔保護 | 未滿足前一律 NO-GO，不合併、不部署 |

## 存檔、分支與回復

- 在隔離工作樹執行任何未來獲授權的修改；保留原始樹和 patch SHA，設置乾淨回復途徑。
- 若有未來隔離候選實作，測試不得讀寫真實玩家 v4/v5/v6 存檔；可使用**隔離測試 fixtures** 檢驗舊格式相容。
- 沒有新授權，不建立／修改 PR、不提交 GitHub、不推送，不碰 main/develop，不合併、部署、force push 或刪分支。
- G1 一直 **NO-GO**；這份路線圖不是任何 Gate 的放行批准。
