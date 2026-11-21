# M4 v6 附加成長資料與回復

保留 M3 v6 封裝、角色 ID/runId/UID、人物 generator、肖像 ID 與 core；不建立 v7，也不把圖片、人物 AI 或新生存狀態塞進存檔。

## 附加資料

```text
requiredFeatures: ['characters-v1', 'progression-v1']
characters.progression: {schemaVersion:1, effectsEnabled:boolean, sequence:安全整數}
characters.records[id].abilityRanks: 原本六個 0–5 等級
characters.records[id].experience: 六個整數 milli-XP，0–150000
characters.records[id].experienceRemainders: 六個 [0,1) 有限小數
```

經驗與等級必須符合門檻，最高級餘數必須為 0。部分遺失、未知欄位／規則版本、負數、非整數經驗、等級矛盾、無效 sequence 都拒絕。`progression-v1` 必須和成長欄位一起存在，不能靠移掉必要功能標記讓程式忽略新資料。

| 來源 | 行為 |
| --- | --- |
| 有效 v4/v5 | 沿用安全遷移，建立原 M3 身分與零等級／零經驗成長資料；原始文字永久備份 |
| 未標記成長的 M3 v6 | 先驗證舊契約，保留 run/UID/姓名/職業/個性/肖像/generator/高水位，補經驗及餘數；已有等級的經驗從該級最低門檻起算 |
| 已有 progression-v1 的 v6 | 完整驗證，無損保存；重複遷移結果不變，不能把缺失欄位當新角色補零 |
| 未知版本／必要功能／損壞或遷移失敗 | 不寫入原始 key，仍可匯出原文；沿用 M1 明確復原與永久封存操作 |
| 舊版空缺居民名冊 | 沿用 M3 保守拒絕，避免 legacy loader 的四人預設造成復活 |
| 原生 v6 空名冊 | 正確保留空名冊、空 active records 與 ID 高水位 |

新標記檔案驗證 workers 為合法名冊、容量不超過 jobs，且與每名居民 buildingId 雙向一致。舊檔若 workers 欄位缺省，可由既有居民參照補齊；明確矛盾的工作資料會拒絕遷移並保留原文，不靜默修掉後自動覆寫。角色死亡後 active record 移除，sequence、原型保留表及 nextSurvivorId 保持單調，不從活人最大 ID 推回高水位。

原 M3 只支援 characters-v1，遇到 progression-v1 會視為未知必要功能，因而保護檔案，避免舊程式載入再儲存時丟失成長資料。

## 備份與配額

v4、v5 以及沒有 progression-v1 的舊 v6 原文均永久保存；JSON 匯入來源也保留原始文字。正常 M4 v6 仍沿用三份輪替備份，使用者釘選不自動移除。三個手動槽與 JSON 保存完整成長欄位、分數餘數、效果開關、工作與高水位。

成長資料增加單檔大小；原有 200 次黎明有限配額測試由 16 KiB 改為 24 KiB，以容納四份含六技能／餘數的檔案，仍驗證 200 次不累積備份。原有配額失敗與真實瀏覽器 quota 測試保留。空間不足時保留既有 active save，顯示錯誤，不自動刪除永久備份；永久檔累積與 2 MiB 單檔上限維持。

## 回復

1. 先匯出完整 M4 v6 JSON，保留所有永久備份；不要清除 localStorage。
2. 程式可回到 M3 基準 `14ddcdd`，或撤回本次 M4 commit。舊 M3 不認得成長功能標記，會阻止覆寫。
3. 要回到可玩的舊程式，使用原有升級前永久 v6 備份，或明確匯出 v5 相容副本後再匯入。v5 副本不含角色身分、技能、經驗、分數餘數與高水位，不能當成完整 M4 備份。
4. 重回 M4 時可匯入完整 M4 v6；相同 UID 與經驗保持，不能用降版副本還原 M4 人物歷史。

沿用單分頁 localStorage 模型，沒有加入跨分頁交易；不要同時用兩個分頁操作同一存檔。未改成即時戰鬥儲存，仍由黎明檢查點決定可回復的進度。
