package com.gccloud.dataroom.core.module.login.service;

import com.gccloud.dataroom.core.config.SysUserConfig;
import com.gccloud.dataroom.core.module.login.dto.SysLoginDTO;
import com.gccloud.dataroom.core.module.login.vo.SysCurrentUserVO;
import com.gccloud.dataroom.core.module.login.vo.SysTokenVO;

import java.util.Map;

/**
 * @author chen.hu
 * @date 2025/5/6 17:37
 */
public interface ISysLoginService {
    /**
     * 登录认证
     * @param loginDTO
     * @return
     */
    SysUserConfig.User loginAuth(SysLoginDTO loginDTO);
    /**
     * 保存验证码
     * @param uuid
     * @return
     */
    void saveCaptcha(String uuid, String code);
    /**
     * 校验验证码
     * @param uuid
     * @param code
     */
    void validateCaptcha(String uuid, String code);
    /**
     * 创建token但不放入缓存中
     * @param userId
     * @param claims
     * @return
     */
    String create(String userId, Map<String, Object> claims);
    /**
     * 创建token并放入缓存中
     * @param userId
     * @return
     */
    SysTokenVO create(String userId);
    /**
     * 从token中解析用户信息
     * @param token
     * @return
     */
    SysUserConfig.User getUserFromToken(String token);
    /**
     * 获取当前用户信息
     * @return
     */
    SysCurrentUserVO current();
    /**
     * 加密
     * @param password
     * @return
     */
    String encry(String password);
    /**
     * 解密
     * @param encryStr
     * @return
     */
    String decry(String encryStr);

}
