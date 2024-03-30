package com.gccloud.dataroom.core.module.manage.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
public class RefreshConfig {

    @ApiModelProperty(notes = "组件编码")
    private String code;

    @ApiModelProperty(notes = "刷新时间，单位秒")
    private Integer time;

}