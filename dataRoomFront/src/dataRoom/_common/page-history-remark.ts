export const PAGE_HISTORY_REMARKS = {
  autoBackup: '自动备份',
  manualSaveBackup: '手动保存自动备份',
} as const

export type PageHistoryRemark = (typeof PAGE_HISTORY_REMARKS)[keyof typeof PAGE_HISTORY_REMARKS]
