<template>
  <div class="dv-capsule-chart">
    <template v-if="state.mergedConfig">
      <div class="label-column">
        <div v-for="item in state.mergedConfig.data" :key="item.name">
          {{ item.name }}
        </div>
        <div>&nbsp;</div>
      </div>

      <div class="capsule-container">
        <div v-for="(capsule, index) in state.capsuleLength" :key="index" class="capsule-item">
          <div
            class="capsule-item-column"
            :style="`width: ${capsule * 100}%; background-color: ${state.mergedConfig.colors[index % state.mergedConfig.colors.length]};`"
          >
            <div
              v-if="state.mergedConfig.showValue"
              class="capsule-item-value"
            >
              {{ state.capsuleValue[index] }}
            </div>
          </div>
        </div>

        <div class="unit-label">
          <div
            v-for="(label, index) in state.labelData"
            :key="label + index"
          >
            {{ label }}
          </div>
        </div>
      </div>

      <div v-if="state.mergedConfig.unit" class="unit-text">
        {{ state.mergedConfig.unit }}
      </div>
    </template>
  </div>
</template>

<script setup>
import { deepClone, deepMerge } from '@/dataroom-packages/datav/utils'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({}),
  },
})

const state = reactive({
  defaultConfig: {
    /**
     * @description Capsule chart data
     * @type {Array<object>}
     * @default data = []
     * @example data = [{ name: 'foo1', value: 100 }, { name: 'foo2', value: 100 }]
     */
    data: [],
    /**
     * @description Colors (hex|rgb|rgba|color keywords)
     * @type {Array<string>}
     * @default color = ['#37a2da', '#32c5e9', '#67e0e3', '#9fe6b8', '#ffdb5c', '#ff9f7f', '#fb7293']
     * @example color = ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'red']
     */
    colors: [
      '#37a2da',
      '#32c5e9',
      '#67e0e3',
      '#9fe6b8',
      '#ffdb5c',
      '#ff9f7f',
      '#fb7293',
    ],
    /**
     * @description Chart unit
     * @type {string}
     * @default unit = ''
     */
    unit: '',
    /**
     * @description Show item value
     * @type {boolean}
     * @default showValue = false
     */
    showValue: false,
    /**
     * @description Text color
     * @type {string}
     * @default textColor = '#fff'
     */
    textColor: '#fff',
    /**
     * @description Chart font size
     * @type {number}
     * @default fontSize = 12
     */
    fontSize: 12,
    /**
     * @description num of labels
     * @type {number}
     * @default labelNum = 6
     */
    labelNum: 6,
  },

  mergedConfig: null,

  capsuleLength: [],
  capsuleValue: [],
  labelData: [],
  labelDataLength: [],
})

watch(() => props.config, () => {
  calcData()
}, {
  deep: true,
})

const fontSize = computed(() => {
  return `${props.config.fontSize ? props.config.fontSize : state.defaultConfig.fontSize}px`
})

const textColor = computed(() => {
  return props.config.textColor ? props.config.textColor : state.defaultConfig.textColor
})

function calcData() {
  mergeConfig()

  calcCapsuleLengthAndLabelData()
}

function mergeConfig() {
  state.mergedConfig = deepMerge(
    deepClone(state.defaultConfig, true),
    props.config || {}
  )
}

function calcCapsuleLengthAndLabelData() {
  const { data, labelNum } = state.mergedConfig

  if (!data.length || data.length === 0) {
    state.labelData = []
    state.capsuleLength = []
    return
  }

  const capsuleValue = data.map(({ value }) => value)

  const maxValue = Math.max(...capsuleValue)

  state.capsuleValue = capsuleValue

  state.capsuleLength = capsuleValue.map(v => (maxValue ? v / maxValue : 0))

  const oneFifth = maxValue / 5

  const labelData = Array.from(
    new Set(Array.from({ length: labelNum }).fill(0).map((v, i) => Math.ceil(i * oneFifth)))
  )

  state.labelData = labelData

  state.labelDataLength = Array.from(labelData).map(v =>
    maxValue ? v / maxValue : 0
  )
}
onMounted(() => {
  calcData()
})
</script>

<style lang="less">
.dv-capsule-chart {
  position: relative;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 10px;
  color: v-bind('textColor');

  .label-column {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    padding-right: 10px;
    text-align: right;
    font-size: v-bind('fontSize');

    div {
      height: 20px;
      line-height: 20px;
    }
  }

  .capsule-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .capsule-item {
    box-shadow: 0 0 3px #999;
    height: 10px;
    margin: 5px 0px;
    border-radius: 5px;

    .capsule-item-column {
      position: relative;
      height: 8px;
      margin-top: 1px;
      border-radius: 5px;
      transition: all 0.3s;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .capsule-item-value {
        font-size: v-bind('fontSize');
        transform: translateX(100%);
      }
    }
  }

  .unit-label {
    height: 20px;
    font-size: v-bind('fontSize');
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .unit-text {
    text-align: right;
    display: flex;
    align-items: flex-end;
    font-size: v-bind('fontSize');
    line-height: 20px;
    margin-left: 10px;
  }
}
</style>
