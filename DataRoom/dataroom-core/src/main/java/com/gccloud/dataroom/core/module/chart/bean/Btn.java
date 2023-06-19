package com.gccloud.dataroom.core.module.chart.bean;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.HashMap;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/1/11 15:20
 */
@Data
public class Btn {

    @ApiModelProperty(notes = "按钮名称")
    private String name;

    @ApiModelProperty(notes = "按钮标签")
    private String remark;

    @ApiModelProperty(notes = "按钮类型")
    private String type;

    @ApiModelProperty(notes = "折叠到更多")
    private boolean isPackUp = false;

    @ApiModelProperty(notes = "按钮动作")
    private Action action;

    @ApiModelProperty(notes = "按钮是否可用")
    private boolean enable;

    @ApiModelProperty(notes = "按钮自定义属性")
    private Attribute customize;

    @ApiModelProperty(notes = "列点击绑定列")
    private String columnCode;


    @Data
    public static class Action {

        @ApiModelProperty(notes = "动作类型")
        private String type;

        @ApiModelProperty(notes = "动作脚本")
        private String script;

        @ApiModelProperty(notes = "打开页面类型的配置")
        private HashMap<String, Object> page;

        @ApiModelProperty(notes = "打开表单类型的配置")
        private HashMap<String, Object> form;

        @ApiModelProperty(notes = "组件能力类型的配置")
        private HashMap<String, Object> component;

        @ApiModelProperty(notes = "javascript类型的配置")
        private HashMap<String, Object> js;

    }

    @Data
    private static class Attribute {

        @ApiModelProperty(notes = "按钮图标")
        private String icon;

        @ApiModelProperty(notes = "按钮颜色")
        private String style;

        @ApiModelProperty(notes = "按钮大小")
        private String size;
    }


}
