# M3 可替換角色美術

> 前一階段紀錄；本次正式素材整合的狀態與驗證請見 [M3 素材整合交付](M3-ART-INTEGRATION.md)。

目前沒有正式立繪、頭像或第三方動漫素材。畫面使用程式繪製的既有 CSS 預設肖像。瀏覽器測試用的透明 1px PNG 由測試程式產生，並非隨遊戲發佈的角色圖片。

## 固定 ID 與清冊

`public/assets/portraits/manifest.v1.json` 定義五組 portrait set：四位原創角色與 `chr_generic`，格式為 `pset.<archetype>.standard.v001`。每組 neutral、focused、worried、smile、fatigued 五種立繪及一個 avatar，共 30 個素材 ID。存檔只記錄 set ID，不保存圖片、路徑或合約。

`rights.v1.json` 為獨立權利清冊，目前 records 為空。任何 draft 素材都不會下載；未知 set ID 亦回退預設肖像。不要為不同圖片重用既有素材版本 ID。

## 導入正式素材

1. 取得原創或可證明授權的 PNG/WebP/JPEG；PNG 與 WebP 可保留透明背景。SVG、外部 URL 與不明素材不接受。
2. 放在 `public/assets/portraits/` 內，使用 ASCII 路徑。尺寸兩邊均不超過 2048px；立繪不超過 350 KiB，頭像不超過 24 KiB。
3. 填寫雙語 alt、實際尺寸、byteLength、檔案 SHA-256、licenseRef。人工審查確定後，才把素材與權利記錄標為 approved。
4. 權利記錄須有 creator、licenseId（Original / CC0 / CC-BY-4.0 / MIT）、evidenceRef、reviewedBy、reviewedAt、attributionText，及 display/commercial/modify/webDistribution/repositoryRedistribution 五項明確許可。這是本專案採用政策，不表示所有授權天然包含所有權利；保留實際證據，不在公開 repo 放私密合約或個資。
5. 執行 `npm run verify:portraits` 與 build。建置會核對實際檔案、大小、雜湊及 PNG 標頭尺寸，阻止路徑逃逸；執行期仍以原生圖片解碼檢查所有格式。
6. 在中英文角色面板檢查透明度、表情、頭像、尺寸與署名。瀏覽器阻擋、損壞或無法解碼時應顯示預設肖像，存檔仍保留外觀 ID。

清冊欄位自動驗證不能取代法律與人工授權審查。撤回素材時先把該素材改回 draft、撤銷權利記錄並移除檔案，再建置；保留舊 ID 與紀錄以辨識既有存檔，不把撤回素材改成其他角色。現行管理器在頁面期間快取清冊，權利更新於重新載入後生效。
