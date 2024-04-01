package com.gccloud.dataroom.core.module.biz.component.vo;

import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.biz.component.entity.BizComponentEntity;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2024/3/22 14:47
 */
@Data
public class BizComponentVO extends BizComponentEntity {

    @ApiModelProperty(notes = "低代码组合的组件配置信息")
    private BasePageDTO config;

}
