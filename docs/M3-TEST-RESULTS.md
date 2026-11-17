# M3 測試紀錄

日期：2026-11-17（台北）。Node.js v24.22.1，npm 11.9.0。基準 M2 `e89c3a7`；沒有新增相依套件或更動 lockfile。

| 檢查 | 實際結果 |
| --- | --- |
| `npm test` | 26 個檔案、524 項全部通過；包含最後圖片 URL lease 修正 |
| `npm run build` | 成功；素材閘門為 0 approved / 30 draft，仍有既有 bundle >500 KiB 警告 |
| 完整 Playwright 回歸 | Chromium 8/8 通過，14.0 分鐘；在 URL lease 修正前完成建置並執行 |
| URL lease 修正後 M3 瀏覽器複驗 | 2/2 通過，2.4 分鐘；包含透明 PNG 實際解碼與失敗回退 |
| `git diff --check` | 通過 |
| 核心模組差異檢查 | map/world/core/buildings/zombies/economy/research/phase-controller 與 M2 無差異；居民兩處僅加入 ID 安全整數防護 |

## 測試範圍

新增角色單元測試：SHA-256 與 Node crypto 交叉驗證；canonical object/array 順序；新局 namespace；死亡、招募、高水位及 reload；不消耗遊戲 RNG；能力值不改變工作／資源／生存結果；v4/v5 決定性遷移；v6 姓名與未知外觀 ID；空名冊邊界；無效 UID、未知必要功能、未知欄位、錯誤格式保護；JSON 原文永久備份；v5 下載副本不寫入現檔。

圖片測試：draft 不下載、權利閘門、同源路徑、尺寸／大小、MIME、SHA-256、過量串流、短檔、404、中立表情回退、缺少頭像、離線重試、請求共用、快取淘汰不撤銷使用中 URL、釋放與 dispose；建置素材閘門。

完整瀏覽器八項：

1. 繁體中文主要 UI、唯讀人物面板與 v4/v5 語系相容。
2. 小視窗繁中控制與可存取角色對話框。
3. M3 身分、高水位實際招募、v5 匯入、完整人物手動槽與 reload。
4. 測試程式自行產生透明 PNG，驗證實際載入、署名、checksum 失敗及 checksum 正確但無法解碼時退回預設肖像。
5. v4 升級、三槽、JSON 往返及損壞檔保護。
6. 永久備份重載及真實瀏覽器配額不足時原檔不變。
7. HUD、資源、建築選單與建造操作。
8. 自然日夜循環、黎明自動保存與 reload。

單元測試亦保留既有建築、資源、研究、殭屍／夜襲及存檔測試；不宣稱瀏覽器覆蓋所有建築或每種夜襲情境。

## 執行方式

```sh
npm test
npm run build
E2E_SLOW_WEBGL=1 npm run test:e2e -- --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs
# 最後圖片管理器修正後重建並複驗 M3 兩項
E2E_SLOW_WEBGL=1 npm run test:e2e -- --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs e2e/m3-characters.spec.js
```

環境不能下載 Playwright 配套 Chromium，使用外部環境設定指定 `/usr/bin/chromium`、SwiftShader、workers=1、deviceScaleFactor=0.5；該設定在 repo 外，不強制開發者使用本機路徑。原生遊戲時間依畫面更新累積，軟體 WebGL 的完整日夜測試約 4.2 分鐘。測試使用本機 preview，沒有正式部署。

完整回歸與最後修正後複驗分別執行，沒有把修正前的完整八項宣稱為修正後重跑。早期一次為加強損壞圖片解碼案例而手動停止的測試不計入通過結果。
