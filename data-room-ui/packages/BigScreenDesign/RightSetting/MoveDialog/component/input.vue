<template>
 <div class="clasfx">
  <span @click="up" class="button">{{Fx[0]}}</span>
   <el-input-number class="bs-el-input-number" v-model="number"></el-input-number>
  <span @click="down" class="button">{{Fx[1]}}</span>
 </div>
</template>
<script>
export default {
  name: 'inputNumber',
  props: {
    number:{
      type: Number,
      default: 0
    },
    Fx:{
      type: Array,
      default: []
    },
  },
  data () {
    return {

    }
  },
  computed: {
    // url(){
    //   return require('data-room-ui/BorderComponents/GcBorder16/component.png')
    // }
  },
  mounted () {
   },
  methods: {
    up(){
      const a=this.number--
      this.$emit('changeStyle',a)
    },
    down(){

    }


  }
}
</script>

<style lang="scss" scoped>
// @import '../../assets/style/bsTheme.scss';
.clasfx{
  display: flex;
  flex-direction: row;
  align-items: center;
}
.button{
  color: #fff;
  cursor: pointer;
  padding: 0 4px;
}
// ::v-deep .el-input-number__decrease{
//   display: none;
// }

// ::v-deep .el-input-number__increase{
//   display: none;
// }

::v-deep .el-input-number--mini {
 width: 120px !important
}



</style>
