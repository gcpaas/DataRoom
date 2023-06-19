<template>
  <div class="content">
    <dv-decoration-5 style="width:90px;height:40px;" />
  </div>
</template>

<script>
import DvDecoration5 from '@jiaminghi/data-view/lib/components/decoration5/src/main.vue'
export default {
  name: 'Decoration5',
  components: {
    DvDecoration5
  },
  data () {
    return {
    }
  }
}
</script>
<style lang="scss" scoped>
 .content{
   width:221px;
   height:100px;
   display: flex;
   justify-content: center;
   align-items: center;
 }
</style>
