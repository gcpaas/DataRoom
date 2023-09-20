package com.gccloud.dataroom.core.permission;

import com.gccloud.dataset.constant.DatasetConstant;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/15 17:08
 */
public interface Permission extends DatasetConstant.Permission {

    /**
     * 大屏页面的权限
     */
    interface DataRoom {

        /**
         * 大屏页面/组件的查询接口权限
         */
        String VIEW = "screen:view";

        /**
         * 大屏页面/组件的新增接口权限
         */
        String ADD = "screen:add";

        /**
         * 大屏页面/组件的编辑接口权限
         */
        String UPDATE = "screen:update";

        /**
         * 大屏页面/组件的删除接口权限
         */
        String DELETE = "screen:delete";

    }

    /**
     * 资源库的权限（文件管理系统）
     */
    interface File {

        /**
         * 文件的查询接口权限
         */
        String VIEW = "file:view";

        /**
         * 文件的上传接口权限
         */
        String UPLOAD = "file:upload";

        /**
         * 文件的下载接口权限
         */
        String DOWNLOAD = "file:download";

        /**
         * 文件的删除接口权限
         */
        String DELETE = "file:delete";
    }


    /**
     * 组件库的权限（业务组件管理）
     */
    interface Component {

        /**
         * 组件的查询接口权限
         */
        String VIEW = "component:view";

        /**
         * 组件的新增接口权限
         */
        String ADD = "component:add";

        /**
         * 组件的编辑接口权限
         */
        String UPDATE = "component:update";

        /**
         * 组件的删除接口权限
         */
        String DELETE = "component:delete";

    }

    /**
     * 地图数据管理权限
     */
    interface Map {

        /**
         * 地图数据的查询接口权限
         */
        String VIEW = "map:view";

        /**
         * 地图数据的新增接口权限
         */
        String ADD = "map:add";

        /**
         * 地图数据的编辑接口权限
         */
        String UPDATE = "map:update";

        /**
         * 地图数据的删除接口权限
         */
        String DELETE = "map:delete";

    }

}