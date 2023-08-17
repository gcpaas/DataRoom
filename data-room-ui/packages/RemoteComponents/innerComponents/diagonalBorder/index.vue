<template>
  <div
    class="border-box"
    :style="{
      backgroundColor: customize.backgroundColor
    }"
  >
    <div
      v-if="customize.diagonalType === 'leftTopRightBottom'"
      class="left-diagonal"
    >
      <div
        class="top"
        :style="{
          width: customize.borderLength + 'px',
          height: customize.borderWidth + 'px',
          borderTopRightRadius: customize.borderRadius + 'px',
          borderBottomRightRadius: customize.borderRadius + 'px',
          backgroundColor: customize.borderColor
        }"
      />
      <div
        class="left"
        :style="{
          width: customize.borderLength + 'px',
          height: customize.borderWidth + 'px',
          borderTopRightRadius: customize.borderRadius + 'px',
          borderBottomRightRadius: customize.borderRadius + 'px',
          backgroundColor: customize.borderColor
        }"
      />
      <div
        class="right"
        :style="{
          width: customize.borderLength + 'px',
          height: customize.borderWidth + 'px',
          borderTopLeftRadius: customize.borderRadius + 'px',
          borderBottomLeftRadius: customize.borderRadius + 'px',
          backgroundColor: customize.borderColor
        }"
      />
      <div
        class="bottom"
        :style="{
          width: customize.borderLength + 'px',
          height: customize.borderWidth + 'px',
          borderTopLeftRadius: customize.borderRadius + 'px',
          borderBottomLeftRadius: customize.borderRadius + 'px',
          backgroundColor: customize.borderColor
        }"
      />
    </div>
    <div
      v-if="customize.diagonalType === 'rightTopLeftBottom'"
      class="right-diagonal"
    >
      <div
        class="top"
        :style="{
          width: customize.borderLength + 'px',
          height: customize.borderWidth + 'px',
          borderTopLeftRadius: customize.borderRadius + 'px',
          borderBottomLeftRadius: customize.borderRadius + 'px',
          backgroundColor: customize.borderColor
        }"
      />
      <div
        class="right"
        :style="{
          width: customize.borderLength + 'px',
          height: customize.borderWidth + 'px',
          borderTopLeftRadius: customize.borderRadius + 'px',
          borderBottomLeftRadius: customize.borderRadius + 'px',
          backgroundColor: customize.borderColor
        }"
      />
      <div
        class="left"
        :style="{
          width: customize.borderLength + 'px',
          height: customize.borderWidth + 'px',
          borderTopRightRadius: customize.borderRadius + 'px',
          borderBottomRightRadius: customize.borderRadius + 'px',
          backgroundColor: customize.borderColor
        }"
      />
      <div
        class="bottom"
        :style="{
          width: customize.borderLength + 'px',
          height: customize.borderWidth + 'px',
          borderTopRightRadius: customize.borderRadius + 'px',
          borderBottomRightRadius: customize.borderRadius + 'px',
          backgroundColor: customize.borderColor
        }"
      />
    </div>
  </div>
</template>
<script>

export default {
  name: 'DiagonalBorder',
  components: {
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
    }
  },
  computed: {
    option () {
      return this.config.option
    },
    optionData () {
      return this.option.data
    },
    customize () {
      return this.option.customize
    }
  },
  mounted () {
    if (this.customize.diagonalType === 'leftTopRightBottom') {
      const leftDiagonal = document.querySelector('.left-diagonal').querySelector('.left')
      const rightDiagonal = document.querySelector('.left-diagonal').querySelector('.right')
      leftDiagonal.style.left = `${this.customize.borderWidth / 2}px`
      leftDiagonal.style.top = `${this.customize.borderWidth / 2}px`
      rightDiagonal.style.right = `${this.customize.borderWidth / 2}px`
      rightDiagonal.style.bottom = `${this.customize.borderWidth / 2}px`
    } else {
      const leftDiagonal = document.querySelector('.right-diagonal').querySelector('.left')
      const rightDiagonal = document.querySelector('.right-diagonal').querySelector('.right')
      leftDiagonal.style.left = `${this.customize.borderWidth / 2}px`
      leftDiagonal.style.bottom = `${this.customize.borderWidth / 2}px`
      rightDiagonal.style.right = `${this.customize.borderWidth / 2}px`
      rightDiagonal.style.top = `${this.customize.borderWidth / 2}px`
    }
  },
  methods: { }
}
</script>
<style lang="scss" scoped>
.border-box {
  width: 100%;
  height: 100%;
  position: relative;

  .left-diagonal {
    .top {
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
    }

    // 顺时针旋转90度
    .left {
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
      transform: rotate(90deg);
      transform-origin: left;
    }

    .right {
      box-sizing: border-box;
      position: absolute;
      bottom: 0;
      right: 0;
      transform: rotate(90deg);
      transform-origin: right;
    }

    .bottom {
      box-sizing: border-box;
      position: absolute;
      bottom: 0;
      right: 0;
      transform-origin: right;
    }
  }

  .right-diagonal {
    .top {
      box-sizing: border-box;
      position: absolute;
      top: 0;
      right: 0;
    }

    .right {
      box-sizing: border-box;
      position: absolute;
      top: 0;
      right: 0;
      transform: rotate(-90deg);
      transform-origin: right;
    }

    .left {
      box-sizing: border-box;
      position: absolute;
      bottom: 0;
      left: 0;
      transform: rotate(-90deg);
      transform-origin: left;
    }

    .bottom {
      box-sizing: border-box;
      position: absolute;
      bottom: 0;
      left: 0;
      transform-origin: left;
    }
  }
}
</style>
