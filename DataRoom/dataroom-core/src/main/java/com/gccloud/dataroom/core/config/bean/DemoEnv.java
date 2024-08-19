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
package com.gccloud.dataroom.core.config.bean;

import com.google.common.collect.Sets;
import lombok.Data;

import java.util.Set;

/**
 * 演示环境配置
 *
 * @author liuchengbiao
 * @date 2021/7/28 5:34 下午
 */
@Data
public class DemoEnv {
    /**
     * 是否是演示环境
     */
    private Boolean enable = false;
    /**
     * 非法请求警告提示
     */
    private String tip = "演示环境,不允许操作";
    /**
     * post请求过滤URL
     */
    private Set<String> postUrlPassSet = Sets.newHashSet();
    /**
     * put请求过滤URL
     */
    private Set<String> putUrlPassSet = Sets.newHashSet();
    /**
     * delete请求过滤URL
     */
    private Set<String> deleteUrlPassSet = Sets.newHashSet();
    /**
     * 以该URL开头的都过滤掉
     */
    private Set<String> startWithUrlPassSet = Sets.newHashSet();
}
