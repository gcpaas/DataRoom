<template>
  <div class="content">
    <dv-decoration-2 style="width:90px;height:5px;" />
  </div>
</template>

<script>
import DvDecoration2 from '@jiaminghi/data-view/lib/components/decoration2/src/main.vue'
export default {
  name: 'Decoration2',
  components: {
    DvDecoration2
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
