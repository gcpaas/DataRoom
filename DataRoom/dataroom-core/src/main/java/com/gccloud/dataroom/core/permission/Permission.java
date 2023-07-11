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
}
