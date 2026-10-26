package com.gccloud.gcpaas.core.shiro;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.constant.UserStatus;
import com.gccloud.gcpaas.dataroom.core.entity.UserEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mcp.service.McpTokenService;
import com.gccloud.gcpaas.dataroom.core.page.service.PageShareService;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import com.gccloud.gcpaas.dataroom.core.shiro.ShiroAuthRealm;
import com.gccloud.gcpaas.dataroom.core.shiro.ShiroAuthToken;
import com.gccloud.gcpaas.dataroom.core.user.service.TokenService;
import com.gccloud.gcpaas.dataroom.core.user.service.UserService;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.mgt.DefaultSecurityManager;
import org.apache.shiro.mgt.DefaultSessionStorageEvaluator;
import org.apache.shiro.mgt.DefaultSubjectDAO;
import org.apache.shiro.subject.Subject;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ShiroAuthRealmTest {

    @Test
    void mcpAuthenticationReusesServiceUserForRoleAuthorizationWithoutSession() {
        McpTokenService mcpTokenService = mock(McpTokenService.class);
        LoginUser mcpUser = loginUser("mcp-user", DataRoomRole.DEVELOPER + "," + DataRoomRole.SHARER);
        when(mcpTokenService.authenticate("drmcp-valid")).thenReturn(mcpUser);
        TokenService tokenService = mock(TokenService.class);

        ShiroAuthRealm realm = realmWith(mcpTokenService, tokenService);
        DefaultSecurityManager securityManager = securityManager(realm);
        Subject subject = new Subject.Builder(securityManager).buildSubject();

        subject.login(new ShiroAuthToken("drmcp-valid", true));

        assertSame(mcpUser, subject.getPrincipal());
        assertTrue(subject.hasRole(DataRoomRole.DEVELOPER));
        assertTrue(subject.hasRole(DataRoomRole.SHARER));
        assertNull(subject.getSession(false));
        verify(mcpTokenService).authenticate("drmcp-valid");
        verifyNoInteractions(tokenService);
    }

    @Test
    void mcpAuthenticationFailureIsWrappedAndDoesNotFallBackToJwt() {
        McpTokenService mcpTokenService = mock(McpTokenService.class);
        DataRoomException failure = new DataRoomException("MCP令牌无效或已过期", 401);
        when(mcpTokenService.authenticate("drmcp-invalid")).thenThrow(failure);
        TokenService tokenService = mock(TokenService.class);
        ShiroAuthRealm realm = realmWith(mcpTokenService, tokenService);
        Logger logger = (Logger) LoggerFactory.getLogger(ShiroAuthRealm.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);

        try {
            AuthenticationException exception = assertThrows(AuthenticationException.class,
                    () -> authenticate(realm, new ShiroAuthToken("drmcp-invalid", true)));

            assertSame(failure, exception.getCause());
            assertFalse(appender.list.isEmpty());
            assertEquals(Level.ERROR, appender.list.get(0).getLevel());
            assertEquals(ExceptionUtils.getStackTrace(failure), appender.list.get(0).getMessage());
            verify(tokenService, never()).getAccountFromToken("drmcp-invalid");
        } finally {
            logger.detachAppender(appender);
        }
    }

    @Test
    void ordinaryJwtAuthenticationStillLoadsUserAndRoles() {
        DataRoomConfig dataRoomConfig = jwtConfig();
        UserService userService = mock(UserService.class);
        UserEntity user = new UserEntity();
        user.setAccount("jwt-user");
        user.setUsername("JWT用户");
        user.setStatus(UserStatus.NORMAL);
        user.setRole(DataRoomRole.MANAGER);
        when(userService.getByAccount("jwt-user")).thenReturn(user);

        TokenService tokenService = new TokenService();
        ReflectionTestUtils.setField(tokenService, "dataRoomConfig", dataRoomConfig);
        tokenService.init();
        String token = tokenService.createToken("jwt-user");

        ShiroAuthRealm realm = new ShiroAuthRealm();
        ReflectionTestUtils.setField(realm, "dataRoomConfig", dataRoomConfig);
        ReflectionTestUtils.setField(realm, "userService", userService);
        ReflectionTestUtils.setField(realm, "tokenService", tokenService);
        ReflectionTestUtils.setField(realm, "mcpTokenService", mock(McpTokenService.class));

        AuthenticationInfo info = authenticate(realm, new ShiroAuthToken(token));
        LoginUser principal = (LoginUser) info.getPrincipals().getPrimaryPrincipal();
        AuthorizationInfo authorizationInfo = ReflectionTestUtils.invokeMethod(
                realm, "doGetAuthorizationInfo", info.getPrincipals());

        assertEquals("jwt-user", principal.getAccount());
        assertEquals(Set.of(DataRoomRole.MANAGER), authorizationInfo.getRoles());
        verify(userService).getByAccount("jwt-user");
    }

    @Test
    void authenticationRejectsExpiredLocalUserToken() {
        DataRoomConfig dataRoomConfig = jwtConfig();
        UserService userService = mock(UserService.class);

        UserEntity user = new UserEntity();
        user.setAccount("expired");
        user.setUsername("过期用户");
        user.setStatus(UserStatus.NORMAL);
        user.setRole("developer");
        user.setExpireDate(new Date(System.currentTimeMillis() - 1000L));
        when(userService.getByAccount("expired")).thenReturn(user);

        TokenService tokenService = new TokenService();
        ReflectionTestUtils.setField(tokenService, "dataRoomConfig", dataRoomConfig);
        tokenService.init();
        String token = tokenService.createToken("expired");

        ShiroAuthRealm realm = new ShiroAuthRealm();
        ReflectionTestUtils.setField(realm, "dataRoomConfig", dataRoomConfig);
        ReflectionTestUtils.setField(realm, "userService", userService);
        ReflectionTestUtils.setField(realm, "tokenService", tokenService);
        ReflectionTestUtils.setField(realm, "mcpTokenService", mock(McpTokenService.class));

        assertThrows(DataRoomException.class, () -> authenticate(realm, new ShiroAuthToken(token)));
    }

    @Test
    void authenticationUsesPageShareServiceForShareToken() {
        PageShareService pageShareService = mock(PageShareService.class);
        UserService userService = mock(UserService.class);
        LoginUser shareUser = loginUser("share", DataRoomRole.SHARER);
        when(pageShareService.authenticateShareToken("share_abc", null)).thenReturn(shareUser);

        ShiroAuthRealm realm = new ShiroAuthRealm();
        ReflectionTestUtils.setField(realm, "pageShareService", pageShareService);
        ReflectionTestUtils.setField(realm, "userService", userService);
        ReflectionTestUtils.setField(realm, "mcpTokenService", mock(McpTokenService.class));

        AuthenticationInfo info = authenticate(realm, new ShiroAuthToken("share_abc"));
        LoginUser principal = (LoginUser) info.getPrincipals().getPrimaryPrincipal();

        assertEquals(DataRoomRole.SHARER, principal.getRoleCodeList().get(0));
        verify(pageShareService).authenticateShareToken("share_abc", null);
        verify(userService, never()).getByAccount("share_abc");
    }

    private static ShiroAuthRealm realmWith(McpTokenService mcpTokenService, TokenService tokenService) {
        ShiroAuthRealm realm = new ShiroAuthRealm();
        ReflectionTestUtils.setField(realm, "mcpTokenService", mcpTokenService);
        ReflectionTestUtils.setField(realm, "tokenService", tokenService);
        return realm;
    }

    private static AuthenticationInfo authenticate(ShiroAuthRealm realm, AuthenticationToken token) {
        return ReflectionTestUtils.invokeMethod(realm, "doGetAuthenticationInfo", token);
    }

    private static DefaultSecurityManager securityManager(ShiroAuthRealm realm) {
        DefaultSecurityManager securityManager = new DefaultSecurityManager(realm);
        DefaultSubjectDAO subjectDAO = (DefaultSubjectDAO) securityManager.getSubjectDAO();
        DefaultSessionStorageEvaluator evaluator = new DefaultSessionStorageEvaluator();
        evaluator.setSessionStorageEnabled(false);
        subjectDAO.setSessionStorageEvaluator(evaluator);
        return securityManager;
    }

    private static LoginUser loginUser(String account, String role) {
        LoginUser user = new LoginUser();
        user.setAccount(account);
        user.setRole(role);
        return user;
    }

    private static DataRoomConfig jwtConfig() {
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        dataRoomConfig.getJwt().setIssuer("dataroom-test");
        dataRoomConfig.getJwt().setSecret("MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=");
        return dataRoomConfig;
    }
}
