import { PageStatus } from '../constants/PageStatus.ts'
import { PageType } from '../constants/PageType.ts'

interface PageRouteSource {
  code: string
  pageType?: string
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
    return `/dataRoom/visualScreenPreview/${PageStatus.PREVIEW}/${page.code}`
  }
  if (page.pageType === PageType.PAGE) {
    return `/dataRoom/pagePreviewer/${PageStatus.PREVIEW}/${page.code}`
  }
  return ''
}
