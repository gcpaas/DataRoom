package com.gccloud.gcpaas.core.shiro;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.config.bean.Jwt;
import com.gccloud.gcpaas.core.config.bean.Sso;
import com.gccloud.gcpaas.core.entity.UserEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.user.service.UserService;
import com.gccloud.gcpaas.core.util.TokenUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 认证
 */
@Slf4j
@Component
public class ShiroAuthRealm extends AuthorizingRealm {

    @Resource
    private DataRoomConfig dataRoomConfig;
    @Resource
    private RestTemplate restTemplate;
    @Resource
    private UserService userService;

    @Override
    public boolean supports(AuthenticationToken token) {
        return token instanceof ShiroAuthToken;
    }

    /**
     * 授权(验证权限时调用)
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        LoginUser user = (LoginUser) principals.getPrimaryPrincipal();
        SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
        info.setRoles(user.getRoleCodeList().stream().collect(Collectors.toSet()));
        return info;
    }

    /**
     * 认证(登录时调用)
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        String accessToken = (String) token.getPrincipal();
        if ("null".equals(accessToken)) {
            throw new DataRoomException("未登录或token已过期或认证异常", 401);
        }
        if (StringUtils.isBlank(accessToken)) {
            throw new DataRoomException("未登录或token已过期或认证异常", 401);
        }
        String tokenIssuer = null;
        JSONObject jwtObj = TokenUtils.parseWithOutValidate(accessToken);
        if (jwtObj == null || !jwtObj.containsKey("iss")) {
            tokenIssuer = "unrecognized";
        } else {
            tokenIssuer = jwtObj.getString("iss");
        }
        Jwt jwt = dataRoomConfig.getJwt();
        String localIssuer = jwt.getIssuer();
        LoginUser loginUser = new LoginUser();
        try {
            if (localIssuer.equals(tokenIssuer)) {
                Claims claims = Jwts.parser().setSigningKey(jwt.getSecret()).build().parseClaimsJws(accessToken).getBody();
                // 解析token，然后获取用户相关信息
                String username = claims.get("username", String.class);
                UserEntity user = userService.getByUsername(username);
                if (user == null || !"normal".equals(user.getState())) {
                    throw new DataRoomException("用户不存在或已禁用");
                }
                loginUser = new LoginUser();
                BeanUtils.copyProperties(user, loginUser);
            } else {
                Sso thirdPartySso = null;
                // 单点登录，带着其他应用的token进来的
                List<Sso> ssoList = dataRoomConfig.getSsoList();
                for (Sso sso : ssoList) {
                    if (!sso.getEnable()) {
                        continue;
                    }
                    if (sso.getIssuer().equals(tokenIssuer)) {
                        thirdPartySso = sso;
                        break;
                    }
                }
                if (thirdPartySso == null) {
                    // 不是本系统的token，直接抛异常
                    log.error("不是符合指定的应用token值规范，无法完成单点登录");
                    throw new DataRoomException("单点登录接入失败");
                }
                HttpHeaders headers = new HttpHeaders();
                headers.add(thirdPartySso.getTokenKey(), accessToken);
                headers.add("Cookie", thirdPartySso.getTokenKey() + "=" + accessToken);
                HttpEntity<Void> requestEntity = new HttpEntity<>(null, headers);
                long start = System.currentTimeMillis();
                ResponseEntity<String> responseEntity = restTemplate.exchange(thirdPartySso.getCurrentUserUrl(), HttpMethod.GET, requestEntity, String.class);
                if (!responseEntity.getStatusCode().is2xxSuccessful()) {
                    log.error("单点登录校验失败，url: {} 响应内容: {}", thirdPartySso.getCurrentUserUrl(), responseEntity.getBody());
                    throw new DataRoomException("单点登录校验失败");
                }
                String respBody = responseEntity.getBody();
                log.info("单点登录校验结果，url: {} 响应内容: {} 耗时: {} 毫秒", thirdPartySso.getCurrentUserUrl(), respBody, System.currentTimeMillis() - start);
                JSONObject respObj = JSON.parseObject(respBody);
                int code = respObj.getIntValue("code");
                if (code != 200) {
                    throw new DataRoomException("单点登录校验失败");
                }
                JSONObject respDataObj = respObj.getJSONObject("data");
                // 设置当前用户、用于下面去远程获取权限后使用
                loginUser = respDataObj.toJavaObject(LoginUser.class);
            }
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            if (e instanceof DataRoomException) {
                throw e;
            }
            throw new DataRoomException("认证失败", 401);
        }
        SimpleAuthenticationInfo info = new SimpleAuthenticationInfo(loginUser, token.getPrincipal(), getName());
        return info;
    }
}
