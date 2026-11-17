居民現在會在疲勞達 85 時退出工作休息，恢復至 35 且至少休息 10 遊戲秒後返工。保留玩家手動指定的建築與待命意向；手動返工優先於自主空缺分配，同時驗證建築容量、存活及單一工作歸屬。

目標分支：`feature/m5a-survival-needs`；基準 `002529e38d072f39f9af137b14de5206fee5d672`。依賴 M1／M2／M3／M4／M5-A；本 PR 不包含合併或正式部署操作。

自主空缺依建築優先級、資源急迫度、職業、技能及健康排序；有效現職保持穩定。角色面板新增繁中／英文自主狀態與控制，保留原立繪、技能及需求面板。Three.js 地圖、攝影機、經濟公式及夜襲傷亡規則保持。

v6 增加獨立 `autonomy-v1` 元件，保留 v4／v5／v6 安全遷移、原始備份、手動槽及 JSON 往返。未知或損壞資料拒讀，不以預設值掩蓋新版損壞欄位。

驗證：701 項單元測試、正式建置與 16 項完整 Chromium 瀏覽器回歸全部通過；含 30,000 遊戲秒長期經濟／需求模擬、跨版存檔及實際 localStorage 空間不足保護。建置仍有既有主 chunk 超過 500 KiB 的警告。

驗證結果與畫面：

- [實作與排序規格](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5b-survivor-autonomy/docs/M5B-IMPLEMENTATION.md)
- [存檔相容性及回復流程](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5b-survivor-autonomy/docs/M5B-SAVE-COMPATIBILITY.md)
- [測試結果](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5b-survivor-autonomy/docs/M5B-TEST-RESULTS.md)
- [修改檔案](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5b-survivor-autonomy/docs/M5B-CHANGED-FILES.md)
- [桌面休息畫面](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5b-survivor-autonomy/docs/screenshots/m5b-rest-1000.png)
- [手機返工畫面](https://github.com/mini1060919-code/LR-Anime/blob/feature/m5b-survivor-autonomy/docs/screenshots/m5b-work-390.png)

休息會降低實際在崗時間，需後續遊玩觀察產量與防衛建築缺員情況；低健康只降低派工順位，不自動治療。原版 HQ 待命防衛保持，因此休息中的居民仍可能因防衛產生疲勞。舊檔無法推導以前的手動待命意向，會預設自主。回復 M5-A 前請保留新版完整 JSON，再使用升級前受保護來源恢復；M5-A 會拒讀 autonomy-v1。
