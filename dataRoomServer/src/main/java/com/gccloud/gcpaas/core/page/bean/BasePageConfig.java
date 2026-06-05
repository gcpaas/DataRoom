package com.gccloud.gcpaas.core.page.bean;

import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.gccloud.gcpaas.core.constant.PageType;
import lombok.Data;

@Data
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "pageType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = DirectoryPageConfig.class, name = PageType.DIRECTORY_TYPE),
        @JsonSubTypes.Type(value = VisualScreenPageConfig.class, name = PageType.VISUAL_SCREEN_TYPE),
        @JsonSubTypes.Type(value = PageConfig.class, name = PageType.PAGE_TYPE)
})
public abstract class BasePageConfig {
    /**
     * 页面基础配置
     */
    private JSONObject basicConfig = new JSONObject();
    /**
     * 全局变量
     */
    private JSONArray globalVariableList = new JSONArray();
    /**
     * 图表列表
     */
    private JSONArray chartList = new JSONArray();

    /**
     * 初始化默认配置
     */
    public abstract void init();

    /**
     * 兼容操作
     */
    public abstract void compat();
}
