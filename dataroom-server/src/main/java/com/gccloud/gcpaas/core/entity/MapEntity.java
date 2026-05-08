package com.gccloud.gcpaas.core.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Schema
@Accessors(chain = true)
@TableName("dr_map")
public class MapEntity extends BaseEntity {

    @Schema(description = "地图名称")
    private String name;

    /**
     * 唯一编码
     */
    @TableField(updateStrategy = FieldStrategy.NEVER)
    @Schema(description = "编码")
    private String code;

    @Schema(description = "父级地图编码")
    private String parentCode;

    @Schema(description = "地图级别 0-世界 1-国家 2-省 3-市 4-区县")
    private Integer level;

    @Schema(description = "geo地图数据json")
    private String geoJson;

    @Schema(description = "是否已上传geoJson 0-否 1-是")
    private Integer uploadedGeoJson;
}