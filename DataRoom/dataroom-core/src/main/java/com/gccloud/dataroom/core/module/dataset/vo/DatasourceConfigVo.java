package com.gccloud.dataroom.core.module.dataset.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 数据源列表Vo
 *
 * @author YB
 * @date 2022/09/14
 */
@Data
public class DatasourceConfigVo {
    @ApiModelProperty(value = "数据源ID")
    private String id;

    @ApiModelProperty(value = "数据源名称 ")
    private String sourceName;

    @ApiModelProperty(value = "数据源类型")
    private String sourceType;
}
