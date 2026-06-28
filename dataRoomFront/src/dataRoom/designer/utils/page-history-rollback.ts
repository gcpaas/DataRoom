export type PageHistoryRollbackFlowResult =
  | 'rolled_back'
  | 'saved_then_rolled_back'
  | 'rolled_back_without_saving'
  | 'save_failed'

interface PageHistoryRollbackFlowOptions {
  hasUnsavedChanges: boolean
  confirmSave: () => Promise<boolean>
  save: () => Promise<boolean>
  rollback: () => Promise<void>
}

export const runPageHistoryRollbackFlow = async ({
  hasUnsavedChanges,
  confirmSave,
  save,
  rollback,
}: PageHistoryRollbackFlowOptions): Promise<PageHistoryRollbackFlowResult> => {
  if (!hasUnsavedChanges) {
    await rollback()
    return 'rolled_back'
  }

  const shouldSave = await confirmSave()
  if (!shouldSave) {
    await rollback()
    return 'rolled_back_without_saving'
  }

  const saved = await save()
  if (!saved) {
    return 'save_failed'
  }

  await rollback()
  return 'saved_then_rolled_back'
}
