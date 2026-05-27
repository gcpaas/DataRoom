# Visual Screen Designer Zoom Preference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the visual screen designer editor zoom preference in `pageConfig.basicConfig.zoom`.

**Architecture:** Add a root-level `basicConfig.zoom` preference separate from existing preview-only `basicConfig.size.zoom`. Keep normalization in shared viewport helpers, then let `VisualScreenDesigner.vue` apply saved preferences on load and update the preference whenever the user changes zoom mode.

**Tech Stack:** Vue 3, TypeScript, Vite, Element Plus, existing lightweight `npx tsx` specs.

---

### Task 1: Add Zoom Preference Types and Helper Tests

**Files:**
- Modify: `data-room-ui/src/dataroom-packages/PageDesigner/type/VisualScreenPageBasicConfig.ts`
- Modify: `data-room-ui/src/dataroom-packages/VisualScreenDesigner/viewport.ts`
- Test: `data-room-ui/src/dataroom-packages/VisualScreenDesigner/viewport.spec.ts`

- [ ] **Step 1: Write failing tests**

Add assertions in `viewport.spec.ts` for:

```ts
assert(normalizeDesignerZoomPreference().mode === 'best', 'missing zoom preference should default to best mode')
assert(normalizeDesignerZoomPreference().value === 100, 'missing zoom preference should default to 100 percent')
assert(normalizeDesignerZoomPreference({ mode: 'fixed', value: 80 }).mode === 'fixed', 'fixed mode should be preserved')
assert(normalizeDesignerZoomPreference({ mode: 'fixed', value: 80 }).value === 80, 'fixed value should be preserved')
assert(normalizeDesignerZoomPreference({ mode: 'bad', value: 80 }).mode === 'best', 'invalid mode should fall back to best')
assert(normalizeDesignerZoomPreference({ mode: 'fixed', value: 999 }).value === ZOOM_MAX_PERCENT, 'fixed value should clamp at max')
```

- [ ] **Step 2: Verify tests fail**

Run:

```bash
npx tsx data-room-ui/src/dataroom-packages/VisualScreenDesigner/viewport.spec.ts
```

Expected: FAIL because `normalizeDesignerZoomPreference` is not exported.

- [ ] **Step 3: Implement helper and type**

Add:

```ts
export type DesignerZoomPreferenceMode = 'best' | 'fixed'

export interface DesignerZoomPreference {
  mode: DesignerZoomPreferenceMode
  value: number
}

export const DEFAULT_DESIGNER_ZOOM_PREFERENCE: DesignerZoomPreference = {
  mode: 'best',
  value: ZOOM_DEFAULT_PERCENT,
}

export const normalizeDesignerZoomPreference = (
  preference?: Partial<DesignerZoomPreference> | null,
): DesignerZoomPreference => {
  const mode = preference?.mode === 'fixed' ? 'fixed' : 'best'
  return {
    mode,
    value: clampDesignerZoomPercent(Number(preference?.value), ZOOM_DEFAULT_PERCENT),
  }
}
```

Add `zoom?: DesignerZoomPreference` to `VisualScreenPageBasicConfig`.

- [ ] **Step 4: Verify helper tests pass**

Run:

```bash
npx tsx data-room-ui/src/dataroom-packages/VisualScreenDesigner/viewport.spec.ts
```

Expected: PASS.

### Task 2: Wire Preference into VisualScreenDesigner

**Files:**
- Modify: `data-room-ui/src/dataroom-packages/VisualScreenDesigner/VisualScreenDesigner.vue`
- Test: `data-room-ui/src/dataroom-packages/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts`

- [ ] **Step 1: Write failing source-level assertions**

Add assertions for:

```ts
assert(source.includes("zoom: { mode: 'best', value: ZOOM_DEFAULT_PERCENT }"), 'default basic config should include designer zoom preference')
assert(source.includes('normalizeDesignerZoomPreference'), 'loaded designer zoom preference should be normalized')
assert(source.includes('applySavedDesignerZoomPreference'), 'designer should apply saved zoom preference after viewport size is available')
assert(source.includes('setDesignerZoomPreferenceMode'), 'zoom interactions should update persisted zoom mode')
assert(source.includes(":class=\"{ 'zoom-step-button--active': basicConfig.zoom?.mode === 'best' }\""), 'fit button should render selected state in best mode')
assert(source.includes(\"setDesignerZoomPreferenceMode('best')\"), 'fit action should persist best mode')
assert(source.includes(\"setDesignerZoomPreferenceMode('fixed')\"), 'manual zoom actions should persist fixed mode')
```

- [ ] **Step 2: Verify tests fail**

Run:

```bash
npx tsx data-room-ui/src/dataroom-packages/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts
```

Expected: FAIL because preference wiring is not present.

- [ ] **Step 3: Implement Vue behavior**

Implement:

```ts
const setDesignerZoomPreferenceMode = (mode: 'best' | 'fixed') => {
  basicConfig.value.zoom = normalizeDesignerZoomPreference({
    mode,
    value: designerZoomPercent.value,
  })
}

const applySavedDesignerZoomPreference = () => {
  const preference = normalizeDesignerZoomPreference(basicConfig.value.zoom)
  basicConfig.value.zoom = preference
  if (preference.mode === 'best') {
    fitDesignerZoomToViewport(false)
    return
  }
  setDesignerZoomPercent(preference.value, false)
}
```

Manual zoom operations call `setDesignerZoomPreferenceMode('fixed')`. The fit icon calls `setDesignerZoomPreferenceMode('best')`.

- [ ] **Step 4: Verify Vue source spec passes**

Run:

```bash
npx tsx data-room-ui/src/dataroom-packages/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts
```

Expected: PASS.

### Task 3: Final Verification

**Files:**
- Verify all touched files.

- [ ] **Step 1: Run focused specs**

```bash
npx tsx data-room-ui/src/dataroom-packages/VisualScreenDesigner/viewport.spec.ts
npx tsx data-room-ui/src/dataroom-packages/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts
```

Expected: both PASS.

- [ ] **Step 2: Run type check**

```bash
cd data-room-ui && npm run type-check
```

Expected: exit code 0.

- [ ] **Step 3: Run build**

```bash
cd data-room-ui && npm run build
```

Expected: exit code 0. Existing Vite chunk-size warnings are acceptable.
