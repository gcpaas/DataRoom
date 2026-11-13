/**
 * 页面类型枚举
 */
export const PageType = {
  DIRECTORY: 'directory',
  VISUAL_SCREEN: 'visualScreen',
  PAGE: 'page'
} as const;

export type PageType = typeof PageType.PAGE | typeof PageType.VISUAL_SCREEN;
