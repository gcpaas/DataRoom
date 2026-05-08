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
import com.github.benmanes.caffeine.cache.Cache;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.stereotype.Controller;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
    @Resource(name = "captchaCache")
    private Cache<String, String> captchaCache;

    @GetMapping("/current")
    @RequiresRoles(value = DataRoomRole.SHARER)
    @Operation(summary = "登录用户", description = "获取当前登录用户信息")
    public Resp<LoginUser> current() {
        LoginUser currentUser = LoginUserUtils.getCurrentUser();
        return Resp.success(currentUser);
    }

    @PostMapping("/login")
    @Operation(summary = "登录", description = "账号密码登录，需携带验证码")
    public Resp<String> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        String captchaKey = params.get("captchaKey");
        String captchaCode = params.get("captchaCode");

        // 校验验证码
        if (StringUtils.isBlank(captchaKey) || StringUtils.isBlank(captchaCode)) {
            return Resp.error("验证码不能为空");
        }
        String cachedCode = captchaCache.getIfPresent(captchaKey);
        if (cachedCode == null) {
            return Resp.error("验证码已过期，请刷新后重试");
        }
        if (!cachedCode.equals(captchaCode.toLowerCase())) {
            return Resp.error("验证码不正确");
        }
        // 验证通过后立即删除，防止重复使用
        captchaCache.invalidate(captchaKey);

        // 解密密码、比较账号密码
        String decryptedPassword = RsaUtils.decryptByPrivateKey(password, dataRoomConfig.getPrivateKey());
        Assert.isTrue(StringUtils.isNotBlank(decryptedPassword), "用户名或密码错误");
        UserEntity sysUser = userService.getByUsername(username);
        Assert.isTrue(sysUser != null && sysUser.getPassword().equals(decryptedPassword), "用户名或密码错误");
        String token = tokenService.createToken(username);
        return Resp.success(token);
    }
}