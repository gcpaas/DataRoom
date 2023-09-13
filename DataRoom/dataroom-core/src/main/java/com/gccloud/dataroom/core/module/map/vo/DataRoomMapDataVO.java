package com.gccloud.dataroom.core.module.map.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/9/4 17:16
 */
@Data
public class DataRoomMapDataVO {

    @ApiModelProperty(notes = "主键")
    private String id;

    @ApiModelProperty(notes = "geo地图数据json")
    private String geoJson;

    @ApiModelProperty(notes = "是否可用")
    private Integer available;

}
