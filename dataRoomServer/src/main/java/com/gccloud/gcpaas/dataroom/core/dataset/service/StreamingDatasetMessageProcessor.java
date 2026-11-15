package com.gccloud.gcpaas.dataroom.core.dataset.service;

import com.alibaba.fastjson2.JSONPath;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.BaseDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.StreamingDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.WebSocketDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.StreamingDatasetMessageContext;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.script.ScriptExecutionRequest;
import com.gccloud.gcpaas.dataroom.core.script.ScriptExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 流式数据集消息处理器。
 * 订阅型数据集消息共用处理入口；WebSocket 支持 JSON 提取或脚本转换。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StreamingDatasetMessageProcessor {

    private final ObjectMapper objectMapper;
    private final ScriptExecutor scriptExecutor;

    public Object process(DatasetEntity datasetEntity, StreamingDataset streamingDataset, String message, Map<String, Object> params) {
        StreamingDatasetMessageContext context = new StreamingDatasetMessageContext();
        context.setDatasetCode(datasetEntity == null ? "" : datasetEntity.getCode());
        DatasetType datasetType = datasetEntity == null ? null : datasetEntity.getDatasetType();
        context.setDatasetType(datasetType);
        context.setMessage(message);
        context.setParams(params == null ? Map.of() : params);
        String script = streamingDataset == null ? "" : streamingDataset.getScript();
        return process(datasetEntity, streamingDataset, context, script);
    }

    public Object process(DatasetEntity datasetEntity, String message, String script, Map<String, Object> params) {
        StreamingDatasetMessageContext context = new StreamingDatasetMessageContext();
        context.setDatasetCode(datasetEntity == null ? "" : datasetEntity.getCode());
        context.setDatasetType(datasetEntity == null ? null : datasetEntity.getDatasetType());
        context.setMessage(message);
        context.setPayload(parseMessage(message));
        context.setParams(params == null ? Map.of() : params);
        return process(datasetEntity, null, context, script);
    }

    public Object process(DatasetEntity datasetEntity, StreamingDataset streamingDataset, StreamingDatasetMessageContext context) {
        String script = streamingDataset == null ? "" : streamingDataset.getScript();
        return process(datasetEntity, streamingDataset, context, script);
    }

    private Object process(DatasetEntity datasetEntity, StreamingDataset streamingDataset, StreamingDatasetMessageContext context, String script) {
        if (streamingDataset instanceof WebSocketDataset webSocketDataset) {
            String mode = webSocketDataset.getProcessingMode();
            if (StringUtils.isBlank(mode)) {
                mode = StringUtils.isNotBlank(script) ? "script" : "json";
            }
            if ("json".equals(mode)) {
                return processJsonMessage(context.getMessage(), webSocketDataset.getJsonPath());
            }
            if (!"script".equals(mode)) {
                throw new DataRoomException("不支持的 WebSocket 数据处理方式");
            }
            if (StringUtils.isBlank(script)) {
                throw new DataRoomException("请输入消息处理脚本");
            }
        }
        if (context.getPayload() == null) {
            context.setPayload(parseMessage(context.getMessage()));
        }
        if (StringUtils.isBlank(script)) {
            return context.getPayload();
        }
        Map<String, Object> bindings = new HashMap<>();
        bindings.put("context", context);
        bindings.put("message", context.getMessage());
        bindings.put("payload", context.getPayload());
        bindings.put("metadata", context.getMetadata());
        bindings.put("params", context.getParams());
        bindings.put("dataset", datasetEntity);
        BaseDataset datasetConfig = datasetEntity == null ? null : datasetEntity.getDataset();
        bindings.put("datasetConfig", datasetConfig);
        bindings.put("streamingDataset", streamingDataset);

        try {
            Object result = scriptExecutor.execute(new ScriptExecutionRequest(script, bindings));
            return normalizeScriptResult(result);
        } catch (DataRoomException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw e;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("流式数据集消息处理脚本执行失败");
        }
    }

    private Object processJsonMessage(String message, String jsonPath) {
        if (StringUtils.isBlank(message)) {
            throw new DataRoomException("WebSocket 消息不能为空，请提供有效的 JSON 数据");
        }
        Object payload;
        try {
            payload = objectMapper.readerFor(Object.class)
                    .with(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
                    .readValue(message);
        } catch (JsonProcessingException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("WebSocket 消息不是有效的 JSON 数据", e);
        }
        if (StringUtils.isBlank(jsonPath)) {
            return payload;
        }
        try {
            return JSONPath.eval(payload, jsonPath.trim());
        } catch (RuntimeException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("WebSocket JSONPath 解析失败，请检查表达式", e);
        }
    }

    private Object parseMessage(String message) {
        if (StringUtils.isBlank(message)) {
            return "";
        }
        try {
            return objectMapper.readValue(message, Object.class);
        } catch (JsonProcessingException e) {
            log.error(ExceptionUtils.getStackTrace(e));
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
                log.error(ExceptionUtils.getStackTrace(e));
                return value;
            }
        }
        return result;
    }
}
