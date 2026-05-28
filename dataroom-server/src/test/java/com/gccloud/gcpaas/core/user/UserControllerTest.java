package com.gccloud.gcpaas.core.user;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.gccloud.gcpaas.core.bean.Rsa;
import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.constant.UserStatus;
import com.gccloud.gcpaas.core.entity.UserEntity;
import com.gccloud.gcpaas.core.user.service.TokenService;
import com.gccloud.gcpaas.core.user.service.UserService;
import com.gccloud.gcpaas.core.util.RsaUtils;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserControllerTest {

    @Test
    void loginRejectsExpiredUserBeforeCreatingToken() {
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        Rsa rsa = RsaUtils.generateRsaKeyPair();
        dataRoomConfig.setPublicKey(rsa.getPublicKey());
        dataRoomConfig.setPrivateKey(rsa.getPrivateKey());
        UserService userService = mock(UserService.class);
        TokenService tokenService = mock(TokenService.class);
        Cache<String, String> captchaCache = Caffeine.newBuilder().build();
        captchaCache.put("captcha-key", "abcd");

        UserEntity user = new UserEntity();
        user.setAccount("expired");
        user.setPassword(RsaUtils.encryptByPublicKey("password", dataRoomConfig.getPublicKey()));
        user.setStatus(UserStatus.NORMAL);
        user.setExpireDate(new Date(System.currentTimeMillis() - 1000L));
        when(userService.getByAccount("expired")).thenReturn(user);

        UserController controller = new UserController();
        ReflectionTestUtils.setField(controller, "userService", userService);
        ReflectionTestUtils.setField(controller, "tokenService", tokenService);
        ReflectionTestUtils.setField(controller, "dataRoomConfig", dataRoomConfig);
        ReflectionTestUtils.setField(controller, "captchaCache", captchaCache);

        Resp<String> response = controller.login(Map.of(
                "username", "expired",
                "password", RsaUtils.encryptByPublicKey("password", dataRoomConfig.getPublicKey()),
                "captchaKey", "captcha-key",
                "captchaCode", "abcd"
        ));

        assertEquals(500, response.getCode());
        assertEquals("用户已过期", response.getMessage());
        verify(tokenService, never()).createToken(anyString());
    }
}
