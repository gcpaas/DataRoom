package com.gccloud.gcpaas.core.user.dto;

import com.gccloud.gcpaas.core.constant.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 用户查询参数
 */
@Data
@Schema(description = "用户查询参数")
public class UserQueryDTO {

    @Schema(description = "关键字（账号或用户名）")
    private String keyword;

    @Schema(description = "状态")
    private UserStatus status;

    @Schema(description = "当前页")
    private Integer current = 1;

    @Schema(description = "每页条数")
    private Integer size = 10;
}