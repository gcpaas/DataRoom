import _ from 'lodash'
import ColorSelect from 'packages/ColorMultipleSelect/index.vue'
const chartSettingMixins = {
  components: {
    ColorSelect
  },
  data () {
    return {
      customRules: {},
      colorScheme: [],
      colors: []
    }
  },
  computed: {
  },
  watch: {
  },
  mounted () {
    this.initColor()
  },
  methods: {
    initColor () {
      const colorSetting = this.config?.setting?.find(item => item.type === 'colorSelect')
      if (colorSetting && colorSetting.value && colorSetting.value.length) {
        this.colorScheme = _.cloneDeep(colorSetting.value)
        this.colors = _.cloneDeep(colorSetting.value)
      }
    },
    // 清空颜色
    delColor () {
      this.colors = []
      this.config.setting.forEach((set) => {
        if (set && set.type === 'colorSelect' && set.value && set.value.length) {
          set.value = []
        }
      })
    },
    addColor () {
      this.colors.push('')
    },
    updateColorScheme (colors) {
      this.colors = [...colors]
      this.config.setting.forEach((set) => {
        if (set && set.type === 'colorSelect') {
          set.value = [...colors]
        }
      })
    }
  }
}

export { chartSettingMixins }
