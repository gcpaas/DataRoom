<template>
  <el-dialog
    title="点九图"
    :visible.sync="dialogVisible"
    :modal="true"
    width="75%"
    :modal-append-to-body="false"
    :appen-to-body="false"
    class="bs-dialog-wrap bs-el-dialog"
    @closed="close"
    @opened="getDom"
  >
      <div class="content">
      <div>
        <table
          border="1"
          cellspacing="0"
        >
          <tr>
            <th>方向</th>
            <th>描述</th>
          </tr>
          <tr>
            <td>左上角</td>
            <td>不能拉伸</td>
          </tr>
          <tr>
            <td>右上角</td>
            <td>不能拉伸</td>
          </tr>
          <tr>
            <td>左下角</td>
            <td>不能拉伸</td>
          </tr>
          <tr>
            <td>右下角</td>
            <td>不能拉伸</td>
          </tr>
          <tr>
            <td>左侧</td>
            <td>宽度不变，高度自动拉伸</td>
          </tr>
          <tr>
            <td>右侧</td>
            <td>宽度不变，高度自动拉伸</td>
          </tr>
          <tr>
            <td>顶部</td>
            <td>高度不变，宽度自动拉伸</td>
          </tr>
          <tr>
            <td>底部</td>
            <td>高度不变，宽度自动拉伸</td>
          </tr>
          <tr>
            <td>中部</td>
            <td>宽度，高度自动拉伸</td>
          </tr>
        </table>
      </div>
      <div class="img">
        <span class="toptitle">
          <!-- <InputCom @changeStyle='changeTop' :Fx="['上','下']" :number="top" /> -->
          <el-input-number
            v-model="top"
            class="bs-el-input-number"
            :step=" 1"
            :min="0"
            :max="100000"
            @change="changeTop"
          />
        </span>
        <span class="righttitle">
          <el-input-number
            v-model="right"
            class="bs-el-input-number"
            :step=" 1"
            :min="0"
            :max="100000"
            @change="changeRight"
          />
        </span>
        <span class="bottomtitle">
          <el-input-number
            v-model="bottom"
            class="bs-el-input-number"
            :step=" 1"
            :min="0"
            :max="100000"
            @change="changeBottom"
          />
        </span>
        <span class="lefttitle">
          <el-input-number
            v-model="left"
            class="bs-el-input-number"
            :step=" 1"
            :min="0"
            :max="100000"
            @change="changeLeft"
          />
        </span>
        <el-image
          style="max-width:550px"
          :src="imgUrl||url"
          fit="fill"
        />
        <div
          id="top"
          class="top"
          @mousedown="onMouseDown"
          @mouseup="onMouseUp"
          @mousemove="onMousemove"
          @click="changeSymbol('top')"
        />
        <div
          id="right"
          class="right"
          @click="changeSymbol('right')"
        />
        <div
          id="bottom"
          class="bottom"
          @click="changeSymbol('bottom')"
        />
        <div
          id="left"
          class="left"
          @click="changeSymbol('left')"
        />
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
import { getFileUrl } from 'data-room-ui/js/utils/file'

export default {
  name: 'SourceDialog',
  data () {
    return {
      dialogVisible: false,
      imgUrl: '',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      symbol: '',
      isDown: false,
      x: 0,
      y: 0,
      l: 0,
      t: 0
    }
  },
  computed: {
    url () {
      return require('data-room-ui/BorderComponents/GcBorder16/component.png')
    }
  },
  mounted () {
  },
  methods: {
    confirm () {
      this.$emit('getArray', [this.top, this.right, this.bottom, this.left])
      this.dialogVisible = false
    },
    getDom () {
      //  const a=document.getElementById('top')
      //  const b=document.getElementById('right')
      //  const c=document.getElementById('bottom')
      //  const d=document.getElementById('left')
      //  this.top=getComputedStyle(a).top.slice(0,-2)
      //  this.right=getComputedStyle(b).right.slice(0,-2)
      //  this.bottom=getComputedStyle(c).bottom.slice(0,-2)
      //  this.left=getComputedStyle(d).left.slice(0,-2)
    },
    onMouseUp () {
      // this.isDown=false;
    },
    onMousemove (e) {
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
    onMouseDown (e) {
      // this.y=e.layerY
	    // this.t=this.top;
      // this.isDown=true
      // console.log(this.x,this.l)
    },
    changeSymbol (val) {
      this.symbol = val
    },

    close () {

    },
    changeTop (val) {
      const a = document.getElementById('top')
      a.style.top = val + 'px'
    },
    changeRight (val) {
      const a = document.getElementById('right')
      a.style.right = val + 'px'
    },
    changeBottom (val) {
      const a = document.getElementById('bottom')
      a.style.bottom = val + 'px'
    },
    changeLeft (val) {
      const a = document.getElementById('left')
      a.style.left = val + 'px'
    },
    init (val, array) {
      if (!val.startsWith('http')) {
        this.imgUrl = getFileUrl(val)
      } else {
        this.imgUrl = val
      }
      if (array) {
        [this.top, this.right, this.bottom, this.left] = array
        this.$nextTick(() => {
          this.changeTop(this.top)
          this.changeRight(this.right)
          this.changeBottom(this.bottom)
          this.changeLeft(this.left)
        })
      }
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
// @import '../../assets/style/bsTheme.scss';
::v-deep .el-dialog__body{
  background-color: #232832;
  position: relative;
  min-height: 450px;
  align-items: center;
  justify-content: center;
  display: flex;
  padding: 16px 16px 16px 16px !important;
}
.content{
  margin: 20px 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  td,th{
    padding: 8px 20px;
    text-align: center;
    vertical-align: middle;
  }
  .img{
    position: relative;
    .toptitle{
        position: absolute;
        top: -43px;
        left: 50%;
        transform: translateX(-50%);
      }
    .righttitle{
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: -123px;
    }
    .bottomtitle{
      position: absolute;
      bottom: -43px;
      left: 50%;
      transform: translateX(-50%);
    }
    .lefttitle{
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: -123px;
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
  width: 100px;
  .el-input__inner{
    padding-right: 30px;
  }
}
table{
  margin-right: 200px;
  color: #fff;
  border: 1px solid #fff;
}
th{
  padding: 4px;
}
td{
  padding: 8px;
}

</style>
