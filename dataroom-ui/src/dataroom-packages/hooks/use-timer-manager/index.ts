import type {Reactive, Ref} from "vue";
import type {CanvasInst} from "@/dataroom-packages/PageDesigner/type/CanvasInst.ts";
import type {PageBasicConfig} from "@/dataroom-packages/PageDesigner/type/PageBasicConfig.ts";
import type {PageTimer} from "@/dataroom-packages/PageDesigner/type/PageTimer.ts";
import {ElMessage} from "element-plus";

interface UseTimerManagerOptions {
  canvasInst: Reactive<CanvasInst>
  basicConfig: Ref<PageBasicConfig>
}

export function useTimerManager(options: UseTimerManagerOptions) {
  const timerManager = new TimerManager(options.canvasInst, options.basicConfig)

  return {
    timerManager: timerManager
  }
}

/**
 * 定时器管理类
 * 用于管理页面中的定时器，包括启动、停止、执行等操作
 */
export class TimerManager {
  // 定时器实例映射表
  private timerIntervalMap: Map<string, number> = new Map()
  // 画布实例引用
  private canvasInst: Reactive<CanvasInst>
  // 基础配置引用
  private basicConfig: Ref<PageBasicConfig>

  constructor(
    canvasInst: Reactive<CanvasInst>,
    basicConfig: Ref<PageBasicConfig>
  ) {
    this.canvasInst = canvasInst
    this.basicConfig = basicConfig
  }

  /**
   * 执行定时器动作
   * @param timer 定时器配置
   */
  private executeTimerActions(timer: PageTimer): void {
    if (!timer.actions || timer.actions.length === 0) {
      return
    }
    // 依次执行所有动作
    timer.actions.forEach((action: any, index: number) => {
      try {
        if (action.type === 'code' && action.code) {
          this.canvasInst.triggerChartAction('', action, {})
        }
      } catch (error) {
        console.error(`定时器 ${timer.name} 动作 [${action.name}] 执行失败:`, error)
        ElMessage.error(`定时器 ${timer.name} 动作 ${action.name} 执行失败: ${error}`)
      }
    })
  }

  /**
   * 启动定时器
   * @param timer 定时器配置
   */
  startTimer(timer: PageTimer): void {
    if (!timer.enabled || !timer.id) {
      return
    }
    // 如果已存在，先清除
    this.stopTimer(timer.id)
    // 创建新的定时器
    const intervalId = window.setInterval(() => {
      this.executeTimerActions(timer)
    }, timer.interval)
    this.timerIntervalMap.set(timer.id, intervalId)
  }

  /**
   * 停止定时器
   * @param timerId 定时器ID
   */
  stopTimer(timerId: string): void {
    const intervalId = this.timerIntervalMap.get(timerId)
    if (intervalId) {
      window.clearInterval(intervalId)
      this.timerIntervalMap.delete(timerId)
    }
  }

  /**
   * 重新加载所有定时器
   */
  reloadAllTimers(): void {
    // 清除所有现有定时器
    this.clearAllTimers()
    // 启动所有启用的定时器
    if (this.basicConfig.value.timers) {
      this.basicConfig.value.timers.forEach((timer) => {
        if (timer.enabled) {
          this.startTimer(timer)
        }
      })
    }
  }

  /**
   * 清除所有定时器
   */
  clearAllTimers(): void {
    this.timerIntervalMap.forEach((intervalId) => {
      window.clearInterval(intervalId)
    })
    this.timerIntervalMap.clear()
  }
}
