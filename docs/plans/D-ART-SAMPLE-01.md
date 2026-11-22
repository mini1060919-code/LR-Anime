# D-ART-SAMPLE-01｜八角概念與雙機械師樣稿

2026-11-22（Asia/Taipei）。G1 NO-GO。樣稿待 Owner 審查。基底為 Draft PR #21 `cd38804a9dbd4cba77916657f13d9d512117910f`，沿用 #16 D-ART 與 #15 D-02 的模板 ID 和職業。M3 視覺參考基準為 `cfa103c659aeb68aa97b448746ac944bbb16fd0d` 的四張全身圖。以縮小拼圖做動畫風、比例、衣料參考，圖面採原創角色構成。

## 查看樣稿

- [八人灰階剪影及配色同頁樣稿](../art/d-art-sample-01/eight-survivors-concepts-v001.png)。上排左起野原茜、川瀨樹、高瀨惠美、北村空。下排左起相馬淳、立石怜、橋本冬馬、小森棗。
- 川瀨樹 [全身](../art/d-art-sample-01/itsuki-full-v001.png) · [半身](../art/d-art-sample-01/itsuki-half-v001.png) · [neutral](../art/d-art-sample-01/itsuki-neutral-v001.png) · [頭像](../art/d-art-sample-01/itsuki-avatar-v001.png)。
- 小森棗 [全身](../art/d-art-sample-01/natsume-full-v001.png) · [半身](../art/d-art-sample-01/natsume-half-v001.png) · [neutral](../art/d-art-sample-01/natsume-neutral-v001.png) · [頭像](../art/d-art-sample-01/natsume-avatar-v001.png)。
- [PNG 技術清冊](../art/d-art-sample-01/inventory.json)。每件記錄 SHA-256、位元組、尺寸、透明／半透明／不透明像素數、Alpha≥32 邊界及來源。

| 角色 | 服裝與職業辨識 | 審查項 |
|---|---|---|
| 野原茜 | 採種簍、土褐外擴圍裙、前腰種子袋 | 暖橄欖內袖在小圖可辨 |
| 川瀨樹 | 靛藍直身、胸前高位壓力錶、水管快接 | 與悠真深色肩線、凜的工具輪廓比對 |
| 高瀨惠美 | 霧綠短外套、腕帶、物資袋 | 銀灰短髮仍接近紗月，先拉開髮型和輪廓 |
| 北村空 | 赭色短外套、斜包、胸前折圖 | 遮光手勢與蓮接近，先審新姿勢 |
| 相馬淳 | 炭灰方肩長背心、黃條、夾板 | 確認縮圖可見夾板 |
| 立石怜 | 灰紫高領、內收持筆記本 | 小圖保留高領與書角 |
| 橋本冬馬 | 暗棕厚肩、銅橙輪班卡 | 灰階與淳并排檢查長外衣差異 |
| 小森棗 | 沙色捲袖、湖藍、腰下零件袋和扳手 | 與凜／樹並排，低重心與短髮可辨 |

## 品質、版次與來源

- OpenAI ImageGen 生成。同頁八角是 RGB 審查圖。雙機械師源圖 [v001](../art/d-art-sample-01/mechanics-source-v001.png) 有頭頂餘量不足與透明邊緣色污。以 v001 作編輯參考取得 [v002](../art/d-art-sample-01/mechanics-source-v002.png)，改善上下餘量，髮絲與局部輪廓仍有色邊，保留兩版供比較。
- v002 經 ImageMagick 各自裁切及統一畫布。全身、半身 1024×1536 RGBA，頭像、neutral 512×512 RGBA，八張 Alpha 0～255。頭像沿用同人 neutral 的方形裁切。兩個全身頂部的 Alpha≥32 留白約 12%。雙機械師的站姿、手、胸錶、腰袋與正臉可從樣稿比對。概念圖與雙人樣稿的髮型和局部服裝存在變體；角色定稿須選定單一母版。
- Owner 審查重點為明暗底邊緣、同尺度半身臉部、高／低工具辨識、與 M3 四角的相似風險。半身臉部尺度與垂直位置仍需統一，棗的頭像稍低於 8% 頂部留白。48／64px、1000／390px 的遊戲容器測試及其餘四種表情留待定稿，neutral 備援亦待接線驗證。
- 來源類型為生成樣稿與同源裁切，僅供本案 Draft 審查。商用、正式發布、長期再散布權利與使用條款核對待 Owner 驗收。現有 M3 的權利記錄未套用到這批圖。樣稿約 8.2 MiB，單件小於 2 MiB，沿用普通 Git，未改 LFS 或執行期 manifest。
- 先由 Owner 決定雙機械師母版與其他六角方向，再針對被驗收指出的實際缺陷修改。源圖、失敗及修稿歷史保留。此分支只有 docs 與審查 PNG，遊戲路徑、角色 ID、存檔與部署無異動。
