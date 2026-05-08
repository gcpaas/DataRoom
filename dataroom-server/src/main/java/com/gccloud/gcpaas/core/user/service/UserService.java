package com.gccloud.gcpaas.core.user.service;

import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.entity.UserEntity;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class UserService {

    @Resource
    private DataRoomConfig dataRoomConfig;

    /**
     * 根据用户名查询用户信息
     *
     * @param username
     * @return
     */
    public UserEntity getByUsername(String username) {
        List<UserEntity> userList = dataRoomConfig.getUserList();
        for (UserEntity user : userList) {
            if (user.getUsername().equals(username)) {
                return user;
            }
        }
        return null;
    }
}
