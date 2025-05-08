package com.gccloud.dataroom.core.permission;

import com.gccloud.common.permission.IApiPermissionService;
import com.gccloud.common.vo.R;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * @author chen.hu
 * @date 2025/5/7 16:35
 */
@Slf4j
@RestController("dataRoomApiPermissionController")
@RequestMapping("/api/permission")
@Api(tags = "大屏接口权限控制器")
public class ApiPermissionController {
    @Resource
    private IApiPermissionService apiPermissionService;

    @GetMapping("/check")
    @ApiOperation(value = "校验大屏接口权限")
    public R<Boolean> checkPermission(HttpServletRequest request, String...permission) {
        return R.success();
    }
}
