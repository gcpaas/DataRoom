package com.gccloud.gcpaas.dataroom.core.mcp.bean;

import com.gccloud.gcpaas.dataroom.core.entity.McpTokenEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
public class McpTokenCreatedVo extends McpTokenEntity {

    @Schema(description = "仅创建成功时返回一次的明文令牌，请妥善保存")
    private String token;
}
