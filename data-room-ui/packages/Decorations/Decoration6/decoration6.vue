<template>
  <div class="content">
    <dv-decoration-6 style="width:90px;height:30px;" />
  </div>
</template>

<script>
import DvDecoration6 from '@jiaminghi/data-view/lib/components/decoration6/src/main.vue'
export default {
  name: 'Decoration6',
  components: {
    DvDecoration6
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
