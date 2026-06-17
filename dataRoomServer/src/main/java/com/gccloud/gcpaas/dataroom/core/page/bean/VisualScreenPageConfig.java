package com.gccloud.gcpaas.dataroom.core.page.bean;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import lombok.Data;

@Data
public class VisualScreenPageConfig extends BasePageConfig {

    @Override
    public void init() {
        String basicConfigJson = """
                {
                    "background": {
                        "fill": "color",
                        "color": "#0F172A",
                        "url": "",
                        "opacity": 1,
                        "repeat": "no-repeat"
                    }
                }
                """;
        JSONObject basicConfig = JSON.parseObject(basicConfigJson);
        setBasicConfig(basicConfig);
    }

    @Override
    public void compat() {

    }
}
