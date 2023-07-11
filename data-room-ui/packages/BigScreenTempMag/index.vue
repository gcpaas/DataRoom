<template>
  <div class="bs-template-mag-wrap">
    <BigScreenMag type="template" />
  </div>
</template>
<script>
import BigScreenMag from 'data-room-ui/BigScreenMag'
export default {
  name: '',
  props: {},
  components: {
    BigScreenMag
  },
  data () {
    return {

    }
  },
  mounted () {},
  methods: {

  }
}
</script>

<style lang="scss" scoped>
  .bs-template-mag-wrap{
    height: 100%;
    width: 100%;
    position: relative;
  }
</style>
