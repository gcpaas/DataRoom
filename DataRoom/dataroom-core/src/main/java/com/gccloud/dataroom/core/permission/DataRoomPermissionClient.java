package com.gccloud.dataroom.core.permission;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/15 10:43
 */
@Component
public class DataRoomPermissionClient {

    @Autowired(required = false)
    private IDataRoomPermissionService permissionService;


    /**
     * 校验大屏页面访问权限
     * @param request 请求
     * @param pageCode 页面编码
     * @return 是否有权限
     */
    public boolean verifyDataPermission(HttpServletRequest request, String pageCode) {
        boolean verify = true;
        if (permissionService != null) {
            verify = permissionService.verifyDataPermission(request, pageCode);
        }
        return verify;
    }


    /**
     * 根据权限过滤
     * @param allCode 全部的大屏code
     * @return 当前用户有权限的大屏code
     */
    public List<String> filterByPermission(List<String> allCode) {
        if (permissionService != null) {
            return permissionService.filterByPermission(allCode);
        }
        return allCode;
    }




}
