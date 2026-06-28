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

export const resolveUploadedThumbnail = (resource: Pick<ResourceEntity, 'id' | 'url' | 'path'>): string | undefined => {
  if (resource.id) {
    return `/dataRoom/resource/file/${resource.id}`
  }
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
