# M3 資料結構、肖像與授權契約草案

> 歷史設計草案；本次實際完成範圍與差異請見 [M3 實作紀錄](../M3-IMPLEMENTATION.md)。

> 以下 TypeScript／JSON 均為設計示例，不是已新增的執行碼、可直接匯入的完整存檔或已核准的素材清單。

## 1. 分層與識別碼

| 層 | 權威來源 | 保存方式 |
| --- | --- | --- |
| 生存與工作 | 原 `state.survivors`、`buildings` | 既有 core payload；不複製工作名冊進人物資料 |
| 穩定人物身分 | `runId` + 居民數字 `id` | 同一 v6 封裝保存 namespace 與 ID 高水位 |
| 人物檔案 | `characters.records` | 每位存活居民一份，key 為十進位居民 ID 字串；死亡時刪除 active record，UID 不重用 |
| 原創原型與背景 | 版本化內容目錄 | 保存內容版本、原型 ID 與必要姓名快照；不在每名居民複製長篇多語言文案 |
| 立繪與授權 | 獨立 portrait manifest + rights registry | 同源靜態資產，存檔只存 ID；不存影像 bytes、外部 URL、合約或 token |
| 3D 物件與選取 | 呈現 adapter | runtime only；不保存 Three.Object3D、動畫、座標或 pool index |

`runId` 不是地圖 seed。新遊戲建立新的隨機 UUID namespace；讀取 v6 保持原 namespace。數字居民 ID 仍供既有工作系統使用，不能直接改成字串 UID。

舊檔第一次轉換前可利用「版本化正規化核心內容的 canonical JSON SHA-256」產生決定性的 `run_<64 hex>`。v5 的時間戳與 JSON 物件屬性順序不參與 hash；core 陣列順序保持原樣，不能為人物排序而改變原工作指派語義；相同 v4 core 與包在 v5 中的同一份 core 得到相同 legacy namespace。規格須固定正規化／雜湊版本並提供測試向量。準備流程可以非同步等待 SHA-256，但不得在 hash 或備份未完成前覆寫舊檔。新遊戲同 seed 仍使用不同 runId。

舊檔沒有 runId，不能可靠判定不同日期的兩個 legacy 檢查點是否屬於同一聚落；預設各自遷移，不與外部人物表合併。相同 canonical core 視為同一來源副本，不宣稱可還原其真實歷史身分。v6 匯入保持既有 namespace；若未來提供「另開分支聚落」，需明確操作產生新 namespace 並整體重綁，不能暗中套用。

不能從舊檔推回已死亡居民的最大 ID。遷移只為當前重建且確認的居民建立人物資料；此後持續保存高水位，防止新的 ID 重用。

## 2. 人物原型與存活角色

```ts
// 純資料型別；不是本次建立的 .ts 執行檔。
type ProfessionId = 'generalist' | 'farmer' | 'mechanic' | 'medic'
  | 'scout' | 'guard' | 'researcher' | 'logistician';
type SkillId = 'agriculture' | 'engineering' | 'medicine'
  | 'scavenging' | 'defense' | 'logistics';
type ExpressionId = 'neutral' | 'smile' | 'focused' | 'worried' | 'fatigued';

interface CharacterArchetype {
  id: string;                     // chr_isumi_rin；穩定 ASCII，不使用姓名作 key
  revision: number;               // 正整數；已發布 revision 不覆蓋
  uniquePerRun: boolean;
  nameKey: string;                // characters.isumi_rin.name
  backgroundKey: string;
  professionId: ProfessionId;
  personalityIds: string[];       // 最多兩項、不重複
  portraitSetId: string;          // pset.chr_isumi_rin.standard.v001
}
interface CharacterRecord {
  uid: string;                    // `${runId}:${survivorId}`
  archetypeId: string;
  archetypeRevision: number;
  nameSnapshot: { 'zh-TW': string; en: string };
  customName: string | null;      // 不自動翻譯；寫入須走驗證命令
  professionId: ProfessionId;
  personalityIds: string[];
  abilityRanks: Record<SkillId, number>; // 整數 0–5；M3-A 效果關閉
  portraitSetId: string;
}
interface CharacterStateV1 {
  schemaVersion: 1;
  generatorVersion: 1;
  contentPackId: string;
  contentPackVersion: number;
  usedUniqueArchetypeIds: string[]; // 包含已死亡固定人物，數量由固定目錄限制
  records: Record<string, CharacterRecord>;
}
```

驗證規則：

- records 的 key 與 core 存活居民 ID 集合精確一致；不靠陣列位置 join。UID 全局於該 run 唯一，且 namespace／數字 ID 一致。
- `run.nextSurvivorId` 為安全正整數，必須大於所有現有居民 ID；序列化來源是記憶體的 `state.nextSurvivorId`，不得每次只從存活者重算。
- `professionId`、原型／肖像 ID 是設定，不是第二份工作狀態；實際工作永遠讀 `survivor.buildingId`。
- 自訂姓名建議 1–32 grapheme，Unicode NFC、去除控制字元，以 textContent 顯示；跨語言保持自訂值，未自訂才讀名稱快照／原型翻譯。
- 能力有限整數、個性不重複、revision 正整數；不接受 NaN、Infinity、重複 UID 或無法對應居民的 active record。
- 保留內建 `chr_generic` 原型與 CSS 剪影；已知 generator 可在內容目錄缺失時為新居民建立 generalist／能力全 0 的有效 record，不改原核心招募。內建原型不依賴外部 pack；其 revision 由程式版本固定。
- 舊角色不因 generator/content pack 更新而重新抽取。目錄缺失時保留 ID 與姓名快照，顯示 fallback，不替換成另一個故事人物。
- 若增加「指定某人工作」命令，須同時驗證存活、閒置、建築啟用、容量及 run；由 domain command 一次更新原連結，不讓 UI 直接推入 `workers[]`。

## 3. 建議 v6 封裝

```ts
interface SaveEnvelopeV6Draft {
  format: 'last-refuge';
  version: 6;
  checkpoint: 'dawn';
  savedAt: string;                 // UTC ISO；不是身分產生的 seed
  requiredFeatures: ['characters-v1'];
  run: {
    id: string;
    nextSurvivorId: number;
  };
  core: LegacyCoreV4;               // 既有完整 payload；其 version 仍是 4
  characters: CharacterStateV1;
}
```

這裡的 `LegacyCoreV4` 指既有完整 core 結構，不是僅含 seed 的簡化資料。v6 外層用 `core` 與 `characters` 明確分區，不冒用舊 v5 serializer。開發時需要完整 reader、writer、validator、restore adapter、匯入匯出與備份支援，不能只改 `SAVE_VERSION` 常數。

單筆 record 示意：

```json
{
  "uid": "run_9a1265a4-4cf7-4bb2-a7d7-7bdf7197cc35:1",
  "archetypeId": "chr_isumi_rin",
  "archetypeRevision": 1,
  "nameSnapshot": { "zh-TW": "伊澄凜", "en": "Rin Isumi" },
  "customName": null,
  "professionId": "mechanic",
  "personalityIds": ["pragmatic", "steadfast"],
  "abilityRanks": {
    "agriculture": 0, "engineering": 0, "medicine": 0,
    "scavenging": 0, "defense": 0, "logistics": 0
  },
  "portraitSetId": "pset.chr_isumi_rin.standard.v001"
}
```

JSON 匯出的是人物資料與素材參照，不是完整圖片／背景內容包；另一台裝置需要相容內容包才能完整呈現，否則使用姓名快照、通用文案與剪影，不將授權圖片塞進存檔。

### 未知資料的處理

- 未知外層版本、characters schema、generator 版本、必要 feature 或能力規則：保留原 bytes、停止自動寫入，允許匯出原始檔。
- 已知 schema 中未知的結構欄位先拒絕自動重寫，避免舊 writer 丟資料；未來若需要擴充，另訂明確 passthrough 區與大小／深度限制。
- 缺失的「可選呈現內容」（肖像檔、表情圖、文案原型）可降級顯示，但不得刪除或重抽 record。
- 未知個性／職業 ID 若只屬於 cosmetic content pack，可保留並顯示「設定待確認」；一旦具有模擬效果，必須搭配必要 feature／ruleset 版本，不能默認為沒有作用後繼續存檔。

### 遷移與提交順序

1. 讀取原始 bytes，辨識 v4／v5／v6；禁止把解析失敗當成新遊戲可覆寫。
2. 純驗證及實際重建 core；記錄既有資源上限、工作名冊及預設值正規化。空／缺失居民名冊的 legacy 例外先要求復原確認，不自動新增角色後提交。
3. 為有效存活居民建立 namespace、穩定 records、原型使用清單及 ID 高水位；每筆 legacy 能力預設 0。
4. 驗證整個 v6 參照、大小與 reader→writer 往返。v6 的明確零人口不得走舊 loader「補 4 人」預設分支。
5. 以原 bytes 建立並確認永久遷移備份；備份失敗則保留原檔，禁止先刪永久備份換空間。
6. 對同一主 key 原子寫入整份 v6；驗證讀回。失敗時保留舊主檔／已建立備份，告知玩家，不部分提交人物資料。
7. 三個槽位、JSON 匯入及復原同樣處理完整封裝；不同 run 不能合併人物表。保留 M1 一般備份 3 份與永久釘選策略。

v6 仍使用既有主／槽位 key，讓舊 M1/M2 看見未知版本而保護它。若改用另一個主 key，舊版可能另寫出分岔進度，故不建議。舊版無法讀 v6；降版需使用者明確匯出 v4/v5 核心副本，告知其中不含 M3 人物資料，並保留原 v6。不得直接在原 key「降版覆蓋」。

## 4. 肖像、表情與素材 ID

| 項目 | 草案 |
| --- | --- |
| 原型 ID | `chr_isumi_rin`；只允許小寫 ASCII、數字、底線，禁止本地化與檔案路徑 |
| 肖像組 ID | `pset.chr_isumi_rin.standard.v001` |
| 單圖 ID | `portrait.chr_isumi_rin.standard.neutral.v001` |
| 表情 | `neutral` 必備；`focused, worried` 首批；`smile, fatigued` 選配 |
| runtime 路徑 | `assets/portraits/chr_isumi_rin/standard/neutral_v001.webp`；同源、本機受控相對路徑 |
| 完稿 | 2:3、建議 1024×1536、sRGB、透明背景；眼線約畫布高度 30–35%，保留頭髮／服裝安全區 |
| 縮圖 | 128×128；明確臉部 crop，不直接拉伸全身圖 |
| 交付 | 原始分層檔置於授權允許的位置；runtime 用 WebP，必要時 PNG；M3 runtime 不新增 SVG／遠端 URL／base64 圖片 |
| 轉移大小目標 | 全圖每張 ≤350 KiB，縮圖 ≤24 KiB；是設計預算，尚未實測 |
| 載入 | 名冊只載入縮圖；選取才載入全圖；避免預載整包表情 |

快速切換人物時，圖片請求必須帶選取 UID／request token；晚到的舊回應不得覆蓋目前人物。快取按完整 asset ID／revision 管理，不以居民陣列 index 當 key。

fallback：指定表情 → 該肖像組 neutral → M2 原創剪影。圖檔 404、解碼失敗、缺授權核准、未知 ID 都走 fallback；不要替換人物身分、阻止核心儲存或阻塞 3D GLB 載入。保留 alt 與狀態文字，不能只靠表情傳達飢餓／口渴。

表情選擇是 derived view state，不保存到存檔。危險表情若使用戰鬥事件，需要 UI 自己的短期提示期限；事件已被主程式 drain 時，不能把事件缺席當成安全或改變戰鬥邏輯。

## 5. 獨立素材目錄與授權登錄

新增目錄的概念路徑：

- `public/assets/portraits/manifest.v1.json`：僅 UI portrait loader 使用，**不加入現有 `assets/manifest.json`**。
- `content/characters/`：版本化原型、姓名及背景文案。
- `content/asset-rights/registry.json`：可公開的權利核准摘要。
- `docs/licenses/portraits/`：允許公開的授權條文與 attribution。
- 私有契約、付款資料或個資另存受控位置；公開 registry 只放不帶存取憑證的 evidence reference。

manifest 結構示意（draft 不會被 runtime 使用）：

```json
{
  "schemaVersion": 1,
  "packId": "lr-original-cast",
  "packVersion": 1,
  "portraitSets": {
    "pset.chr_isumi_rin.standard.v001": {
      "characterArchetypeId": "chr_isumi_rin",
      "neutralAssetId": "portrait.chr_isumi_rin.standard.neutral.v001",
      "expressions": {
        "neutral": "portrait.chr_isumi_rin.standard.neutral.v001"
      }
    }
  },
  "assets": {
    "portrait.chr_isumi_rin.standard.neutral.v001": {
      "path": "assets/portraits/chr_isumi_rin/standard/neutral_v001.webp",
      "width": 1024,
      "height": 1536,
      "altKey": "portraits.isumi_rin.neutral.alt",
      "licenseRef": "rights.lr-cast.rin.v001",
      "status": "draft",
      "sha256": null
    }
  }
}
```

範例沒有實際圖片，也沒有授權通過或 checksum 的宣告。核准前 CI 必須驗證實際檔案存在、檔案型別／大小／尺寸符合、SHA-256 為實際計算值、manifest 參照完整且權利記錄可追溯。

rights registry 至少包含：`id, creator, sourceType, sourceUrl?, licenseId, licenseVersion, evidenceRef, attributionText, permissions, status, reviewedAt, reviewedBy`。permissions 明列遊戲內展示、商業使用、修改／裁切／表情衍生、網站散布與公開原始碼倉庫內再散布的權利。狀態流程為 `draft → rights_verified → approved`；另有 `retired/revoked`，不能僅靠作者自填 `license: Original` 就放行。核准需要權利審查人員的獨立覆核；後續可用 CODEOWNERS／受保護分支強制審查，這些設定本次不變更。CI 驗證欄位、參照與 hash，無法自行判定版權或把 `approved` 字串當法律證明。

優先使用自行創作、明確委託授權、CC0 或可滿足 attribution 的 CC-BY-4.0。不得使用不明網站抓圖、既有動漫截圖／角色二創、未確認的 AI 模仿素材，或不允許所需修改／散布的資產。標示作者或付費購買不必然等於可以把檔案放進公開 repo。

有條件採用 AI 圖像時，需另外記錄供應商、模型／服務版本、生成日期、當時條款證據及人工來源檢查；不能因此宣稱權利已自動無爭議。本案首選原創委託，規劃階段不產生或下載任何圖片。

素材授權不自動等於專案程式碼 MIT。每檔的授權及署名由 registry 與 CREDITS 對應；需要維持既有第三方 3D 素材的授權說明。撤銷素材時停用檔案與 resolver，但保留存檔人物 ID、fallback 與變更紀錄，不刪除玩家人物資料。

M2 的 `approvedPortrait` 目前只做路徑與 metadata 檢查。M3 registry adapter 要先完成上述核准，再轉成 M2 接受的 `src, alt, credit, license` descriptor；不應把該函式誤當作法律審核或真實授權證明。
