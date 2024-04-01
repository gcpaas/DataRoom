/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
     * 校验页面访问权限
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
     * @param allCode 全部的页面code
     * @return 当前用户有权限的页面code
     */
    public List<String> filterByPermission(List<String> allCode) {
        if (permissionService != null) {
            return permissionService.filterByPermission(allCode);
        }
        return allCode;
    }




}