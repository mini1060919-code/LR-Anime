## M5-A：有界限的居民疲勞、健康與士氣

Base：`feature/m4-survivor-progression`（`2d1f408`）。保留 M1–M4，不合併、不修改 main、不正式部署。

新增每位居民 0–100 的疲勞、健康與士氣。有效值勤增加疲勞、待命／停工休息降低疲勞；原飢餓口渴壓力影響健康，供應、休息與有限個性差異影響士氣。職業疲勞差異最多 ±5%，士氣個性偏移最多 ±5 點。沒有疾病、離隊、複雜醫療或自主 AI，健康 0 不新增死亡條件，夜襲／原死亡規則維持。

需求效率只減少生產、採集、植林與研究，介於 40–100%，不增加原產出；M4 技能／經驗與上限、支援光環及戰鬥傷害規則保留。可獨立停用需求效率，保留數值追蹤並回到 M4 工作倍率。

M3 立繪／頭像／五表情與 M4 技能／派工完整保留，新增中英文三需求、狀態、工作效率與開關。需求在唯一的正模擬步結算，保存步號並拒絕重複／倒退／非法 dt，不用牆鐘或日夜歸零補扣。

v6 增加 versioned survival 元件與 `survival-needs-v1` 必要功能，保留原 runId／UID／成長／工作／美術 ID；有效 v4/v5/M3/M4 檔安全補預設並永久備份來源。未知／損壞不覆寫。另修正同內容舊 v6 匯入可能跳過原文備份的短路，現在即使無需重寫也先保護舊來源。

### 驗證

單元測試 **657/657（29 檔）**、正式建置成功；包含 30,000 遊戲秒（200 個日夜週期等值）的需求／食水經濟模擬。M5-A 桌面／手機 browser **2/2** 通過；原有十二項 browser 首輪 11 通過，1 項 M3 不變資料斷言因合法士氣變化失敗，修正為完整比對所有非 needs 資料及需求範圍後單項複驗 1/1 通過。最終 **14 個不同 browser 案例全數具通過結果**；分組紀錄與截圖見報告。

- [計算公式與介面範圍](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5a-survival-needs/docs/M5A-IMPLEMENTATION.md)
- [存檔相容性與回復](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5a-survival-needs/docs/M5A-SAVE-COMPATIBILITY.md)
- [測試與截圖](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5a-survival-needs/docs/M5A-TEST-RESULTS.md)
- [修改檔案](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5a-survival-needs/docs/M5A-CHANGED-FILES.md)

### 已知風險

這是保守的首版需求數值，不是完整 AI 排班；全天值勤會累積疲勞，需玩家利用既有派工安排休息，原自動派工亦可能再分配工作。長局平衡仍需玩家驗收，200 週期測試不代表所有城市配置或 200 場夜襲都已覆蓋。沒有離線恢復，仍是黎明檢查點與單分頁 localStorage；新欄位增加大小，保留既有 2 MiB 上限／配額保護。

回到 M4 `2d1f408` 前保留完整 M5-A v6 與升級前永久備份，不刪 localStorage。舊 M4 不認得新必要功能會保護原檔；v5 副本不保留人物身分、成長、需求與高水位，不能當完整回復檔。未新增角色圖片或變更既有授權。
