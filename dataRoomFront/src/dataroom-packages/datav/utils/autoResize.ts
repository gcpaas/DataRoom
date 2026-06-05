import type { Ref } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'
import { nextTick, onActivated, onDeactivated, onMounted, onUnmounted, ref } from 'vue'
import { type DomResizeObserver, observerDomResize } from './index'

function autoResize(dom: Ref<HTMLElement | null>, onResize?: () => void, afterAutoResizeMixinInit?: () => void) {
  const width = ref(0)
  const height = ref(0)

  let debounceInitWHFun: () => void
  let domObserver: DomResizeObserver | null = null
  let domHtml: HTMLElement | null = null
  let stopWindowResizeListener: (() => void) | null = null

  const initWH = (resize = true) => {
    return new Promise((resolve) => {
      nextTick(() => {
        domHtml = dom.value
        width.value = dom.value ? dom.value.clientWidth : 0
        height.value = dom.value ? dom.value.clientHeight : 0

        if (!dom.value)
          console.warn('DataV: Failed to get dom node, component rendering may be abnormal!')

        else if (!width.value || !height.value)
          console.warn('DataV: Component width or height is 0px, rendering abnormality may occur!')

        if (typeof onResize === 'function' && resize)
          onResize()
        resolve(true)
      })
    })
  }
  const getDebounceInitWHFun = () => {
    debounceInitWHFun = useDebounceFn(initWH, 200)
  }
  const bindDomResizeCallback = () => {
    if (!domHtml)
      return

    unbindDomResizeCallback()
    domObserver = observerDomResize(domHtml, debounceInitWHFun)
    stopWindowResizeListener = useEventListener(window, 'resize', debounceInitWHFun)
  }
  const unbindDomResizeCallback = () => {
    if (domObserver) {
      domObserver.disconnect()
      domObserver.takeRecords()
      domObserver = null
    }

    if (stopWindowResizeListener) {
      stopWindowResizeListener()
      stopWindowResizeListener = null
    }
  }

  const autoResizeMixinInit = async () => {
    await initWH(false)

    getDebounceInitWHFun()

    bindDomResizeCallback()

    if (typeof afterAutoResizeMixinInit === 'function')
      afterAutoResizeMixinInit()
  }

  onMounted(() => {
    autoResizeMixinInit()
  })

  onUnmounted(() => {
    unbindDomResizeCallback()
  })

  onActivated(autoResizeMixinInit)

  onDeactivated(unbindDomResizeCallback)

  return {
    width,
    height,
    initWH,
  }
}

export default autoResize
