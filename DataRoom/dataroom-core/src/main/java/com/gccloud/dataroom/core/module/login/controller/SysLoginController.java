package com.gccloud.dataroom.core.module.login.controller;

import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.vo.R;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.config.SysUserConfig;
import com.gccloud.dataroom.core.constant.DataRoomConst;
import com.gccloud.dataroom.core.module.login.dto.SysLoginDTO;
import com.gccloud.dataroom.core.module.login.service.ISysLoginService;
import com.gccloud.dataroom.core.module.login.vo.SysCurrentUserVO;
import com.gccloud.dataroom.core.module.login.vo.SysTokenVO;
import com.wf.captcha.*;
import com.wf.captcha.base.Captcha;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiSort;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Pattern;

/**
 * @author chen.hu
 * @date 2025/5/6 17:32
 */
@RestController
@RequestMapping("/sys")
@Api(tags = "登录")
@ApiSort(value = 20)
public class SysLoginController {
    public static final Pattern UUID_PATTERN = Pattern.compile("[a-zA-Z0-9-]{36}");
    @Resource
    private ISysLoginService sysLoginService;

    @Resource
    private DataRoomConfig dataRoomConfig;

    @PostMapping("/login")
    @ApiOperation(value = "登录", notes = "登录", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<SysTokenVO> login(@ApiParam(name = "登录参数", value = "传入json格式", required = true) @RequestBody SysLoginDTO loginDTO) {
        if (dataRoomConfig.getCaptcha().isEnable()) {
            sysLoginService.validateCaptcha(loginDTO.getUuid(), loginDTO.getCaptcha());
        }
        SysUserConfig.User user = sysLoginService.loginAuth(loginDTO);
        return R.success(sysLoginService.create(user.getUserId()));
    }

    @GetMapping("/captcha")
    @ApiOperation(value = "获取验证码", notes = "获取验证码", produces = MediaType.IMAGE_JPEG_VALUE)
    public R<Void> captcha(HttpServletResponse response, @RequestParam("uuid") String uuid) throws IOException {
        if (!dataRoomConfig.getCaptcha().isEnable()) {
            throw new GlobalException("验证码未开启");
        }
        if (StringUtils.isBlank(uuid)) {
            throw new GlobalException("uuid不能为空");
        }
        if (!UUID_PATTERN.matcher(uuid).matches()) {
            throw new GlobalException("uuid格式错误");
        }
        response.setHeader("Cache-Control", "no-store, n o-cache∑");
        response.setContentType("image/jpeg");
        Captcha captcha = null;
        int type = dataRoomConfig.getCaptcha().getType();
        int width = dataRoomConfig.getCaptcha().getWidth();
        int height = dataRoomConfig.getCaptcha().getHeight();
        int length = dataRoomConfig.getCaptcha().getLength();
        switch (type) {
            case DataRoomConst.Captcha.Type.GIF:
                captcha = new GifCaptcha(width, height, length);
                break;
            case DataRoomConst.Captcha.Type.CHINESE_GIF:
                captcha = new ChineseGifCaptcha(width, height, length);
                break;
            case DataRoomConst.Captcha.Type.CHINESE:
                captcha = new ChineseCaptcha(width, height, length);
                break;
            case DataRoomConst.Captcha.Type.ARITHMETIC:
                captcha = new ArithmeticCaptcha(width, height);
                ((ArithmeticCaptcha) captcha).getArithmeticString();
                break;
            case DataRoomConst.Captcha.Type.CHARACTER:
            default:
                captcha = new SpecCaptcha(width, height, length);
        }
        String code = captcha.text();
        sysLoginService.saveCaptcha(uuid, code);
        captcha.out(response.getOutputStream());
        return R.success();
    }

    @GetMapping("/current")
    @ApiOperation(value = "当前登录用户", notes = "当前登录用户", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<SysCurrentUserVO> current() {
        SysCurrentUserVO vo = sysLoginService.current();
        if (vo == null) {
            return R.error("未获取到当前用户信息");
        }
        return R.success(sysLoginService.current());
    }

}
