package com.gccloud.gcpaas.dataroom.core.mcp.bean;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.deser.InstantDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.IOException;
import java.time.OffsetDateTime;

@Data
public class McpTokenAddDto {

    @Schema(description = "令牌名称", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @JsonDeserialize(using = IsoDateTimeDeserializer.class)
    @Schema(description = "必填的未来过期时间，ISO 8601格式，包含时区偏移", example = "2027-01-01T00:00:00+08:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private OffsetDateTime expireTime;

    public static class IsoDateTimeDeserializer extends JsonDeserializer<OffsetDateTime> {
        @Override
        public OffsetDateTime deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            if (!parser.hasToken(JsonToken.VALUE_STRING)) {
                return context.reportInputMismatch(OffsetDateTime.class, "有效期必须为ISO日期时间字符串");
            }
            return InstantDeserializer.OFFSET_DATE_TIME.deserialize(parser, context);
        }
    }
}
