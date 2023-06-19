<template>
  <el-dialog
    class="bs-dialog-wrap bs-page-menu-wrap bs-el-dialog"
    title="新建页面"
    :visible.sync="dialogVisible"
    width="800px"
    @close="dialogVisible=false"
  >
    <div class="page-menu-box">
      <div
        v-for="(page,index) in pageList"
        :key="index"
        class="page-item"
        @click="addPage(page)"
      >
        <div class="page-img-box">
          <img
            :src="page.icon"
          >
        </div>
        <div class="page-item-icon">
          {{ page.name }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>

export default {
  name: 'PageMenuDialog',
  data () {
    return {
      dialogVisible: false,
      pageList: [
        {
          name: '目录',
          icon: require('./images/目录.png'),
          type: 'catalog',
          categories: 'catalog'
        },
        {
          name: '大屏',
          icon: require('./images/大屏.png'),
          type: 'bigScreen',
          categories: 'bigScreen'
        }
      ]
    }
  },
  methods: {
    // 新增页面
    addPage (page) {
      this.$emit('addPageDesign', page)
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-page-menu-wrap{
  .page-menu-box{
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 25%);
    .page-item{
      height: 140px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      &:hover{
        cursor: pointer;
      }
      .page-img-box{
        width: 100px;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #e5e5e5;
        &:hover{
          border: 1px dashed var(--bs-el-color-primary);
        }
      }
      img{
        width: 80%;
      }
      .page-item-icon{
        width: 100%;
        text-align: center;
      }
    }
  }

}
</style>
