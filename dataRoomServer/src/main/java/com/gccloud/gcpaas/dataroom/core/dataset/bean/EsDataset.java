package com.gccloud.gcpaas.dataroom.core.dataset.bean;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * Elasticsearch API 查询数据集
 */
@Data
@Schema
public class EsDataset extends BaseDataset {

    @Schema(description = "ES查询路径，如：/index/_search")
    private String path;

    @Schema(description = "请求方法")
    private String method;

    @Schema(description = "ES查询报文")
    private String body;

    @Schema(description = "响应参数路径解析，参考jsonpath语法")
    private String respJsonPath;
}
