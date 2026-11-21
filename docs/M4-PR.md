## M4：居民能力、可驗證成長與核心派工

Base：`feature/m3-anime-art-integration`（`14ddcdd`）。依賴 M1 #1、M2 #2 與 M3；本 PR 不合併、不正式部署。

M3 已保存六種技能等級但沒有工作效果。本次讓實際入庫、生產、研究、照護、搬運與命中傷害產生可重現經驗，按明確門檻升級；閒置、滿倉、缺料、無目標及未參與者不獲經驗。一次性同步收據與保存的 sequence 防止重播，經驗最高 150 XP、等級最高 5。

一般工作／防禦能力加成最多 +10%，後勤支援最多 +5%，診所額外減耗最多 3%；職業與個性只加速相應學習，合計最多 +15%。關閉能力效果時仍記工作經驗，經濟與戰鬥回到原值。未新增傷病、士氣、疲勞或 M5 AI；沒有改原自動派工排序與 Three.js 地圖／攝影機。

角色面板保留 M3 原圖與五表情，新增中英文六技能／經驗、效果開關及指定居民派工。UI 只呼叫核心驗證命令，檢查存活、建築狀態、容量，失敗保留舊職位；可回復原建築自動派工。桌面立繪隨面板保留在側邊，手機維持單欄。

v6 架構不改版，附加 `progression-v1` 必要功能與成長欄位。v4/v5/舊 v6 安全補齊資料並永久保存來源，保留既有高等級、UID、外觀與高水位。M4 新檔驗證 XP／等級及雙向工作名冊；未知、損壞或遷移失敗不覆寫。舊 M3 遇新必要功能會阻止丟失成長資料的存回。沿用三槽、JSON 與備份輪替。

### 驗證

單元測試 **596/596（28 檔）**，正式建置成功。M4 桌面／手機瀏覽器 **2/2** 通過（5.7 分鐘），最後桌面排版複驗 **1/1** 通過（3.2 分鐘），M1–M3 原有回歸 **10/10** 通過（25.0 分鐘）。共 12 個不同瀏覽器案例全部通過。

- [實作、公式與工作來源](https://github.com/mini1060919-code/LR-Anime/blob/feature/m4-survivor-progression/docs/M4-IMPLEMENTATION.md)
- [存檔相容與回復](https://github.com/mini1060919-code/LR-Anime/blob/feature/m4-survivor-progression/docs/M4-SAVE-COMPATIBILITY.md)
- [測試與截圖](https://github.com/mini1060919-code/LR-Anime/blob/feature/m4-survivor-progression/docs/M4-TEST-RESULTS.md)
- [修改檔案](https://github.com/mini1060919-code/LR-Anime/blob/feature/m4-survivor-progression/docs/M4-CHANGED-FILES.md)

### 風險與回復

這是有限的首版成長數值，仍需長局平衡驗收；不宣稱所有職業成長速度已最佳化。經驗增加存檔體積，保留 2 MiB 上限與單分頁 localStorage 模型；永久備份滿額仍須玩家管理，不自動刪除。仍是黎明檢查點，不是隨時保存戰鬥。

回復程式可回到 M3 `14ddcdd`，先保留完整 M4 v6 匯出與升級前永久備份；舊程式不認得 progression-v1 時會阻止覆寫。v5 相容副本會失去角色身分、技能、經驗與高水位，不能當完整 M4 備份。未變更圖片授權或加入素材。
