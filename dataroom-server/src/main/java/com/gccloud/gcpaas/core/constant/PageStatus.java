package com.gccloud.gcpaas.core.constant;

import com.baomidou.mybatisplus.annotation.IEnum;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 页面类型
 */
public enum PageStatus implements IEnum<String> {
    DESIGN("design", "设计态"),
    PUBLISHED("published", "已发布"),
    HISTORY("history", "历史记录"),
    PREVIEW("preview", "预览"),
    SNAPSHOT("snapshot", "快照");

    private String type;
    private String desc;

    PageStatus(String type, String desc) {
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
