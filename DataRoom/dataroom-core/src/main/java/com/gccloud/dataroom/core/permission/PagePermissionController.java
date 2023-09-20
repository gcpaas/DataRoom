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

import static com.gccloud.dataroom.core.module.manage.service.IDataRoomPagePreviewService.PREVIEW_KEY;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/24 10:36
 */
@Slf4j
@RestController("dataRoomPagePermissionController")
@RequestMapping("/bigScreen/permission")
@Api(tags = "大屏页权限控制器")
public class PagePermissionController {

    @Resource
    private DataRoomPermissionClient permissionClient;

    @GetMapping("/check/{code}")
    @ApiOperation(value = "校验大屏页权限")
    public R<Boolean> checkPermission(HttpServletRequest request, @PathVariable("code") String code) {
        if (code.startsWith(PREVIEW_KEY)) {
            code = code.replace(PREVIEW_KEY + "_", "");
        }
        boolean access = permissionClient.verifyDataPermission(request, code);
        return R.success(access);
    }


}
