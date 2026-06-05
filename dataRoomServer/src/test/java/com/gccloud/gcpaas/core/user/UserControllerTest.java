package com.gccloud.gcpaas.core.user;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.gccloud.gcpaas.core.bean.PageVo;
import com.gccloud.gcpaas.core.bean.Rsa;
import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.constant.UserStatus;
import com.gccloud.gcpaas.core.entity.UserEntity;
import com.gccloud.gcpaas.core.user.dto.UserQueryDTO;
import com.gccloud.gcpaas.core.user.service.TokenService;
import com.gccloud.gcpaas.core.user.service.UserService;
import com.gccloud.gcpaas.core.util.RsaUtils;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
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

    @Test
    void loginRecordsPasswordFailureWhenPasswordDoesNotMatch() {
        DataRoomConfig dataRoomConfig = newDataRoomConfig();
        UserService userService = mock(UserService.class);
        TokenService tokenService = mock(TokenService.class);
        Cache<String, String> captchaCache = captchaCache("captcha-key", "abcd");
        UserEntity user = activeUser("alice", "right-password", dataRoomConfig);
        when(userService.getByAccount("alice")).thenReturn(user);

        UserController controller = newController(userService, tokenService, dataRoomConfig, captchaCache);

        assertThrows(IllegalArgumentException.class, () -> controller.login(Map.of(
                "username", "alice",
                "password", RsaUtils.encryptByPublicKey("wrong-password", dataRoomConfig.getPublicKey()),
                "captchaKey", "captcha-key",
                "captchaCode", "abcd"
        )));

        verify(userService, times(1)).recordLoginFailure(user);
        verify(tokenService, never()).createToken(anyString());
    }

    @Test
    void loginRejectsActiveLockedUserBeforeCreatingToken() {
        DataRoomConfig dataRoomConfig = newDataRoomConfig();
        UserService userService = mock(UserService.class);
        TokenService tokenService = mock(TokenService.class);
        Cache<String, String> captchaCache = captchaCache("captcha-key", "abcd");
        UserEntity user = activeUser("alice", "right-password", dataRoomConfig);
        user.setStatus(UserStatus.LOCKED);
        user.setLoginLockedUntil(new Date(System.currentTimeMillis() + 60_000L));
        when(userService.getByAccount("alice")).thenReturn(user);
        when(userService.isLoginLockActive(user)).thenReturn(true);

        UserController controller = newController(userService, tokenService, dataRoomConfig, captchaCache);

        Resp<String> response = controller.login(Map.of(
                "username", "alice",
                "password", RsaUtils.encryptByPublicKey("right-password", dataRoomConfig.getPublicKey()),
                "captchaKey", "captcha-key",
                "captchaCode", "abcd"
        ));

        assertEquals(500, response.getCode());
        assertEquals("账号已锁定，请10分钟后重试", response.getMessage());
        verify(userService, never()).recordLoginFailure(user);
        verify(userService, never()).recordLoginSuccess(user);
        verify(tokenService, never()).createToken(anyString());
    }

    @Test
    void loginRestoresLockedUserToNormalWhenLockWindowPassedAndPasswordMatches() {
        DataRoomConfig dataRoomConfig = newDataRoomConfig();
        UserService userService = mock(UserService.class);
        TokenService tokenService = mock(TokenService.class);
        Cache<String, String> captchaCache = captchaCache("captcha-key", "abcd");
        UserEntity user = activeUser("alice", "right-password", dataRoomConfig);
        user.setStatus(UserStatus.LOCKED);
        user.setLoginFailCount(3);
        user.setLoginLockedUntil(new Date(System.currentTimeMillis() - 60_000L));
        when(userService.getByAccount("alice")).thenReturn(user);
        when(userService.isLoginLockActive(user)).thenReturn(false);
        when(tokenService.createToken("alice")).thenReturn("token");

        UserController controller = newController(userService, tokenService, dataRoomConfig, captchaCache);

        Resp<String> response = controller.login(Map.of(
                "username", "alice",
                "password", RsaUtils.encryptByPublicKey("right-password", dataRoomConfig.getPublicKey()),
                "captchaKey", "captcha-key",
                "captchaCode", "abcd"
        ));

        assertEquals(200, response.getCode());
        assertEquals("token", response.getData());
        verify(userService, times(1)).recordLoginSuccess(user);
    }

    @Test
    void unlockDelegatesToUserService() {
        UserService userService = mock(UserService.class);
        UserController controller = newController(userService, mock(TokenService.class), newDataRoomConfig(), captchaCache("captcha-key", "abcd"));

        Resp<Void> response = controller.unlock("user-1");

        assertEquals(200, response.getCode());
        verify(userService, times(1)).unlock("user-1");
    }

    @Test
    void pageReturnsPageVoWithTotalAndRecords() {
        UserService userService = mock(UserService.class);
        UserController controller = newController(userService, mock(TokenService.class), newDataRoomConfig(), captchaCache("captcha-key", "abcd"));
        UserQueryDTO queryDTO = new UserQueryDTO();
        queryDTO.setCurrent(1);
        queryDTO.setSize(10);
        UserEntity user = new UserEntity();
        user.setAccount("admin");
        user.setUsername("Admin");

        PageVo<UserEntity> pageVo = new PageVo<>();
        pageVo.setCurrent(1);
        pageVo.setSize(10);
        pageVo.setTotal(12);
        pageVo.setData(List.of(user));
        when(userService.page(queryDTO)).thenReturn(pageVo);

        Resp<?> response = controller.page(queryDTO);

        assertEquals(200, response.getCode());
        PageVo<?> responsePage = assertInstanceOf(PageVo.class, response.getData());
        assertEquals(12, responsePage.getTotal());
        assertEquals(1, responsePage.getCurrent());
        assertEquals(10, responsePage.getSize());
        assertEquals(1, responsePage.getData().size());
    }

    private static DataRoomConfig newDataRoomConfig() {
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        Rsa rsa = RsaUtils.generateRsaKeyPair();
        dataRoomConfig.setPublicKey(rsa.getPublicKey());
        dataRoomConfig.setPrivateKey(rsa.getPrivateKey());
        return dataRoomConfig;
    }

    private static Cache<String, String> captchaCache(String key, String code) {
        Cache<String, String> captchaCache = Caffeine.newBuilder().build();
        captchaCache.put(key, code);
        return captchaCache;
    }

    private static UserEntity activeUser(String account, String password, DataRoomConfig dataRoomConfig) {
        UserEntity user = new UserEntity();
        user.setAccount(account);
        user.setPassword(RsaUtils.encryptByPublicKey(password, dataRoomConfig.getPublicKey()));
        user.setStatus(UserStatus.NORMAL);
        return user;
    }

    private static UserController newController(UserService userService, TokenService tokenService, DataRoomConfig dataRoomConfig, Cache<String, String> captchaCache) {
        UserController controller = new UserController();
        ReflectionTestUtils.setField(controller, "userService", userService);
        ReflectionTestUtils.setField(controller, "tokenService", tokenService);
        ReflectionTestUtils.setField(controller, "dataRoomConfig", dataRoomConfig);
        ReflectionTestUtils.setField(controller, "captchaCache", captchaCache);
        return controller;
    }
}
