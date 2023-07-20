<template>
  <div
    :class="`bs-card`"
    style="width: 100%;height: 100%;position: relative;"
  >
    <div
      :style="{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundColor: customize.backgroundColor,
        border:`${customize.border}px` + ' ' + customize.borderStyle + ' ' + customize.borderColor,
      }"
    >
      <header
        :style="{
          color: customize.headerColor,
          padding: '8px 0',
          lineHeight: '16px',
          borderBottom: `${customize.titleBottomLineWidth}px solid ${customize.titleBottomLineColor}`,
          fontSize: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'space-between',
        }"
      >
        <span
          :style="{

            display: 'inline-block',
            borderLeft: `${customize.titleLineWidth}px solid ${customize.titleLineColor}`,
            paddingLeft: customize.titlePaddingLeft+'px'
          }"
        >
          {{ config.title }}
        </span>
      </header>
      <div
        :style="{
          flex: 1,
          position: 'relative'
        }"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'Card',
  components: {},
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      customClass: {}
    }
  },
  mounted () {
  },
  watch: {},
  computed: {
    customize () {
      return this.config.option.customize
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>

</style>
