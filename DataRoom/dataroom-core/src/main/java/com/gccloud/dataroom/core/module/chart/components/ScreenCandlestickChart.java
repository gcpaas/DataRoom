package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Map;

/**
 * 文本
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 16:44
 */
@Data
public class ScreenCandlestickChart extends Chart {
    
    @ApiModelProperty(notes = "组件类型")
    private String type = PageDesignConstant.BigScreen.Type.K_LINE;

    @ApiModelProperty(notes = "个性化")
    private Map<String, Object> customize;


}
