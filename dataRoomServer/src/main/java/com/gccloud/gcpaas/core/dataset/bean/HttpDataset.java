package com.gccloud.gcpaas.core.dataset.bean;

import com.gccloud.gcpaas.core.bean.KeyVal;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema
public class HttpDataset extends BaseDataset {

    @Schema(description = "请求地址")
    private String url;

    @Schema(description = "请求方法")
    private String method;

    @Schema(description = "请求头")
    private List<KeyVal> headerList;

    @Schema(description = "请求体")
    private String body;

    @Schema(description = "响应参数路径解析，参考jsonpath语法")
    private String respJsonPath;
}
