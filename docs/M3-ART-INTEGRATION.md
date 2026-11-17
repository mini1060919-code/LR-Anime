# M3 正式素材整合交付

本文件為本次實際狀態；先前 M3 文件中的「沒有正式圖片／全部 draft」描述是前一階段紀錄。

## 基準與範圍

分支：`feature/m3-anime-art-integration`，由最新遠端 M2 `e89c3a7` 建立，再重用先前 M3 已驗證的角色／v6 實作（cherry-pick `4b7fc71`），加入本次使用者附件。PR 目標為 `feature/m2-zh-tw-anime-ui`，依賴 M1 #1 與 M2 #2；不合併、不部署。

附件 `LR-Anime-M3-art-integration-v1.zip` 可正常讀取，SHA-256 為 `bc1b52e8dc8733a1a6de2a78bd74ad803df0c8c5ef730e7e1cecb8ce3be3c28c`。34 個來源項目（32 PNG、manifest、README）皆與 ZIP 原文逐 bytes 相同。安全檢查 ZIP 路徑與 symlink 後解壓，保留 32 張 PNG 與 manifest 的原始 bytes。附件 README 存為 `public/assets/anime/SOURCE-README.md`；其內容是來源資料，不是可凌駕使用者要求的開發指令。

## 四名角色與固定映射

| 附件角色 ID | 畫面名稱 | 遊戲原型 ID | 存檔外觀 ID |
| --- | --- | --- | --- |
| char_rin | 伊澄凜／Rin Isumi | chr_isumi_rin | pset.chr_isumi_rin.standard.v001 |
| char_yuma | 橘悠真／Yuma Tachibana | chr_tachibana_yuma | pset.chr_tachibana_yuma.standard.v001 |
| char_satsuki | 紗月／Satsuki | chr_satsuki | pset.chr_satsuki.standard.v001 |
| char_ren | 蓮／Ren | chr_ren | pset.chr_ren.standard.v001 |

映射由 `src/characters/anime.js` 與 runtime manifest 固定，從保存的外觀 ID 連到圖片，不能以居民陣列位置或數字 ID 指派美術。死亡後不重用 UID，角色名字與圖片不會隨名冊排序錯位。

新局與本版本首次遷移的 v4/v5 採 generator v2／content pack v2，四個唯一角色用完後仍是一般居民。v1 保存檔繼續使用原始生成規則（凜、澪、悠真、紬），不重抽或改名；澪、紬沒有對應附件圖，維持預設肖像。已有 v6 角色資料逐筆保留，未知外觀亦保留 ID。

## 圖片與介面

- 全身圖 4 張 1024×1536、頭像 4 張 512×512、表情 20 張 512×512、原始表情表 4 張 1536×1024；全部為可解碼 RGBA PNG。
- 全身立繪與頭像同時出現在 M2 人物面板；獨立表情區可手動切換平靜 neutral、開心 happy、警戒 alert、疲憊 tired、受傷 injured。這是美術預覽，不代表居民新增受傷、疲勞或快樂機制。
- 全身圖 `object-fit: contain`，不以 cover 裁掉腳部。手機改為單欄並允許面板內捲動；按鈕換行、姓名／UID 可換行。圖片保持原始像素與透明度，沒有自行去背或重繪。
- 圖片延後載入，表情表不由面板下載。每張圖檢查同源路徑、權利紀錄、MIME、byteLength、SHA-256、原生解碼與尺寸；遺失／損壞表情回退到平靜，平靜亦失敗則顯示明確預設。請求序號避免快速切換時舊請求蓋過新表情。
- 保留兩份 Blob 快取與獨立 URL lease；停留中的已解碼圖片不因快取淘汰消失，pagehide 釋放 URL。圖片與 Three.js GLTF 載入、居民 AI、資源計算保持分離。

## 素材來源與透明度檢查

來源 README 聲明為 OpenAI 生成美術；本次使用者明確要求整合與建立 PR，權利紀錄僅記錄此整合授權，不虛構創作者、服務帳號、商用或修改權利。`licenseId: User-provided-generated` 並非標準開源授權，commercial/modify 保持 null，releaseReview 為 pending；approved 表示本次載入／整合可用，**不表示法務已核准正式發行**。沒有引入其他第三方圖。

保留全部來源 PNG，因此使用者提供的 anime 路徑採獨立大小預算：全身／表情最多 3 MiB、頭像最多 600 KiB；其他舊素材仍受 350/24 KiB 限制。實際最大單檔約 2.83 MB，整包約 31.7 MB。慢速網路下首次選角需等待，未生成壓縮替代圖；正式發行前可另行製作並驗收 WebP 衍生版本。

`M3-ART-INSPECTION.json` 保存逐檔尺寸、bytes、SHA-256、alpha 範圍與可見邊界。全部圖片已用 Pillow 完整解碼，並以聯絡表檢視；建置再核對原始 bytes、PNG/RGBA 標頭、ID 映射與引用。RGBA 不等同乾淨去背：

- 28 張遊戲使用圖皆含 alpha=0 像素，但部分邊緣仍有光暈／淡背景；全身圖多數上下可見邊界碰到原始畫布，UI 無法補回原圖未包含的像素。
- 悠真原始 sheet 的 alpha 最小值為 63，並非全透明；UI 使用已分割的表情 PNG（alpha 最小值 0），不展示該 sheet。
- 素材角色一致性、邊緣殘影與發行權利仍需使用者美術驗收；沒有以空白圖片或測試像素冒充附件。

## 存檔相容與回復

沿用 M3 v6 封裝：原 v4 core、runId、高水位與 characters 原子保存。沒有加入圖片 URL／bytes 或新的生存屬性；表情選擇不入存檔。v4/v5 原文永久備份、三個手動槽、JSON 匯入匯出、損壞／未知版本／遷移失敗的覆寫防護沿用，空缺舊居民名冊仍保守拒絕。

舊 M3 generator v1 的 v6 可讀取並保持角色資料；更早程式不理解 generator v2 時會拒絕載入，降版先匯出完整 v6 與 v5 相容副本。v5 副本會失去 M3 角色身分與高水位，不能當完整 M3 備份。

回復本次整合可撤回本次美術 commit，回到其父 commit（重用的 M3 角色系統）；圖片與清冊一併回復，不刪除 localStorage。要回到 M2 需先保留原文備份並使用 v5 相容副本。永久備份累積仍可能耗盡配額，保留現有檔並提示管理，不自動刪除釘選備份。

## 遊戲截圖

四名角色各有 1280×900 與 390×844 的實際瀏覽器截圖，檔名為 `docs/screenshots/m3-art-<角色 ID>-<寬度>.png`。

- [凜：桌面](screenshots/m3-art-char_rin-1280.png)／[手機](screenshots/m3-art-char_rin-390.png)
- [悠真：桌面](screenshots/m3-art-char_yuma-1280.png)／[手機](screenshots/m3-art-char_yuma-390.png)
- [紗月：桌面](screenshots/m3-art-char_satsuki-1280.png)／[手機](screenshots/m3-art-char_satsuki-390.png)
- [蓮：桌面](screenshots/m3-art-char_ren-1280.png)／[手機](screenshots/m3-art-char_ren-390.png)

測試環境 deviceScaleFactor=0.5，PNG 實際為 640×450／195×422；標示的 1280／390 是 CSS viewport，不宣稱輸出為相同像素尺寸。

## 驗證

- 單元測試：27 個檔案、530 項通過。新增真實 32 PNG bytes、28 張 runtime 載入、四人映射、20 表情、缺圖回退、整合授權邊界、generator v1 延續與 v4/v5/v6 相容測試。
- 正式建置：成功，32 PNG 來源核對通過；runtime 28 張可載入、18 個既有 draft 槽位。保留既有 JS bundle >500 KiB 警告。
- 瀏覽器最終完整回歸：**10/10 通過，23.8 分鐘**。新增 1280×900 與 390×844 兩組，各實際選取四人、切換 20 表情、核對 full/avatar 尺寸、缺圖回退、唯讀狀態及畫面截圖；保留既有八項語系／存檔／遊戲流程測試。

執行方式：`npm test`、`npm run build`、`E2E_SLOW_WEBGL=1 npm run test:e2e -- --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs`。受限於雲端下載條件，使用系統 Chromium + SwiftShader，workers=1、deviceScaleFactor=0.5；不變更 repo 預設 Playwright 設定。瀏覽器測試使用本機 preview，沒有正式部署。

初跑曾因 M2 舊案例仍斷言面板零張圖片而失敗，已更新為驗證實際全身圖與四個頭像；中止試跑的子程序已清理，最終回歸以單一 runner 執行，不把中止結果計為通過。真實素材讀取單元測試使用獨立 20 秒時限；桌面美術案例在軟體 WebGL 下約 5.9 分鐘，因此最後僅把慢速環境的該案例時限由 6 分鐘放寬為 10 分鐘，未改動驗證斷言或正式程式。
