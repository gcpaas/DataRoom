package com.gccloud.dataroom.core.module.dataset.dto;

import com.gccloud.dataroom.core.dto.SearchDTO;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author pan.shun
 * @since 2021/9/6 15:34
 */
@Data
public class DataSourceDto extends SearchDTO {

    @ApiModelProperty(value = "数据源名称")
    private String sourceName;

    @ApiModelProperty(value = "数据源类型")
    private String sourceType;

    @ApiModelProperty(value = "模块编码")
    private String moduleCode;
}
