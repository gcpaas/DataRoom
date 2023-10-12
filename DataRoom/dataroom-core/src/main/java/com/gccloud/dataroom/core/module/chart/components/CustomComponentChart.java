package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 自定义组件
 * @author hongyang
 * @version 1.0
 * @date 2023/3/28 14:25
 */
@Data
public class CustomComponentChart extends Chart {

    @ApiModelProperty(notes = "父编码")
    private String parentCode;

    @ApiModelProperty(notes = "版本")
    private String version;

    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.CUSTOM_COMPONENT;

    @ApiModelProperty(notes = "自定义处理配置脚本")
    private String optionHandler;

    @ApiModelProperty(notes = "自定义处理数据源脚本")
    private String dataHandler;

    @ApiModelProperty(notes = "组件的构造函数分类")
    private String chartType;

    @ApiModelProperty(notes = "组件的配置，直接从g2官网复制")
    private Object option;

    @ApiModelProperty(notes = "右侧面板自定义配置")
    private List<Map<String, Object>> setting;

    @ApiModelProperty(notes = "组件类别")
    private String category;

    @Data
    public static class Setting {

        @ApiModelProperty(notes = "配置项字段")
        private String field;

        @ApiModelProperty(notes = "值")
        private Object value;
    }

}
