package com.gccloud.gcpaas.core.page.bean;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
@Data
public class PageConfig extends BasePageConfig {

    @Override
    public void init() {

    }

    @Override
    public void compat() {
        // 默认配置模板，用于补充 currentConfig 中缺失的属性，新增的默认属性要在这里定义
        String basicConfigJson = """
                {
                    "background": {
                        "fill": "color",
                        "color": "",
                        "url": "",
                        "opacity": 1,
                        "repeat": "no-repeat"
                     }
                }
                """;
        JSONObject templateConfig = JSON.parseObject(basicConfigJson);
        JSONObject currentConfig = getBasicConfig();
        if (currentConfig == null || currentConfig.isEmpty()) {
            setBasicConfig(templateConfig);
            return;
        }
        supplementConfig(templateConfig, currentConfig);
        setBasicConfig(currentConfig);
    }

    /**
     * 递归补充配置对象中缺失的属性（以 current 为准，仅补充缺失项）
     *
     * @param template 模板配置（提供默认值）
     * @param current  当前配置（会被直接修改，补充缺失属性）
     */
    private void supplementConfig(JSONObject template, JSONObject current) {
        if (template == null || current == null) {
            return;
        }
        for (String key : template.keySet()) {
            Object templateValue = template.get(key);
            if (current.containsKey(key)) {
                Object currentValue = current.get(key);
                // 如果两者都是对象类型，递归补充
                if (isJsonObjectOrMap(templateValue) && isJsonObjectOrMap(currentValue)) {
                    JSONObject templateJsonObj = toJsonObject(templateValue);
                    JSONObject currentJsonObj = toJsonObject(currentValue);
                    // 递归补充嵌套对象
                    supplementConfig(templateJsonObj, currentJsonObj);
                    // 如果 currentValue 原本是 Map 类型，需要更新回去
                    current.put(key, currentJsonObj);
                }
                // 如果不是对象类型，保持 current 的值不变
            } else {
                // current 中不存在该 key，从模板补充
                current.put(key, templateValue);
            }
        }
    }

    /**
     * 判断对象是否为 JSONObject 或 Map 类型
     */
    private boolean isJsonObjectOrMap(Object obj) {
        return obj instanceof JSONObject || obj instanceof Map;
    }

    /**
     * 将对象转换为 JSONObject
     */
    private JSONObject toJsonObject(Object obj) {
        if (obj instanceof JSONObject) {
            return (JSONObject) obj;
        } else if (obj instanceof Map) {
            return new JSONObject((Map<String, Object>) obj);
        }
        return new JSONObject();
    }
}
