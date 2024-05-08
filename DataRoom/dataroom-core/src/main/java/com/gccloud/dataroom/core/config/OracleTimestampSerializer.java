package com.gccloud.dataroom.core.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import lombok.extern.slf4j.Slf4j;
import oracle.sql.TIMESTAMP;
import org.apache.commons.lang3.exception.ExceptionUtils;

import java.io.IOException;

/**
 * 解决oracle TIMESTAMP类型返回序列化问题
 * @author hongyang
 * @version 1.0
 * @date 2024/05/07 10:30
 */
@Slf4j
public class OracleTimestampSerializer extends JsonSerializer<TIMESTAMP> {

    @Override
    public void serialize(TIMESTAMP timestamp, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        jsonGenerator.writeString(timestampToString(timestamp));
    }

    /**
     * timestamp字段处理
     *
     * @param timestamp
     * @return
     */
    public static String timestampToString(TIMESTAMP timestamp) {
        String content = "";
        try {
          // 转为日期格式
            content = timestamp.stringValue();
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return content;
    }
}
