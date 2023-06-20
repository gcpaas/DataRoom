package com.gccloud.dataroom.core.module.biz.component.dto;

import com.gccloud.common.dto.SearchDTO;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/5 11:41
 */
@Data
public class BizComponentSearchDTO extends SearchDTO {

    @ApiModelProperty(value = "所属分组")
    private String type;

    @ApiModelProperty(value = "名称")
    private String name;
}
