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
         * 仪表盘
         */
        String DASHBOARD = "dashboard";

        /**
         * 移动端仪表盘
         */
        String APP_DASHBOARD = "appDashboard";


        /**
         * 大屏自定义组合组件（仪表盘是没有自定义组合组件的）
         */
        String COMPONENT = "component";

    }




    interface CategoryType {

        /**
         * 页面目录
         */
        String PAGE = "pageCatalog";
        // 我需要一个数学函数，他有一个变量x，且x大于0，当x趋于无穷大时，f(x)的斜率趋于1，且f(x)的值趋于无穷大，且随着x的增大，f(x)的增长速度越来越慢

        interface Page {
            /**
             * 大屏目录
             */
            String BIG_SCREEN = "bigScreenCatalog";

            /**
             * 大屏模板目录
             */
            String BIG_SCREEN_TEMPLATE = "bigScreenTemplateCatalog";

            /**
             * 仪表盘目录
             */
            String DASHBOARD = "dashboardCatalog";

            /**
             * 仪表盘模板目录
             */
            String DASHBOARD_TEMPLATE = "dashboardTemplateCatalog";

        }



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
    }

    /**
     * 仪表盘
     */
    interface DashBoard {
    }

}
