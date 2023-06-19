package com.gccloud.dataroom.config;

import com.google.common.collect.Lists;
import lombok.Data;

import java.util.List;

/**
 * 跨域设置
 *
 * @author liuchengbiao
 * @date 2020-09-03 09:58
 */
@Data
public class Cors {
    private String mapping = "/**";
    private List<String> allowedOrigins = Lists.newArrayList("*");
    private Boolean allowCredentials = true;
    private List<String> allowedMethods = Lists.newArrayList("GET", "POST", "PUT", "DELETE", "OPTIONS");
    private List<String> allowedHeaders;
    private List<String> exposedHeaders;
    private Long maxAge = 3600L;
}
