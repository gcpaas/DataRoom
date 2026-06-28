package com.gccloud.gcpaas.core.shiro;

import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.constant.UserStatus;
import com.gccloud.gcpaas.dataroom.core.entity.UserEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.page.service.PageShareService;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import com.gccloud.gcpaas.dataroom.core.shiro.ShiroAuthRealm;
import com.gccloud.gcpaas.dataroom.core.shiro.ShiroAuthToken;
import com.gccloud.gcpaas.dataroom.core.user.service.TokenService;
import com.gccloud.gcpaas.dataroom.core.user.service.UserService;
import org.apache.shiro.authc.AuthenticationInfo;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ShiroAuthRealmTest {

    @Test
    void authenticationRejectsExpiredLocalUserToken() {
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
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
        String token = tokenService.createToken("expired");

        ShiroAuthRealm realm = new ShiroAuthRealm();
        ReflectionTestUtils.setField(realm, "dataRoomConfig", dataRoomConfig);
        ReflectionTestUtils.setField(realm, "userService", userService);

        assertThrows(DataRoomException.class, () -> ReflectionTestUtils.invokeMethod(realm, "doGetAuthenticationInfo", new ShiroAuthToken(token)));
    }

    @Test
    void authenticationUsesPageShareServiceForShareToken() {
        PageShareService pageShareService = mock(PageShareService.class);
        UserService userService = mock(UserService.class);
        LoginUser shareUser = new LoginUser();
        shareUser.setAccount("share");
        shareUser.setUsername("分享访问者");
        shareUser.setRole(DataRoomRole.SHARER);
        when(pageShareService.authenticateShareToken("share_abc", null)).thenReturn(shareUser);

        ShiroAuthRealm realm = new ShiroAuthRealm();
        ReflectionTestUtils.setField(realm, "pageShareService", pageShareService);
        ReflectionTestUtils.setField(realm, "userService", userService);

        AuthenticationInfo info = ReflectionTestUtils.invokeMethod(realm, "doGetAuthenticationInfo", new ShiroAuthToken("share_abc"));
        LoginUser principal = (LoginUser) info.getPrincipals().getPrimaryPrincipal();

        assertEquals(DataRoomRole.SHARER, principal.getRoleCodeList().get(0));
        verify(pageShareService).authenticateShareToken("share_abc", null);
        verify(userService, never()).getByAccount("share_abc");
    }
}
