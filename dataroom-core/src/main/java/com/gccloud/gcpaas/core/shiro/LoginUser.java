package com.gccloud.gcpaas.core.shiro;

import com.gccloud.gcpaas.core.entity.UserEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Map;

/**
 * 当前登录的用户
 */
@Data
public class LoginUser extends UserEntity {

    @Schema(description = "扩展属性")
    private Map<String, Object> extProps;
}
