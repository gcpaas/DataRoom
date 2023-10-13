package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Date;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 16:44
 */
@Data
public class ScreenTimeCountDownChart extends Chart {
    /**
     * 描述
     */
    @ApiModelProperty(notes = "描述")
    private String title;
    /**
     * 以结束时间进行倒计时
     */
    @ApiModelProperty(notes = "结束时间")
    private Date endTime;

    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.TIME_COUNT_DOWN;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @ApiModelProperty(notes = "日期格式")
    private String dateFormat;

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "字体大小")
        private Integer fontSize = 14;

        @ApiModelProperty(notes = "字体权重")
        private Integer fontWeight = 700;

        @ApiModelProperty(notes = "字体颜色")
        private String color;

        @ApiModelProperty(notes = "字体")
        private String fontFamily;

    }


}
