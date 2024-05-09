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
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.utils.JSON;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.basic.dao.DataRoomPagePreviewDao;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.PagePreviewEntity;
import com.gccloud.dataroom.core.module.biz.component.dto.BizComponentDTO;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPagePreviewService;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/9/13 10:11
 */
@Service
public class DataRoomPagePreviewServiceImpl extends ServiceImpl<DataRoomPagePreviewDao, PagePreviewEntity> implements IDataRoomPagePreviewService {

    @Override
    public String add(BasePageDTO pageDTO) {
        String code = pageDTO.getCode();
        PagePreviewEntity pagePreview = this.getByCode(code, false);
        if (pagePreview != null) {
            // 有则直接更新
            pageDTO.setCode(code);
            pagePreview.setConfig(JSON.toJSONString(pageDTO));
            pagePreview.setCreateDate(new Date());
            this.updateById(pagePreview);
            return code;
        }
        // 没有则新增
        pageDTO.setCode(code);
        PagePreviewEntity pagePreviewEntity = BeanConvertUtils.convert(pageDTO, PagePreviewEntity.class);
        pagePreviewEntity.setType(PageDesignConstant.Type.BIG_SCREEN);
        pagePreviewEntity.setCreateDate(new Date());
        pagePreviewEntity.setConfig(JSON.toJSONString(pageDTO));
        this.save(pagePreviewEntity);
        return code;
    }

    @Override
    public String add(BizComponentDTO componentDTO) {
        String code = componentDTO.getCode();
        PagePreviewEntity componentPreview = this.getByCode(code, false);
        if (componentPreview != null) {
            // 有则直接更新
            componentDTO.setCode(code);
            componentPreview.setConfig(JSON.toJSONString(componentDTO));
            componentPreview.setCreateDate(new Date());
            this.updateById(componentPreview);
            return code;
        }
        // 没有则新增
        componentDTO.setCode(code);
        PagePreviewEntity componentPreviewEntity = BeanConvertUtils.convert(componentDTO, PagePreviewEntity.class);
        componentPreviewEntity.setType(PageDesignConstant.Type.COMPONENT);
        componentPreviewEntity.setCreateDate(new Date());
        componentPreviewEntity.setConfig(JSON.toJSONString(componentDTO));
        this.save(componentPreviewEntity);
        return code;
    }

    @Override
    public PagePreviewEntity getByCode(String code) {
        return this.getByCode(code, true);
    }

    /**
     * 根据code获取页面预览数据
     * @param code
     * @param throwException
     * @return
     */
    private PagePreviewEntity getByCode(String code, boolean throwException) {
        LambdaQueryWrapper<PagePreviewEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PagePreviewEntity::getCode, code);
        List<PagePreviewEntity> list = this.list(queryWrapper);
        if (list == null || list.isEmpty()) {
            if (throwException) {
                throw new GlobalException("页面预览数据不存在，可能已过期");
            }
            return null;
        }
        return list.get(0);
    }

    @Override
    public void clear() {
        // 清除创建时间超过一天的预览数据
        Date date = new Date();
        date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
        LambdaQueryWrapper<PagePreviewEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.le(PagePreviewEntity::getCreateDate, date);
        this.delete(queryWrapper);
    }
}