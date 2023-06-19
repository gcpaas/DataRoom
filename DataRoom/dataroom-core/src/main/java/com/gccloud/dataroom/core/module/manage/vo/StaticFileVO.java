package com.gccloud.dataroom.core.module.manage.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/21 9:34
 */
@Data
public class StaticFileVO {

    @ApiModelProperty(notes = "静态字段名称")
    private String name;

    @ApiModelProperty(notes = "静态资源地址")
    private String url;

}
