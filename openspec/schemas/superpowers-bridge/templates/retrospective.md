# Retrospective: <change-name>

> Written: <YYYY-MM-DD> (after verify passed)
> Commit range: `<base-sha>..<head-sha>`
> Worktree: <path or "merged to main">

---

## 0. Evidence

> 量化前置數據 — 後續 Wins / Misses bullets 直接引用,避免每行重複 [evidence: ...]。
> 冷寫場景(retro 寫於 cycle 結束之後一段時間),只用 `git log` + `tasks.md` +
> commit messages 也應能重建本節。

- **Commit range**: `<base-sha>..<head-sha>` (<n> commits)
- **Diff size**: <+X / -Y lines across N files>
- **Tasks done**: <x>/<y> (`grep -cE '^\s*- \[x\]' tasks.md` → x;regex 容許 sub-task 縮排)
- **Active hours**: <estimate>
- **Subagent dispatches**: <count or "n/a">
- **New external dependencies**: <list, with license + version, or "none">
- **Bugs encountered post-merge**: <count, one-line each, or "none">
- **OpenSpec validate state at archive**: <pass / fail / not-run>
- **Test coverage signal**: <e.g. jacoco %, pytest count, vitest count, or "n/a">

Commit chain (時序):

```
<base-sha> <one-line summary>
...
<head-sha> <archive commit one-line>
```

---

## 1. Wins

- [evidence: <commit/file/test>] <description>

## 2. Misses

- 🔴 [blocking | evidence: ...] <description>
- 🟡 [painful  | evidence: ...] <description>
- 📌 [nit      | evidence: ...] <description>

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| 1.2       | ...          | ... |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        |      |
| superpowers:writing-plans                        |      |
| superpowers:using-git-worktrees                  |      |
| superpowers:subagent-driven-development          |      |
| (transitive) superpowers:test-driven-development |      |
| (transitive) superpowers:requesting-code-review  |      |
| superpowers:finishing-a-development-branch       |      |

> **Default expectation**: 全部 ✓。每個 skill 都是 schema 設計的一部分,
> 跳過屬於異常情境。任一項 ✗ 都必須在下方
> `### Deliberately Skipped Skills` subsection 提出原因與預防方案。

### Deliberately Skipped Skills

> 跳過 skill 是設計的 escape hatch,不是常規路徑。每個 ✗ 必須回答以下三題;
> 整節空白(全綠)是預期狀態。

- **`<skill name>`**
  - **What was skipped**: <具體跳過了整個 skill,還是某個 sub-step>
  - **Why this cycle**: <具體 cycle 條件 — 不可寫「不需要」/「太小」/「沒時間」/「被外部 dep 擋住」/「skill 輸出看起來不對」之類含糊理由;要寫實際 trigger(具體 commit / log line / 觀察到的行為)>
  - **How to prevent recurrence**: 下一個 cycle 在同類條件下怎麼不再跳?選一:
    - `schema graph fix` — 寫具體要改 schema.yaml 的哪一段
    - `skill description tightening` — 寫具體要改哪個 skill 的 frontmatter / instruction
    - `CLAUDE.md trigger` — 寫具體要在 adopter CLAUDE.md.fragment 加哪段判讀規則
    - `scope-judgment rule` — 寫具體 cycle 的 scope 應該被怎麼判讀
    - `one-off — schema boundary case, no prevention possible` — 但需明寫為何 boundary(不接受含糊保留)

> **與 §6 Promote candidates 的關係**:多個 cycle 同 skill 同 `How to prevent`
> 答案 → 該模式應 promote 到 §6,直接觸發 schema / skill PR,不可累積成「常態」。

## 5. Surprises

- <assumption that turned out wrong>

## 6. Promote candidates → long-term learning

每條 candidate 用 `- [ ]` checklist:

- 標題:嚴重程度 emoji(🔴/🟡/📌)+ 一句話 learning
- `→ **Promote to** <destination>`(memory / CLAUDE.md / schema / skill / one-off)
- 兩行 body(對應 superpowers feedback memory body schema):
  - `> **Why**: <reason; often a past incident or strong preference>`
  - `> **How to apply**: <when/where this guidance kicks in>`

未勾選的 `- [ ]` 表示 candidate 尚未 promote — 可帶到下一個 cycle 的 retro 重評估,
或保留作為跨 cycle 的觀察點。

> **Carry-forward 機制**:下個 cycle 寫 retro 時,可
> `grep -A 5 '^- \[ \]' openspec/changes/archive/*/retrospective.md` 取出
> 既往 unchecked candidates,逐筆判斷要 carry-forward 到本 cycle §6、就地
> promote、或標 stale 不再追蹤。

範例:

- [ ] 🔴 **<short rule>** → **Promote to memory** (type: feedback)
  > **Why**: <past incident or strong preference that motivated this rule>
  > **How to apply**: <which file / cycle phase / decision moment this kicks in>

- [ ] 🟡 **<another candidate>** → **Promote to project CLAUDE.md** (`<path/to/CLAUDE.md>` 段)
  > **Why**: ...
  > **How to apply**: ...

- [ ] 📌 **<third candidate>** → **One-off** (記錄即可,不 promote)
  > **Why**: <why it doesn't generalize>
