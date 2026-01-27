package com.gccloud.gcpaas.core.constant;

import com.baomidou.mybatisplus.annotation.IEnum;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 页面类型
 */
public enum PageType implements IEnum<String> {
    DIRECTORY("directory", "目录或文件夹"),
    VISUAL_SCREEN("visualScreen", "虚拟大屏"),
    PAGE("page", "页面");

    public static final String DIRECTORY_TYPE = "directory";
    public static final String VISUAL_SCREEN_TYPE = "visualScreen";
    public static final String PAGE_TYPE = "page";

    private String type;
    private String desc;

    PageType(String type, String desc) {
        this.type = type;
        this.desc = desc;
    }

    @JsonValue
    public String getType() {
        return type;
    }

    @Override
    public String getValue() {
        return type;
    }
}
