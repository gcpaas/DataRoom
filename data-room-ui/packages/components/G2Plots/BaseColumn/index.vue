<template>
    <!-- 组件外层Dom必须包含一个class，该class名称为 chart+组件名称+wrapper -->
    <div class="chart-demo-wrapper xxx  yyy">
        <div>Demo组件</div>
    </div>
</template>
<script>
    export default {
        name: 'Demo',
        props: {
            chart: {
                type: Object,
                default: () => ({})
            }
        },
        inject: ['canvasInst'],
        data() {
            return {}
        },
        mounted(){
            // 注册自己到画布实例中，便于画布实例提供 getChartInst("组件ID") 方法获取实例
        },
        methods: {
            /**
             * 初始化组件
             */
            initChart() {
                // 获取数据并进行渲染，会调用 updateChartData 方法
            },
            /**
             * 刷新组件大小
             */
            resizeChart() {
            },
            /**
             * 使用数据集数据更新图表数据
             * @param params 数据集入参
             */
            updateChartData(params = {}) {
                // 获取到参数后，调用 updateChartDataWithData 方法
            },
            /**
             * 使用指定数据更新图表数据，适用于一个数据集分发多个图表场景
             * @param data
             */
            updateChartDataWithData(data = []) {

            },
            // 导出图表数据成Excel
            exportChartData(){
                //
            },
            /**
             * 刷新组件样式，配置面板改变值时触发
             * @param styleConfig 样式配置，可为空
             */
            updateChartStyle(styleConfig = {}) {
                if (styleConfig){
                    // 如果配置不为空，将进行配置合并，用合并后的配置进行渲染组件
                    return
                }
                // 如果配置为空，就直接用该组件的配置进行渲染（适用于右侧配置面板更新时使用）
            },
            /**
             * 修改chart为指定主题
             * @param theme 主题名称，由系统内置好的，每种主题对于每种图表应该如何配置由设计师设计美化确认
             * @param chart 图表的样式配置，不为空时需要合并当前组件配置
             */
            updateChartTheme(theme = "default", chart = {}) {
                console.info('%s组件(id=%s)准备更新主题为: %s', chart.desc, chart.id, theme)
                if (theme == 'default') {
                    // 默认主题，合并 default.json配置到chart

                } else if (theme == 'techBlue') {
                    // 科技蓝主题，合并 techBlue.json配置到chart, 根据该主题对该图表组件进行定制化改造

                }
            },
            /**
             * 修改chart主题以适配全局主题
             * @param globalThemeConfig 选中的全局主题，每个组件从全局主题中选择合适的参数应用到自己组件中
             * @param chart 当前图表配置
             */
            updateChartThemeFromGlobal(globalThemeConfig = {}) {

            },
            /**
             * 执行动作
             * name: 动作名称
             * params: 动作需要的参数
             */
            exeAction(action = {name: 'default', params: {}}) {
                console.info('%s组件(id=%s)准备执行%s动作', this.chart.desc, this.chart.id, action.name)
                if (action.name == 'resizeChart') {
                    try {
                        this.echartInstance.resize()
                    } catch (e) {
                        console.error(e)
                    }
                    return
                }
                if (!this[action.name] || typeof this[action.name] != 'function') {
                    console.error('%s组件(id=%s)不支持%s动作', this.chart.desc, this.chart.id, action.name)
                    return
                }
                // 动态执行方法，如果方法在执行前需要特殊处理，则新增if判断
                try {
                    this[action.name](action.params)
                } catch (e) {
                    console.error(e)
                }
            },
            // 事件模拟触发
            triggerClickEvent() {
                // 获取事件触发需要执行的动作ID列表
                let actionIdList = []
                for (let i = 0; i < actionIdList.length; i++) {
                    let actionId = actionIdList[i]
                    // 调用画布提供的方法执行动作，具体动作的代码转为Function是在画布加载时完成
                    this.canvasInst.exeAction(actionId, {})
                }
            }
        },
        // 销毁组件实例、数据、相关监听事件等
        beforeDestroy() {
            // 将自己从画布实例中删除，删除后无法通过 getChartInst("组件ID") 方法获取实例
        }
    }
</script>

<style lang="scss" scoped>
  .chart-demo-wrapper {
    // 指定类作用域下写自定义样式
  }
</style>
