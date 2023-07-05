<template>
  <div class="basic-component-input">
    <span
      v-if="config.customize.showTitle"
      class="title-left"
      :style="{ marginRight: config.customize.titleStyle.marginRight + 'px', fontSize: config.customize.titleStyle.fontSize + 'px', color: config.customize.titleStyle.color }"
    >
      {{ config.customize.title }}
    </span>
    <el-input
      :id="`el-input-${config.code}`"
      v-model="config.customize.value"
      type="text"
      resize="both"
      class="input"
      :placeholder="config.customize.placeholderStyle.placeholder"
      :style="{ backgroundColor: config.customize.backgroundStyle.backgroundColor }"
    >
      <i
        v-if="config.customize.icon.position === 'left' && config.customize.icon.name"
        slot="prefix"
        class="el-input__icon"
        :class="config.customize.icon.position === 'left' ? config.customize.icon.name : ''"
      />
      <i
        v-if="config.customize.icon.position === 'right' && config.customize.icon.name"
        slot="suffix"
        class="el-input__icon"
        :class="config.customize.icon.position === 'right' ? config.customize.icon.name : ''"
      />
    </el-input>
  </div>
</template>

<script>
import commonMixins from 'packages/js/mixins/commonMixins'
import linkageMixins from 'packages/js/mixins/linkageMixins'
export default {
  name: 'BasicComponentInput',
  mixins: [commonMixins, linkageMixins],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return { }
  },
  watch: {
    'config.customize.value': {
      handler (val) {
        this.$store.commit('bigScreen/changeActiveItemConfig', { ...this.config, customize: { ...this.config.customize, value: this.config.customize.value } })
      }
    }
  },
  mounted () {
    this.chartInit()
    // this.changeStyle()
  },
  methods: {
    changeStyle (config) {
      const input = document.querySelector(`#el-input-${config.code}`)

      // const inputIcon = input.querySelector(`.${this.config.customize.icon.name}`)
      input.style.backgroundColor = config.customize.backgroundStyle.backgroundColor
      input.style.fontSize = config.customize.inputStyle.fontSize + 'px'
      input.style.color = config.customize.inputStyle.color
      input.style.borderColor = config.customize.borderStyle.borderColor
      input.style.borderWidth = config.customize.borderStyle.borderWidth + 'px'
      input.style.borderStyle = config.customize.borderStyle.borderStyle
      input.style.borderRadius = config.customize.borderStyle.borderRadius + 'px'
      // inputIcon.style.fontSize = this.config.customize.inputStyle.fontSize + 'px'
      if (config.customize.icon.name) {
        const inputIcon = document.querySelector(`.${config.customize.icon.name}`)
        inputIcon.style.fontSize = config.customize.inputStyle.fontSize + 'px'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.basic-component-input {
  width: 100%;
  display: flex;
  .title-left {
    display: block;
    white-space: nowrap;
    align-self: center;
  }
  // .title-top{
  //   display: block;
  //   text-align: center;
  //   white-space: nowrap;
  // }

  .el-input {
    height: 100%;
    width: 100%;

    ::v-deep .el-input__inner {
      height: 100%;
      width: 100%;
      background-color:#151a26;
      border: 1px solid #DCDFE6;
    }
  }

}
</style>
