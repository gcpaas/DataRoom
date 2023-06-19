<template>
  <div class="content">
    <dv-decoration-10 style="width:90%;height:5px;" />
  </div>
</template>

<script>
import DvDecoration10 from '@jiaminghi/data-view/lib/components/decoration10/src/main.vue'
export default {
  name: 'Decoration10',
  components: {
    DvDecoration10
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
