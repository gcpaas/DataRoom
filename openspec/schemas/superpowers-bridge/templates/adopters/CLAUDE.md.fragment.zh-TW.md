<!-- Source: superpowers-bridge/templates/adopters/CLAUDE.md.fragment.zh-TW.md -->
<!-- 把這一節貼進你專案的 CLAUDE.md,讓 Claude 知道如何分流本 repo 使用本 schema 的工作。 -->
<!-- 若你客製 schema 名稱或 bridge repo URL,請對應修改;否則保持原樣即可。 -->

## 變更工作流(Claude Code 啟動先讀)

本 repo 採用 [`superpowers-bridge`](https://github.com/JiangWay/openspec-schemas/tree/main/superpowers-bridge) 銜接 OpenSpec 與 Superpowers。整合規則(語言、artifact 路徑、PRECHECK)以該 bridge README 為準;以下是給 Claude 的 routing 指引。

### 入口分流

| 你看到的觸發 | 應該怎麼做 |
|---|---|
| 使用者以 narrative 開「設計討論 / 腦力激盪」 | 先 verbal `superpowers:brainstorming`,**不**寫到 `docs/superpowers/specs/`;對話收斂後依下方 5 條判準升級到 `/opsx:propose` |
| 使用者直接呼叫 `/opsx:new` / `/opsx:ff` / `/opsx:propose` | 走 schema 既定流程;artifact instruction 會在每步注入 |
| 使用者明確說 bug fix / typo / config 微調 / 文件更新 | 直接 PR,**不**建 change(見下方 skip 規則) |
| 已經在某個 change 中 | `/opsx:continue` 或 `/opsx:apply` / `/opsx:verify` / `/opsx:archive` 推進 |

### 何時**不**走 opsx(直接 PR)

| 情境 | 直接 PR? |
|---|---|
| 新功能 / 新 capability / 架構變更 / breaking change | ❌ 要走 opsx |
| Bug fix(不變更合約)/ 測試補寫 / linter 規則 / 非破壞性升級 / typo / 文件 / config 值微調 | ✅ 直接 PR |

原則:**流程儀式跟風險成正比**。動到對外合約 / schema / 跨系統介接 / 合規邊界 → opsx;其他 → 直接 PR。

### Verbal brainstorm 升級到 opsx 的 5 條判準

5 條**全滿足**才升級(任一缺則繼續 brainstorm,不寫到 `docs/superpowers/specs/`):

1. **Scope 鎖定** —— 一句話講清「包含/不包含什麼」
2. **主要設計分歧已收斂** —— 替代方案選過,剩下 TBD 有明確 owner 與影響面
3. **跨系統依賴盤點過** —— 對方就緒 / 暫 mock / 真未知,三選一講得清
4. **驗收條件可陳述** —— 具體 pass 條件(例:`./mvnw clean verify` 通過 + N 個成果)
5. **對話進入收斂** —— 最近幾輪在 confirm 不在發散

全滿足 → 主動建議使用者「要不要 `/opsx:propose`?」,使用者 ack 後落地。永遠不要自動觸發。

### Front-door 反模式(別做)

- 讓 brainstorming 寫到 `docs/superpowers/specs/`
- 讓 writing-plans 寫到 `docs/superpowers/plans/`
- TBD 沒收斂就升級到 opsx
- 對 bug fix / typo 也建 change

詳細見 [superpowers-bridge README §進入與離開的判斷](https://github.com/JiangWay/openspec-schemas/blob/main/superpowers-bridge/README.zh-TW.md#進入與離開的判斷entry--exit-gates)。
