package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 自定义html
 * @author hongyang
 * @version 1.0
 * @date 2023/3/16 16:44
 */
@Data
public class ScreenCustomHtmlChart extends Chart {

    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.CUSTOM_HTML;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();


    @Data
    public static class Customize {

        @ApiModelProperty(notes = "自定义html")
        private String htmlStr;
    }
}
