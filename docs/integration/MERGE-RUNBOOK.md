# M1～M5-B 依序整合與失敗回復操作書

本文件是待使用者批准的操作方案。這次審查沒有合併、調整任何 PR Base、刪除分支、推送標記或改動 develop／main。

## 標記與凍結

核准執行時先重新 fetch 全部 heads 與 PR heads；逐一對照 branch-audit.json 的完整 SHA。任何 head／base 改變即停止，重做該段 diff、祖先與完整回歸，不沿用本報告通過結果。

建議建立不可移動的 annotated tags：`integration/2026-11-18/pre-develop-f6faebb`、`integration/2026-11-18/candidate-f2df451`，分別指向完整 develop／M5-B SHA；其他六階段以 `integration/2026-11-18/m1-642c8d2` 等 stage＋短 SHA 命名。先確認名稱未存在且目標正確；存在不同目標時另起名稱，絕不強制移動。逐個推送明確 tag，不能使用 `--tags` 把其他本地 tag 一起推送。標記是 Git 回復錨點，不是玩家存檔備份。

GitHub 設定須確認允許 **Create a merge commit**、禁止自動刪除 head branch、沒有啟用 auto-merge，並核對 develop 的審查與必要 checks。API Forbidden，本次無法證實儲存庫保護設定及 reviewer／checks 放行狀態，須由擁有者確認。main 不在整合目標內。

## Base 調整與順序

| 階段 | PR | 目前 Base | 何時改成 develop | 合併後要包含的原始 Head |
| --- | --- | --- | --- | --- |
| M1 | #1 | develop | 不需調整 | 642c8d2fb1c6faddcfdd1b10e0c69d7231c53eec |
| M2 | #2 | feature/save-protection-v5 | M1 合併且 develop 完整測試通過後 | e89c3a7ffd3b4131a8be76ca28e5a864edee6fda |
| M3 | #4 | feature/m2-zh-tw-anime-ui | M2 合併且測試通過後 | 14ddcddf0a6037e611a70a3a9bf34097d7a7a68f |
| M4 | #3 | feature/m3-anime-art-integration | M3 合併且測試通過後 | 2d1f4084b2d422b55cc9879fcf92b870a34a381f |
| M5-A | #5 | feature/m4-survivor-progression | M4 合併且測試通過後 | 002529e38d072f39f9af137b14de5206fee5d672 |
| M5-B | 尚無 PR | 建議先以 M5-A 為 Base 建立 | M5-A 合併且測試通過後 | f2df451b0fccf4c62ac71821817bf130376d18bc |

順序為 **#1 → #2 → #4 → #3 → #5 → M5-B PR**，逐次匯入 develop；不是先把子分支一路合回父分支再把整包一次合入 develop。不要預先同時調整所有 Base，否則 PR diff 會包含尚未進 develop 的前置階段。

本輪環境為 Node.js v24.22.1／npm 11.9.0；各階段使用對應鎖檔，不先升級依賴。在這個雲端需先設定 `npm_config_cache=/workspace/.npm-cache`（或其他可寫專用快取）；預設家目錄 cache 不可寫的首次失敗已保留。瀏覽器設定、版本及完整命令見 REPORT.md 與 evidence/browser-config.txt。

每一段都要：

1. 使用者核准該段，記錄當下 develop SHA（before）及 PR head SHA；核對前階段 Head 已是 develop 祖先。
2. 調整下一個 PR Base 後，重新核對 `git diff origin/develop...origin/<head> --name-status`，須與 evidence/stage-N.patch／stat 的預期功能差異一致；不能只看總檔案數。檢查 review 是否被 Base 調整重設。
3. 建立臨時檢查 worktree／分支，對更新後合併結果執行 `npm ci`、`npm test`、`npm run build`、該階段版本所具備的全部 Playwright 測試。若此階段是 M1，不應要求尚未加入的 M5-B 測試存在，但不能刪除／略過該版現有失敗測試。
4. 使用 **Create a merge commit**，保持 head branch，不使用 squash、rebase merge、auto-merge。
5. 取得合併後 develop SHA（after），驗證原始 Head 是其祖先、merge commit 第一父提交為記錄的 before，並確認差異樹與預檢一致。
6. 在全新的測試 worktree 與隔離瀏覽器重新執行上述四個命令，保存該段 after SHA、完整輸出與 exit status；全部通過後，才建立 `integration/2026-11-18/after-mN-<sha>` 標記並進下一段。

若 develop 設定要求 head 必須包含最新 Base，單純 retarget 可能仍被阻擋。此時先停止放行，由使用者批准「Update branch with merge commit」或在該功能分支正常 merge 最新 develop；不能選 rebase 更新。保存更新前 Head、檢查更新後 tree 與原階段功能樹一致，記錄新 Head SHA 並重跑完整測試，再重新審查。正常 merge 不改寫原始提交；後續堆疊仍能以前階段原始 Head 找到共同祖先。若有其他 develop 修改使 tree 不再相同，視為新的整合變更，不能直接沿用本報告。

任一衝突、意外檔案、未核准的 head 移動、review／checks 未通過、安裝失敗、測試失敗或樹差異不符：**停止後續 Base 調整及合併**。本次候選通過不能取代未來每次合併後重測。

## merge commit 與 squash 比較

| 方式 | 祖先關係 | 堆疊 PR 的後果 | 本次建議 |
| --- | --- | --- | --- |
| 一般 merge commit | 原 Head 全部成為 develop 祖先 | 下一段 merge-base 可到達前階段 Head，顯示單階段差異 | 採用 |
| squash merge | 生成新提交，舊 Head 不一定成為祖先 | 下一段三點 diff 可能重新出現前階段修改，衝突與重複 review 風險增加 | 不採用 |
| rebase merge | 重建提交 SHA | 後續分支仍指向舊祖先，通常要重整整串分支 | 不採用 |

若儲存庫只允許 squash，先停止；由擁有者決定啟用一般 merge，或另行批准完整重建 PR 的方案。本次不 rebase 共用分支、不 force push，也不 reset --hard。

## 每一步失敗回復

| 失敗位置 | 保全方式 | 回復方式 |
| --- | --- | --- |
| fetch／Base 調整前 | 不改 develop | 修復環境／重做審查；尚未改 Base 無需回復 |
| Base 調整後、合併前 | 記錄舊 Base，保留 head | 可把該 PR Base 調回上表原值並重新審查；不改提交歷史 |
| 臨時檢查發生衝突 | 正式分支不受影響 | 保留檢查證據，停止；只清理自己建立的臨時環境，不動共享 branch |
| 合併完成但 after 測試失敗 | 凍結後續階段，記錄 merge SHA | 先保存失敗輸出；另開回復分支與 PR，先驗證該 merge 第一父提交確為記錄的 develop before，再用 `git revert -m 1 <merge-SHA>` 產生反向提交，核對 diff 及完整測試後由使用者核准合入 develop |
| 多階段已合併後發現問題 | 保留所有 before／after 標記 | 由最後階段向前逐個提出 revert PR，不能跳過依賴直接回復底層 M1；不直接 reset develop 到舊 SHA |
| 存檔或 UX 回歸 | 保留原始 JSON、槽與備份 | 不自動改玩家儲存；在隔離瀏覽器重現，修復另開功能／修復 PR |

注意：revert 不移除原合併的祖先關係；未來重新引入功能不能單純再 merge 同一個 Head，需經修復提交或 revert-the-revert PR 再次審查與完整測試。應用程式 Git 回復不代表新版存檔可被舊版解讀，另見 SAVE-SAFETY.md。
