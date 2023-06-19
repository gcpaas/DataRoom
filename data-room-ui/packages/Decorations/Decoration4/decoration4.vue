<template>
  <div class="content">
    <dv-decoration-4 style="width:7px;height:70px;" />
  </div>
</template>

<script>
import DvDecoration4 from '@jiaminghi/data-view/lib/components/decoration4/src/main.vue'
export default {
  name: 'Decoration4',
  components: {
    DvDecoration4
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
