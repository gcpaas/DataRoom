<template>
  <div class="content">
    <dv-decoration-8 style="width:90px;height:50px;" />
  </div>
</template>

<script>
import DvDecoration8 from '@jiaminghi/data-view/lib/components/decoration8/src/main.vue'
export default {
  name: 'Decoration8',
  components: {
    DvDecoration8
  },
  data () {
    return {}
  }
}
</script>
<style lang="scss" scoped>
.content {
  width: 221px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
