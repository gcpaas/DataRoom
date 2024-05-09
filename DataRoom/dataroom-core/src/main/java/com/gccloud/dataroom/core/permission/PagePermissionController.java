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

import com.gccloud.common.vo.R;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/24 10:36
 */
@Slf4j
@RestController("dataRoomPagePermissionController")
@RequestMapping("/dataroom/permission")
@Api(tags = "页面权限控制器")
public class PagePermissionController {

    @Resource
    private DataRoomPermissionClient permissionClient;

    @GetMapping("/check/{code}")
    @ApiOperation(value = "校验页面权限")
    public R<Boolean> checkPermission(HttpServletRequest request, @PathVariable("code") String code) {
        boolean access = permissionClient.verifyDataPermission(request, code);
        return R.success(access);
    }


}