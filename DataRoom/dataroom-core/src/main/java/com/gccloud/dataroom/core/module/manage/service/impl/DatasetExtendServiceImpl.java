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

package com.gccloud.dataroom.core.module.manage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPageService;
import com.gccloud.dataset.extend.dataset.IDatasetExtendService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/7/20 10:33
 */
@Order(101)
@Service("dataroomDatasetExtendService")
public class DatasetExtendServiceImpl implements IDatasetExtendService {

    @Resource
    private IDataRoomPageService pageService;

    @Override
    public String deleteCheck(String id) {
        if (StringUtils.isBlank(id)) {
            return null;
        }
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(PageEntity::getId, PageEntity::getName);
        // "businessKey":"id",
        queryWrapper.like(PageEntity::getConfig, "\"businessKey\":\"" + id + "\"");
        queryWrapper.orderByDesc(PageEntity::getUpdateDate);
        List<PageEntity> list = pageService.list(queryWrapper);
        if (list == null || list.isEmpty()) {
            return null;
        }
        String msg = "数据集已被以下页面引用，无法删除：";
        for (PageEntity page : list) {
            msg += page.getName() + "、";
        }
        msg = msg.substring(0, msg.length() - 1);
        return msg;
    }

    @Override
    public String getServiceType() {
        return "大屏";
    }
}