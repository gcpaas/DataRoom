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

package com.gccloud.dataroom.core.module.manage.extend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/8/1 15:10
 */
@Component
public class DataRoomExtendClient {

    @Autowired(required = false)
    private IDataRoomExtendService extendService;


    /**
     * 删除页面后的扩展方法
     * @param code
     */
    public void deleteByCode(String code) {
        if (extendService != null) {
            extendService.deleteByCode(code);
        }
    }

    /**
     * 页面新增后的处理
     * @param code 新增的页面code
     */
    public void afterAdd(String code) {
        if (extendService != null) {
            extendService.afterAdd(code);
        }
    }

    /**
     * 页面删除后的处理
     * @param code 删除的页面code
     */
    public void afterDelete(String code) {
        if (extendService != null) {
            extendService.afterDelete(code);
        }
    }


}