package com.gccloud.dataroom.core.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsonorg.JSONArraySerializer;
import com.fasterxml.jackson.datatype.jsonorg.JsonOrgModule;
import com.gccloud.dataroom.core.constant.DataRoomConst;
import lombok.extern.slf4j.Slf4j;
import oracle.sql.CLOB;
import org.json.JSONArray;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;

/**
 * Jackson配置类
 * @Author hongyang
 * @Date 2022/06/19
 * @Version 1.0.0
 */
@Slf4j
@Configuration
@ConditionalOnMissingClass(value = "com.gccloud.dashboard.core.config.ObjectMapperConfiguration")
@ConditionalOnProperty(prefix = "gc.starter.dataroom.component", name = "ObjectMapperConfiguration", havingValue = "ObjectMapperConfiguration", matchIfMissing = true)
public class DataRoomObjectMapperConfiguration {

    @Resource
    private ObjectMapper objectMapper;

    @PostConstruct
    public void init() {
        log.info(DataRoomConst.Console.LINE);
        log.info("注册 Jackson JsonOrgModule 模块");
        // 不注册该模块会导致 @RequestBody 为 JSONObject 时属性无法填充
        JsonOrgModule jsonOrgModule = new JsonOrgModule();
        objectMapper.registerModule(jsonOrgModule);
        SimpleModule simpleModule = new SimpleModule();
        // 解决 接口响应中包含JSONObject 或 JSONArray时, 序列化失败，变成{empty: false} 的问题
        simpleModule.addSerializer(JSONArray.class, JSONArraySerializer.instance);
        simpleModule.addSerializer(CLOB.class, new OracleClobSerializer());
        objectMapper.registerModule(simpleModule);

        log.info(DataRoomConst.Console.LINE);
    }
}
