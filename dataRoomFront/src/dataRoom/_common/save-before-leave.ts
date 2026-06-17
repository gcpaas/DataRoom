export type SaveBeforeLeaveAction = 'cancel' | 'discard' | 'confirm'

interface SaveBeforeLeaveHandlers {
  save: () => Promise<void>
  navigate: () => void
}

export const handleSaveBeforeLeaveAction = async (action: SaveBeforeLeaveAction, handlers: SaveBeforeLeaveHandlers) => {
  if (action === 'cancel') {
    return
  }

  if (action === 'discard') {
    handlers.navigate()
    return
  }

  await handlers.save()
  handlers.navigate()
}
