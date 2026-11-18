# M5-B 存檔相容性報告

## 格式

保留 v6 外層、角色 schemaVersion 1、runId、UID、高水位 ID、職業、能力、經驗、needs 與素材參照。新增獨立版本元件，不更換外層存檔版本：

```json
{
  "requiredFeatures": ["characters-v1", "progression-v1", "survival-needs-v1", "autonomy-v1"],
  "characters": {
    "autonomy": { "schemaVersion": 1 },
    "records": {
      "1": {
        "autonomy": {
          "mode": "manual",
          "targetBuildingId": 2,
          "resting": true,
          "reason": "fatigue",
          "cooldownUntil": 110
        }
      }
    }
  }
}
```

上例為結構節錄。requiredFeatures 按上述固定順序保留全部既有標記並追加 autonomy-v1；其餘角色及核心欄位均須保留，不可用節錄替代完整存檔。

- mode：auto／manual；auto 的 targetBuildingId 必須為 null。
- 手動目標為 null 表示玩家指定待命，否則必須指向有工作容量的現存建築。
- resting 必須為布林；休息者實際 buildingId 必須為 null、reason 為 fatigue；非休息者 reason 必須為 null。
- cooldownUntil 為有限非負遊戲秒數，不能超過 survival.elapsedSeconds + 10（含浮點容差）。讀檔保留原截止時間。
- 手動實際工作必須與保留目標一致。精確欄位、元件版本及功能旗標一致性均驗證；已標記新版的損壞欄位不會被安全預設值掩蓋。

## 舊版遷移

| 輸入 | 行為 |
| --- | --- |
| v4／v5 | 沿用既有身分、成長、需求遷移，再加自主元件 |
| M3／M4／M5-A v6 | 保留既有資料，僅補缺少的已知元件 |
| M5-B v6 | 驗證後原樣恢復自主意向、休息與時鐘 |
| 未知外層／元件版本、旗標不符、損壞資料 | 拒絕載入；不自動覆寫原資料 |

缺自主資料時，若居民正在 autoAssign=false 的建築工作，推導為手動並記錄原建築；其他居民預設 auto／未休息／截止時間 0。舊檔沒有保存「玩家手動待命」意向，無法可靠推導，故預設自主。疲勞過高者於第一次排程進入休息。

升級前來源沿用 M1 永久備份規則；即使升級後內容與目前原生存檔相同，仍保護舊來源。手動槽與 JSON 匯入匯出共用驗證、遷移及備份路徑。既有輪替備份、重要備份、空間不足時拒寫並保留原檔的行為保持。新功能未新增每幀或每次派工存檔，仍採原本黎明快照。

## 驗證與限制

單元測試涵蓋跨版遷移、舊來源保護、手動槽／JSON 往返、冷卻續接、死亡不復活與 ID 不重用，以及錯誤模式／目標／截止時間／版本／旗標等拒讀情況。既有全部存檔保護測試保留。

欄位增加會使存檔略增；原有大小及 localStorage 容量限制仍有效。多分頁同時操作的原有限制不在本階段擴充。

回復流程：先匯出目前 M5-B JSON，再切回 M5-A `002529e38d072f39f9af137b14de5206fee5d672`，以升級前受保護備份恢復。M5-A 會安全拒讀 autonomy-v1，不能用移除旗標的方法強迫讀取。舊 v4 相容副本無法完整保留角色身分、經驗、需求或自主意向，不可取代完整新版備份。
