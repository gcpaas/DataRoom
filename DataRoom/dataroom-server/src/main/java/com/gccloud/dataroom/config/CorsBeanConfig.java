/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.gccloud.dataroom.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * 接口跨域注册
 */
@Slf4j
@Configuration
@ConditionalOnProperty(prefix = "gc.starter.dataroom.component", name = "CorsBeanConfig", havingValue = "CorsBeanConfig", matchIfMissing = true)
public class CorsBeanConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        Cors cors = new Cors();
        CorsRegistration corsRegistration = registry.addMapping(cors.getMapping());
        corsRegistration
                // change 由allowedOrigins改为allowedOriginPatterns，springboot新版本中allowedOrigins不允许设置*，只能设置具体的域名
                .allowedOriginPatterns(cors.getAllowedOrigins().toArray(new String[cors.getAllowedOrigins().size()]))
                .allowCredentials(cors.getAllowCredentials())
                .allowedMethods(cors.getAllowedMethods().toArray(new String[cors.getAllowedMethods().size()]))
                .maxAge(cors.getMaxAge());
        if (cors.getAllowedHeaders() != null && !cors.getAllowedHeaders().isEmpty()) {
            corsRegistration.allowedHeaders(cors.getAllowedHeaders().toArray(new String[cors.getAllowedHeaders().size()]));
        }
        List<String> exposedHeaders = cors.getExposedHeaders();
        if (exposedHeaders != null && !exposedHeaders.isEmpty()) {
            corsRegistration.exposedHeaders(exposedHeaders.toArray(new String[exposedHeaders.size()]));
        }
    }
}