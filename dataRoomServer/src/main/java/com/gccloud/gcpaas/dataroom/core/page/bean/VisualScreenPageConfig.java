package com.gccloud.gcpaas.dataroom.core.page.bean;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
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
        String globalVariableListJson = """
                [
                    {
                        "id": "4d59beb3-d386-446f-9ef1-b7e273f2c49b",
                        "name": "curDay",
                        "remark": "今日日期，格式: yyyy-MM-dd",
                        "source": "code",
                        "config": {
                            "code": "const d = new Date();\\nconst dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;\\nconsole.log(dateStr);\\nreturn dateStr"
                        }
                    },
                    {
                        "id": "2bc63350-7239-4483-b8ea-5c22484bc487",
                        "name": "teamName",
                        "remark": "团队名称",
                        "source": "static",
                        "config": {
                            "value": "GCPAAS"
                        }
                    }
                ]
                """;
        JSONArray globalVariableListConfig = JSON.parseArray(globalVariableListJson);
        setGlobalVariableList(globalVariableListConfig);
    }

    @Override
    public void compat() {

    }
}
