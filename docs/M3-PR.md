## M3：使用者提供的動漫角色美術與 v6 角色系統

Base：`feature/m2-zh-tw-anime-ui`。依賴 M1 #1 與 M2 #2；不合併、不正式部署。

本次由最新 M2 建立分支，重用前階段 M3 角色／存檔實作，再整合使用者提供的 `LR-Anime-M3-art-integration-v1.zip`，不再只有肖像占位圖。32 張原始 RGBA PNG 與來源 manifest 原樣保留於 `public/assets/anime/`。

- 固定 `char_rin`、`char_yuma`、`char_satsuki`、`char_ren` 四個來源 ID，透過存檔外觀 ID 映射角色；全身圖、頭像與五種表情接入 M2 中英文面板。
- 表情區手動切換平靜、開心、警戒、疲憊、受傷；表情缺圖／損壞回退平靜，最後使用明確預設。沒有新增受傷、疲勞或能力加成玩法。
- 新配置採 generator v2；既有 v6 generator v1 人物與招募規則保留，不將澪／紬改名套成紗月／蓮。v4/v5 安全遷移、原文永久備份、三槽與 JSON 保護沿用。
- 不改動 Three.js 地圖、攝影機、建築、資源經濟、科技或夜襲模組；居民核心僅保留前階段 M3 的 ID 溢位防護。

### 驗證

單元測試 27 個檔案、530 項通過；正式建置成功。建置核對 32 張來源 PNG 的 bytes／SHA-256／RGBA 尺寸與引用，28 張 runtime 圖可載入，18 個其他角色 draft 槽位保持回退。

完整 Chromium 回歸 **10/10 通過（23.8 分鐘）**，包含最後自然日夜循環與黎明重載。瀏覽器結果與截圖請見 [素材整合交付](https://github.com/mini1060919-code/LR-Anime/blob/feature/m3-anime-art-integration/docs/M3-ART-INTEGRATION.md)。包含桌面 1280×900、手機 390×844 的四角色全身圖、頭像、20 表情、缺圖回退及唯讀狀態；保留既有語系、配額、永久備份、JSON、自然日夜循環與黎明重載回歸。

### 素材與審查風險

來源 README 聲明為 OpenAI 生成美術。本次只記錄使用者要求整合／PR 的授權，不宣稱商用、排他著作權或商標已完成審查。`User-provided-generated` 不是標準開源授權，正式發布審查仍 pending。

32 張來源圖約 31.7 MB，保留原始 PNG，不預先下載表情表。部分圖有邊緣光暈／淡背景，悠真原始 sheet 未完全透明，遊戲使用已分割且含 alpha=0 的表情圖。既有 JS 大型 bundle 警告與單分頁 localStorage 限制仍在。美術一致性與原圖邊緣請驗收截圖。

### 文件與回復

- [實作、角色映射、存檔相容性與回復](https://github.com/mini1060919-code/LR-Anime/blob/feature/m3-anime-art-integration/docs/M3-ART-INTEGRATION.md)
- [逐檔原始素材檢查](https://github.com/mini1060919-code/LR-Anime/blob/feature/m3-anime-art-integration/docs/M3-ART-INSPECTION.json)
- [修改檔案清單](https://github.com/mini1060919-code/LR-Anime/blob/feature/m3-anime-art-integration/docs/M3-CHANGED-FILES.md)

撤回本次美術 commit 可回到其父 commit 的原 M3 系統；勿刪除存檔。回到 M2 前先匯出完整 v6 與 v5 相容副本，後者不保留 M3 身分、高水位與人物資料。保留原始永久備份，不自動刪除釘選資料。
