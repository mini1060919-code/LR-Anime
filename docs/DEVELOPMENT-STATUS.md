# LR-Anime｜最新開發狀態
更新：2026-11-20（Asia/Taipei）。**來源為專案負責人提供之 A～E 原計畫、先前 Codespaces 截圖及 GitHub 已操作 PR；非新的完整回歸實測。**

## 管理總覽
- 目前關卡：**G1**；決策 **NO-GO**。
- 第一階段：M0～M5-B 有程式開發成果，整合驗收尚未放行。
- UX-01：建築選單與角色作用改善的設計，依原始計畫稱完成；原始交付物與工程落地待核對。
- M5-C：待開發；M6：部分企劃；M7～M11：後續規劃。
- A 工作包：A-02～A-06 先前曾推進，但未取得全部交付／版權證據，保留待核對。
- B 工作包：原訂企劃線接 B-03～B-06；B-01／B-02 原檔待核對。
- C／D：原始工作項目已入庫，未宣稱實作。
- E：六個 UI/UX 子項已按原文建檔，未宣稱程式完成。

## GitHub 工作追蹤
| 項目 | 連結 | 現況／限制 |
|---|---|---|
| M3 | [PR #7](https://github.com/mini1060919-code/LR-Anime/pull/7) | 修正 neutral 斷言，待統一版本重測 |
| M4～M5-B | [PR #8](https://github.com/mini1060919-code/LR-Anime/pull/8) | Codex 個別環境 6/6 E2E PASS，單元 701/701 PASS，建置成功 |
| G1 統一 | [PR #9](https://github.com/mini1060919-code/LR-Anime/pull/9) | Draft 驗證分支；完整同一版本驗收未完成 |

## 下一步（依序）
1. 完成 PR #9 head 的 G1 完整測試與依賴／存檔驗收，更新 [G1](milestones/G1.md)。
2. 核對 A～E 交付物原檔，補充工作包中的實際驗收證據。
3. G1 放行後處理 UX-01；並行企劃 B-03～B-06 → C → D。
4. 後續 M5-C、M6-A～D、M7～M11 按 [M 階段](milestones/README.md) 推進。

## 更新契約
每次修改功能、設計或素材都應在相關階段檔案留下日期、成果路徑、PR／commit、測試及風險；同步更新本狀態頁與 [變更日誌](CHANGELOG-PLAN.md)，以免新對話出現版本錯置。
