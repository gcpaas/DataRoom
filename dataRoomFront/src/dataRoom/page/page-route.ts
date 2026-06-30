import { PageStatus } from '../constants/PageStatus.ts'
import { PageType } from '../constants/PageType.ts'

interface PageRouteSource {
  code: string
  pageType?: string
  pageStatus?: string
}

export const getPageDesignPath = (page: PageRouteSource) => {
  if (page.pageType === PageType.VISUAL_SCREEN) {
    return `/dataRoom/visualScreenDesigner/${page.code}`
  }
  if (page.pageType === PageType.PAGE) {
    return `/dataRoom/pageDesigner/${page.code}`
  }
  return ''
}

export const getPagePreviewPath = (page: PageRouteSource) => {
  if (page.pageType === PageType.VISUAL_SCREEN) {
    return `/dataRoom/visualScreenPreview/${PageStatus.PUBLISHED}/${page.code}`
  }
  if (page.pageType === PageType.PAGE) {
    return `/dataRoom/pagePreviewer/${PageStatus.PUBLISHED}/${page.code}`
  }
  return ''
}

export const shouldPublishBeforePreview = (page: PageRouteSource) => {
  if (page.pageType !== PageType.VISUAL_SCREEN && page.pageType !== PageType.PAGE) {
    return false
  }
  return page.pageStatus?.toLowerCase() !== PageStatus.PUBLISHED
}
