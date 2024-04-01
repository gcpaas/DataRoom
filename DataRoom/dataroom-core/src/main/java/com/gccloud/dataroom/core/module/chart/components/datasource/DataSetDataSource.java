/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.gccloud.dataroom.core.module.chart.components.datasource;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * @author hongyang
 * @version 1.0
 * @date 2022/11/19 10:45
 */
@Data
public class DataSetDataSource {

    @ApiModelProperty(notes = "数据来源，可能为数据集或者表达式")
    private String source;

    @ApiModelProperty(notes = "数据集标识")
    private String businessKey;

    @ApiModelProperty(notes = "数据源标识")
    private String dataSourceKey;

    @ApiModelProperty(notes = "数据集类型")
    private String dataSetType;

    @ApiModelProperty(notes = "数据集参数")
    private HashMap<String, Object> params;

    @ApiModelProperty(notes = "x轴维度字段")
    private String dimensionField;

    @ApiModelProperty(notes = "y轴指标字段")
    private String metricField;

    @ApiModelProperty(notes = "拆分字段")
    private String classifiedField;

    @ApiModelProperty(notes = "服务端分页")
    private Boolean serverPagination;

    public DataSetDataSource() {
    }


    public DataSetDataSource(Map<String, Object> map) {
        this.businessKey = (String) map.get("businessKey");
        this.dataSourceKey = (String) map.get("dataSourceKey");
        this.dataSetType = (String) map.get("dataSetType");
        this.params = (HashMap<String, Object>) map.get("params");
        this.dimensionField = (String) map.get("dimensionField");
        this.metricField = (String) map.get("metricField");
        this.classifiedField = (String) map.get("groupField");
    }
}