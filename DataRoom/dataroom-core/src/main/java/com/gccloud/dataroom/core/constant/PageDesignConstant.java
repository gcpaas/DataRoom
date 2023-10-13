package com.gccloud.dataroom.core.constant;

/**
 * @author zhang.tianming
 */
public interface PageDesignConstant {

    /**
     * 页面类型
     */
    interface Type {
        /**
         * 大屏
         */
        String BIG_SCREEN = "bigScreen";

        /**
         * 大屏组件
         */
        String COMPONENT = "component";
    }


    interface CategoryType {
        /**
         * 大屏目录
         */
        String BIG_SCREEN = "bigScreenCatalog";

        /**
         * 大屏模板目录
         */
        String BIG_SCREEN_TEMPLATE = "bigScreenTemplateCatalog";

        /**
         * 资源库目录
         */
        String RESOURCE = "resourceCatalog";

        /**
         * 组件库目录
         */
        String COMPONENT = "componentCatalog";

    }
    /**
     * 大屏
     */
    interface BigScreen {

        /**
         * 组件类型
         */
        interface Type {

            /**
             * 表格
             */
            String TABLES = "tables";

            /**
             * 外链
             */
            String IFRAME = "iframeChart";

            /**
             * 倒计时
             */
            String TIME_COUNT_DOWN = "timeCountDown";

            /**
             * 当前时间
             */
            String CURRENT_TIME = "currentTime";

            /**
             * 文本
             */
            String TEXT = "texts";

            /**
             * 装饰边框
             */
            String BORDER = "border";

            /**
             * 滚动面板
             */
            String SCREEN_SCROLL_BOARD = "screenScrollBoard";

            /**
             * 滚动排行榜
             */
            String SCREEN_SCROLL_RANKING = "screenScrollRanking";
            /**
             * 自定义组件
             */
            String CUSTOM_COMPONENT = "customComponent";

            /**
             * 地图
             */
            String MAP = "map";

            /**
             * 图标
             */
            String SVGS = "svgs";

            /**
             * 数字翻牌器
             */
            String DIGITAL_FLOP = "digitalFlop";

            /**
             * 视频
             */
            String VIDEO = "video";

            /**
             * 输入框
             */
            String INPUT = "input";

            /**
             * 按钮
             */
            String BUTTON = "button";

            /**
             * 超链接
             */
            String LINK = "linkChart";

            /**
             * 主题切换器
             */
            String THEME_SWITCHER = "themeSwitcher";

            /**
             * 主题选择器
             */
            String THEME_SELECT = "themeSelect";

            /**
             * 跑马灯
             */
            String MARQUEE = "marquee";

            /**
             * 飞线地图
             */
            String FLY_MAP = "flyMap";

            /**
             * Tab切换
             */
            String TAB_CHART = "chartTab";

            /**
             * 选择器
             */
            String SELECT = "select";

            /**
             * 时间选择
             */
            String TIME_PICKER = "timePicker";

            /**
             * echarts组件
             */
            String ECHARTS_COMPONENT = "echartsComponent";

            /**
             * 日期时间选择
             */
            String DATE_TIME_PICKER = "dateTimePicker";

            /**
             * 指标卡1
             */
            String INDEX_CARD = "indexCard";

            /**
             * 指标卡2
             */
            String INDICATOR_CARD = "indicatorCard";

            /**
             * 数字
             */
            String NUMBER = "number";

            /**
             * 自定义html
             */
            String CUSTOM_HTML = "customHtml";

        }
    }


}
