/*
 * @description: dashboard画布拖拽
 * @Date: 2023-03-20 12:48:42
 * @Author: xing.heng
 */
const dragDesignPanelMixin = {
  data () {
    return {
      isMouseDown: false,
      isContextmenu: false,
      scrollTop: 0,
      scrollLeft: 0,
      _startX: 0,
      _startY: 0
    }
  },
  mounted () {
    this.moveCanvas()
  },
  methods: {
    moveCanvas () {
      this.$nextTick(() => {
        const father = document.querySelector('#screens')
        father.addEventListener('contextmenu', e => {
          e.preventDefault()
          e.stopPropagation()
          this.isContextmenu = true
        })

        father.addEventListener('mousedown', e => {
          e.preventDefault()
          e.stopPropagation()
          if (e.button === 2) {
            this.isMouseDown = true
            // 记录按下鼠标的位置, 用于计算鼠标的移动距离
            this._startX = e.offsetX
            this._startY = e.offsetY
          }
        })

        father.addEventListener('mousemove', this.handleMove)

        father.addEventListener('mouseup', (e) => {
          e.preventDefault()
          e.stopPropagation()
          this.resetIsMouseDown()
          // father.removeEventListener('mousemove', this.handleMove)
        })
        father.addEventListener('mouseleave', (e) => {
          e.preventDefault()
          e.stopPropagation()
          this.resetIsMouseDown()
        })
      })
    },
    handleMove (e) {
      const father = document.querySelector('#screens')
      e.preventDefault()
      e.stopPropagation()
      // 判断鼠标移动时是否处于按下状态
      if (this.isMouseDown && e.buttons === 2) {
        // 获取鼠标按下后移动的距离
        const offsetX = e.offsetX - this._startX
        const offsetY = e.offsetY - this._startY

        // 需要注意的是当鼠标向上移动时, 滚动条应该向下移动, 所以这里都是减去的移动距离
        this.scrollTop = this.scrollTop - offsetY
        this.scrollLeft = this.scrollLeft - offsetX

        // 横向可移动的最大距离
        const limitX = father.scrollWidth - father.offsetWidth
        // 纵向可移动的最大距离
        const limitY = father.scrollHeight - father.offsetHeight

        if (this.scrollTop >= limitY) {
          // 当滑块移动到底端时
          this.scrollTop = limitY
        } else if (this.scrollTop <= 0) {
          // 当滑块移动到顶端时
          this.scrollTop = 0
        }

        if (this.scrollLeft >= limitX) {
          // 当滑块移动到左侧时
          this.scrollLeft = limitX
        } else if (this.scrollLeft <= 0) {
          // 当滑块移动到右侧时
          this.scrollLeft = 0
        }

        // 标尺开始的刻度
        const startX = (father.scrollLeft + this.thick) - offsetX
        const startY = (father.scrollTop + this.thick) - offsetY
        if (
          this.startX >= 0 &&
            this.startY >= 0 &&
            this.startX <= (this.width - father.scrollLeft) &&
            this.startY <= (this.height - father.scrollTop)
        ) {
          this.startX = startX
          this.startY = startY
        }

        // 将计算后的距离赋值给滚动条
        father.scrollTop = this.scrollTop
        father.scrollLeft = this.scrollLeft

        // this.$emit('changeStart', {
        //   x: this.startX + 50 - 20,
        //   y: this.startY + 50 - 20
        // })
      }
    },
    resetIsMouseDown () {
      this.isMouseDown = false
      this.isContextmenu = false
    }
  }
}

export { dragDesignPanelMixin }
