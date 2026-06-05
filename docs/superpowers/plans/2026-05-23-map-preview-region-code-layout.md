# Map Preview Region Code Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the selected map region code to the right side of the map preview title bar as low-emphasis helper metadata.

**Architecture:** This is a single Vue component layout change in the map management page. The template keeps the main title on the left and renders the selected map code on the right only when `selectedMap.code` exists; scoped SCSS handles flex alignment, spacing, truncation, and Element Plus text color variables.

**Tech Stack:** Vue 3, TypeScript, scoped SCSS, Element Plus CSS variables.

---

### Task 1: Update Map Preview Title Layout

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/map/index.vue`
- Test: `dataRoomFront` type check

- [ ] **Step 1: Update the preview panel template**

Replace the map preview title block with a left title and right metadata span:

```vue
<div class="panel-title">
  <span>地图预览</span>
  <span v-if="selectedMap?.code" class="map-code">区域编码：{{ selectedMap.code }}</span>
</div>
```

- [ ] **Step 2: Update the title bar styles**

In `.map-preview-panel .panel-title`, use flex layout to separate the main title and helper metadata:

```scss
.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  box-shadow: 0px 1px 0px 0px rgba(0, 0, 0, 0.06);

  .map-code {
    min-width: 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    font-weight: 400;
    font-feature-settings: 'tnum';
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
```

- [ ] **Step 3: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: `vue-tsc --build` completes successfully.
