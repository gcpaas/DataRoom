<template>
  <div id="dv-full-screen-container" ref="fullScreenContainer">
    <template v-if="state.ready">
      <slot />
    </template>
  </div>
</template>

<script lang="ts" setup>
import autoResize from '@/dataroom-packages/datav/utils/autoResize'

const fullScreenContainer = ref<HTMLElement | null>(null)

const state = reactive({
  allWidth: 0,
  scale: 0,
  datavRoot: '',
  ready: false,
})

function initConfig() {
  const { width, height } = screen

  state.allWidth = width

  if (fullScreenContainer.value) {
    fullScreenContainer.value.style.width = `${width}px`
    fullScreenContainer.value.style.height = `${height}px`
  }
}

function setAppScale() {
  const currentWidth = document.body.clientWidth
  if (fullScreenContainer.value)
    fullScreenContainer.value.style.transform = `scale(${currentWidth / state.allWidth})`
}

function onResize() {
  setAppScale()
}

function afterAutoResizeMixinInit() {
  initConfig()
  setAppScale()

  state.ready = true
}

autoResize(fullScreenContainer, onResize, afterAutoResizeMixinInit)
</script>

<style lang="less">
#dv-full-screen-container {
  position: fixed;
  top: 0px;
  left: 0px;
  overflow: hidden;
  transform-origin: left top;
  z-index: 999;
}
</style>
