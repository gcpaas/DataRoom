package com.gccloud.dataroom.core.module.map.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/9/4 17:16
 */
@Data
public class DataRoomMapVO {

    @ApiModelProperty(notes = "主键")
    private String id;

    @ApiModelProperty(notes = "父级编码")
    private String parentId;

    @ApiModelProperty(notes = "地图编码")
    private String mapCode;

    @ApiModelProperty(notes = "地图名称")
    private String name;

    @ApiModelProperty(notes = "地图级别 0-世界 1-国家 2-省 3-市 4-区县")
    private Integer level;

    @ApiModelProperty(notes = "geo地图数据json")
    private String geoJson;

    @ApiModelProperty(notes = "是否已上传geoJson 0-否 1-是")
    private Integer uploadedGeoJson;

    @ApiModelProperty(notes = "是否有子节点")
    private Boolean hasChildren;

    @ApiModelProperty(notes = "子级")
    private List<DataRoomMapVO> children;

    @ApiModelProperty(notes = "是否禁用")
    private Boolean disabled;

}
