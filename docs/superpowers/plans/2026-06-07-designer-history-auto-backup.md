# Designer History Auto-Backup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persisted history auto-backup, history browsing, and safe rollback for both designers so users can recover work after crashes or accidental browser closure.

**Architecture:** Reuse `dr_page_stage` as the only persisted history store, add explicit backend backup/rollback endpoints with snapshot-copy semantics, then wire both designers to share one frontend hash-based auto-backup flow and one shared history dialog. Keep the new persisted history feature separate from the existing in-session undo/redo stack.

**Tech Stack:** Spring Boot 3.5, MyBatis-Plus, Vue 3, TypeScript, Element Plus, node:test, Maven

---

### Task 1: Backend history backup and rollback contract

**Files:**
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/page/dto/PageHistoryBackupDto.java`
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/service/PageStageServiceHistoryTest.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/page/PageController.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/page/service/PageStageService.java`

- [ ] Add `PageHistoryBackupDto` with `pageCode`, `remark`, `pageType`, and `pageConfig`, matching the existing `PageStageEntity` payload shape used by the designers.
- [ ] Extend `PageStageService` with `backupHistory(PageHistoryBackupDto dto)` and `rollbackDesignByHistoryId(String id)` so the controller does not embed snapshot-copy logic.
- [ ] Implement `backupHistory` by creating a new `PageStageEntity`, setting `pageStatus = PageStatus.HISTORY`, copying the payload fields, and saving a new row every time without content deduplication.
- [ ] Implement `rollbackDesignByHistoryId` with the fixed sequence: load target history, validate `history` status, load current `design`, create a new `history` row from current `design` with remark `回滚前自动备份`, then overwrite only the current design row's `pageConfig` and `updateDate`.
- [ ] Add `POST /dataRoom/page/history/backup` and `POST /dataRoom/page/history/rollback/{id}` in `PageController`, both guarded by `@RequiresRoles(value = DataRoomRole.DEVELOPER)` and wired to the new service methods.
- [ ] Keep the old `/stage/rollback/{id}` endpoint untouched for compatibility, but add a short comment noting that the designers must use the new snapshot-copy rollback endpoint.

### Task 2: Backend history list ordering and service tests

**Files:**
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/page/PageController.java`
- Test: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/service/PageStageServiceHistoryTest.java`

- [ ] Update `/dataRoom/page/stage/list` to append explicit `orderByDesc(PageStageEntity::getCreateDate)` so the history dialog always gets deterministic descending order.
- [ ] Write service-level tests that cover:
  - backup creates a new `history` row
  - repeated backup of identical content still creates a new row
  - rollback creates one `回滚前自动备份` row
  - rollback keeps the target history row as `history`
  - rollback updates the current design row with the selected history `pageConfig`
- [ ] Run: `mvn -q -pl dataRoomServer -Dtest=PageStageServiceHistoryTest test`
- [ ] If controller logic changes need direct coverage, add a focused controller assertion to the same test class or a sibling `PageControllerHistoryTest` instead of broad end-to-end wiring.

### Task 3: Shared frontend history hashing and auto-backup utilities

**Files:**
- Create: `dataRoomFront/src/dataroom-packages/_common/designer-history-backup.ts`
- Create: `dataRoomFront/src/dataroom-packages/_common/designer-history-backup.spec.ts`
- Modify: `dataRoomFront/src/dataroom-packages/page/api.ts`

- [ ] Add pure helpers in `designer-history-backup.ts` for stable page-config serialization, MD5-compatible hash generation, unsaved-change detection, and a small auto-backup controller with start/stop and one-minute polling.
- [ ] Keep the helper framework-free so it can be tested with `node:test` and reused by both designers without Vue coupling.
- [ ] Extend `pageApi` with:
  - `historyBackup(data)`
  - `historyList(params)`
  - `historyRollback(id)`
- [ ] Write focused node tests for:
  - stable serialization returns the same string for equal objects with different key order
  - `hasUnsavedChanges(currentHash, lastSavedHash)` behavior
  - auto-backup skip when `currentHash === lastAutoBackupHash`
  - auto-backup trigger when hashes differ
- [ ] Run: `cd dataRoomFront && npx tsx --test src/dataroom-packages/_common/designer-history-backup.spec.ts`

### Task 4: Shared history dialog component

**Files:**
- Create: `dataRoomFront/src/dataroom-packages/_components/PageHistoryDialog.vue`
- Modify: `dataRoomFront/src/dataroom-packages/page/type/PageStageEntity.ts`
- Reference: `docs/design/DESIGN.md`

- [ ] Build one reusable history dialog component with props for `pageCode`, `modelValue`, and `hasUnsavedChanges`, plus emits for `update:modelValue`, `rolled-back`, and optional `refresh-requested`.
- [ ] Use Element Plus table, pagination, dialog, button, and confirm flow without custom inner-style overrides that violate `docs/design/DESIGN.md`.
- [ ] Query `pageApi.historyList` on open and on page-change, always sending `pageStatus=history` and `size=20`.
- [ ] Render columns for `createDate`, `remark`, and `回滚`.
- [ ] Block rollback immediately when `hasUnsavedChanges` is true and show the “请先保存后再回滚” message instead of opening a confirm dialog.
- [ ] On confirmed rollback, call `pageApi.historyRollback(id)`, then emit `rolled-back` so the parent designer can trigger a full page refresh.

### Task 5: PageDesigner integration

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/PageDesigner/PageDesigner.vue`
- Modify: `dataRoomFront/src/dataroom-packages/page/api.ts`

- [ ] Add local state for `lastSavedHash`, `lastAutoBackupHash`, and `historyDialogVisible`.
- [ ] Replace the existing save flow with: build current `pageConfig` -> `updatePageConfig` -> `historyBackup({ remark: '手动保存自动备份' })` -> update both hashes -> show one success message.
- [ ] Start the shared auto-backup controller after the initial design payload loads; stop it on component unmount.
- [ ] Compute `hasUnsavedChanges` from `currentHash !== lastSavedHash` and pass it into `PageHistoryDialog`.
- [ ] Insert the new `历史` button immediately left of `预览`, and mount `PageHistoryDialog` in the template.
- [ ] On dialog `rolled-back`, perform `window.location.reload()` so the designer reloads the server-side `design` state exactly as the spec requires.

### Task 6: VisualScreenDesigner integration

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/VisualScreenDesigner/VisualScreenDesigner.vue`
- Modify: `dataRoomFront/src/dataroom-packages/page/api.ts`

- [ ] Mirror the same `lastSavedHash`, `lastAutoBackupHash`, `historyDialogVisible`, save-with-history, and auto-backup flow used in `PageDesigner.vue`.
- [ ] Reuse the same shared helper functions for page-config assembly and hash updates instead of duplicating per-designer comparison logic.
- [ ] Insert the new `历史` button immediately left of `预览`, preserving the existing toolbar order and current zoom/tool controls.
- [ ] Mount `PageHistoryDialog` and reload the page on successful rollback.
- [ ] Ensure the auto-backup timer is cleared in `onBeforeUnmount()` alongside the existing viewport and keyboard cleanup.

### Task 7: Verification

**Files:**
- Test: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/service/PageStageServiceHistoryTest.java`
- Test: `dataRoomFront/src/dataroom-packages/_common/designer-history-backup.spec.ts`

- [ ] Run: `mvn -q -pl dataRoomServer -Dtest=PageStageServiceHistoryTest test`
- [ ] Run: `cd dataRoomFront && npx tsx --test src/dataroom-packages/_common/designer-history-backup.spec.ts`
- [ ] Run: `cd dataRoomFront && npm run type-check`
- [ ] Run: `cd dataRoomFront && npm run lint`
- [ ] Manually verify in both designers:
  - `历史` button sits left of `预览`
  - save creates one new history row every click
  - no-change minute tick does not create duplicate auto backups
  - changed minute tick creates one `自动备份`
  - rollback is blocked when local edits are unsaved
  - rollback success reloads the page and the selected history becomes the new design state

### Task 8: Integration commits

**Files:**
- Modify: backend and frontend files from Tasks 1-6

- [ ] Commit backend snapshot-copy history API work with a message like `feat(core): add page history backup and rollback APIs`.
- [ ] Commit shared frontend history utilities and dialog with a message like `feat(front): add designer history backup dialog`.
- [ ] Commit final designer wiring and verification fixes with a message like `feat(front): wire designer auto-backup and rollback`.
