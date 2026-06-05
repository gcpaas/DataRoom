package com.gccloud.gcpaas.core.user.service;

import com.gccloud.gcpaas.core.constant.UserStatus;
import com.gccloud.gcpaas.core.entity.UserEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.user.dto.UserDTO;
import org.junit.jupiter.api.Test;

import java.io.Serializable;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserServiceLoginSecurityTest {

    @Test
    void recordLoginFailureLocksUserOnThirdConsecutivePasswordFailure() {
        Date now = new Date(1_000_000L);
        TestUserService userService = new TestUserService(now);
        UserEntity user = user("1", UserStatus.NORMAL);
        user.setLoginFailCount(2);

        userService.recordLoginFailure(user);

        assertEquals(UserStatus.LOCKED, user.getStatus());
        assertEquals(3, user.getLoginFailCount());
        assertEquals(new Date(now.getTime() + TimeUnit.MINUTES.toMillis(10)), user.getLoginLockedUntil());
        assertEquals(user, userService.updatedUser);
    }

    @Test
    void recordLoginFailureExtendsLockWhenRetryAfterWindowStillUsesWrongPassword() {
        Date now = new Date(2_000_000L);
        TestUserService userService = new TestUserService(now);
        UserEntity user = user("1", UserStatus.LOCKED);
        user.setLoginFailCount(3);
        user.setLoginLockedUntil(new Date(now.getTime() - 1_000L));

        userService.recordLoginFailure(user);

        assertEquals(UserStatus.LOCKED, user.getStatus());
        assertEquals(3, user.getLoginFailCount());
        assertEquals(new Date(now.getTime() + TimeUnit.MINUTES.toMillis(10)), user.getLoginLockedUntil());
        assertEquals(user, userService.updatedUser);
    }

    @Test
    void recordLoginSuccessRestoresLockedUserToNormalAndClearsLoginFailureState() {
        TestUserService userService = new TestUserService(new Date(3_000_000L));
        UserEntity user = user("1", UserStatus.LOCKED);
        user.setLoginFailCount(3);
        user.setLoginLockedUntil(new Date(4_000_000L));

        userService.recordLoginSuccess(user);

        assertEquals(UserStatus.NORMAL, user.getStatus());
        assertEquals(0, user.getLoginFailCount());
        assertNull(user.getLoginLockedUntil());
        assertEquals(user, userService.updatedUser);
    }

    @Test
    void unlockOnlyAllowsLockedUsersToReturnToNormal() {
        TestUserService userService = new TestUserService(new Date(4_000_000L));
        UserEntity user = user("1", UserStatus.DISABLED);
        userService.user = user;

        DataRoomException exception = assertThrows(DataRoomException.class, () -> userService.unlock("1"));

        assertEquals("只有锁定用户才能解锁", exception.getMessage());
        assertNull(userService.updatedUser);
    }

    @Test
    void unlockRestoresLockedUserToNormalAndClearsLoginFailureState() {
        TestUserService userService = new TestUserService(new Date(5_000_000L));
        UserEntity user = user("1", UserStatus.LOCKED);
        user.setLoginFailCount(3);
        user.setLoginLockedUntil(new Date(6_000_000L));
        userService.user = user;

        userService.unlock("1");

        assertEquals(UserStatus.NORMAL, user.getStatus());
        assertEquals(0, user.getLoginFailCount());
        assertNull(user.getLoginLockedUntil());
        assertEquals(user, userService.updatedUser);
    }

    @Test
    void updateRejectsChangingDisabledUserDirectlyBackToNormal() {
        TestUserService userService = new TestUserService(new Date(7_000_000L));
        UserEntity user = user("1", UserStatus.DISABLED);
        userService.user = user;
        UserDTO dto = new UserDTO();
        dto.setId("1");
        dto.setStatus(UserStatus.NORMAL);

        DataRoomException exception = assertThrows(DataRoomException.class, () -> userService.update(dto));

        assertEquals("只有锁定用户才能恢复为正常状态", exception.getMessage());
        assertNull(userService.updatedUser);
    }

    @Test
    void updateAllowsChangingLockedUserDirectlyBackToNormal() {
        TestUserService userService = new TestUserService(new Date(8_000_000L));
        UserEntity user = user("1", UserStatus.LOCKED);
        user.setLoginFailCount(3);
        user.setLoginLockedUntil(new Date(9_000_000L));
        userService.user = user;
        UserDTO dto = new UserDTO();
        dto.setId("1");
        dto.setStatus(UserStatus.NORMAL);

        userService.update(dto);

        assertEquals(UserStatus.NORMAL, user.getStatus());
        assertEquals(0, user.getLoginFailCount());
        assertNull(user.getLoginLockedUntil());
        assertEquals(user, userService.updatedUser);
    }

    @Test
    void activeLoginLockExpiresOnlyAfterLockedUntilPasses() {
        Date now = new Date(10_000_000L);
        TestUserService userService = new TestUserService(now);
        UserEntity user = user("1", UserStatus.LOCKED);
        user.setLoginLockedUntil(new Date(now.getTime() + 1L));

        assertTrue(userService.isLoginLockActive(user));
    }

    private static UserEntity user(String id, UserStatus status) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setAccount("alice");
        user.setUsername("Alice");
        user.setStatus(status);
        return user;
    }

    private static class TestUserService extends UserService {
        private final Date now;
        private UserEntity user;
        private UserEntity updatedUser;

        private TestUserService(Date now) {
            this.now = now;
        }

        @Override
        protected Date now() {
            return now;
        }

        @Override
        public UserEntity getById(Serializable id) {
            return user;
        }

        @Override
        public boolean updateById(UserEntity entity) {
            updatedUser = entity;
            return true;
        }
    }
}
