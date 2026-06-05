<template>
  <div class="dv-button-wrapper">
    <button class="dv-button">
      <div class="dv-button-svg-container">
        <component :is="border" />
      </div>
      <div class="dv-button-text">
        <slot />
      </div>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { lighten } from '@jiaminghi/color'
import type { Component } from 'vue'
import Border1 from './BorderBox1.vue'
import Border2 from './BorderBox2.vue'
import Border3 from './BorderBox3.vue'
import Border4 from './BorderBox4.vue'
import Border5 from './BorderBox5.vue'
import Border6 from './BorderBox6.vue'

interface ButtonProps {
  color?: string
  fontColor?: string
  bg?: boolean
  border?: string | Component
  fontSize?: number
}

defineOptions({
  components: {
    Border1,
    Border2,
    Border3,
    Border4,
    Border5,
    Border6,
  },
})

const props = withDefaults(defineProps<ButtonProps>(), {
  color: '#2058c7',
  fontColor: '',
  bg: true,
  border: 'Border1',
  fontSize: 14,
})

const hoverColor = computed(() => lighten(props.color, 40))

const fontColorCalc = computed(() => props.fontColor === '' ? props.color : props.fontColor)

const hoverFontColor = computed(() => lighten(fontColorCalc.value, 40))

const bgDisplay = computed(() => props.bg ? 0.1 : 0.0)

const fontSize = computed(() => {
  return `${props.fontSize}px`
})
</script>

<style lang="less">
.dv-button-wrapper {
  position: relative;

  .dv-button {
    padding: 10px 20px;
    display: inline-block;
    outline: none;
    border: none;
    background-color: transparent;
    line-height: 1;
    font-size: v-bind('fontSize');
    text-decoration: none;
    text-shadow: v-bind('color') 0px 0px 1px;
    color: v-bind('fontColorCalc');
    cursor: pointer;
  }

  .dv-button:hover, .dv-button:focus {
      text-shadow: v-bind('hoverColor') 0px 0px 1px;
      color: v-bind('hoverFontColor');
  }

  .dv-button:hover svg, .dv-button:focus svg {
      filter: drop-shadow(v-bind('hoverColor') 0px 0px 2px);
  }

  .dv-button:hover path[data-type="shape"], .dv-button:focus path[data-type="shape"] {
      fill: v-bind('hoverColor');
  }

  .dv-button-svg-container {
      position: absolute;
      inset: -2px;
      display: flex;
  }

  .dv-button-svg {
      display: block;
      flex: 1 1 0%;
      filter: drop-shadow(v-bind('color') 0px 0px 2px);
  }
  .dv-button-svg-bg {
      stroke-width: 0;
      stroke: transparent;
      fill: v-bind('color');
      opacity: v-bind('bgDisplay');
  }
  .dv-button-svg-line {
      stroke-width: 2;
      stroke: v-bind('color');
      vector-effect: non-scaling-stroke;
      fill: transparent;
  }

  .dv-button-text {
      position: relative;
  }
}
</style>
