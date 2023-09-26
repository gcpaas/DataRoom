package com.gccloud.dataroom.core.module.map.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/9/7 16:14
 */
@Data
public class DataRoomMapRepeatDTO {

    @ApiModelProperty(notes = "主键")
    private String id;

    @ApiModelProperty(notes = "父级地图id")
    private String parentId;

    @ApiModelProperty(notes = "地图编码")
    private String mapCode;

    @ApiModelProperty(notes = "地图名称")
    private String mapName;
}
