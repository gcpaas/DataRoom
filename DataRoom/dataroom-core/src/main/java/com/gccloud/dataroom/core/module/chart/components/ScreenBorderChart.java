package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * 边框图表
 * @author hongyang
 * @version 1.0
 * @date 2023/3/16 10:29
 */
@Data
public class ScreenBorderChart extends Chart {

    @ApiModelProperty(notes = "个性化配置")
    private Map<String, Object> customize = new HashMap<>();


}
