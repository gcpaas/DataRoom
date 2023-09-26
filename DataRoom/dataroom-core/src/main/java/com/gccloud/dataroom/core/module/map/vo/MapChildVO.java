package com.gccloud.dataroom.core.module.map.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/8/31 16:13
 */
@Data
public class MapChildVO {

    @ApiModelProperty(notes = "地图名称")
    private String name;

    @ApiModelProperty(notes = "是否已存在")
    private Boolean exist;

    @ApiModelProperty(notes = "已存在的地图id")
    private String existId;

}
