# M5-A v6 相容性與回復

## schema 評估

不升級頂層 v6 或人物 schemaVersion，也不重設 M3 身分與 M4 成長。以獨立 `schemaVersion:1` 的 survival 元件擴充，並加必要功能標記，讓舊程式無法忽略新需求後存回而丟資料。

```text
requiredFeatures: ['characters-v1','progression-v1','survival-needs-v1']
characters.survival: {schemaVersion:1,effectsEnabled:true,lastStep:0,elapsedSeconds:0}
characters.records[id].needs: {fatigue:0,health:100,morale:70}
```

三值須為 0–100 有限 number。步號須為非負安全整數；elapsedSeconds 須有限、非負且不大於步號。標記與元件須同時存在；元件欄位、record needs 欄位皆精確驗證。已標記的檔案若缺少欄位或範圍錯誤，不把損壞當成舊檔補零。

| 輸入 | 處理 |
| --- | --- |
| 有效 v4／v5 | 沿用 M3/M4 安全遷移，補技能／需求安全預設，原文永久保留 |
| M3 v6（只有 characters-v1） | 保留身分／外觀，補 M4 成長與本次需求；既有技能等級保留 |
| M4 v6 | 所有 runId／UID／XP／能力／個性／職業／工作／美術參照不變，只補 survival 與 needs |
| M5-A v6 | 精確驗證、冪等讀取，保存時鐘、效率開關與全部需求 |
| 未知功能、未知版本、損壞或遷移失敗 | 拒絕覆寫，仍可匯出原始 JSON，沿用 M1 明確復原機制 |
| 原生 v6 空名冊 | 保持空名冊、空 active records 與原高水位，不復活居民 |

舊版缺／空居民名冊、明確矛盾工作參照，沿用 M3/M4 的保守拒絕策略，不自動重建後覆寫原檔。新生與死亡的身分規則不變。

## 備份與 JSON

v4、v5、M3/M4 舊 v6 的首次升級原文均永久保護，JSON 匯入來源也保存確切文字。新增修正：若舊 v6 升級結果恰等於目前 active save，仍先保存舊來源，再回報無需重寫；不能讓相同內容的短路跳過來源備份。新增單元與瀏覽器測試驗證這個邊界。

M5-A 正常自動保存仍只有三份輪替備份；釘選不自動移除。三槽、JSON、原始損壞資料匯出與配額不足保護保留，需求值／時鐘／成長／工作一起保存。仍是黎明檢查點，不新增任意戰鬥快照。

## 回復與風險

- 回復程式可回到 M4 `2d1f408` 或撤回本次 M5-A commit；先匯出完整 M5-A v6，勿刪 localStorage。
- 舊 M4 遇 survival-needs-v1 會保護未知必要功能，不能直接讀取再丟掉需求欄位。要回到可玩的舊程式，使用升級前永久 M4 備份；保留完整 M5-A 檔，以後可回到本版恢復。
- v5 相容副本不含人物身分、成長、需求、時鐘與高水位，不能用來完整回復 M5-A。
- 仍為單分頁 localStorage、2 MiB 單檔上限。新欄位增加大小，永久備份累積可能滿額；保留 active save 並提示管理，不自動刪釘選檔。沒有跨分頁交易。
- 需求只按有效模擬時間更新，不實作離線休息或補算。突然關頁仍只能回到最近黎明；這是既有檢查點設計。
