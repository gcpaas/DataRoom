export const DESIGNER_HISTORY_AUTO_BACKUP_INTERVAL_MS = 60_000

export interface DesignerHistoryAutoBackupControllerOptions {
  getCurrentHash: () => Promise<string | null | undefined> | string | null | undefined
  getLastAutoBackupHash: () => string | null | undefined
  setLastAutoBackupHash: (hash: string) => void
  backup: (currentHash: string) => Promise<void> | void
  onError?: (error: unknown) => void
  intervalMs?: number
  setIntervalFn?: typeof globalThis.setInterval
  clearIntervalFn?: typeof globalThis.clearInterval
}

export interface DesignerHistoryAutoBackupController {
  start: () => void
  stop: () => void
  tick: () => Promise<boolean>
  isRunning: () => boolean
}

export function stableSerializePageConfig(pageConfig: unknown): string {
  const normalized = normalizeStableValue(pageConfig)
  return JSON.stringify(normalized === undefined ? null : normalized)
}

export async function createDesignerHistoryHash(pageConfig: unknown): Promise<string> {
  const serialized = stableSerializePageConfig(pageConfig)
  const digest = await getSubtleCrypto().digest('SHA-256', new TextEncoder().encode(serialized))
  return bytesToHex(new Uint8Array(digest))
}

export function hasUnsavedChanges(currentHash: string | null | undefined, lastSavedHash: string | null | undefined): boolean {
  return currentHash !== lastSavedHash
}

export function createDesignerHistoryAutoBackupController(
  options: DesignerHistoryAutoBackupControllerOptions,
): DesignerHistoryAutoBackupController {
  const setIntervalFn = options.setIntervalFn ?? globalThis.setInterval
  const clearIntervalFn = options.clearIntervalFn ?? globalThis.clearInterval
  const intervalMs = options.intervalMs ?? DESIGNER_HISTORY_AUTO_BACKUP_INTERVAL_MS

  let timer: ReturnType<typeof globalThis.setInterval> | undefined
  let ticking = false

  const tick = async (): Promise<boolean> => {
    if (ticking) {
      return false
    }
    ticking = true
    try {
      const currentHash = await options.getCurrentHash()
      if (!currentHash) {
        return false
      }
      if (currentHash === options.getLastAutoBackupHash()) {
        return false
      }
      await options.backup(currentHash)
      options.setLastAutoBackupHash(currentHash)
      return true
    } finally {
      ticking = false
    }
  }

  return {
    start() {
      if (timer) {
        return
      }
      timer = setIntervalFn(() => {
        void tick().catch((error) => {
          reportIntervalError(error, options.onError)
        })
      }, intervalMs)
    },
    stop() {
      if (!timer) {
        return
      }
      clearIntervalFn(timer)
      timer = undefined
    },
    tick,
    isRunning() {
      return timer !== undefined
    },
  }
}

function reportIntervalError(error: unknown, onError?: (error: unknown) => void): void {
  if (!onError) {
    return
  }
  try {
    onError(error)
  } catch (callbackError) {
    console.error(callbackError)
  }
}

function normalizeStableValue(value: unknown): unknown {
  if (value === null) {
    return null
  }

  const valueType = typeof value
  if (valueType === 'string' || valueType === 'boolean') {
    return value
  }
  if (valueType === 'number') {
    return Number.isFinite(value) ? value : null
  }
  if (valueType === 'bigint') {
    return (value as bigint).toString()
  }
  if (valueType === 'undefined' || valueType === 'function' || valueType === 'symbol') {
    return undefined
  }
  if (Array.isArray(value)) {
    return value.map((item) => {
      const normalizedItem = normalizeStableValue(item)
      return normalizedItem === undefined ? null : normalizedItem
    })
  }
  if (value instanceof Date) {
    return value.toJSON()
  }
  if (hasToJson(value)) {
    return normalizeStableValue(value.toJSON())
  }
  if (isPlainObject(value)) {
    const normalizedObject: Record<string, unknown> = {}
    for (const key of Object.keys(value).sort()) {
      const normalizedItem = normalizeStableValue(value[key])
      if (normalizedItem !== undefined) {
        normalizedObject[key] = normalizedItem
      }
    }
    return normalizedObject
  }
  return String(value)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function hasToJson(value: unknown): value is { toJSON: () => unknown } {
  return typeof value === 'object' && value !== null && 'toJSON' in value && typeof value.toJSON === 'function'
}

function getSubtleCrypto(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error('SubtleCrypto is not available in the current runtime')
  }
  return subtle
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
