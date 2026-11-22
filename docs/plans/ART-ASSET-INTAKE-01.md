# ART-ASSET-INTAKE-01｜原始美術接收與遠端基線

2026-11-22（Asia/Taipei）。G1 NO-GO。治理基準 `ddafe7e5e8d02be642f9387b4fc6ba447b548979`。本階段交付 GitHub 基線盤點與接收阻塞紀錄。原包複核待補件。

| 原包 | Owner 提供的先前結果 | 本輪接收 |
|---|---|---|
| LR-Anime-A03-A06-Mio-Art-v1.zip | 9 PNG，清冊 SHA 相符，有全身／半身／頭像／五表情 | 待可讀原件。第九件用途、權利、裁切及需修項待核 |
| LR-Anime-M3-character-assets.zip | 4 名角色全身，紗月／蓮有交叉異常 | 待可讀原件，兩張爭議圖隔離 |
| LR-Anime-M3-art-integration-v1.zip | 32 張，與另一整合包相同 | 待可讀原件，尚無 ZIP SHA 或逐件相符結論 |
| LR-Anime-M3-art-integration-v1 (1).zip | 完整整合包副本 | 待可讀原件，以兩包完整 SHA 判重 |

已檢查工作區、library-files、shared/downloads，以及可見 Git 歷史的對應 ZIP 名稱，未取得原包。ZIP 檔名中的 v1 是名目版本。保留 Owner 所述結果，等原包可讀後補實測。

## GitHub 來源、尺寸、Alpha 與權利

- 候選 `cfa103c659aeb68aa97b448746ac944bbb16fd0d` 的 `public/assets/anime` 有 32 PNG、來源 README、舊版 manifest。全身 4 張 1024×1536，頭像與個別表情 24 張 512×512，源表情表 4 張 1536×1024。
- `node scripts/verify-portraits.mjs` 通過，28 approved、18 draft。逐件解碼及 SHA-256 已另存 [基線清冊](../art/m3-baseline-inventory.json)。28 個載入用 PNG 均符合目前 manifest SHA。各全身 Alpha 0～254。悠真源表情表 Alpha 63～253，沒有全透明像素，沿用 README 的殘留背景歷史。
- M3 權利來源為 `user-m3-art-v1`、使用者供應且來源 README 紀錄 OpenAI 圖像生成。現有登錄允許顯示、網路散布、repo 再散布，修改與商業欄位為 null，發布審查 pending。
- 四角 32 張實體已存在於鎖定候選。候選沒有正式澪 PNG。澪與兩個 M3 原包的檔案對照及補件判定待 ZIP 清冊、來源與權利。禁止以來檔覆蓋現有候選。
- 候選 art 目錄約 31 MiB，最大單件約 2.7 MiB，現行 Git 管理且候選無 .gitattributes。單份審查樣稿可評估普通 Git，原始 ZIP、重複包及長期高頻修圖版次另估儲存量，未變更資產管理。

## 接續驗收

在本檔同分支使用 `python docs/art/audit_assets.py --baseline /path/to/pinned/game /path/to/a.zip /path/to/b.zip /path/to/c.zip /path/to/d.zip > /path/to/intake.json`。先讀原件內 manifest、README、權利附錄，按完整 SHA 確認每件、跨包相同檔名的不同內容及跨名稱同 SHA。另存原件與收到日期。損壞檔或缺件保留錯誤及原包 SHA，另索正本。視覺與權利用表記接收、需修、補件、禁止覆蓋。基線命令及合計為實測，本輪無新遊戲或存檔測試。

## 2026-11-22（Asia/Taipei）｜Draft #22 遠端覆核

遠端 #22 為 Open Draft，mergeable=true，留言及 review 皆空。候選基線驗證器重跑為 28 approved／18 draft。附件只找到先前自製的 smoke ZIP，四份業主原件仍未取得。紗月／蓮原包映射及澪逐張 QA／權利待原件。 G1 NO-GO。此次只追加讀回證據。

## 2026-11-22｜ART-INTAKE-02

[實體素材接收結果](ART-INTAKE-02.md)已記錄四件缺可讀原包。候選肖像驗證器通過，原包 QA、映射與授權仍待到件。G1 NO-GO。

## 2026-11-22｜ART-INTAKE-02 四份原包已接收

[四包實測與完整清冊](ART-INTAKE-02.md)已追加至 Draft #22。整合包副本逐位元組相同，第一批紗月／蓮檔名互換，整合包及候選映射正確。澪九件符合所列 manifest 資料，授權及 UI 裁切驗收待核。#23 待 Owner 決策。G1 NO-GO。
