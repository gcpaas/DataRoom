package com.gccloud.gcpaas.dataroom.core.shiro;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.util.TokenUtils;
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
    private final String tokenKey;

    public ShiroAuthFilter(String tokenKey) {
        this.tokenKey = tokenKey;
    }

    @Override
    protected AuthenticationToken createToken(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        ShiroAuthToken mcpToken = createMcpToken(httpRequest);
        if (mcpToken != null) {
            return mcpToken;
        }
        String token = TokenUtils.getToken(httpRequest, tokenKey);
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
        if (isMcpRequest(req)) {
            ShiroAuthToken mcpToken = createMcpToken(req);
            if (mcpToken != null) {
                return executeLogin(request, response);
            }
        }
        // 获取请求token，如果token不存在，直接返回401
        String token = TokenUtils.getToken(req, tokenKey);
        if (StringUtils.isBlank(token)) {
            writeAuthError((HttpServletResponse) response, Resp.authError(), isMcpRequest(req));
            return false;
        }
        return executeLogin(request, response);
    }

    @Override
    protected boolean onLoginFailure(AuthenticationToken token, AuthenticationException e, ServletRequest request, ServletResponse response) {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        try {
            // 处理登录失败的异常
            log.error(ExceptionUtils.getStackTrace(e));
            HttpServletRequest req = (HttpServletRequest) request;
            writeAuthError(httpResponse, getAuthError(e), isMcpRequest(req));
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

    private Resp<String> getAuthError(AuthenticationException e) {
        DataRoomException dataRoomException = findDataRoomException(e);
        if (dataRoomException != null) {
            return Resp.error(dataRoomException.getCode(), dataRoomException.getMessage());
        }
        return Resp.authError();
    }

    private DataRoomException findDataRoomException(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof DataRoomException dataRoomException) {
                return dataRoomException;
            }
            current = current.getCause();
        }
        return null;
    }

    private ShiroAuthToken createMcpToken(HttpServletRequest request) {
        if (!isMcpRequest(request)) {
            return null;
        }
        String authorization = request.getHeader("Authorization");
        if (authorization == null) {
            return null;
        }
        // 显式携带错误凭证时必须失败，不能回退到浏览器Cookie/JWT。
        String token = authorization.regionMatches(true, 0, "Bearer ", 0, 7)
                ? authorization.substring(7).trim() : "";
        return new ShiroAuthToken(token, true);
    }

    private boolean isMcpRequest(HttpServletRequest request) {
        String contextPath = request.getContextPath();
        String requestUri = request.getRequestURI();
        String path = requestUri.startsWith(contextPath)
                ? requestUri.substring(contextPath.length()) : requestUri;
        return "/mcp".equals(path);
    }

    private void writeAuthError(HttpServletResponse response, Resp<String> authError, boolean mcpRequest)
            throws IOException {
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Origin", getOrigin());
        response.setContentType("application/json;charset=utf-8");
        if (mcpRequest) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setHeader("WWW-Authenticate", "Bearer");
        }
        String body = OBJECT_MAPPER.writeValueAsString(authError);
        response.getWriter().print(body);
    }
}
