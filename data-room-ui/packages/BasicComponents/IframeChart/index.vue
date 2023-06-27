<template>
  <div
    class="bs-design-wrap"
    :class="{ 'no-pointer': isDesign }"
  >
    <div class="iframe-wrap">
      <iframe
        class="iframe"
        allowfullscreen="true"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        oallowfullscreen="true"
        msallowfullscreen="true"
        :style="{
          width: '200%',
          height: '200%',
          transform: 'scale(.5, .5) translate(-50%, -50%)',
          border: 'none'
        }"
        :src="newUrl"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'IframeChart',
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return { newUrl: '' }
  },
  computed: {
    isDesign () {
      return (window?.BS_CONFIG?.routers?.designUrl || '/big-screen/design') === this.$route.path
    }
  },
  watch: {},
  mounted () {
    this.changeStyle()
  },
  methods: {
    changeStyle (config) {
      this.newUrl = this.replaceUrlVariables(this.config.url)
    },
    replaceUrlVariables (url) {
      const variableRegex = /\${([A-Za-z0-9_.]+)}/g
      const variables = {}
      let match
      while ((match = variableRegex.exec(url))) {
        const variable = match[1]
        try {
          const value = eval(variable)
          variables[variable] = value !== undefined ? value : ''
        } catch (e) {
          variables[variable] = ''
        }
      }
      const replacedUrl = url.replace(variableRegex, (match, variable) => {
        return variables[variable] || match
      })
      return replacedUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap {
  position: relative;
  overflow: hidden;
  background: #fff;
  width: 100%;
  height: 100%;
  .iframe-wrap {
    height: 100%;
  }
}
.no-pointer {
  pointer-events: none;
}
</style>
