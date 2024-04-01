package com.gccloud.dataroom.core.module.biz.component.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.gccloud.common.utils.EmptyAsNullDeserializer;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.biz.component.entity.BizComponentEntity;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/5 11:41
 */
@Data
public class BizComponentDTO extends BizComponentEntity {

    @JsonDeserialize(using = EmptyAsNullDeserializer.class)
    @ApiModelProperty(notes = "主键")
    private String id;

    @ApiModelProperty(notes = "低代码组合的组件配置信息")
    private BasePageDTO config;
}
