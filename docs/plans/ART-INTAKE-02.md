# ART-INTAKE-02｜實體素材接收結果

2026-11-22（Asia/Taipei）。本次訊息無可下載附件參照。檢查工作區、library-files、shared/downloads、可見 /mnt/data 與 /tmp。只找到先前自製的 `work/audit-smoke.zip`。四件原包均缺可讀原件。

| 預期檔名 | 實際檔名／大小／SHA-256／檔案數量 |
|---|---|
| LR-Anime-A03-A06-Mio-Art-v1.zip | 未取得，均待實測 |
| LR-Anime-M3-character-assets.zip | 未取得，均待實測 |
| LR-Anime-M3-art-integration-v1.zip | 未取得，均待實測 |
| LR-Anime-M3-art-integration-v1 (1).zip | 未取得，均待實測 |

原包未執行 audit_assets.py。兩份整合包的完整 SHA 比對、澪九張 PNG 與 manifest／來源／權利核對、紗月／蓮四筆全身原件映射均待到件。保留既有候選映射及所有原件歷史。候選 `cfa103c659aeb68aa97b448746ac944bbb16fd0d` 重跑肖像驗證器為 28 approved／18 draft。#23 另存 Owner 概念稿審查清單。G1 NO-GO。

## 2026-11-22（Asia/Taipei）｜四份附件實際到件

本次使用者附件已下載至工作區附件目錄並以原檔唯讀開啟。四包全部通過 ZIP CRC。原 ZIP 保留於附件位置，GitHub 只提交 [檔案與成員實測清冊](../art/art-intake-02/inventory.json) 及判定，原包的整合指示僅作來源資料。

| 下載檔名 | 位元組 | 成員／PNG | ZIP SHA-256 |
|---|---:|---:|---|
| LR-Anime-A03-A06-Mio-Art-v1.zip | 18479973 | 12／9 | d26da9e4d7b4db816d230b7f53e7cf46a4c36d4e4ede637eb8767ac3cabf4dba |
| LR-Anime-M3-character-assets.zip | 8491810 | 6／4 | 319ab623f3fd7f331df5581612081603292fda7dc2ec2672b2516f93a0b752eb |
| LR-Anime-M3-art-integration-v1.zip | 31688111 | 34／32 | bc1b52e8dc8733a1a6de2a78bd74ad803df0c8c5ef730e7e1cecb8ce3be3c28c |
| LR-Anime-M3-art-integration-v1 (1).zip | 31688111 | 34／32 | bc1b52e8dc8733a1a6de2a78bd74ad803df0c8c5ef730e7e1cecb8ce3be3c28c |

- 兩整合包 SHA 相同，`cmp` 回傳成功；兩份均保留。整合包 32 PNG 與候選同路徑逐位元組一致，舊版 M3 manifest 同樣一致，所有角色 full、avatar、expression 路徑均有成員。全部 PNG 成員解碼成功。第一批四張 1024×1536 全身與候選均有同 SHA，其中兩張跨名稱，詳映射紀錄。
- M3 第一批及整合包 README 皆記載 OpenAI 圖像生成。現有候選 `user-m3-art-v1` 權利適用已登錄的顯示、網路及儲存庫散布；修改與商用仍未核可。兩原包未提供新增可獨立核驗的授權證明。
- 澪 manifest v1.0.0，九件 SHA、尺寸、mode 全項相符；八張上游原圖所列 Alpha 統計全相符。512px 衍生頭像在 manifest 沒有 Alpha 統計，實測已補入清冊。另核對 [澪逐件 QA](A-ART-QA-01.md) 和 [紗月／蓮映射](ART-ASSET-MAPPING-01.md)。
- 已執行原有 audit_assets.py 與候選肖像驗證器（28 approved／18 draft）。本次無遊戲 CI、E2E 或存檔測試。G1 NO-GO，#23 仍待 Owner 核准。
