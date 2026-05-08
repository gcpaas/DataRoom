package com.gccloud.gcpaas.core.constant;

import com.baomidou.mybatisplus.annotation.IEnum;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 素材资源类型
 */
public enum ResourceType implements IEnum<String> {
    DIRECTORY("directory", "目录或文件夹"),
    IMAGE("image", "图片"),
    VIDEO("video", "视频");

    private String type;
    private String desc;

    ResourceType(String type, String desc) {
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
