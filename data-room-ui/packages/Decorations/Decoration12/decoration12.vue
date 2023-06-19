<template>
  <div class="content">
    <dv-decoration-12 style="width:70px;height:70px;" />
  </div>
</template>

<script>
import DvDecoration12 from '@jiaminghi/data-view/lib/components/decoration12/src/main.vue'
export default {
  name: 'Decoration12',
  components: {
    DvDecoration12
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
