package com.gccloud.gcpaas.dataroom.core.entity;

import com.alibaba.fastjson2.annotation.JSONField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.ToString;

import java.util.Date;

@Data
@ToString(onlyExplicitlyIncluded = true)
@TableName("dr_mcp_token")
@Schema(description = "个人MCP令牌")
public class McpTokenEntity {

    @TableId(type = IdType.ASSIGN_ID)
    @ToString.Include
    private String id;

    private String name;

    private String tokenPrefix;

    private Date expireTime;

    private Date createDate;

    @JsonIgnore
    @JSONField(serialize = false, deserialize = false)
    @Schema(hidden = true)
    private String tokenHash;

    @JsonIgnore
    @JSONField(serialize = false, deserialize = false)
    @Schema(hidden = true)
    private String userId;

    @JsonIgnore
    @JSONField(serialize = false, deserialize = false)
    @Schema(hidden = true)
    private String tenantCode;

    @JsonIgnore
    @JSONField(serialize = false, deserialize = false)
    @Schema(hidden = true)
    @TableLogic(value = "0", delval = "1")
    private String delFlag = "0";
}
