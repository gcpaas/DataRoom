<template>
  <div class="content">
    <dv-decoration-9 style="width:70px;height:70px;" />
  </div>
</template>

<script>
import DvDecoration9 from '@jiaminghi/data-view/lib/components/decoration9/src/main.vue'
export default {
  name: 'Decoration9',
  components: {
    DvDecoration9
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
