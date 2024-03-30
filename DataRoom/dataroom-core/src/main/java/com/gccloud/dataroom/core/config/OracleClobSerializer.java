package com.gccloud.dataroom.core.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import lombok.extern.slf4j.Slf4j;
import oracle.sql.CLOB;
import org.apache.commons.lang3.exception.ExceptionUtils;

import java.io.IOException;
import java.sql.Clob;

/**
 * 解决oracle CLOB类型返回序列化问题
 * @author hongyang
 * @version 1.0
 * @date 2024/03/22 17:30
 */
@Slf4j
public class OracleClobSerializer extends JsonSerializer<CLOB> {

    @Override
    public void serialize(CLOB clob, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        jsonGenerator.writeString(clobToString(clob));
    }

    /**
     * Clob字段处理
     *
     * @param clob
     * @return
     */
    public static String clobToString(Clob clob) {
        String content = "";
        try {
            content = clob.getSubString(1, (int) clob.length());
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return content;
    }
}
