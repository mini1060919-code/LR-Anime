# M5-A 測試與畫面

基準 M4 `2d1f408`；Node v24.22.1／npm 11.9.0，沒有新增套件。原有 596 項單元測試保留，legacy fixture 補上移除新需求元件的步驟，以維持「舊 v6」資料的真實形狀。

| 檢查 | 結果 |
| --- | --- |
| `npm test` | 29 個檔案、657 項通過（原有 596 + 本階段 61） |
| `npm run build` | 成功；原 32 PNG 校驗通過，既有 bundle >500 KiB 警告仍在 |
| M5-A 桌面／手機 | 2/2 通過，5.1 分鐘 |
| 原有 M1–M4 十二項瀏覽器回歸 | 首輪 11 通過、1 舊斷言失敗（31.2 分鐘）；修正後該項 1/1 通過（1.7 分鐘），最終 12 個不同案例均通過 |
| `git diff --check` | 通過 |

新增測試覆蓋工作／休息、無效職位、原民兵活動、數值上下限、健康壓力與恢復、原死亡規則、個性／職業差異、效率上下限與停用、產出／預估／研究／採集、重複／倒退／非法時間步、日夜時鐘隔離、重載防重播、全版本遷移、三槽／JSON、同內容舊檔匯入永久備份，以及損壞／未知版本原文保護。

長時間測試為 30,000 個一秒遊戲步（相當 200 個 150 秒日夜週期），固定四名居民、農場／菜園／診所／兩口井，實際執行經濟、進食飲水與需求。驗證每段資源不越容量、需求有限且範圍合法、沒有額外死亡或資源異常。這不是 200 場夜襲與隨機天氣壓力測試；自然日夜／夜襲功能由既有純邏輯與 browser smoke 另行覆蓋。

M5-A 瀏覽器使用 1000×900 與 390×900 CSS viewport，透過正式 JSON 介面匯入可重現的需求檢查點，再用 M4 UI 派工；確認實際運行後工作者疲勞增加、待命者疲勞減少、需求效率開關、黎明保存與重載、解除工作恢復，以及英文標籤。舊 M4 檔案移除需求元件後匯入，確認預設與原始文字永久備份。

重載後主程式會繼續有效模擬，因此 browser 比較保存的需求快照與延續步號，不錯把正在運作的數值要求為永遠等於黎明；純資料 restore 測試則逐欄比對完全相等。

```sh
npm test
npm run build
E2E_SLOW_WEBGL=1 ./node_modules/.bin/playwright test --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs e2e/m5a-survival-needs.spec.js
E2E_SLOW_WEBGL=1 ./node_modules/.bin/playwright test --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs --grep-invert 'M5-A needs, real duty and rest, saved growth'
```

環境使用系統 Chromium／SwiftShader，workers=1、deviceScaleFactor=0.5，設定在 repo 外；圖片像素是 CSS viewport 的一半。本機 preview 不是正式部署。

初跑 browser 發現「同內容舊 v6 匯入」漏存來源備份，已修正並加入專項回歸；修正前失敗／中止結果不計為通過。M2 的 meter 斷言由原兩條增為五條（保留飢渴、增加三需求）；M4 checkpoint 斷言增加新的必要功能標記。

## 截圖

- [桌面三需求、立繪與技能](screenshots/m5a-needs-1000.png)
- [手機三需求與技能](screenshots/m5a-needs-390.png)

M3 舊人物回歸原本把整份 record 視為不變；本階段士氣會隨有效時間改變，因此調整為逐欄保留全部非 needs 資料的深度比對，並驗證需求的合法方向／範圍。此項已在其餘回歸完成後單獨複驗通過，不把首次失敗算作通過。

最終覆蓋 14 個不同 browser 案例（本階段 2 + 原有 12），均有通過結果；採分組與修正後單項複驗，不宣稱第一次單次全套已零失敗。正式程式與最後建置在這些回歸期間沒有變更。

單項複驗命令：

```sh
E2E_SLOW_WEBGL=1 ./node_modules/.bin/playwright test --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs e2e/m3-characters.spec.js --grep "persistent named residents"
```
