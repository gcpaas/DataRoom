package com.gccloud.gcpaas.dataroom.core.datasource.bean;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 数据源字段元数据
 */
@Data
@Schema(description = "数据源字段元数据")
public class DataSourceColumnMeta {

    @Schema(description = "字段名称")
    private String name;

    @Schema(description = "字段类型")
    private String type;

    @Schema(description = "字段备注")
    private String comment;
}
