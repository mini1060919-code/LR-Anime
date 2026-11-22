# ART-ASSET-MAPPING-01｜紗月與蓮全身映射

G1 NO-GO。跨 ZIP 對應待原件。Remote 基線 `cfa103c659aeb68aa97b448746ac944bbb16fd0d`，兩個全身路徑的可見導入歷史為 `14ddcddf0a6037e611a70a3a9bf34097d7a7a68f`。

| 現有角色 | catalog／圖像證據 | 候選全身 SHA-256 |
|---|---|---|
| 紗月 `chr_satsuki`／`char_satsuki` | medic，照護同伴。銀灰短髮、綠色髮夾、淺色醫護外套、紅臂章與醫療包。全身與同鍵頭像一致。 | `7294ea3083b16bf67b8bd83e54288cb030df1383e78a6250695d00b5ab1ac894` |
| 蓮 `chr_ren`／`char_ren` | guard，守望聚落。短棕髮、頭戴護目鏡、棕紅圍巾、外勤背包。全身與同鍵頭像一致。 | `ff9e71e945f97184151c5982bd96ef9c9caceac79ee48a85d204165432dbf78f` |

已核對 `src/characters/catalog.js`、`src/characters/anime.js`、現行 portrait manifest、M3 來源 README、全身和頭像視覺。GitHub 現有名稱和視覺相符，且兩張 1024×1536 全身各自 SHA 符合現行 manifest。兩批原件的反向 SHA、源命名錯誤發生環節及作者原意仍未知。收到原包後填四筆 `ZIP SHA／member path／實檔 SHA／基線 SHA／視覺身份／來源聲明／Owner 決策`，區分命名互換與畫作重新輸出。若一致，先修隔離清冊映射；若不一致，以全身＋頭像＋表情並列交 Owner 復核。原件、ID、候選路徑及歷史保留。

## ART-INTAKE-02｜原件交叉驗證

路徑均位於各包的 `public/assets/anime/portraits/`。整合包副本逐位元組相同，候選同路徑均與整合包一致。

| 來源／全身檔名 | SHA-256 | 實際角色與候選路徑結論 |
|---|---|---|
| 第一批／char_satsuki_full_v1.png | ff9e71e945f97184151c5982bd96ef9c9caceac79ee48a85d204165432dbf78f | 蓮，候選 char_ren_full_v1.png |
| 第一批／char_ren_full_v1.png | 7294ea3083b16bf67b8bd83e54288cb030df1383e78a6250695d00b5ab1ac894 | 紗月，候選 char_satsuki_full_v1.png |
| 整合包／char_satsuki_full_v1.png | 7294ea3083b16bf67b8bd83e54288cb030df1383e78a6250695d00b5ab1ac894 | 紗月，候選同路徑 |
| 整合包／char_ren_full_v1.png | ff9e71e945f97184151c5982bd96ef9c9caceac79ee48a85d204165432dbf78f | 蓮，候選同路徑 |

第一批 manifest 依錯置檔名標示角色。圖像內容由整合包的同角色頭像及五表情支持，這些成員也全部與候選同路徑相符。紗月銀灰短髮、髮夾、白色醫療外套對應 medic；蓮棕髮、護目鏡、圍巾對應 guard。第一批有命名互換，整合包已正確配對；保留第一批原件和 manifest，沿用候選正式路徑及角色 ID。完整來源／成員證據見 [ART-INTAKE-02](ART-INTAKE-02.md)。
