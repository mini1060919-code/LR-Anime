# 需求對應原始測試證據

本輪 verbose 單元輸出的代表案例；完整 701 項均在同一份日誌，未挑選執行或跳過失敗。瀏覽器完整 16 項以 playwright.log 為準。

| 需求 | 原始輸出位置及案例 |
| --- | --- |
| v4/v5/v6 成長遷移 | [第 197 行](evidence/npm-test.log#L197)：`✓ tests/progression.test.js > v4/v5/v6 add-on migration and protection > migrates v4/v5 to identical growth defaults and preserves exact old v6 source on import 33ms` |
| 死亡及 ID 不重用 | [第 213 行](evidence/npm-test.log#L213)：`✓ tests/progression.test.js > v4/v5/v6 add-on migration and protection > keeps dead residents dead and high-water IDs non-reusable after growth reload 4ms` |
| quota 失敗保護 | [第 251 行](evidence/npm-test.log#L251)：`✓ tests/save-protection.test.js > validation and preservation > does not overwrite if backup fails from quota 28ms` |
| 重複派工不給經驗 | [第 280 行](evidence/npm-test.log#L280)：`✓ tests/autonomy.test.js > deterministic job priority, suitability and capacity > does not reorder valid manual worker history or emit XP for repeated job evaluation 1ms` |
| 長期自主模擬 | [第 366 行](evidence/npm-test.log#L366)：`✓ tests/autonomy.test.js > long autonomous rest/work simulation > runs 200 cycle-equivalents with real repeated rest/resume, bounded resources and no duplicate jobs 2272ms` |
| 200 黎明輪替 | [第 451 行](evidence/npm-test.log#L451)：`✓ tests/save-protection.test.js > bounded rotation and permanent retention > runs 200 dawns within a finite quota and retains exactly the three latest checkpoints 3435ms` |
| 長期需求模擬 | [第 493 行](evidence/npm-test.log#L493)：`✓ tests/survival-needs.test.js > bounded real output and long-running simulation > simulates 200 complete day/night cycles without invalid needs, extra deaths or resource overflow 1791ms` |
| 人物姓名及美術保存 | [第 446 行](evidence/npm-test.log#L446)：`✓ tests/characters.test.js > v6 complete save contract and safe legacy migration > round trips names, personality, occupation and appearance including missing art 9ms` |
| 經濟停用效果一致 | [第 443 行](evidence/npm-test.log#L443)：`✓ tests/characters.test.js > stable identity and roster lifecycle > leaves jobs, economy, survival and recruitment equivalent when ability effects are disabled, even at rank five 24ms` |
| 槽位、JSON、自主恢復 | [第 351 行](evidence/npm-test.log#L351)：`✓ tests/autonomy.test.js > safe v6 autonomy extension > persists manual targets, rest cooldown and needs through three slots and JSON 42ms` |
| 健康順位 | [第 278 行](evidence/npm-test.log#L278)：`✓ tests/autonomy.test.js > deterministic job priority, suitability and capacity > prefers healthier candidates over a low-health expert 3ms` |
| 休息與冷卻 | [第 259 行](evidence/npm-test.log#L259)：`✓ tests/autonomy.test.js > bounded rest lifecycle and hysteresis > requires both the low fatigue threshold and the saved minimum rest time 2ms` |
| 手動優先 | [第 263 行](evidence/npm-test.log#L263)：`✓ tests/autonomy.test.js > player intent and all existing manual entry points > reserves a manual target while exhausted, then resumes it ahead of autonomous occupants 1ms` |
| 原版建築 | [第 226 行起](evidence/npm-test.log#L226)：`definitions.test.js` |
| 原版資源 | [第 8 行起](evidence/npm-test.log#L8)：`economy.test.js` |
| 科技研究 | [第 587 行起](evidence/npm-test.log#L587)：`research.test.js` |
| 繁中 | [第 617 行起](evidence/npm-test.log#L617)：`i18n.test.js` |
| 素材 | [第 659 行起](evidence/npm-test.log#L659)：`anime-art.test.js` |
| 建築建造及容量 | [第 552 行起](evidence/npm-test.log#L552)：`buildings.test.js` |
| 殭屍戰鬥／防衛 | [第 74 行起](evidence/npm-test.log#L74)：`zombies.test.js` |
| 夜襲波次 | [第 672 行起](evidence/npm-test.log#L672)：`waves.test.js` |
