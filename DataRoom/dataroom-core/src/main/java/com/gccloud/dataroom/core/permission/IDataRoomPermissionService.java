package com.gccloud.dataroom.core.permission;


import javax.servlet.http.HttpServletRequest;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/15 10:38
 */
public interface IDataRoomPermissionService {

    /**
     * 校验接口权限
     * @param request
     * @param permission
     * @return
     */
    boolean verifyApiPermission(HttpServletRequest request, String... permission);


    /**
     * 校验大屏页面数据访问权限
     * @param request
     * @param pageCode
     * @return
     */
    boolean verifyDataPermission(HttpServletRequest request, String pageCode);


}
