import type { ChartAction } from '@/dataRoom/components/type/ChartAction.ts'
import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'

export interface PageTimerBehaviorConfig {
  disabled: boolean
  actions: ChartAction[]
}

export const TIMER_TICK_BEHAVIOR: Behavior = {
  name: '定时触发',
  desc: '按照定时器间隔重复触发',
  method: 'tick',
  paramsList: [
    { name: 'timerId', type: 'string', desc: '定时器ID' },
    { name: 'timerName', type: 'string', desc: '定时器名称' },
    { name: 'interval', type: 'number', desc: '执行间隔，单位毫秒' },
    { name: 'timestamp', type: 'number', desc: '触发时间戳' },
  ],
}

export interface PageTimer {
  // 定时器ID
  id: string
  // 定时器名称
  name: string
  // 是否启用
  enabled: boolean
  // 定时器间隔，单位毫秒
  interval: number
  // 定时器触发事件配置
  behaviors: {
    tick: PageTimerBehaviorConfig
  }
}

export const createDefaultTimerBehaviors = (): PageTimer['behaviors'] => {
  return {
    tick: {
      disabled: false,
      actions: [],
    },
  }
}

export const ensureTimerTickBehavior = (timer: PageTimer): PageTimerBehaviorConfig => {
  if (!timer.behaviors) {
    timer.behaviors = createDefaultTimerBehaviors()
  }
  if (!timer.behaviors.tick) {
    timer.behaviors.tick = {
      disabled: false,
      actions: [],
    }
  }
  return timer.behaviors.tick
}
