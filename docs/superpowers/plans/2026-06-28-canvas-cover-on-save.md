# Canvas Cover On Save Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在页面设计器和大屏设计器的用户主动保存流程中尽力截取画布并更新 `dr_page.thumbnail`，且封面失败不阻断设计配置保存。

**Architecture:** 后端新增一个只按 `PageEntity.code` 更新 `thumbnail` 的窄接口，保持 `dr_page` 和 `dr_page_stage` 职责分离。前端新增封面捕获工具，主动保存先尝试 `html-to-image` 截图、上传图片资源、更新封面，再调用现有 `savePageWithHistoryBackup()`；自动历史备份不接入封面流程。

**Tech Stack:** Spring Boot 3.5、MyBatis-Plus、JUnit 5、Mockito、Vue 3、TypeScript、Element Plus、html-to-image、Vite/vue-tsc。

---

## File Structure

- Create `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/dto/PageThumbnailUpdateDto.java`: 请求 DTO，包含 `code` 和 `thumbnail`。
- Modify `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/PageController.java`: 增加 `/dataRoom/page/updateThumbnail` 接口，校验参数并只更新 `dr_page.thumbnail` 与 `updateDate`。
- Modify `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/PageControllerHistoryTest.java`: 增加轻量单元测试，验证封面接口校验、按 code 更新字段、页面不存在时报错。
- Modify `dataRoomFront/src/dataRoom/page/api.ts`: 增加 `PageThumbnailUpdateDto` 类型和 `pageApi.updateThumbnail()`。
- Create `dataRoomFront/src/dataRoom/designer/utils/page-thumbnail-save.ts`: 封装截图、资源上传、封面接口更新和失败分类。
- Modify `dataRoomFront/src/dataRoom/page-designer/PageDesigner.vue`: 增加画布截图目标 `ref`，主动保存和保存并离开接入封面工具，自动备份保持不变。
- Modify `dataRoomFront/src/dataRoom/visual-screen-designer/VisualScreenDesigner.vue`: 复用已有 `canvasContainer` 作为截图目标，主动保存和保存并离开接入封面工具，自动备份保持不变。

## Task 1: 后端封面接口测试

**Files:**
- Modify: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/PageControllerHistoryTest.java`
- Create later: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/dto/PageThumbnailUpdateDto.java`
- Modify later: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/PageController.java`

- [ ] **Step 1: Add imports for the new DTO and page service assertions**

Add these imports to `PageControllerHistoryTest.java`:

```java
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.entity.PageEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.page.dto.PageThumbnailUpdateDto;
import com.gccloud.gcpaas.dataroom.core.page.service.PageService;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
```

- [ ] **Step 2: Add tests for updateThumbnail**

Append these tests and helper service to `PageControllerHistoryTest`:

```java
    @Test
    void updateThumbnailUpdatesOnlyPageThumbnailByCode() {
        TableInfoHelper.initTableInfo(new MybatisMapperBuilderAssistant(new MybatisConfiguration(), ""), PageEntity.class);
        CapturingPageService pageService = new CapturingPageService(true);
        PageController controller = new PageController();
        ReflectionTestUtils.setField(controller, "pageService", pageService);

        PageThumbnailUpdateDto dto = new PageThumbnailUpdateDto();
        dto.setCode("PAGE_001");
        dto.setThumbnail("/dataRoom/resource/file/1800000000000000001");

        Resp<Boolean> response = controller.updateThumbnail(dto);

        assertEquals(200, response.getCode());
        assertEquals(Boolean.TRUE, response.getData());
        assertNotNull(pageService.capturedUpdateWrapper);
        String sqlSet = pageService.capturedUpdateWrapper.getSqlSet();
        assertTrue(sqlSet.contains("thumbnail"));
        assertTrue(sqlSet.contains("update_date"));
        String normalizedConditions = pageService.capturedUpdateWrapper
                .getExpression()
                .getNormal()
                .getSqlSegment()
                .toLowerCase(Locale.ROOT);
        assertTrue(normalizedConditions.contains("code"));
        assertEquals("PAGE_001", pageService.capturedUpdateWrapper.getParamNameValuePairs().get("MPGENVAL1"));
    }

    @Test
    void updateThumbnailRejectsBlankCode() {
        PageController controller = new PageController();
        PageThumbnailUpdateDto dto = new PageThumbnailUpdateDto();
        dto.setCode(" ");
        dto.setThumbnail("/dataRoom/resource/file/1800000000000000001");

        DataRoomException exception = assertThrows(DataRoomException.class, () -> controller.updateThumbnail(dto));

        assertEquals("页面编码不能为空", exception.getMessage());
    }

    @Test
    void updateThumbnailRejectsBlankThumbnail() {
        PageController controller = new PageController();
        PageThumbnailUpdateDto dto = new PageThumbnailUpdateDto();
        dto.setCode("PAGE_001");
        dto.setThumbnail(" ");

        DataRoomException exception = assertThrows(DataRoomException.class, () -> controller.updateThumbnail(dto));

        assertEquals("封面地址不能为空", exception.getMessage());
    }

    @Test
    void updateThumbnailRejectsMissingPage() {
        TableInfoHelper.initTableInfo(new MybatisMapperBuilderAssistant(new MybatisConfiguration(), ""), PageEntity.class);
        CapturingPageService pageService = new CapturingPageService(false);
        PageController controller = new PageController();
        ReflectionTestUtils.setField(controller, "pageService", pageService);

        PageThumbnailUpdateDto dto = new PageThumbnailUpdateDto();
        dto.setCode("MISSING_PAGE");
        dto.setThumbnail("/dataRoom/resource/file/1800000000000000001");

        DataRoomException exception = assertThrows(DataRoomException.class, () -> controller.updateThumbnail(dto));

        assertEquals("页面不存在", exception.getMessage());
    }

    private static class CapturingPageService extends PageService {
        private final boolean updateResult;
        private LambdaUpdateWrapper<PageEntity> capturedUpdateWrapper;

        private CapturingPageService(boolean updateResult) {
            this.updateResult = updateResult;
        }

        @Override
        public boolean update(Wrapper<PageEntity> updateWrapper) {
            this.capturedUpdateWrapper = (LambdaUpdateWrapper<PageEntity>) updateWrapper;
            return updateResult;
        }
    }
```

- [ ] **Step 3: Run the targeted test and verify RED**

Run:

```bash
mvn -q -pl dataRoomServer -Dtest=PageControllerHistoryTest -DforkCount=0 test
```

Expected: FAIL because `PageThumbnailUpdateDto` and `PageController.updateThumbnail()` do not exist yet.

## Task 2: 后端封面接口实现

**Files:**
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/dto/PageThumbnailUpdateDto.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/PageController.java`
- Test: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/PageControllerHistoryTest.java`

- [ ] **Step 1: Create the DTO**

Create `PageThumbnailUpdateDto.java`:

```java
package com.gccloud.gcpaas.dataroom.core.page.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "页面封面更新参数")
public class PageThumbnailUpdateDto {
    @Schema(description = "页面编码")
    private String code;

    @Schema(description = "封面地址")
    private String thumbnail;
}
```

- [ ] **Step 2: Import the DTO in PageController**

Add:

```java
import com.gccloud.gcpaas.dataroom.core.page.dto.PageThumbnailUpdateDto;
```

- [ ] **Step 3: Add updateThumbnail endpoint**

Add this method after `updateName()` in `PageController`:

```java
    @PostMapping("/updateThumbnail")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "修改页面封面", description = "根据编码修改页面封面")
    @OperationLogMeta(actionType = "修改页面封面", actionDesc = "修改页面封面", businessType = "page_thumbnail", businessName = "页面封面", targetIdKey = "code", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<Boolean> updateThumbnail(@RequestBody PageThumbnailUpdateDto dto) {
        if (dto == null || StringUtils.isBlank(dto.getCode())) {
            throw new DataRoomException("页面编码不能为空");
        }
        if (StringUtils.isBlank(dto.getThumbnail())) {
            throw new DataRoomException("封面地址不能为空");
        }
        LambdaUpdateWrapper<PageEntity> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(PageEntity::getCode, dto.getCode());
        updateWrapper.set(PageEntity::getThumbnail, dto.getThumbnail());
        updateWrapper.set(PageEntity::getUpdateDate, new Date());
        boolean updated = pageService.update(updateWrapper);
        if (!updated) {
            throw new DataRoomException("页面不存在");
        }
        return Resp.success(true);
    }
```

- [ ] **Step 4: Run targeted backend tests and verify GREEN**

Run:

```bash
mvn -q -pl dataRoomServer -Dtest=PageControllerHistoryTest -DforkCount=0 test
```

Expected: PASS.

- [ ] **Step 5: Commit backend API**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/dto/PageThumbnailUpdateDto.java dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/PageController.java dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/PageControllerHistoryTest.java
git commit -m "feat(server): add page thumbnail update api"
```

## Task 3: 前端 API 与封面工具实现

**Files:**
- Modify: `dataRoomFront/src/dataRoom/page/api.ts`
- Create: `dataRoomFront/src/dataRoom/designer/utils/page-thumbnail-save.ts`

- [ ] **Step 1: Add page thumbnail API type and method**

In `page/api.ts`, add:

```typescript
export interface PageThumbnailUpdateDto {
  code: string
  thumbnail: string
}
```

Add to `pageApi`:

```typescript
  updateThumbnail(data: PageThumbnailUpdateDto) {
    return request.post<boolean>('/dataRoom/page/updateThumbnail', data)
  },
```

- [ ] **Step 2: Create page-thumbnail-save utility**

Create `page-thumbnail-save.ts`:

```typescript
import { toBlob } from 'html-to-image'
import { nextTick } from 'vue'
import { ResourceType } from '@/dataRoom/constants/ResourceType.ts'
import { resourceApi, type ResourceEntity } from '@/dataRoom/resource/api.ts'
import { pageApi } from '@/dataRoom/page/api.ts'

export type PageThumbnailSaveFailureStage = 'capture' | 'upload' | 'update'

export interface PageThumbnailSaveSuccess {
  ok: true
  thumbnail: string
}

export interface PageThumbnailSaveFailure {
  ok: false
  stage: PageThumbnailSaveFailureStage
  error: unknown
}

export type PageThumbnailSaveResult = PageThumbnailSaveSuccess | PageThumbnailSaveFailure

export interface CaptureAndUpdatePageThumbnailOptions {
  pageCode: string
  target: HTMLElement | null | undefined
  pixelRatio?: number
  now?: () => number
}

export const createPageThumbnailUploadFile = (blob: Blob, pageCode: string, timestamp: number): File => {
  return new File([blob], `${pageCode}_cover_${timestamp}.png`, { type: 'image/png' })
}

export const resolveUploadedThumbnail = (resource: Pick<ResourceEntity, 'url' | 'path'>): string | undefined => {
  return resource.url || resource.path
}

export const getPageThumbnailFailureMessage = (failure: PageThumbnailSaveFailure): string => {
  if (failure.stage === 'capture') {
    return '保存成功，但封面截取失败'
  }
  return '保存成功，但封面更新失败'
}

export const captureAndUpdatePageThumbnail = async ({
  pageCode,
  target,
  pixelRatio = 1,
  now = Date.now,
}: CaptureAndUpdatePageThumbnailOptions): Promise<PageThumbnailSaveResult> => {
  if (!target) {
    return {
      ok: false,
      stage: 'capture',
      error: new Error('thumbnail capture target is missing'),
    }
  }

  let blob: Blob | null
  try {
    await nextTick()
    blob = await toBlob(target, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: undefined,
    })
    if (!blob) {
      throw new Error('thumbnail capture returned empty blob')
    }
  } catch (error) {
    return { ok: false, stage: 'capture', error }
  }

  let thumbnail: string | undefined
  try {
    const formData = new FormData()
    const file = createPageThumbnailUploadFile(blob, pageCode, now())
    formData.append('file', file, file.name)
    formData.append('name', file.name.replace(/\.png$/i, ''))
    formData.append('resourceType', ResourceType.IMAGE)
    const resource = await resourceApi.upload(formData)
    thumbnail = resolveUploadedThumbnail(resource)
    if (!thumbnail) {
      throw new Error('uploaded resource does not include url or path')
    }
  } catch (error) {
    return { ok: false, stage: 'upload', error }
  }

  try {
    await pageApi.updateThumbnail({ code: pageCode, thumbnail })
    return { ok: true, thumbnail }
  } catch (error) {
    return { ok: false, stage: 'update', error }
  }
}
```

- [ ] **Step 3: Run frontend type check and verify GREEN**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 4: Commit frontend utility**

```bash
git add dataRoomFront/src/dataRoom/page/api.ts dataRoomFront/src/dataRoom/designer/utils/page-thumbnail-save.ts
git commit -m "feat(front): add page thumbnail save utility"
```

## Task 4: 页面设计器接入主动保存封面

**Files:**
- Modify: `dataRoomFront/src/dataRoom/page-designer/PageDesigner.vue`

- [ ] **Step 1: Import thumbnail utility**

Add to `PageDesigner.vue` imports:

```typescript
import {
  captureAndUpdatePageThumbnail,
  getPageThumbnailFailureMessage,
  type PageThumbnailSaveFailure,
} from '@/dataRoom/designer/utils/page-thumbnail-save.ts'
```

- [ ] **Step 2: Add a canvas content ref**

After existing refs near `currentPageConfigHash`, add:

```typescript
const canvasCaptureTargetRef = ref<HTMLElement | null>(null)
```

- [ ] **Step 3: Add active save helper**

Replace the existing `savePageConfig` with a parameterized helper:

```typescript
const savePageConfig = async (options: { updateThumbnail?: boolean } = {}) => {
  const payload = getPageConfigPayload()
  if (!payload) {
    return false
  }

  let thumbnailFailure: PageThumbnailSaveFailure | undefined
  if (options.updateThumbnail) {
    const thumbnailResult = await captureAndUpdatePageThumbnail({
      pageCode: payload.pageCode,
      target: canvasCaptureTargetRef.value,
    })
    if (!thumbnailResult.ok) {
      thumbnailFailure = thumbnailResult
      console.error(thumbnailResult.error)
    }
  }

  const savedHash = await savePageWithHistoryBackup({
    payload,
    updatePageConfig: pageApi.updatePageConfig,
    historyBackup: pageApi.historyBackup,
  })

  if (savedHash.status === 'design_save_failed') {
    return savedHash
  }

  applySavedDesignerHistoryState({
    savedHash: savedHash.hash,
    historyBackupSucceeded: savedHash.status === 'saved_with_history',
    setLastSavedHash: (hash) => {
      lastSavedHash.value = hash
    },
    setLastAutoBackupHash: (hash) => {
      lastAutoBackupHash.value = hash
    },
    invalidateCurrentHash: currentPageConfigHashSync.invalidate,
    triggerCurrentHashSync: currentPageConfigHashSyncTask.trigger,
  })

  if (savedHash.status === 'saved_without_history') {
    console.error(savedHash.historyBackupError)
    ElMessage({
      message: '保存成功，但历史备份失败，请稍后重试',
      type: 'warning',
    })
    return savedHash
  }

  ElMessage({
    message: thumbnailFailure ? getPageThumbnailFailureMessage(thumbnailFailure) : '保存成功',
    type: thumbnailFailure ? 'warning' : 'success',
  })
  return savedHash
}
```

- [ ] **Step 4: Make toolbar save update thumbnail**

Update `onSave`:

```typescript
const onSave = async () => {
  await savePageConfig({ updateThumbnail: true })
}
```

- [ ] **Step 5: Make save-before-leave update thumbnail**

In `onSaveBeforeLeaveAction`, change the callback that calls `savePageConfig()` to:

```typescript
const saved = await savePageConfig({ updateThumbnail: true })
```

Do not change `historyAutoBackupController`; its `backup` callback must continue calling only `pageApi.historyBackup(...)`.

- [ ] **Step 6: Bind screenshot ref to the grid canvas content**

In the template, change the canvas main content wrapper from:

```vue
<div class="canvas-main" id="canvas-main" :style="computedCanvasMainContainerStyle" @click="onCanvasClick">
```

to:

```vue
<div ref="canvasCaptureTargetRef" class="canvas-main" id="canvas-main" :style="computedCanvasMainContainerStyle" @click="onCanvasClick">
```

- [ ] **Step 7: Run frontend type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 8: Commit page designer integration**

```bash
git add dataRoomFront/src/dataRoom/page-designer/PageDesigner.vue
git commit -m "feat(front): capture page designer cover on save"
```

## Task 5: 大屏设计器接入主动保存封面

**Files:**
- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/VisualScreenDesigner.vue`

- [ ] **Step 1: Import thumbnail utility**

Add to `VisualScreenDesigner.vue` imports:

```typescript
import {
  captureAndUpdatePageThumbnail,
  getPageThumbnailFailureMessage,
  type PageThumbnailSaveFailure,
} from '@/dataRoom/designer/utils/page-thumbnail-save.ts'
```

- [ ] **Step 2: Replace savePageConfig with thumbnail-aware version**

Replace the existing `savePageConfig` with:

```typescript
const savePageConfig = async (options: { updateThumbnail?: boolean } = {}) => {
  const payload = getPageConfigPayload()
  if (!payload) {
    return false
  }

  let thumbnailFailure: PageThumbnailSaveFailure | undefined
  if (options.updateThumbnail) {
    const thumbnailResult = await captureAndUpdatePageThumbnail({
      pageCode: payload.pageCode,
      target: canvasContainer.value,
    })
    if (!thumbnailResult.ok) {
      thumbnailFailure = thumbnailResult
      console.error(thumbnailResult.error)
    }
  }

  const savedHash = await savePageWithHistoryBackup({
    payload,
    updatePageConfig: pageApi.updatePageConfig,
    historyBackup: pageApi.historyBackup,
  })

  if (savedHash.status === 'design_save_failed') {
    return savedHash
  }

  applySavedDesignerHistoryState({
    savedHash: savedHash.hash,
    historyBackupSucceeded: savedHash.status === 'saved_with_history',
    setLastSavedHash: (hash) => {
      lastSavedHash.value = hash
    },
    setLastAutoBackupHash: (hash) => {
      lastAutoBackupHash.value = hash
    },
    invalidateCurrentHash: currentPageConfigHashSync.invalidate,
    triggerCurrentHashSync: currentPageConfigHashSyncTask.trigger,
  })

  if (savedHash.status === 'saved_without_history') {
    console.error(savedHash.historyBackupError)
    ElMessage({
      message: '保存成功，但历史备份失败，请稍后重试',
      type: 'warning',
    })
    return savedHash
  }

  ElMessage({
    message: thumbnailFailure ? getPageThumbnailFailureMessage(thumbnailFailure) : '保存成功',
    type: thumbnailFailure ? 'warning' : 'success',
  })
  return savedHash
}
```

- [ ] **Step 3: Make toolbar save update thumbnail**

Update `onSave`:

```typescript
const onSave = async () => {
  await savePageConfig({ updateThumbnail: true })
}
```

- [ ] **Step 4: Make save-before-leave update thumbnail**

In `onSaveBeforeLeaveAction`, change the callback that calls `savePageConfig()` to:

```typescript
const saved = await savePageConfig({ updateThumbnail: true })
```

Do not change `historyAutoBackupController`; its `backup` callback must continue calling only `pageApi.historyBackup(...)`.

- [ ] **Step 5: Confirm screenshot target excludes controls**

Verify the template still binds:

```vue
<div ref="canvasContainer" class="canvas-content" :style="computedCanvasContentStyle">
```

Do not move `canvasContainer` to `.canvas-main` or `.canvas-viewport`, because those include viewport interaction state and can include non-canvas UI.

- [ ] **Step 6: Run frontend type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 7: Commit visual screen designer integration**

```bash
git add dataRoomFront/src/dataRoom/visual-screen-designer/VisualScreenDesigner.vue
git commit -m "feat(front): capture visual screen cover on save"
```

## Task 6: Final Verification

**Files:**
- Verify all files modified by Tasks 1-5.

- [ ] **Step 1: Run backend targeted tests**

Run:

```bash
mvn -q -pl dataRoomServer -Dtest=PageControllerHistoryTest -DforkCount=0 test
```

Expected: PASS.

- [ ] **Step 2: Run catch logging test if Java catch blocks changed**

If implementation changed any Java `catch` block, run:

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

Expected: PASS. If no Java `catch` block changed, record `not run: no Java catch block changed` in the final handoff.

- [ ] **Step 3: Run frontend type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 4: Run lint only if template or style changes require it**

This plan changes Vue templates but does not add SCSS rules. Run lint if the implementation changes style blocks or Element Plus layout structure beyond adding refs and save calls:

```bash
cd dataRoomFront
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Manual browser verification**

Start the app if needed:

```bash
cd dataRoomFront
npm run dev
```

Manual checks:

- 页面设计器顶部保存 sends resource upload, sends `POST /dataRoom/page/updateThumbnail`, then sends `POST /dataRoom/page/updatePageConfig`.
- 大屏设计器顶部保存 sends resource upload, sends `POST /dataRoom/page/updateThumbnail`, then sends `POST /dataRoom/page/updatePageConfig`.
- 保存并离开 triggers the same thumbnail attempt before completing the leave action.
- 自动历史备份 does not send resource upload and does not send `updateThumbnail`.
- A cross-origin image or iframe screenshot failure still saves page config and shows a warning message.

- [ ] **Step 6: Final status check**

Run:

```bash
git status --short
```

Expected: only intentional implementation changes are present. Do not revert unrelated existing changes such as `dataRoomFront/src/dataRoom/data-source/index.vue` if it is still present from another task.
