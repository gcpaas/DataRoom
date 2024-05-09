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
import com.gccloud.common.utils.JSON;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.basic.dao.DataRoomPageDao;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.dataroom.core.module.basic.entity.PagePreviewEntity;
import com.gccloud.dataroom.core.module.chart.bean.Linkage;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomOssService;
import com.gccloud.dataroom.core.module.manage.dto.DashboardPageDTO;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomSearchDTO;
import com.gccloud.dataroom.core.module.manage.dto.RefreshConfig;
import com.gccloud.dataroom.core.module.manage.extend.DataRoomExtendClient;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPagePreviewService;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPageService;
import com.gccloud.dataroom.core.module.template.entity.PageTemplateEntity;
import com.gccloud.dataroom.core.module.template.service.IPageTemplateService;
import com.gccloud.dataroom.core.permission.DataRoomPermissionClient;
import com.gccloud.dataroom.core.utils.CodeGenerateUtils;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.AssertUtils;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.vo.PageVO;
import com.gccloud.dataroom.core.utils.PathUtils;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.*;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 11:05
 */
@Service
@Slf4j
public class DataRoomPageServiceImpl extends ServiceImpl<DataRoomPageDao, PageEntity> implements IDataRoomPageService {


    @Resource
    private IPageTemplateService pageTemplateService;

    @Resource
    private DataRoomExtendClient dataRoomExtendClient;

    @Resource
    private DataRoomPermissionClient permissionClient;

    @Resource
    private IDataRoomPagePreviewService previewService;

    @Resource
    private IDataRoomOssService ossService;

    @Override
    public PageEntity getByCode(String code) {
        return IDataRoomPageService.super.getByCode(code);
    }

    @Override
    public String add(BasePageDTO pageDTO) {
        if (StringUtils.isBlank(pageDTO.getCode())) {
            String code = CodeGenerateUtils.generate(pageDTO.getType());
            pageDTO.setCode(code);
        }
        if (StringUtils.isNotBlank(pageDTO.getCoverPicture())) {
            String base64Str = pageDTO.getCoverPicture();
            String fileUrl = this.saveCoverPicture(base64Str, pageDTO.getCode());
            pageDTO.setCoverPicture(fileUrl);
        }
        PageEntity dataRoomEntity = BeanConvertUtils.convert(pageDTO, PageEntity.class);
        dataRoomEntity.setConfig(pageDTO);
        AssertUtils.isTrue(!checkNameRepeat(dataRoomEntity), "名称重复");
        AssertUtils.isTrue(!checkCodeRepeat(dataRoomEntity), "编码重复");
        this.save(dataRoomEntity);
        dataRoomExtendClient.afterAdd(dataRoomEntity.getCode());
        return dataRoomEntity.getCode();
    }


    /**
     * 将base64字符串转为图片文件存储
     *
     * @param base64String
     * @param fileName
     * @return
     */
    private String saveCoverPicture(String base64String, String fileName) {
        String fileUrl = "";
        if (StringUtils.isBlank(base64String)) {
            return fileUrl;
        }
        // 如果不是base64字符串，直接返回 NOTE 因为如果前端截图失败，会将原封面地址传过来
        if (!base64String.startsWith("data:image")) {
            return base64String;
        }
        try {
            // 去除base64字符串前缀，从初始位置，到逗号位置
            base64String = base64String.substring(base64String.indexOf(",") + 1);
            // 解码base64字符串
            byte[] imageBytes = Base64.getDecoder().decode(base64String);
            InputStream inputStream = new ByteArrayInputStream(imageBytes);
            DataRoomFileEntity fileEntity = new DataRoomFileEntity();
            String filePath = "cover" + File.separator + fileName + ".png";
            ossService.upload(inputStream, filePath, 0, fileEntity);
            // 封面先不保存到资源库
            // fileService.save(fileEntity);
            log.info("页面封面保存至：{}", filePath);
            fileUrl = fileEntity.getUrl();
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return fileUrl;
    }


    /**
     * 复制封面文件
     * @param oldFileName
     * @param newFileName
     * @return
     */
    private String copyCoverPicture(String oldFileName, String newFileName) {
        if (StringUtils.isBlank(oldFileName)) {
            return "";
        }
        String oldFile = "cover" + File.separator + oldFileName + ".png";
        String newFilePath = "cover" + File.separator + newFileName + ".png";
        return ossService.copy(oldFile, newFilePath);
    }

    @Override
    public String addByTemplate(BasePageDTO basePageDTO) {
        if (StringUtils.isBlank(basePageDTO.getPageTemplateId())) {
            throw new GlobalException("页面模板不能为空");
        }
        BasePageDTO configByTemplate = getConfigByTemplate(basePageDTO);
        return add(configByTemplate);
    }

    @Override
    public BasePageDTO getConfigByTemplate(BasePageDTO basePageDTO) {
        String pageTemplateId = basePageDTO.getPageTemplateId();
        PageTemplateEntity pageTemplate = pageTemplateService.getById(pageTemplateId);
        AssertUtils.isTrue(pageTemplate != null, "页面模板不存在");
//        AssertUtils.isTrue(Objects.equals(pageTemplate.getType(), PageDesignConstant.Type.BIG_SCREEN), "页面模板类型不正确");
        BasePageDTO templateConfig = pageTemplate.getConfig();
        String name = basePageDTO.getName();
        if (StringUtils.isBlank(name)) {
            int i = 0;
            String newName = pageTemplate.getName() + "副本";
            while (checkNameRepeat(newName, null, basePageDTO.getType())) {
                i++;
                newName = pageTemplate.getName() + "副本" + i;
            }
            name = newName;
        }
        templateConfig.setName(name);
        templateConfig.setCode(basePageDTO.getCode());
        templateConfig.setParentCode(basePageDTO.getParentCode());
        templateConfig.setId(basePageDTO.getId());
        List<Map<String, Object>> chartList = templateConfig.getChartList();
        if (CollectionUtils.isEmpty(chartList)) {
            chartList = Lists.newArrayList();
        }
        for (Map<String, Object> chart : chartList) {
            // 重置数据源配置
        }
        return templateConfig;
    }

    @Override
    public PageVO<PageEntity> getByCategory(DataRoomSearchDTO searchDTO) {
        if (StringUtils.isBlank(searchDTO.getType())) {
            throw new GlobalException("类型不能为空");
        }
        // 使用，分割type
        List<String> types = Lists.newArrayList(searchDTO.getType().split(","));
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(StringUtils.isNotBlank(searchDTO.getSearchKey()), PageEntity::getName, searchDTO.getSearchKey());
        if (StringUtils.isNotBlank(searchDTO.getParentCode())) {
            queryWrapper.eq(PageEntity::getParentCode, searchDTO.getParentCode());
        }
        queryWrapper.in(PageEntity::getType, types);
        queryWrapper.select(PageEntity::getCode);
        List<PageEntity> idEntityList = this.list(queryWrapper);
        if (idEntityList == null || idEntityList.isEmpty()) {
            PageVO<PageEntity> pageVO = new PageVO<>();
            pageVO.setList(Lists.newArrayList());
            return pageVO;
        }
        List<String> codeList = idEntityList.stream().map(PageEntity::getCode).collect(Collectors.toList());
        List<String> filterByPermission = permissionClient.filterByPermission(codeList);
        if (filterByPermission == null || filterByPermission.isEmpty()) {
            PageVO<PageEntity> pageVO = new PageVO<>();
            pageVO.setList(Lists.newArrayList());
            return pageVO;
        }
        LambdaQueryWrapper<PageEntity> reQueryWrapper =  new LambdaQueryWrapper<>();
        if (idEntityList.size() == filterByPermission.size()) {
            // 说明没有过滤掉任何一个, 按照原来的条件查询
            reQueryWrapper = queryWrapper;
        } else {
            // 说明过滤掉了一些, 按照过滤后的编码查询
            reQueryWrapper.in(PageEntity::getCode, filterByPermission);
        }
        reQueryWrapper.select(PageEntity::getId, PageEntity::getCode, PageEntity::getName,
                PageEntity::getParentCode, PageEntity::getOrderNum, PageEntity::getCoverPicture, PageEntity::getUpdateDate, PageEntity::getType);
        // 优先序号升序，其次创建时间降序
        reQueryWrapper.orderByAsc(PageEntity::getOrderNum);
        reQueryWrapper.orderByDesc(PageEntity::getCreateDate);
        PageVO<PageEntity> page = this.page(searchDTO, reQueryWrapper);
        List<PageEntity> list = page.getList();
        return page;
    }


    @Override
    public void update(BasePageDTO pageDTO) {
        AssertUtils.isTrue(StringUtils.isNotBlank(pageDTO.getCode()), "编码不能为空");
        AssertUtils.isTrue(StringUtils.isNotBlank(pageDTO.getName()), "名称不能为空");
        if (StringUtils.isNotBlank(pageDTO.getCoverPicture())) {
            String coverPicture = this.saveCoverPicture(pageDTO.getCoverPicture(), pageDTO.getCode());
            pageDTO.setCoverPicture(coverPicture);
        }
        PageEntity dataRoomEntity = BeanConvertUtils.convert(pageDTO, PageEntity.class);
        dataRoomEntity.setConfig(pageDTO);
        AssertUtils.isTrue(!checkNameRepeat(dataRoomEntity), "名称重复");
        AssertUtils.isTrue(!checkCodeRepeat(dataRoomEntity), "编码重复");
        this.updateById(dataRoomEntity);
        PAGE_ENTITY_CACHE.invalidate(dataRoomEntity.getCode());
    }


    public static final String COPY_SUFFIX = "-副本";

    @Override
    public String copy(PageEntity entity) {
        BasePageDTO config = entity.getConfig();
        entity.setId(null);
        String oldCode = entity.getCode();
        entity.setCode(CodeGenerateUtils.generate(entity.getType()));
        int i = 1;
        String oldName = entity.getName();
        // 检查是否有 -副本，有的话从-副本开始，后面全部去掉
        if (oldName.contains(COPY_SUFFIX)) {
            oldName = oldName.substring(0, oldName.indexOf(COPY_SUFFIX));
            if (StringUtils.isBlank(oldName)) {
                oldName = "页面";
            }
        }
        entity.setName(oldName + COPY_SUFFIX);
        while (checkNameRepeat(entity)) {
           // 如果重复，采取 -副本1，-副本2的方式
            entity.setName(oldName + COPY_SUFFIX + i);
            i++;
        }
        config.setName(entity.getName());
        config.setCode(entity.getCode());
        List<Map<String, Object>> chartList = config.getChartList();
        // 新旧编码映射
        Map<String, String> chartCodeMap = Maps.newHashMap();
        for (Map<String, Object> chart : chartList) {
            String oldChartCode = chart.get("code").toString();
            chart.put("code", CodeGenerateUtils.generate("chart"));
            chartCodeMap.put(oldChartCode, chart.get("code").toString());
        }
        // 处理图表之间的联动
        for (Map<String, Object> chart : chartList) {
            Object linkageObj = chart.get("linkage");
            if (linkageObj == null) {
                continue;
            }
            Linkage linkage = BeanConvertUtils.convert(linkageObj, Linkage.class);
            if (linkage == null) {
                continue;
            }
            List<Linkage.Component> components = linkage.getComponents();
            if (components == null || components.isEmpty()) {
                continue;
            }
            for (Linkage.Component component : components) {
                String componentKey = component.getComponentKey();
                if (StringUtils.isBlank(componentKey)) {
                    continue;
                }
                String newCode = chartCodeMap.get(componentKey);
                component.setComponentKey(newCode);
            }
        }
        // 处理刷新配置
        List<RefreshConfig> refreshConfigs = null;
        if (config instanceof DataRoomPageDTO) {
            refreshConfigs = ((DataRoomPageDTO) config).getPageConfig().getRefreshConfig();
        }
        if (config instanceof DashboardPageDTO) {
            refreshConfigs = ((DashboardPageDTO) config).getPageConfig().getRefreshConfig();
        }
        if (refreshConfigs != null) {
            for (RefreshConfig refreshConfig : refreshConfigs) {
                String oldChartCode = refreshConfig.getCode();
                refreshConfig.setCode(chartCodeMap.get(oldChartCode));
            }
        }
        String copyUrl = this.copyCoverPicture(oldCode, entity.getCode());
        if (StringUtils.isBlank(copyUrl)) {
            entity.setCoverPicture(null);
        } else {
            entity.setCoverPicture(copyUrl);
        }
        this.save(entity);
        dataRoomExtendClient.afterAdd(entity.getCode());
        return entity.getCode();
    }

    @Override
    public void deleteByCode(String code) {
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageEntity::getCode, code);
        this.remove(queryWrapper);
        PAGE_ENTITY_CACHE.invalidate(code);
        // 调用拓展接口
        dataRoomExtendClient.deleteByCode(code);
        // 移除权限拓展
        dataRoomExtendClient.afterDelete(code);
    }
}