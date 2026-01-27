package com.gccloud.gcpaas.core.exception;

import com.gccloud.gcpaas.core.bean.Resp;
import io.jsonwebtoken.ExpiredJwtException;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.UnauthorizedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.text.MessageFormat;

@RestControllerAdvice
@Slf4j
//  解决 SpringBoot 3.4+版本报错 java.lang.NoSuchMethodError: 'void org.springframework.web.method.ControllerAdviceBean
@Hidden
public class DataRoomExceptionHandler {

    @ExceptionHandler(AuthorizationException.class)
    public Resp<String> authorizationException(AuthorizationException e) {
        log.error(ExceptionUtils.getStackTrace(e));
        Resp<String> r = new Resp<String>();
        r.setCode(500);
        r.setMessage(e.getMessage());
        return r;
    }

    @ExceptionHandler(UnauthorizedException.class)
    public Resp<String> unauthorizedException(AuthorizationException e, HttpServletRequest request) {
        String message = e.getMessage();
        if (message != null) {
            int start = message.indexOf("[");
            if (start >= 0) {
                message = message.substring(start);
            }
        }
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }
        log.error(MessageFormat.format("请检查该用户是否具有指定的权限: {0} ", message));
        Resp<String> r = new Resp<String>();
        r.setCode(500);
        r.setMessage("您无权限访问 " + uri + " 接口");
        return r;
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public Resp<String> expiredJwtException(AuthorizationException e) {
        log.error(ExceptionUtils.getStackTrace(e));
        return Resp.authError();
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public Resp<String> httpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
        log.error(ExceptionUtils.getStackTrace(e));
        Resp<String> r = new Resp<String>();
        r.setCode(500);
        r.setMessage("不支持该请求方式");
        return r;
    }

    /**
     * 处理自定义异常
     */
    @ExceptionHandler(DataRoomException.class)
    public Resp<String> exception(HttpServletRequest request, DataRoomException e) {
        log.error(ExceptionUtils.getStackTrace(e));
        Resp<String> r = new Resp<>();
        r.setCode(e.getCode());
        r.setMessage(e.getMessage());
        return r;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Resp<String> illegalArgumentException(Exception e) {
        log.error(ExceptionUtils.getStackTrace(e));
        return Resp.error(e.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public Resp<String> noResourceFoundException(Exception e) {
        log.error(ExceptionUtils.getStackTrace(e));
        return Resp.error(404, "访问的地址不存在");
    }

    @ExceptionHandler(Exception.class)
    public Resp<String> handleException(Exception e) {
        log.error(ExceptionUtils.getStackTrace(e));
        return Resp.error("服务器异常");
    }
}
