# Verification Report

> 此檔案由 `openspec-verify-change` skill 在 apply 完成後產生，用以確認實作
> 與 specs / design / tasks 的一致性。失敗的檢查須返回對應 artifact 修正後
> 再重跑 verify。

**Change**: `<change-name>`
**Verified at**: `YYYY-MM-DD HH:mm`
**Verifier**: `<who / which agent>`

---

## 1. Structural Validation (`openspec validate --all --json`)

- [ ] 全數 items `"valid": true`

**結果**：

```text
<貼上 openspec validate --all 的輸出摘要>
```

若有失敗項目，列出 id + issues：

| Item | Type | Issues |
|---|---|---|
| — | — | — |

---

## 2. Task Completion (`tasks.md`)

- [ ] 所有 `- [ ]` 已變為 `- [x]`

**未完成任務**（若有）：

| Task | 未完成原因 | 是否阻塞 archive |
|---|---|---|
| — | — | — |

---

## 3. Delta Spec Sync State

對每個 `openspec/changes/<name>/specs/` 下的 capability 目錄，與
`openspec/specs/<capability>/spec.md` 比對：

| Capability | Sync 狀態 | 備註 |
|---|---|---|
| — | ✓ 已 sync / ✗ 待 sync / N/A | — |

---

## 4. Design / Specs Coherence Spot Check

抽樣比對 `design.md` 的決策是否反映在 `specs/*.md` 的 Requirements 與
Scenarios 中：

| 抽樣項 | design 描述 | specs 對應 | 差距 |
|---|---|---|---|
| — | — | — | — |

**漂移警告**（非阻塞）：

- <若有，列出；無則填「無」>

---

## 5. Implementation Signal

- [ ] Worktree 內無未 staged 的檔案
- [ ] 所有相關 commit 已推送

**Commit 範圍**（若知道）：`<from-sha>..<to-sha>`

---

## 6. Front-Door Routing Leak Detector（warning,非阻塞）

設計產出不應落在 `docs/superpowers/specs/`(brainstorm artifact 的
output redirection 會把它導到 `openspec/changes/<name>/brainstorm.md`)。

偵測:

```bash
ls docs/superpowers/specs/*.md 2>/dev/null
```

- [ ] 無檔案,或存在的檔案是 schema 安裝前的合法存留

**洩漏清單**（若有）：

| 檔案 | 內容是否已 captured 進 change | 建議動作 |
|---|---|---|
| — | — | — |

> 不會擋住 archive。新的 schema-installed cycle 產生的洩漏,應搬進
> `openspec/changes/<name>/brainstorm.md` 或 `design.md` 後刪原檔。

---

## 7. Deferred Manual Dogfood vs Automated Test Equivalence

對 plan.md 中標 `[~]` deferred 的手動 dogfood / smoke task,逐項列出
等價的自動化測試覆蓋。若沒有等價自動化測試,該項應視為**真正的 gap**
而非合理 deferral,建議在 retrospective Misses 中記錄。

| Deferred dogfood (plan §) | Equivalent automated test | Coverage assessment | 真正 gap? |
|---|---|---|---|
| 例:§11.3 `compose up + curl /actuator/health` | `LinebcIntegrationApplicationTests` (Testcontainers,24s) | Spring context boot + Flyway 跑完 + 主要 bean 注入 | ❌ 已等價覆蓋 |
| — | — | — | — |

> **判讀規則**:
> - 「等價」= 自動化測試的 assertion 集合是手動 dogfood 預期 assertion 的超集
> - 「Coverage assessment」= 列出實際被觸及的 layer (context / DB schema / wiring / HTTP path / etc.)
> - 任何「真正 gap = ✅」的列,Overall Decision 仍可 PASS,但須在 retrospective 留 follow-up 條目

> **何時可以整節空白**:plan.md 完全沒有 `[~]` 標記的 row 時,本節不需要填(空白即 PASS)。
> 只要 plan.md 出現任何 `[~]`,本節必須逐項列出,否則 Overall Decision 應降為 FAIL。

---

## Overall Decision

- [ ] ✅ PASS — 可進入 finishing-a-development-branch 與 archive
- [ ] ⚠️ PASS WITH WARNINGS — 可進入後續步驟但需注意：`<說明>`
- [ ] ❌ FAIL — 返回失敗的 artifact 修正後重跑 verify

**下一步**：

<說明下一個動作>
