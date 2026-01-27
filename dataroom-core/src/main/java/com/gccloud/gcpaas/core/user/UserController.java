package com.gccloud.gcpaas.core.user;

import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.constant.DataRoomRole;
import com.gccloud.gcpaas.core.entity.UserEntity;
import com.gccloud.gcpaas.core.shiro.LoginUser;
import com.gccloud.gcpaas.core.user.service.TokenService;
import com.gccloud.gcpaas.core.user.service.UserService;
import com.gccloud.gcpaas.core.util.LoginUserUtils;
import com.gccloud.gcpaas.core.util.RsaUtils;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.stereotype.Controller;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;

/**
 * 用户管理
 */
@Tag(name = "用户管理")
@ApiSort(value = 200)
@RestController
@Controller
@RequestMapping("/dataRoom/user")
public class UserController {

    @Resource
    private UserService userService;
    @Resource
    private TokenService tokenService;
    @Resource
    private DataRoomConfig dataRoomConfig;

    @GetMapping("/current")
    @RequiresRoles(value = DataRoomRole.SHARER)
    @Operation(summary = "登录用户", description = "获取当前登录用户信息")
    public Resp<LoginUser> current() {
        LoginUser currentUser = LoginUserUtils.getCurrentUser();
        return Resp.success(currentUser);
    }

    @PostMapping("/login")
    @Operation(summary = "登录", description = "账号密码登录")
    public Resp<String> login(@RequestBody UserEntity user) {
        // 解密密码、比较账号密码
        String password = RsaUtils.decryptByPrivateKey(user.getPassword(), dataRoomConfig.getPrivateKey());
        Assert.isTrue(StringUtils.isNotBlank(password), "用户名或密码错误");
        UserEntity sysUser = userService.getByUsername(user.getUsername());
        Assert.isTrue(sysUser != null && sysUser.getPassword().equals(password), "用户名或密码错误");
        String token = tokenService.createToken(user.getUsername());
        return Resp.success(token);
    }
}