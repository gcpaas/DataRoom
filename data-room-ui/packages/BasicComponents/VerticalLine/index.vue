<template>
  <div
    style="width: 100%; height: 100%"
    class="bs-design-wrap"
  >
    <div
      :key="updateKey"
      class="custom-border-box"
      :style="{
        width: width + 'px',
        opacity: opacity / 100,
        'background-image': `linear-gradient(to bottom, ${
          gradientColor0 ? gradientColor0 : gradientColor1
        } , ${gradientColor1 ? gradientColor1 : gradientColor0})`
      }"
    />
  </div>
</template>
<script>
import { refreshComponentMixin } from 'packages/js/mixins/refreshComponent'
export default {
  name: 'VerticalLine',
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
    width () {
      return this.config.customize.width || 40
    },
    gradientColor0 () {
      return this.config.customize.gradientColor0 || ''
    },
    gradientColor1 () {
      return this.config.customize.gradientColor1 || ''
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  .custom-border-box {
    width: 100%;
    height: 100%;
    // border: 1px solid rgba(131, 191, 246, 0);
    // background-color: #007aff;
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
