<template>
  <div class="content">
    <dv-decoration-3 style="width:90px;height:20px;" />
  </div>
</template>

<script>
import DvDecoration3 from '@jiaminghi/data-view/lib/components/decoration3/src/main.vue'
export default {
  name: 'Decoration3',
  components: {
    DvDecoration3
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
