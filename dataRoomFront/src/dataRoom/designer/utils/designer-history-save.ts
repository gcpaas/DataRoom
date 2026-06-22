import { createDesignerHistoryHash } from './designer-history-backup.ts'
import { PAGE_HISTORY_REMARKS, type PageHistoryRemark } from './page-history-remark.ts'
import type { PageStageEntity } from '@/dataRoom/page/type/PageStageEntity.ts'

export interface PageHistoryBackupPayload {
  pageCode: PageStageEntity['pageCode']
  remark: string
  pageType: PageStageEntity['pageType']
  pageConfig: PageStageEntity['pageConfig']
}

interface SavePageWithHistoryBackupOptions {
  payload: PageStageEntity
  updatePageConfig: (payload: PageStageEntity) => Promise<unknown>
  historyBackup: (payload: PageHistoryBackupPayload) => Promise<unknown>
  createHash?: (pageConfig: PageStageEntity['pageConfig']) => Promise<string>
}

export type SavePageWithHistoryBackupResult =
  | {
      status: 'saved_with_history'
      hash: string
    }
  | {
      status: 'saved_without_history'
      hash: string
      historyBackupError: unknown
    }
  | {
      status: 'design_save_failed'
      error: unknown
    }

interface CoalescedLatestAsyncTaskOptions {
  schedule?: (callback: () => void) => void
  onError?: (error: unknown) => void
}

export interface CoalescedLatestAsyncTask {
  trigger: () => void
  whenIdle: () => Promise<void>
}

export interface AliveGuard {
  isAlive: () => boolean
  dispose: () => void
  runIfAlive: <T>(callback: () => T) => T | undefined
}

export interface LatestDesignerHashSync {
  sync: (computeHash: () => Promise<string | null | undefined>) => Promise<string | null | undefined>
  invalidate: () => void
}

interface ApplySavedDesignerHistoryStateOptions {
  savedHash: string
  historyBackupSucceeded: boolean
  setLastSavedHash: (hash: string) => void
  setLastAutoBackupHash: (hash: string) => void
  invalidateCurrentHash: () => void
  triggerCurrentHashSync: () => void
}

export const createPageHistoryBackupPayload = (
  payload: PageStageEntity,
  remark: PageHistoryRemark | string,
): PageHistoryBackupPayload => ({
  pageCode: payload.pageCode,
  remark,
  pageType: payload.pageType,
  pageConfig: payload.pageConfig,
})

export const savePageWithHistoryBackup = async ({
  payload,
  updatePageConfig,
  historyBackup,
  createHash = createDesignerHistoryHash,
}: SavePageWithHistoryBackupOptions): Promise<SavePageWithHistoryBackupResult> => {
  try {
    await updatePageConfig(payload)
  } catch (error) {
    return {
      status: 'design_save_failed',
      error,
    }
  }

  const hash = await createHash(payload.pageConfig)

  try {
    await historyBackup(createPageHistoryBackupPayload(payload, PAGE_HISTORY_REMARKS.manualSaveBackup))
    return {
      status: 'saved_with_history',
      hash,
    }
  } catch (historyBackupError) {
    return {
      status: 'saved_without_history',
      hash,
      historyBackupError,
    }
  }
}

export const createCoalescedLatestAsyncTask = (
  task: () => Promise<void>,
  options: CoalescedLatestAsyncTaskOptions = {},
): CoalescedLatestAsyncTask => {
  const schedule = options.schedule ?? ((callback: () => void) => queueMicrotask(callback))

  let scheduled = false
  let running = false
  let rerunRequested = false
  let idlePromise = Promise.resolve()
  let resolveIdle: (() => void) | undefined

  const markBusy = () => {
    if (resolveIdle) {
      return
    }
    idlePromise = new Promise<void>((resolve) => {
      resolveIdle = resolve
    })
  }

  const markIdleIfPossible = () => {
    if (scheduled || running || rerunRequested || !resolveIdle) {
      return
    }
    resolveIdle()
    resolveIdle = undefined
  }

  const reportError = (error: unknown) => {
    if (!options.onError) {
      return
    }
    options.onError(error)
  }

  const run = async () => {
    scheduled = false
    if (running) {
      return
    }
    running = true
    try {
      await task()
    } catch (error) {
      reportError(error)
    } finally {
      running = false
      if (rerunRequested) {
        rerunRequested = false
        scheduled = true
        schedule(() => {
          void run()
        })
      }
      markIdleIfPossible()
    }
  }

  return {
    trigger() {
      markBusy()
      if (running) {
        rerunRequested = true
        return
      }
      if (scheduled) {
        return
      }
      scheduled = true
      schedule(() => {
        void run()
      })
    },
    whenIdle() {
      return idlePromise
    },
  }
}

export const createAliveGuard = (): AliveGuard => {
  let alive = true

  return {
    isAlive() {
      return alive
    },
    dispose() {
      alive = false
    },
    runIfAlive<T>(callback: () => T) {
      if (!alive) {
        return undefined
      }
      return callback()
    },
  }
}

export const createLatestDesignerHashSync = (
  setCurrentHash: (hash: string | undefined) => void,
): LatestDesignerHashSync => {
  let token = 0

  return {
    async sync(computeHash) {
      const currentToken = ++token
      const hash = await computeHash()
      if (currentToken === token) {
        setCurrentHash(hash ?? undefined)
      }
      return hash
    },
    invalidate() {
      token += 1
    },
  }
}

export const applySavedDesignerHistoryState = ({
  savedHash,
  historyBackupSucceeded,
  setLastSavedHash,
  setLastAutoBackupHash,
  invalidateCurrentHash,
  triggerCurrentHashSync,
}: ApplySavedDesignerHistoryStateOptions): void => {
  invalidateCurrentHash()
  setLastSavedHash(savedHash)
  if (historyBackupSucceeded) {
    setLastAutoBackupHash(savedHash)
  }
  triggerCurrentHashSync()
}
