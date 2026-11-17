# M3 角色系統實作與驗收紀錄

基準：M2 `e89c3a7ffd3b4131a8be76ca28e5a864edee6fda`，分支 `feature/m3-survivor-profiles`。PR 目標為 `feature/m2-zh-tw-anime-ui`，依賴 M1 #1 與 M2 #2；不合併、不部署。

## 已完成範圍

- 每位存活居民保留原本數字 id，新增跨存讀檔穩定 UID、雙語姓名快照、職業、個性、原型版本與外觀 ID。四位原創原型每局各使用一次，後續居民使用決定性一般角色。能力值保存但不參與任何遊戲計算。
- 新局 `run_<UUID>`；舊檔使用版本化正規化 core 的 canonical JSON SHA-256 namespace。UID 結合 runId 與居民 id，高水位 `nextSurvivorId` 隨 v6 保存，死亡後不重用 ID。同地圖 seed 的新局仍為不同 namespace。
- `characters.records` 僅記錄存活居民，不複製工作指派、飢渴、資源或 Three.js 物件。名冊同步與肖像呈現不改變 AI、招募條件或經濟。僅在原有招募入口加入安全整數 ID 耗盡防護。
- M2 角色面板顯示中英文姓名、職業、個性、背景、UID、外觀 ID 與既有工作狀態；名冊每頁 50 人。沒有新增能力效果或姓名編輯操作。
- 圖片管理器與 GLTF 啟動流程分離，延後讀取清冊、驗證權利狀態、MIME、大小、SHA-256，再由瀏覽器解碼並確認尺寸。表情採 worried/focused/neutral，失敗退回 neutral，再退回原創 CSS 肖像。頭像失敗不下載大立繪代替。
- 快取上限預設兩份圖片 Blob；並行請求共用下載，每個解碼使用獨立 URL lease，完成或失敗即釋放。淘汰快取不撤銷正在解碼的 URL，pagehide 釋放剩餘使用中 URL。

## v6 契約與相容性

```text
{ format, version:6, checkpoint:'dawn', savedAt,
  requiredFeatures:['characters-v1'],
  run:{id:runId,nextSurvivorId}, core:{version:4,...},
  characters:{schemaVersion,generatorVersion,records,usedUniqueArchetypeIds} }
```

確切欄位與驗證規則以 `src/persistence.js`、`src/characters/state.js` 為準。原始 `createSaveData` 仍是 v4 core serializer；`createCheckpoint` 建立完整 v6。`readSave` 現在回傳完整封裝，呼叫端經 `restoreSave` 還原，不丟失角色資料。

| 輸入 | 結果與保護 |
| --- | --- |
| 有效 v4 / v5 | 先在記憶體重建並驗證 core、產生確定性人物，再保存 v6；原舊檔永久備份 |
| JSON 匯入 v4 / v5 | 永久保存匯入原始文字，亦備份被替換的有效現存檔；寫入失敗保留原檔 |
| 有效 v6 | 保留 namespace、高水位、姓名、外觀及能力資料；再次遷移結果不變 |
| 損壞、未知版本、未知必要功能、未知欄位或遷移失敗 | 拒絕轉換與自動覆寫，仍可匯出原始資料，沿用 M1 明確復原操作 |
| v4 / v5 缺失或空居民名冊 | 保守拒絕遷移，避免舊 restore 的預設四人行為靜默改寫資料；原始文字保留 |
| v6 空名冊 | 合法，載入仍為空，不復活居民 |
| 未安裝但格式合法的外觀 ID | 保存原 ID，畫面顯示預設肖像 |

一般 v6 自動存檔沿用 M1 三份輪替備份；釘選備份與舊版升級原檔不輪替刪除。永久備份累積可能耗盡儲存空間，屆時保護現有檔並提示玩家匯出及管理備份，不自動刪除重要檔案。三個手動槽、JSON 匯入匯出與配額處理保留。

另提供「匯出 v5 相容副本」，僅下載 core，不替換目前 v6；副本無 M3 身分、高水位與角色資料，UI 先提示資料損失。舊 M1/M2 程式不能直接讀 v6，降版前須匯出相容副本。

## 與設計草案的實作差異

- SHA-256 使用同步純 JavaScript 實作，與 Node 原生 crypto 的文字及二進位邊界向量交叉驗證。現行 localStorage API 維持同步，避免讀取、備份、寫入之間引入非同步競爭；用途為穩定識別與完整性，並非身分認證。
- 本階段完成檔案／面板整合，不建立個別 3D 居民與肖像的點選綁定。原遊戲的建築 worker 是池化裝飾，不是完整居民實體，原地圖與攝影機維持原樣。
- 舊檔無法推回已死亡者的歷史最大 ID；遷移由目前存活名冊開始建立高水位。不同日期 legacy core 可能形成不同 namespace，不宣稱能重建舊歷史身分。

## 驗證與限制

詳見 `M3-TEST-RESULTS.md`。新增測試涵蓋 ID 死亡／招募／存讀檔、遷移決定性、錯誤檔保護、匯入原文備份、未知外觀、能力值不影響原模擬、授權閘門及圖片解碼失敗。既有存檔、語系、建築、科技與完整日夜循環測試保留。

沒有提供正式角色圖片；清冊為 30 個 draft 槽位，零張核准圖片。正式美術仍待製作／授權審查。原有 dawn 檢查點、2 MiB 存檔大小上限與 localStorage 單分頁使用模型維持；多分頁同時寫入不具跨分頁交易保證。既有大型 JS bundle 警告仍存在。

## 回復方式

在 M3 功能分支撤回本次 commit 或回到上述 M2 commit 即可回復程式；不要刪除 localStorage。執行舊版前先在 M3 匯出完整 v6 與 v5 相容副本，或保留原有永久 v4/v5 備份。舊版遇 v6 應保護未知版本，不能直接以新局覆蓋。M3 新增角色資料只存在完整 v6，v5 副本不能用來完整回復 M3 人物身分。
