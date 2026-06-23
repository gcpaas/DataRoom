package com.gccloud.gcpaas.dataroom.core.dataset.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.BaseDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.StreamingDataset;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 流式数据集消息处理器。
 * WebSocket、MQTT、Kafka 等订阅型数据集收到原始消息后统一通过这里执行脚本转换。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StreamingDatasetMessageProcessor {

    private final ObjectMapper objectMapper;

    public Object process(DatasetEntity datasetEntity, StreamingDataset streamingDataset, String message, Map<String, Object> params) {
        String script = streamingDataset == null ? "" : streamingDataset.getScript();
        return process(datasetEntity, message, script, params);
    }

    public Object process(DatasetEntity datasetEntity, String message, String script, Map<String, Object> params) {
        Object payload = parseMessage(message);
        if (StringUtils.isBlank(script)) {
            return payload;
        }

        Binding binding = new Binding();
        binding.setVariable("message", message);
        binding.setVariable("payload", payload);
        binding.setVariable("params", params);
        binding.setVariable("dataset", datasetEntity);
        BaseDataset datasetConfig = datasetEntity == null ? null : datasetEntity.getDataset();
        binding.setVariable("datasetConfig", datasetConfig);

        try {
            Object result = new GroovyShell(binding).evaluate(script);
            return normalizeScriptResult(result);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("流式数据集消息处理脚本执行失败");
        }
    }

    private Object parseMessage(String message) {
        if (StringUtils.isBlank(message)) {
            return "";
        }
        try {
            return objectMapper.readValue(message, Object.class);
        } catch (JsonProcessingException e) {
            return message;
        }
    }

    private Object normalizeScriptResult(Object result) {
        if (result instanceof CharSequence text) {
            String value = text.toString();
            if (StringUtils.isBlank(value)) {
                return value;
            }
            try {
                return objectMapper.readValue(value, Object.class);
            } catch (JsonProcessingException e) {
                return value;
            }
        }
        return result;
    }
}
