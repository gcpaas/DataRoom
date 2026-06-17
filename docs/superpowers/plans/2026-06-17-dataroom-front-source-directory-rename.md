# DataRoom Front Source Directory Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename `dataRoomFront/src/dataroom-packages` to `dataRoomFront/src/dataRoom` and update every repository reference to the new path.

**Architecture:** Keep the existing `@` alias pointing to `dataRoomFront/src`. Move the source directory once, then mechanically replace the literal path segment `dataroom-packages` with `dataRoom` across tracked project text files. Do not add a compatibility alias or change runtime routes, component names, exports, or behavior.

**Tech Stack:** Vue 3, TypeScript, Vite, ESLint, Maven repository docs.

---

## File Structure

- Move: `dataRoomFront/src/dataroom-packages` -> `dataRoomFront/src/dataRoom`
- Modify: all files containing the literal text `dataroom-packages` under `dataRoomFront/`, `AGENTS.md`, and `docs/`
- Verify: `dataRoomFront/vite.config.ts`
- Verify: `dataRoomFront/tsconfig.app.json`
- Verify: `dataRoomFront/eslint.config.ts`
- Verify: `dataRoomFront/src/router/index.ts`
- Verify: `dataRoomFront/src/router/routes.ts`

No new runtime files are required.

### Task 1: Move The Frontend Source Directory

**Files:**
- Move: `dataRoomFront/src/dataroom-packages`
- Create by move: `dataRoomFront/src/dataRoom`

- [ ] **Step 1: Confirm the old directory exists and the new directory does not**

Run:

```bash
test -d dataRoomFront/src/dataroom-packages
test ! -e dataRoomFront/src/dataRoom
```

Expected: both commands exit successfully with no output.

- [ ] **Step 2: Move the directory with git**

Run:

```bash
git mv dataRoomFront/src/dataroom-packages dataRoomFront/src/dataRoom
```

Expected: command exits successfully with no output.

- [ ] **Step 3: Verify the directory layout**

Run:

```bash
test ! -e dataRoomFront/src/dataroom-packages
test -d dataRoomFront/src/dataRoom
find dataRoomFront/src/dataRoom -maxdepth 1 -type d | sort
```

Expected: the first two commands exit successfully. The `find` output includes `dataRoomFront/src/dataRoom`, `PageDesigner`, `VisualScreenDesigner`, `_common`, `_components`, `assets`, `components`, `datav`, `hooks`, and the existing business directories.

- [ ] **Step 4: Commit the physical directory move**

Run:

```bash
git add dataRoomFront/src
git commit -m "refactor(front): rename dataroom package directory"
```

Expected: commit succeeds. Git may report many renames because the directory contains the frontend package source.

### Task 2: Replace Repository References

**Files:**
- Modify: `dataRoomFront/vite.config.ts`
- Modify: `dataRoomFront/tsconfig.app.json`
- Modify: `dataRoomFront/eslint.config.ts`
- Modify: `dataRoomFront/src/router/index.ts`
- Modify: `dataRoomFront/src/router/routes.ts`
- Modify: all moved source files under `dataRoomFront/src/dataRoom/**` containing `dataroom-packages`
- Modify: `AGENTS.md`
- Modify: docs under `docs/**` containing `dataroom-packages`

- [ ] **Step 1: List files that still contain the old path segment**

Run:

```bash
rg -l "dataroom-packages" dataRoomFront AGENTS.md docs --glob '!dataRoomFront/node_modules/**' --glob '!dataRoomFront/dataRoomFront/**'
```

Expected: output lists current source, config, AGENTS.md, and docs files that need textual replacement.

- [ ] **Step 2: Replace the literal path segment in project files**

Run:

```bash
perl -pi -e 's/dataroom-packages/dataRoom/g' $(rg -l "dataroom-packages" dataRoomFront AGENTS.md docs --glob '!dataRoomFront/node_modules/**' --glob '!dataRoomFront/dataRoomFront/**')
```

Expected: command exits successfully with no output.

- [ ] **Step 3: Verify key config files now reference the new path**

Run:

```bash
sed -n '30,48p' dataRoomFront/vite.config.ts
sed -n '1,12p' dataRoomFront/tsconfig.app.json
sed -n '20,32p' dataRoomFront/eslint.config.ts
```

Expected:

```text
vite.config.ts uses @/dataRoom/assets/element.scss and includes @/dataRoom.
tsconfig.app.json excludes src/dataRoom/datav/**.
eslint.config.ts ignores src/dataRoom/datav/**.
```

- [ ] **Step 4: Verify router imports now reference the new path**

Run:

```bash
sed -n '1,110p' dataRoomFront/src/router/index.ts
sed -n '1,120p' dataRoomFront/src/router/routes.ts
```

Expected: router files use `@/dataRoom/...`; route URL strings such as `/dataRoom/pageDesigner/:pageCode` remain unchanged.

- [ ] **Step 5: Commit the textual replacement**

Run:

```bash
git add dataRoomFront AGENTS.md docs
git commit -m "refactor(front): update dataRoom source references"
```

Expected: commit succeeds and contains only textual path updates plus docs path updates.

### Task 3: Verify No Old Path Remains

**Files:**
- Verify: repository text references
- Verify: `dataRoomFront/src/dataRoom`

- [ ] **Step 1: Scan for old path remnants**

Run:

```bash
rg "dataroom-packages"
```

Expected: no runtime/config matches. Historical migration docs may still mention the old path for explanatory accuracy.

- [ ] **Step 2: Confirm the old directory does not exist**

Run:

```bash
test ! -e dataRoomFront/src/dataroom-packages
```

Expected: command exits successfully with no output.

- [ ] **Step 3: Confirm the new directory exists**

Run:

```bash
test -d dataRoomFront/src/dataRoom
```

Expected: command exits successfully with no output.

### Task 4: Run Frontend Type Check

**Files:**
- Verify: `dataRoomFront/package.json`
- Verify: TypeScript import graph under `dataRoomFront/src/**`

- [ ] **Step 1: Run type checking**

Run:

```bash
cd dataRoomFront && npm run type-check
```

Expected: command exits successfully.

- [ ] **Step 2: If type checking reports unresolved `dataRoom` imports, locate and fix them**

Run:

```bash
rg -n "dataroom-packages|@/dataroom-packages" dataRoomFront/src dataRoomFront/vite.config.ts dataRoomFront/tsconfig.app.json dataRoomFront/eslint.config.ts
```

Expected: no runtime `dataroom-packages` matches. Existing `@/dataRoom` matches are valid.

- [ ] **Step 3: Rerun type checking after any fix**

Run:

```bash
cd dataRoomFront && npm run type-check
```

Expected: command exits successfully.

### Task 5: Final Review And Commit Verification

**Files:**
- Verify: git history and working tree

- [ ] **Step 1: Review current changes**

Run:

```bash
git status --short
```

Expected: clean working tree. If verification-only edits were needed after Task 2, they should appear here and must be committed.

- [ ] **Step 2: Commit any verification fix if needed**

Run only if `git status --short` shows files changed by Task 4 fixes:

```bash
git add dataRoomFront AGENTS.md docs
git commit -m "fix(front): complete dataRoom path migration"
```

Expected: commit succeeds. Skip this step if the working tree is clean.

- [ ] **Step 3: Capture final verification commands for handoff**

Run:

```bash
rg "dataroom-packages"
cd dataRoomFront && npm run type-check
```

Expected: `rg` returns no runtime/config matches, except historical migration docs that intentionally mention the old path; `npm run type-check` exits successfully.
