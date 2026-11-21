# D-ART｜八名倖存者美術製作規格 v0.1

2026-11-21 Asia/Taipei。角色資料沿用 [D-02](https://github.com/mini1060919-code/LR-Anime/blob/69b264c044aacab2c9c73b16beb17d8e8e7fa200/docs/plans/D-02.md) 與 D-05。對照既有四角的透明 PNG、manifest 與畫面比例。本輪交付製作規格，正式圖稿與品質審查待辦。

| 模板 ID／角色 | 職業與背景線索 | 輪廓、服裝、配色與辨識物 |
|---|---|---|
| chr_recruit_akane／野原茜 Akane Nohara | farmer，保存溫室種苗 | 外擴圍裙，土褐與暖橄欖，腰前種子袋 |
| chr_recruit_itsuki／川瀨樹 Itsuki Kawase | mechanic，巡蓄水槽 | 直身窄肩，靛藍防水背心，高位量測工具 |
| chr_recruit_emi／高瀨惠美 Emi Takase | medic，診所輪班及物資 | 圓領短外套，霧綠與米白，腕帶。避免仿冒醫療商標 |
| chr_recruit_sora／北村空 Sora Kitamura | scout，路線紀錄 | 斜跨行囊、赭色短外套，胸前折頁地圖 |
| chr_recruit_jun／相馬淳 Jun Soma | logistician，配給貨單 | 方肩長背心，炭灰與淡黃，手持盤點夾板 |
| chr_recruit_rei／立石怜 Rei Tateishi | researcher，保存技術筆記 | 高領縱向輪廓，灰紫與藍灰，貼身筆記本 |
| chr_recruit_toma／橋本冬馬 Toma Hashimoto | guard，鄰里輪值 | 寬肩厚衣，暗棕與銅橙，胸前輪班卡 |
| chr_recruit_natsume／小森棗 Natsume Komori | mechanic，整備搬運車 | 捲袖、低重心工具袋，沙色與湖藍，與樹的直身輪廓區別 |

## 共通交付

- 每人一張 1024×1536 透明全身母版兼檔案展示，衍生一張 1024×1536 半身檔與 512×512 頭像。半身及表情保留相同臉部中心與視線，頂部至少留 8% 安全邊。D-05 卡片提案以 48px／64px 測可辨識度，E-05 詳情以 2:3 容器測 1000px／390px，均使用 contain 且可唯讀縮放。
- 五個表情鍵沿既有四角的 `neutral`、`happy`、`alert`、`tired`、`injured`。缺表情以同角色驗證過的 neutral 備援，缺 neutral 時顯示通用剪影及文字。建議資產鍵 `portrait.<模板ID>.standard.<表情>.v001`，角色 UID 及模板 ID 保持獨立。
- 先審八人黑白剪影及同尺度配色稿，再選兩位機械師驗證區分度及裁切，過審才製作全表。每件原檔留版本、用途、尺寸、Alpha、SHA-256、來源、權利、責任人及驗收記錄。批准後才可進正式 manifest。
- 獨立美術驗收包含黑白剪影可區分、五表情身份一致、透明邊緣無雜色、尺寸／SHA／權利相符及兩語畫面。禁用未授權第三方圖。既有四角素材與 ID 保留。顧問澪維持獨立身份，無勞動或床位名額。

下一任務 D-ART-REVIEW-01，先核准樣稿規格與權利交付。E-05、D-05 的容器尺寸仍待實際介面審查。
