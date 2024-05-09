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

package com.gccloud.dataroom.core.module.manage.service;

import com.gccloud.common.service.ISuperService;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.PagePreviewEntity;
import com.gccloud.dataroom.core.module.biz.component.dto.BizComponentDTO;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/9/13 10:10
 */
public interface IDataRoomPagePreviewService extends ISuperService<PagePreviewEntity> {

    /**
     * 保存页面预览数据
     * @param pageDTO
     * @return
     */
    String add(BasePageDTO pageDTO);

    /**
     * 保存组件预览数据
     * @param componentDTO
     * @return
     */
    String add(BizComponentDTO componentDTO);

    /**
     * 根据code获取页面预览数据
     * @param code
     * @return
     */
    PagePreviewEntity getByCode(String code);

    /**
     * 清理预览数据
     */
    void clear();

}