package com.gccloud.dataroom.core.permission;


import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/15 10:38
 */
public interface IDataRoomPermissionService {

    /**
     * 校验大屏页面数据访问权限
     * @param request
     * @param pageCode
     * @return
     */
    boolean verifyDataPermission(HttpServletRequest request, String pageCode);

    /**
     * 根据权限过滤
     * @param allCode 全部的大屏code
     * @return 当前用户有权限的大屏code
     */
    default List<String> filterByPermission(List<String> allCode) {
        return allCode;
    }

}
