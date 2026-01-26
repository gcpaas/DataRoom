package com.gccloud.dataroom.core.module.login.service.impl;

import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.config.SysUserConfig;
import com.gccloud.dataroom.core.config.bean.Jwt;
import com.gccloud.dataroom.core.constant.DataRoomConst;
import com.gccloud.dataroom.core.module.login.cache.SysTokenCache;
import com.gccloud.dataroom.core.module.login.dto.SysLoginDTO;
import com.gccloud.dataroom.core.module.login.service.ISysLoginService;
import com.gccloud.dataroom.core.module.login.vo.SysCurrentUserVO;
import com.gccloud.dataroom.core.module.login.vo.SysTokenVO;
import com.gccloud.dataroom.core.utils.IPUtils;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import eu.bitwalker.useragentutils.UserAgent;
import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.apache.shiro.crypto.hash.Sha256Hash;


import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * @author chen.hu
 * @date 2025/5/6 17:38
 */
@Service
@Slf4j
public class SysLoginServiceImpl implements ISysLoginService {
    Cache<String, String> CAPTCHA_CACHE = Caffeine.newBuilder().expireAfterWrite(7200, TimeUnit.SECONDS).build();
    Cache<String, SysTokenCache> TOKEN_CACHE = Caffeine.newBuilder().expireAfterWrite(7200, TimeUnit.SECONDS).build();

    @Resource
    private SysUserConfig sysUserConfig;
    @Resource
    private DataRoomConfig dataRoomConfig;

    @Override
    public SysUserConfig.User loginAuth(SysLoginDTO loginDTO) {
        List<SysUserConfig.User> users = sysUserConfig.getUsers();
        if (CollectionUtils.isEmpty(users)) {
            throw new GlobalException("请先添加用户");
        }
        SysUserConfig.User user = users.stream()
                .filter(u -> u.getUsername().equals(loginDTO.getUsername()))
                .findFirst()
                .orElseThrow(() -> new GlobalException("用户不存在", DataRoomConst.Response.Code.NO_FOUND));
        String encryStr = encry(user.getPassword());
        if (!encryStr.equals(loginDTO.getPassword())) {
            throw new GlobalException("账号或密码错误");
        }
        return user;
    }

    @Override
    public void saveCaptcha(String uuid, String code) {
        CAPTCHA_CACHE.put(uuid, code);
    }

    @Override
    public void validateCaptcha(String uuid, String code) {
        String captcha = CAPTCHA_CACHE.getIfPresent(uuid);
        if ((StringUtils.isBlank(captcha))) {
            throw new GlobalException("验证码已失效");
        }
        CAPTCHA_CACHE.invalidate(uuid);
        if (captcha.equalsIgnoreCase(code)) {
            return;
        }
        throw new GlobalException("验证码错误");
    }

    @Override
    public String create(String userId, Map<String, Object> claims) {
        Jwt jwtConfig = dataRoomConfig.getJwt();
        JwtBuilder builder = Jwts.builder()
                .signWith(SignatureAlgorithm.forName(jwtConfig.getAlg()), jwtConfig.getSecret())
                .setClaims(claims)
                .setIssuer(jwtConfig.getIssuer())
                .setAudience(userId + "")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtConfig.getExpiration() * 1000L));
        // 设置唯一标识
        builder.setId(claims.get(DataRoomConst.Jwt.ID).toString());
        return builder.compact();
    }

    @Override
    public SysTokenVO create(String userId) {
        List<SysUserConfig.User> users = sysUserConfig.getUsers();
        SysUserConfig.User user = users.stream()
                .filter(u -> u.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new GlobalException("用户不存在", DataRoomConst.Response.Code.NO_FOUND));
        SysTokenVO tokenVO = new SysTokenVO();
        Map<String, Object> claims = new HashMap<>(16);
        claims.put(DataRoomConst.Jwt.USER_ID, user.getUserId());
        claims.put(DataRoomConst.Jwt.USER_NAME, user.getUsername());
        claims.put(DataRoomConst.Jwt.ROLE, user.getRole());
        claims.put(DataRoomConst.Jwt.PERMISSIONS, user.getPermissions());
        String id = IdWorker.getIdStr();
        claims.put(DataRoomConst.Jwt.ID, id);
        String token = create(user.getUserId(), claims);
        tokenVO.setToken(token);
        DataRoomConst.Jwt.StoreStrategy storeStrategy = dataRoomConfig.getJwt().getStoreStrategy();
        if (storeStrategy != DataRoomConst.Jwt.StoreStrategy.NONE) {
            // 无状态策略时不需要进行服务端保存
            SysTokenCache tokenCache = BeanConvertUtils.convert(tokenVO, SysTokenCache.class);
            HttpServletRequest request = ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
            if (request != null) {
                // 设置浏览器信息
                String agentStr = request.getHeader("User-Agent");
                if (StringUtils.isNotBlank(agentStr)) {
                    UserAgent agent = UserAgent.parseUserAgentString(agentStr);
                    tokenCache.setBrowserName(agent.getBrowser().getName());
                    tokenCache.setDeviceName(agent.getOperatingSystem().getName());
                    tokenCache.setUserAgent(agentStr);
                }
                // 设置IP地址
                tokenCache.setIp(IPUtils.getIp(request));
            }
            tokenCache.setUserName(user.getUsername());
            tokenCache.setCreateDate(new Date());
            tokenCache.setUpdateDate(new Date());
            tokenCache.setDeadDate(DateTime.now().plusSeconds(dataRoomConfig.getJwt().getExpiration()).toDate());
            tokenCache.setId(id);
            TOKEN_CACHE.put(id, tokenCache);
        }
        return tokenVO;
    }

    @Override
    public SysUserConfig.User getUserFromToken(String token) {
        if (StringUtils.isBlank(token)) {
            return null;
        }
        Claims claims = null;
        try {
            claims = Jwts.parser()
                    .setSigningKey(dataRoomConfig.getJwt().getSecret())
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Token校验失败", e);
            throw new GlobalException("Token校验失败", DataRoomConst.Response.Code.NO_LOGIN);
        }
        if (claims.getExpiration().before(new Date())) {
            return null;
        }
        DataRoomConst.Jwt.StoreStrategy storeStrategy = dataRoomConfig.getJwt().getStoreStrategy();
        if (DataRoomConst.Jwt.StoreStrategy.NONE == storeStrategy) {
            SysUserConfig.User user = new SysUserConfig.User();
            user.setUserId(claims.get(DataRoomConst.Jwt.USER_ID).toString());
            user.setUsername(claims.get(DataRoomConst.Jwt.USER_NAME).toString());
            user.setRole(claims.get(DataRoomConst.Jwt.ROLE, List.class));
            user.setPermissions(claims.get(DataRoomConst.Jwt.PERMISSIONS, List.class));
            return user;
        }
        String tokenId = claims.get(DataRoomConst.Jwt.ID).toString();
        if (StringUtils.isBlank(tokenId)) {
            return null;
        }
        SysTokenCache userToken = TOKEN_CACHE.getIfPresent(tokenId);
        if (userToken == null) {
            return null;
        }
        Claims claimsFinal = claims;
        userToken.setUpdateDate(new Date());
        return sysUserConfig.getUsers().stream()
                .filter(u -> u.getUserId().equals(claimsFinal.get(DataRoomConst.Jwt.USER_ID)))
                .findFirst()
                .orElseThrow(() -> new GlobalException("用户不存在", DataRoomConst.Response.Code.NO_FOUND));
    }

    @Override
    public SysCurrentUserVO current() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String token = request.getHeader("dataRoomToken");
        if ("null".equals(token) || StringUtils.isBlank(token)) {
            throw new GlobalException(DataRoomConst.Response.Msg.NO_LOGIN, DataRoomConst.Response.Code.NO_LOGIN);
        }
        SysUserConfig.User currentUser = getUserFromToken(token);
        if (currentUser == null) {
            throw new GlobalException("TOKEN无效或已过期", DataRoomConst.Response.Code.NO_FOUND);
        }
        return BeanConvertUtils.convert(currentUser, SysCurrentUserVO.class);
    }

    @Override
    public String encry(String password) {
        if (StringUtils.isBlank(password)) {
            return "";
        }
        return new Sha256Hash(new Sha256Hash(password).toHex() + password).toHex();
    }

    @Override
    public String decry(String encryStr) {
        return encryStr;
    }
}

