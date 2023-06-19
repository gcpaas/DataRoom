<template>
  <div
    style="width: 100%; height: 100%"
    class="bs-design-wrap"
  >
    <div
      :key="updateKey"
      class="custom-border-box"
      :style="{
        'border-color': color,
        'border-width': width + 'px',
        'background-image': `linear-gradient(${gradientDirection}, ${
          gradientColor0 ? gradientColor0 : gradientColor1
        } , ${gradientColor1 ? gradientColor1 : gradientColor0})`,
        'font-size': fontSize + 'px',
        'font-weight': fontWeight,
        opacity: opacity / 100,
        color: fontColor
      }"
    >
      {{ text }}
    </div>
  </div>
</template>
<script>
import { refreshComponentMixin } from 'packages/js/mixins/refreshComponent'
export default {
  name: 'Border15',
  components: {},
  mixins: [refreshComponentMixin],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {}
  },
  computed: {
    text () {
      return this.config.customize.text || ''
    },
    fontWeight () {
      return this.config.customize.fontWeight || 400
    },
    color () {
      return this.config.customize.borderColor || '#83bff6'
    },
    width () {
      return this.config.customize.borderWidth || 1
    },
    gradientColor0 () {
      return this.config.customize.gradientColor0 || ''
    },
    gradientColor1 () {
      return this.config.customize.gradientColor1 || ''
    },
    gradientDirection () {
      return this.config.customize.gradientDirection
    },
    fontSize () {
      return this.config.customize.fontSize || 16
    },
    fontColor () {
      return this.config.customize.fontColor || '#fff'
    },
    opacity () {
      return this.config.customize.opacity || 100
    }
  },
  watch: {},
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.bs-design-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: transparent;
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  .custom-border-box {
    width: 100%;
    height: 100%;
    border: 1px solid rgba(131, 191, 246, 0);
    border-radius: 50% 50% 50% 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

/*滚动条样式*/
/deep/::-webkit-scrollbar {
  width: 4px;
  border-radius: 4px;
  height: 4px;
}

/deep/::-webkit-scrollbar-thumb {
  background: #dddddd !important;
  border-radius: 10px;
}
</style>
