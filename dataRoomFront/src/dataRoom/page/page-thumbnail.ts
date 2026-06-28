import type { PageEntity } from './api'
import { PageType } from '@/dataRoom/constants/PageType.ts'
import { getResourceUrl } from '@/dataRoom/utils/index.ts'

export const isDirectoryPageType = (pageType?: string) => pageType === PageType.DIRECTORY

export const getPageThumbnailSrc = (
  item: Pick<PageEntity, 'pageType' | 'thumbnail'>,
  getDefaultPlaceholder: (pageType?: string) => string,
) => {
  if (isDirectoryPageType(item.pageType)) {
    return getDefaultPlaceholder(item.pageType)
  }
  if (!item.thumbnail) {
    return getDefaultPlaceholder(item.pageType)
  }
  return getResourceUrl(item.thumbnail)
}
