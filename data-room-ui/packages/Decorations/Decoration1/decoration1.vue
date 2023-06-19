<template>
  <div class="content">
    <dv-decoration-1 style="width:90px;height:50px;" />
  </div>
</template>

<script>
import DvDecoration1 from '@jiaminghi/data-view/lib/components/decoration1/src/main.vue'
export default {
  name: 'Decoration1',
  components: {
    DvDecoration1
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
