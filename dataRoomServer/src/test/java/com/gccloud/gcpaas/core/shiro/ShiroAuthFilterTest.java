package com.gccloud.gcpaas.core.shiro;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.shiro.ShiroAuthFilter;
import org.apache.shiro.authc.AuthenticationException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ShiroAuthFilterTest {

    @Test
    void authFailureUsesDataRoomExceptionMessageWhenPresent() {
        ShiroAuthFilter filter = new ShiroAuthFilter();
        AuthenticationException exception = new AuthenticationException(
                new AuthenticationException(new DataRoomException("分享链接已停用", 401))
        );

        Resp<String> resp = ReflectionTestUtils.invokeMethod(filter, "getAuthError", exception);

        assertEquals(401, resp.getCode());
        assertEquals("分享链接已停用", resp.getMessage());
    }

    @Test
    void authFailureFallsBackToDefaultMessage() {
        ShiroAuthFilter filter = new ShiroAuthFilter();

        Resp<String> resp = ReflectionTestUtils.invokeMethod(filter, "getAuthError", new AuthenticationException("failed"));

        assertEquals(401, resp.getCode());
        assertEquals("未登录或token已过期或认证异常", resp.getMessage());
    }
}
