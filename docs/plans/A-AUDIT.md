# 參謀澪素材盤點｜2026-11-21 Asia/Taipei

來源鎖定遊戲候選 `cfa103c659aeb68aa97b448746ac944bbb16fd0d`。查閱候選樹、可見 Git refs 的澪命名路徑歷史、治理 A／M6-A 與工作區 library-files／shared。以下僅代表可取得範圍。

## A-01 人設與 ID

治理 A 定位澪為新手嚮導及非勞動參謀。候選 `src/characters/catalog.js` 另有 legacy `chr_asagiri_mio`（朝霧澪／Mio Asagiri），撤離站醫護、同理心與堅定。已有存檔居民應保留原 ID；顧問身分 `advisor.mio` 仍為 PR #15 提案。正式顧問人設圖與身分綁定待 Owner 確認。

## A-02 全身

澪的 `pset.chr_asagiri_mio.standard.v001` 無 fullAssetId，可見 Git 樹及附件未取得透明全身原檔。路徑、實測尺寸、Alpha、SHA、來源和授權皆待原檔。

## A-03 半身與頭像

manifest 的 neutral 路徑為 `assets/portraits/chr_asagiri_mio/standard/neutral_v001.webp`，宣告 1024×1536。頭像 `assets/portraits/chr_asagiri_mio/standard/avatar_v001.png` 宣告 128×128。兩者皆 draft，實檔缺、byteLength 與 SHA 為 null。neutral 裁切層級無法從宣告確認。

## A-04 表情

需求為平靜、微笑、警戒、擔憂、讚許。草稿路徑同 A-03，檔名 `neutral_v001.webp`、`smile_v001.webp`、`focused_v001.webp`、`worried_v001.webp`、`fatigued_v001.webp`，均宣告 1024×1536，實檔與 SHA 皆缺。警戒與 focused 的映射需審查，讚許無對應槽；fatigued 為既有額外槽，保留。

## A-05 品質

鎖定候選的 `node scripts/verify-portraits.mjs` 通過，28 approved、18 draft。Pillow 解碼比對 28 張四角既有檔，尺寸與 SHA 均符合 manifest，Alpha 最小均 0、最大 246～254。四張全身為 1024×1536，其餘為 512×512。澪六個 draft 槽均缺實檔，透明度、邊緣、裁切及視覺比對待辦。收到原檔後在明暗背景預覽邊緣、確認有效 Alpha 與 48px 頭像可辨識度。
