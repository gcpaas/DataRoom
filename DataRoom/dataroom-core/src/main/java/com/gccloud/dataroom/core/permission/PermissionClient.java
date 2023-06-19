package com.gccloud.dataroom.core.permission;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/15 10:43
 */
@Component
public class PermissionClient {

    @Autowired(required = false)
    private IPermissionService tokenService;

    public boolean verifyApiPermission(HttpServletRequest request, String... permissions) {
        boolean verify = true;
        if (tokenService != null) {
            verify = tokenService.verifyApiPermission(request, permissions);
        }
        return verify;
    }


    public boolean verifyDataPermission(HttpServletRequest request, String pageCode) {
        boolean verify = true;
        if (tokenService != null) {
            verify = tokenService.verifyDataPermission(request, pageCode);
        }
        return verify;
    }




}
