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

package com.gccloud.dataroom.core.module.template.service;

import com.gccloud.dataroom.core.module.template.dto.PageTemplateSearchDTO;
import com.gccloud.dataroom.core.module.template.entity.PageTemplateEntity;
import com.gccloud.common.service.ISuperService;
import com.gccloud.common.vo.PageVO;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/20 16:38
 */
public interface IPageTemplateService extends ISuperService<PageTemplateEntity> {

    /**
     * 分页查询
     *
     * @param searchDTO
     * @return
     */
    PageVO<PageTemplateEntity> getPage(PageTemplateSearchDTO searchDTO);

    /**
     * 列表查询
     *
     * @param searchDTO
     * @return
     */
    List<PageTemplateEntity> getList(PageTemplateSearchDTO searchDTO);

    /**
     * 新增
     *
     * @param pageTemplate
     * @return
     */
    String add(PageTemplateEntity pageTemplate);

    /**
     * 删除
     *
     * @param ids
     */
    void deleteByIds(List<String> ids);

    /**
     * 修改
     *
     * @param pageTemplate
     */
    void update(PageTemplateEntity pageTemplate);
}