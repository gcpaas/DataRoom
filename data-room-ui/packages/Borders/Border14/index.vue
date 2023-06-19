<template>
  <div
    style="width: 100%; height: 100%"
    class="bs-design-wrap"
  >
    <div
      :key="updateKey"
      class="custom-border-box"
      :style="{
        'border-top-left-radius': radiusLeftTop + 'px',
        'border-top-right-radius': radiusRightTop + 'px',
        'border-bottom-left-radius': radiusLeftBottom + 'px',
        'border-bottom-right-radius': radiusRightBottom + 'px',
        border: `${width}px solid ${color} `,
        opacity: opacity / 100,
        'background-image': `linear-gradient(${gradientDirection}, ${
          gradientColor0 ? gradientColor0 : gradientColor1
        } , ${gradientColor1 ? gradientColor1 : gradientColor0})`
      }"
    />
  </div>
</template>
<script>
import { refreshComponentMixin } from 'packages/js/mixins/refreshComponent'
export default {
  name: 'Border14',
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
    color () {
      return this.config.customize.borderColor || ''
    },
    width () {
      return this.config.customize.borderWidth || 0
    },
    gradientColor0 () {
      return this.config.customize.gradientColor0 || ''
    },
    gradientColor1 () {
      return this.config.customize.gradientColor1 || ''
    },
    radiusLeftTop () {
      return this.config.customize.radiusLeftTop || 0
    },
    radiusRightTop () {
      return this.config.customize.radiusRightTop || 0
    },
    radiusLeftBottom () {
      return this.config.customize.radiusLeftBottom || 0
    },
    radiusRightBottom () {
      return this.config.customize.radiusRightBottom || 0
    },
    gradientDirection () {
      return this.config.customize.gradientDirection
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
