# Console Layout Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the console shell render as two visually independent regions: a standalone left menu card and a transparent right router outlet that preserves each child page's own container styling.

**Architecture:** Limit the change to `ConsoleLayout.vue`. Remove the extra pane wrappers that currently make the sidebar and content feel like one parent shell, keep `dr-console-layout` as a transparent flex container only, and leave `user / profile / operationLog` pages fully responsible for their own white cards and borders.

**Tech Stack:** Vue 3 SFC, TypeScript, Vue Router, scoped SCSS, Element Plus CSS variables, `vue-tsc`, ESLint

---

## File Structure

- Modify: `dataRoomFront/src/dataRoom/console/ConsoleLayout.vue`
  - Collapse the template to one left card and one transparent content outlet
  - Remove shell-level pane wrappers and shell-level white content card styling
  - Keep existing menu items and active-route logic intact
- Verify: `dataRoomFront/src/router/routes.ts`
  - No route changes required; confirm the console child routes still target the same content pages

---

### Task 1: Remove Shared Pane Structure

**Files:**
- Modify: `dataRoomFront/src/dataRoom/console/ConsoleLayout.vue:45-71`
- Verify: `dataRoomFront/src/router/routes.ts:45-69`

- [ ] **Step 1: Confirm the current layout fails the approved visual spec**

Open the current console shell in the browser and verify these failure conditions:

- The template still includes `dr-console-layout__sidebar-pane`
- The template still includes `dr-console-layout__content-pane`
- The right side is wrapped by a shell-level card instead of showing child pages directly
- The left and right regions still look subordinate to one outer layout shell

Expected: FAIL against the approved spec because the pane wrappers create a shared shell structure.

- [ ] **Step 2: Replace the template with a direct sidebar card + direct content outlet**

Update the template in `dataRoomFront/src/dataRoom/console/ConsoleLayout.vue` to this structure:

```vue
<template>
  <div class="dr-console-layout">
    <aside class="dr-console-layout__sidebar">
      <div class="dr-console-layout__sidebar-header">
        <h2 class="dr-console-layout__title">控制台</h2>
      </div>
      <div class="dr-console-layout__menu">
        <button
          v-for="item in consoleMenus"
          :key="item.key"
          type="button"
          class="dr-console-layout__menu-item"
          :class="{ 'is-active': activeMenuPath === item.path }"
          @click="jumpToMenu(item.path)"
        >
          <span class="dr-console-layout__menu-label">{{ item.label }}</span>
        </button>
      </div>
    </aside>
    <section class="dr-console-layout__content">
      <RouterView />
    </section>
  </div>
</template>
```

- [ ] **Step 3: Verify the route shell still compiles after the template change**

Run: `npm run type-check`

Expected: PASS. `vue-tsc` succeeds with no template or component type errors.

- [ ] **Step 4: Commit the template-only structural cleanup**

```bash
git add dataRoomFront/src/dataRoom/console/ConsoleLayout.vue
git commit -m "refactor: simplify console layout structure"
```

---

### Task 2: Make the Shell Transparent and Keep Only the Left Card

**Files:**
- Modify: `dataRoomFront/src/dataRoom/console/ConsoleLayout.vue:74-177`

- [ ] **Step 1: Confirm the current shell styles violate the approved visual model**

Check the current SCSS and verify these failure conditions:

- `dr-console-layout` is doing more than pure flex layout
- `dr-console-layout__content` applies shell-level white background, border, and radius
- The left card is not the only shell-level visual card

Expected: FAIL against the approved spec because the right side is still visually treated as a shell-owned card.

- [ ] **Step 2: Rewrite the shell SCSS so only the left side is a shell-owned card**

Replace the scoped SCSS in `dataRoomFront/src/dataRoom/console/ConsoleLayout.vue` with this version:

```scss
<style scoped lang="scss">
.dr-console-layout {
  display: flex;
  height: 100%;
  min-height: 0;
  gap: 16px;
  background: transparent;

  &__sidebar {
    width: 200px;
    flex-shrink: 0;
    align-self: stretch;
    margin: 16px 0 16px 16px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 16px 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
  }

  &__sidebar-header {
    padding: 0 16px 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__title {
    margin: 0;
    font-size: 20px;
    line-height: 1.3;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0;
  }

  &__menu {
    display: flex;
    flex-direction: column;
  }

  &__menu-item {
    width: 100%;
    border: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: transparent;
    padding: 12px 16px;
    box-sizing: border-box;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    &:hover {
      background: var(--el-fill-color-lighter);
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      box-shadow: inset 2px 0 0 var(--el-color-primary);
    }
  }

  &__menu-label {
    font-size: 14px;
    line-height: 1.57;
    font-weight: 500;
    color: var(--el-text-color-primary);
    letter-spacing: 0;
  }

  &__content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    margin: 16px 16px 16px 0;
    overflow: auto;
    background: transparent;
    border: 0;
    border-radius: 0;
    padding: 0;
    box-sizing: border-box;
  }
}
</style>
```

- [ ] **Step 3: Run lint on the updated shell file**

Run: `npx eslint src/dataRoom/console/ConsoleLayout.vue`

Expected: PASS with no lint output.

- [ ] **Step 4: Re-run type-check after the style rewrite**

Run: `npm run type-check`

Expected: PASS. No regressions from the template/style pairing.

- [ ] **Step 5: Verify the layout visually against the approved spec**

Open the console page and confirm all of the following:

- `dr-console-layout` reads as transparent layout only
- The left side is a standalone white menu card
- The left card has `16px` distance from top, left, and bottom
- The gap between left and right is `16px`
- The right side no longer has a shell-owned white card
- `user / profile / log` each keep their own original inner white cards and borders

Expected: PASS. The left and right regions look independent rather than belonging to one shared shell.

- [ ] **Step 6: Commit the final visual separation**

```bash
git add dataRoomFront/src/dataRoom/console/ConsoleLayout.vue
git commit -m "style: separate console sidebar from content area"
```

---

## Self-Review

### Spec Coverage

- Left menu remains a standalone white card: covered by Task 2
- `dr-console-layout` becomes transparent layout only: covered by Task 2
- Right side stops using a shell-level card: covered by Tasks 1 and 2
- `16px` outer spacing and `16px` inter-column gap: covered by Task 2
- Child pages retain their own containers: covered by Task 2 visual verification

### Placeholder Scan

- No `TODO` or `TBD`
- All modified file paths are explicit
- Commands are concrete
- Replacement template and SCSS are fully written out

### Type Consistency

- Uses existing `consoleMenus`, `activeMenuPath`, and `jumpToMenu`
- Keeps `RouterView` as the right-side outlet
- Does not introduce new class names beyond the existing `sidebar` and `content` contract

---

Plan complete and saved to `docs/superpowers/plans/2026-05-28-console-layout-separation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
