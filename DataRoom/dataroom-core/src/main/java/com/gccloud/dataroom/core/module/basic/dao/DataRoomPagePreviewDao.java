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

package com.gccloud.dataroom.core.module.basic.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gccloud.dataroom.core.module.basic.entity.PagePreviewEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author gcpaas
 * @Date 2022/06/07
 * @Version 1.0.0
 */
@Mapper
public interface DataRoomPagePreviewDao extends BaseMapper<PagePreviewEntity> {

}