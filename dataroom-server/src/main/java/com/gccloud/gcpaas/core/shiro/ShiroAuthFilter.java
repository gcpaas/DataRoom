package com.gccloud.gcpaas.core.shiro;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.util.TokenUtils;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.web.filter.authc.AuthenticatingFilter;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;

/**
 * oauth2过滤器
 */
@Slf4j
public class ShiroAuthFilter extends AuthenticatingFilter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    protected AuthenticationToken createToken(ServletRequest request, ServletResponse response) throws Exception {
        String token = TokenUtils.getToken((HttpServletRequest) request);
        if (StringUtils.isBlank(token)) {
            return new ShiroAuthToken("");
        }
        return new ShiroAuthToken(token);
    }

    @Override
    protected boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) {
        if (((HttpServletRequest) request).getMethod().equals(RequestMethod.OPTIONS.name())) {
            return true;
        }
        return false;
    }

    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletRequest req = (HttpServletRequest) request;
        // 获取请求token，如果token不存在，直接返回401
        String token = TokenUtils.getToken((HttpServletRequest) request);
        if (StringUtils.isBlank(token)) {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
            httpResponse.setHeader("Access-Control-Allow-Origin", getOrigin());
            httpResponse.setContentType("application/json;charset=utf-8");
            String body = OBJECT_MAPPER.writeValueAsString(Resp.authError());
            httpResponse.getWriter().print(body);
            return false;
        }
        return executeLogin(request, response);
    }

    @Override
    protected boolean onLoginFailure(AuthenticationToken token, AuthenticationException e, ServletRequest request, ServletResponse response) {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.setContentType("application/json;charset=utf-8");
        httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
        httpResponse.setHeader("Access-Control-Allow-Origin", getOrigin());
        try {
            // 处理登录失败的异常
            log.error(ExceptionUtils.getStackTrace(e));
            String body = OBJECT_MAPPER.writeValueAsString(Resp.authError());
            httpResponse.getWriter().print(body);
        } catch (IOException e1) {
            log.error(ExceptionUtils.getStackTrace(e1));
        }
        return false;
    }

    public HttpServletRequest getHttpServletRequest() {
        return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
    }

    public String getOrigin() {
        HttpServletRequest request = getHttpServletRequest();
        return request.getHeader("Origin");
    }
}
