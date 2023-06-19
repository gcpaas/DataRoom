<template>
  <div class="bs-design-wrap bs-picture">
    <div class="content-box">
      <el-image
        :src="config.customize.url || noImageUrl"
        fit="fill"
        :style="{
          width: '100%',
          height: '100%',
          opacity: config.customize.opacity / 100,
          borderRadius: config.customize.radius + 'px'
        }"
        draggable="false"
      >
        <div
          slot="placeholder"
          class="image-slot"
        >
          加载中···
        </div>
      </el-image>
      <!-- <img
        :src="config.customize.url || noImageUrl"
        :style="{
          width: '100%',
          height: '100%',
          opacity: config.customize.opacity / 100,
          borderRadius: config.customize.radius + 'px'
        }"
        draggable="false"
      > -->
    </div>
  </div>
</template>
<script>
export default {
  name: 'PictureChart',
  components: {},
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      noImageUrl: require('packages/BasicComponents/Picture/images/noImage.png')
    }
  },
  computed: {},
  watch: {},
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.bs-design-wrap {
  width: 100%;
  background-color: rgba(0, 0, 0, 0);
  .content-box {
    width: 100%;
    height: 100%;
  }
}
</style>
