<template>
  <div class="content">
    <dv-decoration-11 style="width:100%;height:40px;" />
  </div>
</template>

<script>
import DvDecoration11 from '@jiaminghi/data-view/lib/components/decoration11/src/main.vue'
export default {
  name: 'Decoration11',
  components: {
    DvDecoration11
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
