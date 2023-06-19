<template>
  <svg
    :class="getClassName"
    aria-hidden="true"
  >
    <use :xlink:href="getName" />
  </svg>
</template>

<script>
export default {
  name: 'IconSvg',
  props: {
    name: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  computed: {
    getName () {
      return `#icon-${this.name}`
    },
    getClassName () {
      return [
        'icon-svg',
        `icon-svg__${this.name}`,
        this.className && /\S/.test(this.className) ? `${this.className}` : ''
      ]
    }
  }
}
</script>

<style scoped>
  .icon-svg {
    width: 18px;
    height: 18px;
    vertical-align: middle;
    fill: currentColor;
    overflow: hidden;
    mask-size: cover!important;
    display: inline-block;
  }
</style>
