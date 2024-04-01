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