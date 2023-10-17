<template>
  <el-dialog
    title="资源库"
    :visible.sync="dialogVisible"
    :modal="true"
    :modal-append-to-body="false"
    :appen-to-body="false"
    class="bs-dialog-wrap bs-el-dialog"
    @closed="close"
    @opened='getDom'
  >
    <div class="content">
      <div class="img">
        <span class="toptitle">
            <el-input-number
            @change='changeTop'
            controls-position="right"
            v-model="top"
            class="bs-el-input-number"
            :step=" 1"
            :min="0"
            :max="100000"
            />
        </span>
        <span class="righttitle">
            <el-input-number
            @change='changeRight'
            controls-position="right"
            v-model="right"
            class="bs-el-input-number"
            :step=" 1"
            :min="0"
            :max="100000"
            />
        </span>
        <span class="bottomtitle">
            <el-input-number
            @change='changeBottom'
            controls-position="right"
            v-model="bottom"
            class="bs-el-input-number"
            :step=" 1"
            :min="0"
            :max="100000"
            />
        </span>
        <span class="lefttitle">
            <el-input-number
            @change='changeLeft'
            controls-position="right"
            v-model="left"
            class="bs-el-input-number"
            :step=" 1"
            :min="0"
            :max="100000"
            />
        </span>
          <el-image
          :src="this.imgUrl||url"
          fit="none"></el-image>
          <div
           @mousedown="onMouseDown"
           @mouseup="onMouseUp"
           @mousemove="onMousemove"
           @click="changeSymbol('top')"
           id="top"
           class="top">

          </div>
          <div @click="changeSymbol('right')" id="right" class="right">
          </div>
          <div @click="changeSymbol('bottom')" id="bottom" class="bottom">
          </div>
          <div @click="changeSymbol('left')" id="left" class="left">
          </div>
      </div>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="dialogVisible = false"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="confirm"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import { right } from '@antv/g2plot/lib/plots/sankey/sankey'

export default {
  name: 'SourceDialog',
  data () {
    return {
      dialogVisible: false,
      imgUrl:'',
      top:0,
      right:0,
      bottom:0,
      left:0,
      symbol:'',
      isDown:false,
      x:0,
      y:0,
      l:0,
      t:0
    }
  },
  computed: {
    url(){
      return require('data-room-ui/BorderComponents/GcBorder16/component.png')
    }
  },
  mounted () {
   },
  methods: {
    confirm(){
      this.$emit('getArray',[this.top,this.right,this.bottom,this.left])
      this.dialogVisible = false
    },
    getDom(){
      //  const a=document.getElementById('top')
      //  const b=document.getElementById('right')
      //  const c=document.getElementById('bottom')
      //  const d=document.getElementById('left')
      //  this.top=getComputedStyle(a).top.slice(0,-2)
      //  this.right=getComputedStyle(b).right.slice(0,-2)
      //  this.bottom=getComputedStyle(c).bottom.slice(0,-2)
      //  this.left=getComputedStyle(d).left.slice(0,-2)
    },
    onMouseUp(){
      // this.isDown=false;
    },
    onMousemove(e){
      // const a=document.getElementById('top')
      // if(this.isDown==false){
      //   return
      // }
      // console.log(e)
      // let ny=e.clientY-194;
      // let nt=ny-(this.y-this.t);
      // a.style.top=nt+"px"
      // this.top=a.style.top
    },
    onMouseDown(e){
      // this.y=e.layerY
	    // this.t=this.top;
      // this.isDown=true
      // console.log(this.x,this.l)
    },
    changeSymbol(val){
      this.symbol=val
    },

    close(){

    },
    changeTop(val){
      const a=document.getElementById('top')
      a.style.top=val+"px"
    },
    changeRight(val){
      const a=document.getElementById('right')
      a.style.right=val+"px"
    },
     changeBottom(val){
      const a=document.getElementById('bottom')
      a.style.bottom=val+"px"
    },
     changeLeft(val){
      const a=document.getElementById('left')
      a.style.left=val+"px"
    },
    init (val,array) {
      this.imgUrl=val
      if(array){
        [this.top,this.right,this.bottom,this.left]=array
        this.$nextTick(()=>{
          this.changeTop(this.top)
          this.changeRight(this.right)
          this.changeBottom(this.bottom)
          this.changeLeft(this.left)
        })
      }
      this.dialogVisible = true
    },
  }
}
</script>

<style lang="scss" scoped>
// @import '../../assets/style/bsTheme.scss';
::v-deep .el-dialog__body{
  background-color: #232832;
  position: relative;
  min-height: 400px;
  align-items: center;
  justify-content: center;
  display: flex;
  padding: 16px 16px 16px 16px !important;
}
.content{
  display: flex;
  justify-content: center;
  align-items: center;
  .img{
    position: relative;
    .toptitle{
        position: absolute;
        top: -30px;
        left: 42%;
      }
    .righttitle{
      position: absolute;
      top: 50%;
      right: -75px;
    }
    .bottomtitle{
      position: absolute;
      bottom: -30px;
      left: 42%;
    }
    .lefttitle{
      position: absolute;
      top: 50%;
      left: -75px;
    }
    // height: 100%;
    .top{
      position: absolute;
      top: 0;
      height: 1px;
      background-color: #fff;
      width: 100%;
    }
    .right{
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      background-color: #fff;
      width: 1px;
    }
    .bottom{
      position: absolute;
      bottom: 0;
      height: 1px;
      background-color: #fff;
      width: 100%;
    }
    .left{
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background-color: #fff;
      width: 1px;
    }
  }

}
::v-deep .el-input-number--mini{
  width: 70px;
  .el-input__inner{
    padding-right: 30px;
  }
}

</style>
