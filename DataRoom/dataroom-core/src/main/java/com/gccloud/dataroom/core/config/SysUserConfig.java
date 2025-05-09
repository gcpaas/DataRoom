package com.gccloud.dataroom.core.config;

import com.gccloud.dataroom.core.permission.Permission;
import com.gccloud.dataset.constant.DatasetConstant;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

/**
 * @author chen.hu
 * @date 2025/5/6 16:36
 */
@Slf4j
@Configuration
@ConfigurationProperties(prefix = "gc.starter.dataroom")
@Data
public class SysUserConfig {
    private List<User> users = new ArrayList<>();

    @Data
    public static class User {
        private String userId;
        private String username;
        private String password;
        private List<String> role;
        private List<String> permissions;
    }

    @PostConstruct
    public void init() {
        for (User user : users) {
            user.setPermissions(mapRoleToPermissions(user.getRole()));
        }
    }

    private List<String> mapRoleToPermissions(List<String> roles) {
        List<String> permissions = new ArrayList<>();
        for (String role : roles){
            switch (role) {
                case "dataRoomRead":
                    // 读权限
                    permissions.add(Permission.DataRoom.VIEW);
                    permissions.add(Permission.File.VIEW);
                    permissions.add(Permission.File.DOWNLOAD);
                    permissions.add(Permission.Component.VIEW);
                    permissions.add(Permission.Map.VIEW);
                    permissions.add(DatasetConstant.Permission.Dataset.VIEW);
                    permissions.add(DatasetConstant.Permission.Dataset.EXECUTE);
                    permissions.add(DatasetConstant.Permission.Dataset.CATEGORY_VIEW);
                    permissions.add(DatasetConstant.Permission.Dataset.LABEL_VIEW);
                    permissions.add(DatasetConstant.Permission.Datasource.TEST);
                    permissions.add(DatasetConstant.Permission.Datasource.VIEW);
                    break;
                case "dataRoomWrite":
                    // 写权限
                    permissions.add(Permission.DataRoom.ADD);
                    permissions.add(Permission.DataRoom.UPDATE);
                    permissions.add(Permission.DataRoom.DELETE);
                    permissions.add(Permission.File.UPLOAD);
                    permissions.add(Permission.File.DELETE);
                    permissions.add(Permission.Component.ADD);
                    permissions.add(Permission.Component.UPDATE);
                    permissions.add(Permission.Component.DELETE);
                    permissions.add(Permission.Map.ADD);
                    permissions.add(Permission.Map.UPDATE);
                    permissions.add(Permission.Map.DELETE);
                    permissions.add(DatasetConstant.Permission.Dataset.DELETE);
                    permissions.add(DatasetConstant.Permission.Dataset.ADD);
                    permissions.add(DatasetConstant.Permission.Dataset.UPDATE);
                    permissions.add(DatasetConstant.Permission.Dataset.CATEGORY_EDIT);
                    permissions.add(DatasetConstant.Permission.Dataset.LABEL_EDIT);
                    permissions.add(DatasetConstant.Permission.Datasource.DELETE);
                    permissions.add(DatasetConstant.Permission.Datasource.ADD);
                    permissions.add(DatasetConstant.Permission.Datasource.UPDATE);
                    break;
                default:
                    throw new IllegalArgumentException("未知角色: " + role);
            }
        }
        return permissions;
    }
}
