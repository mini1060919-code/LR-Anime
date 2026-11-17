# M4 自動測試與畫面

環境：Node v24.22.1／npm 11.9.0；未增加相依套件。基準 M3 `14ddcdd`。

| 檢查 | 結果 |
| --- | --- |
| `npm test` | 28 個檔案、596 項通過（原有 530 + M4 66） |
| `npm run build` | 成功；原 32 PNG 檢查通過，既有 >500 KiB bundle 警告仍在 |
| M4 瀏覽器兩尺寸 | 2/2 通過，5.7 分鐘 |
| 桌面排版修正後複驗 | 1/1 通過，3.2 分鐘；僅 >520px 的 CSS 調整，手機不受影響 |
| M1–M3 十項瀏覽器回歸 | 10/10 通過，25.0 分鐘 |
| `git diff --check` | 通過 |

新增單元測試覆蓋六種能力、門檻、職業與個性表、只限參與者、餘數與重載、一次性收據／偽造／跨 state／重播、資源上限、缺料／停工／空轉、發電、研究、診所、採集、後勤、植林完成、廣播招募、實際傷害與過量傷害、HQ 六名槍手、手動／自動派工、全版本遷移、三槽及 JSON、工作名冊矛盾、死亡與高水位。

停用能力加成後以最高技能驗證經濟、採集、科技、診所倍率、飢渴及戰鬥與原值一致。經驗仍來自實際工作，不以畫面開啟、待命或經過時間直接授予。

M4 瀏覽器案例使用 1000×900 與 390×900 CSS viewport，透過正式 JSON 匯入 UI 建立接近升級門檻的檢查點；經正式派工 UI 指派，再運行真正的農場生產跨過等級門檻，沒有直接呼叫授予 XP API。檢查繁中六技能、圖像、目前工作、效果開關、黎明保存與 reload，恢復自動派工、解除工作，並在桌面驗證英文技能標籤。自然完整日夜循環由原 smoke 另行驗證，不以測試快轉冒充自然流程。

## 執行

```sh
npm test
npm run build
E2E_SLOW_WEBGL=1 ./node_modules/.bin/playwright test --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs e2e/m4-progression.spec.js
# 最後桌面排版修改後另重跑桌面一項
E2E_SLOW_WEBGL=1 ./node_modules/.bin/playwright test --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs e2e/m4-progression.spec.js --grep 'at 1000px'
E2E_SLOW_WEBGL=1 ./node_modules/.bin/playwright test --config /workspace/.cloud-setup/LR-Anime/playwright.config.mjs --grep-invert 'Traditional Chinese skills, validated assignment and dawn persistence'
```

使用環境外設定指定系統 Chromium／SwiftShader、workers=1、deviceScaleFactor=0.5；不改 repo 預設 Playwright 設定。圖片檔實際像素為 CSS viewport 的一半。本機 preview 不是正式部署。

初跑原 M3 的「最高技能也沒有能力效果」測試已按 M4 需求改為顯式關閉效果；成長配額測試維持有限空間、調為 24 KiB。語系的遷移 fixture 原本把居民指向零職缺 HQ，已改為合法待命名冊，唯讀適配測試仍保留任意工作名稱的顯示檢查。為補強工作名冊驗證而中止的一次回歸不計通過；最終結果以表格為準。

## 畫面

- [桌面人物立繪與目前工作](screenshots/m4-dossier-1000.png)／[桌面六技能與經驗](screenshots/m4-skills-1000.png)
- [手機人物立繪](screenshots/m4-dossier-390.png)／[手機六技能與派工](screenshots/m4-skills-390.png)

最終覆蓋 12 個不同的瀏覽器案例：M4 2 項 + 原有 10 項，均通過；另有最後桌面 CSS 修改後的 1 項重複複驗，不算第 13 個不同案例。M4 手機樣式不受桌面專用 CSS 影響；最後核心程式與存檔驗證和單元測試通過時一致。
