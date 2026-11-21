# A-RECOVERY-01｜澪原檔與補圖驗收

2026-11-22 Asia/Taipei。以 [Draft PR #18](https://github.com/mini1060919-code/LR-Anime/pull/18) Head `0c1218b353216bf7e1485d3cb444c815b1cd8bfb` 與候選 `cfa103c659aeb68aa97b448746ac944bbb16fd0d` 為基準。複核 A-01～A-06、候選 manifest／rights、已 fetch 歷史、PR 內文與留言、GitHub Releases 及工作區附件。可見來源無澪原檔或授權附件，GitHub Issues 停用。legacy 居民 `chr_asagiri_mio` 不改，顧問身分與勞動人口分開。

| 需求 | 既有草稿／宣告尺寸 | 實際尺寸、Alpha、SHA／來源及權利 |
|---|---|---|
| 全身 | 無 fullAssetId | 缺原檔，全部未知 |
| 半身 | 無獨立槽，neutral 是否半身待核 | 缺原檔，全部未知 |
| 頭像 | avatar_v001.png／128×128 | 缺原檔，全部未知 |
| 平靜 | neutral_v001.webp／1024×1536 | 缺原檔，全部未知 |
| 微笑 | smile_v001.webp／1024×1536 | 缺原檔，全部未知 |
| 警戒 | focused_v001.webp／1024×1536，映射待核 | 缺原檔，全部未知 |
| 擔憂 | worried_v001.webp／1024×1536 | 缺原檔，全部未知 |
| 讚許 | 無對應草稿槽 | 缺原檔，全部未知 |
| 既有疲倦 | fatigued_v001.webp／1024×1536，保留 | 缺原檔，全部未知 |

六個草稿槽均在 `assets/portraits/chr_asagiri_mio/standard/`，SHA 與 byteLength 均為 null，且 `rights.chr_asagiri_mio.v001` 無已登錄權利。候選 `node scripts/verify-portraits.mjs` 通過（28 approved／18 draft）；其中無澪正式圖片。

## 補圖需求與驗收清單

- 先接收並留存 A-01 人設原稿、創作者、來源版本、書面用途範圍及是否允許修改與散布。逐件區分已存在且合格、現有需修及確定缺件。取得確認後才進入補圖。
- 全身與半身草案均採 1024×1536，頭像保留既有 128×128 槽，另保存可供裁切的高解析來源。若收到合格不同尺寸原稿，先記錄版次與裁切策略。五表情須由同基準人設衍生，先確認警戒／focused 映射及讚許鍵，保留額外疲倦槽。
- 每檔解碼，記實際尺寸、Alpha 範圍、透明像素與深淺背景邊緣，檢查頭髮、輪廓、臉部一致性、手部及 48px／64px 頭像辨識。記 byteLength、SHA-256、檔名、來源、rights、審查人與日期。驗證單一表情缺失回同角色 neutral，neutral 缺失回剪影且不串圖。
- 同步 manifest／rights 後再跑素材驗證器及畫面驗收，正式納入須另外授權。此輪沒有修改圖片、權利清冊或遊戲。下一任務 A-SOURCE-INTAKE，待取得原檔及權利證據。
