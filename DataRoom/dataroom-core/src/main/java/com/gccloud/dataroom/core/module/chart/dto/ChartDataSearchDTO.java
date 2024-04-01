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

package com.gccloud.dataroom.core.module.chart.dto;

import com.gccloud.dataroom.core.module.chart.bean.Filter;
import com.gccloud.dataroom.core.module.chart.components.datasource.DataSetDataSource;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 数据查询
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Data
public class ChartDataSearchDTO {

    @ApiModelProperty(notes = "页面编码")
    private String pageCode;

    @ApiModelProperty(notes = "图表编码")
    private String chartCode;

    @ApiModelProperty(notes = "当前页")
    private Integer current;

    @ApiModelProperty(notes = "每页记录数")
    private Integer size;

    @ApiModelProperty(notes = "数据来源")
    private DataSetDataSource dataSource;

    @ApiModelProperty(notes = "过滤条件")
    private List<Filter> filterList;

}