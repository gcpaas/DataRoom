package com.gccloud.gcpaas.core.user.service;

import com.gccloud.gcpaas.dataroom.core.entity.UserEntity;
import com.gccloud.gcpaas.dataroom.core.user.service.UserService;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserServiceTest {

    @Test
    void isExpiredTreatsBlankExpireDateAsPermanent() {
        UserEntity user = new UserEntity();
        user.setExpireDate(null);

        assertFalse(UserService.isExpired(user));
    }

    @Test
    void isExpiredTreatsPastAndCurrentExpireDateAsExpired() {
        UserEntity pastUser = new UserEntity();
        pastUser.setExpireDate(new Date(System.currentTimeMillis() - 1000L));
        UserEntity currentUser = new UserEntity();
        currentUser.setExpireDate(new Date());

        assertTrue(UserService.isExpired(pastUser));
        assertTrue(UserService.isExpired(currentUser));
    }

    @Test
    void isExpiredTreatsFutureExpireDateAsValid() {
        UserEntity user = new UserEntity();
        user.setExpireDate(new Date(System.currentTimeMillis() + 60_000L));

        assertFalse(UserService.isExpired(user));
    }
}
