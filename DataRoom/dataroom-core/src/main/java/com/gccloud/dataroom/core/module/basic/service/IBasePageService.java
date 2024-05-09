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

package com.gccloud.dataroom.core.module.basic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.common.service.ISuperService;
import com.gccloud.common.utils.AssertUtils;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 *
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
public interface IBasePageService extends ISuperService<PageEntity> {

    /**
     * 页面实体缓存
     */
    Cache<String, PageEntity> PAGE_ENTITY_CACHE = Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.MINUTES).build();

    /**
     * 获取指定类型页面所有名称
     *
     * @param type
     * @return
     */
    default Set<String> getAllName(String type) {
        AssertUtils.isTrue(StringUtils.isNotBlank(type), "type不能为空");
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageEntity::getType, type);
        queryWrapper.select(PageEntity::getName);
        List<PageEntity> list = getBaseMapper().selectList(queryWrapper);
        Set<String> allName = list.stream().map(PageEntity::getName).collect(Collectors.toSet());
        return allName;
    }

    /**
     * 根据编码查询
     *
     * @param code
     * @return
     */
    default PageEntity getByCode(String code) {
        AssertUtils.isTrue(StringUtils.isNotBlank(code), "页面编码不能为空");
        PageEntity ifPresent = PAGE_ENTITY_CACHE.getIfPresent(code);
        if (ifPresent != null) {
            return ifPresent;
        }
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageEntity::getCode, code);
        List<PageEntity> list = getBaseMapper().selectList(queryWrapper);
        PageEntity pageEntity = !list.isEmpty() ? list.get(0) : null;
        if (pageEntity != null) {
            PAGE_ENTITY_CACHE.put(code, pageEntity);
        }
        return pageEntity;
    }

    /**
     * 检查页面是否存在
     * @param code
     * @return
     */
    default boolean checkPageExist(String code) {
        // 先检查缓存中是否存在
        PageEntity pageEntity = PAGE_ENTITY_CACHE.getIfPresent(code);
        if (pageEntity != null) {
            return true;
        }
        // 缓存中不存在，再去数据库中查找
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(PageEntity::getId);
        queryWrapper.eq(PageEntity::getCode, code);
        List<PageEntity> list = getBaseMapper().selectList(queryWrapper);
        return !list.isEmpty();
    }

    /**
     * 名称查重
     * @param entity
     * @return
     */
    default boolean checkNameRepeat(PageEntity entity) {
        AssertUtils.isTrue(StringUtils.isNotBlank(entity.getName()), "名称不能为空");
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(PageEntity::getId);
        queryWrapper.eq(PageEntity::getName, entity.getName())
                .eq(PageEntity::getType, entity.getType())
                .ne(StringUtils.isNotBlank(entity.getId()), PageEntity::getId, entity.getId());
        return getBaseMapper().selectList(queryWrapper).size() > 0;
    }

    /**
     * 名称查重
     * @param name
     * @param id
     * @param type
     * @return
     */
    default boolean checkNameRepeat(String name, String id, String type) {
        AssertUtils.isTrue(StringUtils.isNotBlank(name), "名称不能为空");
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(PageEntity::getId);
        queryWrapper.eq(PageEntity::getName, name)
                .eq(PageEntity::getType, type)
                .ne(StringUtils.isNotBlank(id), PageEntity::getId, id);
        return getBaseMapper().selectList(queryWrapper).size() > 0;
    }


    /**
     * 编码查重
     * @param entity
     * @return
     */
    default boolean checkCodeRepeat(PageEntity entity) {
        AssertUtils.isTrue(StringUtils.isNotBlank(entity.getCode()), "编码不能为空");
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(PageEntity::getId);
        queryWrapper.eq(PageEntity::getCode, entity.getCode())
                .eq(PageEntity::getType, entity.getType())
                .ne(StringUtils.isNotBlank(entity.getId()), PageEntity::getId, entity.getId());
        return getBaseMapper().selectList(queryWrapper).size() > 0;
    }

}