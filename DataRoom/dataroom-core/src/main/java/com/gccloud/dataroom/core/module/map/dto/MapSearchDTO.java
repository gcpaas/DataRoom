package com.gccloud.dataroom.core.module.map.dto;

import com.gccloud.common.dto.SearchDTO;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/8/31 14:07
 */
@Data
public class MapSearchDTO extends SearchDTO {

    @ApiModelProperty(notes = "父级地图id")
    private String parentId;

    @ApiModelProperty(notes = "层级")
    private Integer level;

    @ApiModelProperty(notes = "是否已上传")
    private Integer uploadedGeoJson;


}
