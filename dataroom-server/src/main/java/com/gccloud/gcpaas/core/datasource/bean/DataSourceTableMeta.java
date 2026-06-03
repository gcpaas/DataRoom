package com.gccloud.gcpaas.core.datasource.bean;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 数据源表元数据
 */
@Data
@Schema(description = "数据源表元数据")
public class DataSourceTableMeta {

    @Schema(description = "表名称")
    private String name;

    @Schema(description = "表类型")
    private String type;

    @Schema(description = "表备注")
    private String comment;
}
