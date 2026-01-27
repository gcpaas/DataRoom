package com.gccloud.gcpaas.core.util;

import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtils extends ObjectMapper {

    public static final JsonUtils objectMapper = new JsonUtils();

    public static ObjectMapper getInstance() {
        return objectMapper;
    }
}
