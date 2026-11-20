# LR-Anime｜計畫與階段歷史變更日誌
本檔為**追加式**工作紀錄，保留過往決策，不以最新狀態覆寫歷史事實。

## 2026-11-20｜建立 A～E v1.0 / M 階段／G1 文檔體系
- 來源：專案負責人重新提供《LR-Anime｜A～E 遊戲體驗與美術開發總計畫 v1.0》及開發順序、雙線分工。
- 完成：總計畫入口、A/B/C/D/E 各 6 個子項階段紀錄、M0～M11 里程碑、G1 閘門、交接文件、最新狀態與更新規則。
- 重要決策：設計／程式／測試／整合／放行分別記錄，不以過去對話主張當作已驗收證據。
- GitHub 紀錄：M3 PR #7、M4～M5-B PR #8、G1 統一 PR #9；G1 **NO-GO**。
- 未完成：A～E 原始交付實體核對；PR #9 的同一版本完整回歸、分支相容與存檔驗收。
- 下一步：G1 回歸 → UX-01 → M5-C → M6-A～D → M7～M11；企劃線 B-03～B-06 → C → D。

## 後續追加紀錄格式
### YYYY-MM-DD｜<工作編號>｜<變更摘要>
- 版本／負責工作線：
- 已完成與檔案：
- PR／Commit：
- 實際單元／建置／E2E／存檔驗證：
- 風險與決策：
- 尚未完成／下一編號：

## 2026-11-20｜B-03｜居民／工作／防禦教學 v0.1 草案
- 版本／責任線：B-03 v0.1；企劃／敘事線。
- 已完成與檔案：[docs/plans/B-03.md](plans/B-03.md)；提出教學順序、暫定 ID、雙語草稿、可跳過條件、存檔安全邊界、八類待執行驗收案例。
- PR／Commit：治理分支 `docs/ae-master-plan-v1-governance`，commit `26d8dcb46296c1af196b979413a52fda79ef8e59`；屬 PR #10 文件工作，未合併。
- 實際單元／建置／E2E／存檔驗證：**未執行**；本次僅變更規格文件。
- 風險與決策：B-01／B-02 原檔、正式事件名稱與現有 UI 尚待核實；本次未修改功能或存檔，也未變更 G1 NO-GO。
- 尚未完成／下一編號：B-03 原稿／事件契約驗證、雙語審校；並行下一企劃 B-04。


## 2026-11-20｜G1 PR #9 完整自動化回歸成果歸檔
- 同一 Head：`a2000b4e4700cd187aa0b1d2b2186364743850dc`。
- 依 Codex 正式 PR 報告：Vitest 701/701、Playwright 24/24、M3 happy→neutral 補跑 2/2、存檔 v4/v5/v6、Smoke 2/2 皆 PASS；安裝與建置成功。
- 仍須核對 GitHub required checks／review 規則（Codex 回報 HTTP 403）、分支依賴與放行順序；**G1 NO-GO**。
- 已將早期「Smoke 修補缺席」風險調整為版本差異待審，不再標作實際回歸失敗；歷史紀錄保留。


## 2026-11-20｜G1 正式 GitHub Actions 驗證啟動
- 新建 [Draft PR #11](https://github.com/mini1060919-code/LR-Anime/pull/11)，新增 `.github/workflows/g1-validation.yml`，維持 PR #9 原驗證 SHA 不變。
- GitHub Actions run ID `44724242042`；最初查核單元／建置 SUCCESS，Playwright E2E 進行中。
- 已建立 [G1 放行檢查表](milestones/G1-RELEASE-CHECKLIST.md)；仍待 CI 完成、required checks／review、生效規則與正式合併順序核對。NO-GO。
