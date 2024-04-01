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

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.context.annotation.Configuration;

import java.util.Date;

/**
 * 用于填充创建时间和更新时间字段
 * @author hongyang
 * @version 1.0
 * @date 2023/8/16 10:46
 */
@Configuration
public class DataRoomMetaObjectHandler implements MetaObjectHandler {

    /**
     * 创建时间字段
     */
    private static final String CREATE_DATE = "createDate";
    /**
     * 更新时间字段
     */
    private static final String UPDATE_DATE = "updateDate";

    @Override
    public void insertFill(MetaObject metaObject) {
        Date date = new Date();
        this.setFieldValByName(CREATE_DATE, date, metaObject);
        this.setFieldValByName(UPDATE_DATE, date, metaObject);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.setFieldValByName(UPDATE_DATE, new Date(), metaObject);
    }
}