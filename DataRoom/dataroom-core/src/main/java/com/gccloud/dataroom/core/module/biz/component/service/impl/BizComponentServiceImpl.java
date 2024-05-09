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

package com.gccloud.dataroom.core.module.biz.component.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.vo.PageVO;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.dataroom.core.module.biz.component.dao.DataRoomBizComponentDao;
import com.gccloud.dataroom.core.module.biz.component.dto.BizComponentDTO;
import com.gccloud.dataroom.core.module.biz.component.dto.BizComponentSearchDTO;
import com.gccloud.dataroom.core.module.biz.component.entity.BizComponentEntity;
import com.gccloud.dataroom.core.module.biz.component.service.IBizComponentService;
import com.gccloud.dataroom.core.module.biz.component.vo.BizComponentVO;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomOssService;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPageService;
import com.gccloud.dataroom.core.utils.CodeGenerateUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/5 13:35
 */
@Slf4j
@Service("dataRoomBizComponentService")
public class BizComponentServiceImpl extends ServiceImpl<DataRoomBizComponentDao, BizComponentEntity> implements IBizComponentService {

    @Resource
    private IDataRoomOssService ossService;

    @Resource
    private IDataRoomPageService pageService;

    @Override
    public PageVO<BizComponentVO> getPage(BizComponentSearchDTO searchDTO) {
        LambdaQueryWrapper<BizComponentEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(BizComponentEntity::getId,BizComponentEntity::getCode,BizComponentEntity::getBizType,BizComponentEntity::getCoverPicture,
                BizComponentEntity::getName,BizComponentEntity::getOrderNum,BizComponentEntity::getType,BizComponentEntity::getRemark,BizComponentEntity::getPageCode,BizComponentEntity::getDesignType);
        queryWrapper.like(StringUtils.isNotBlank(searchDTO.getName()), BizComponentEntity::getName, searchDTO.getName());
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getType()), BizComponentEntity::getType, searchDTO.getType());
        queryWrapper.eq(searchDTO.getDesignType() != null, BizComponentEntity::getDesignType, searchDTO.getDesignType());
        if (searchDTO.getScope() != null && !searchDTO.getScope().isEmpty()) {
            // 数据库中存储的是;分割的字符串
            queryWrapper.and(
                    wrapper -> {
                        for (Integer scope : searchDTO.getScope()) {
                            wrapper.like(BizComponentEntity::getScope, scope + ";");
                        }
                    }
            );
        }
        queryWrapper.orderByAsc(BizComponentEntity::getOrderNum);
        queryWrapper.orderByDesc(BizComponentEntity::getCreateDate);
        PageVO<BizComponentEntity> page = this.page(searchDTO, queryWrapper);
        List<BizComponentEntity> list = page.getList();
        List<BizComponentVO> voList = BeanConvertUtils.convert(list, BizComponentVO.class);
        PageVO<BizComponentVO> pageVO = BeanConvertUtils.convert(page, PageVO.class);
        pageVO.setList(voList);
        // 如果designType为1，表示是低代码组件，需要查询配置信息
        if (searchDTO.getDesignType() == null || searchDTO.getDesignType() == 1) {
            // designType = 1 且 pageCode 不为空
            Set<String> pageCodes = list.stream()
                    .filter(e -> e.getDesignType() == 1 && StringUtils.isNotBlank(e.getPageCode()))
                    .map(BizComponentEntity::getPageCode).collect(Collectors.toSet());
            if (pageCodes.isEmpty()) {
                return pageVO;
            }
            LambdaQueryWrapper<PageEntity> pageQueryWrapper = new LambdaQueryWrapper<>();
            pageQueryWrapper.in(PageEntity::getCode, pageCodes);
            List<PageEntity> pageList = pageService.list(pageQueryWrapper);
            Map<String, BasePageDTO> pageMap = pageList.stream().collect(Collectors.toMap(PageEntity::getCode, PageEntity::getConfig));
            for (BizComponentVO vo : voList) {
                BasePageDTO config = pageMap.get(vo.getPageCode());
                vo.setConfig(config);
            }
        }
        return pageVO;
    }

    @Override
    public List<BizComponentVO> getList(BizComponentSearchDTO searchDTO) {
        LambdaQueryWrapper<BizComponentEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(StringUtils.isNotBlank(searchDTO.getName()), BizComponentEntity::getName, searchDTO.getName());
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getType()), BizComponentEntity::getType, searchDTO.getType());
        List<BizComponentEntity> list = this.list(queryWrapper);
        List<BizComponentVO> voList = BeanConvertUtils.convert(list, BizComponentVO.class);
        // 如果designType为1，表示是低代码组件，需要查询配置信息
        if (searchDTO.getDesignType() == null || searchDTO.getDesignType() == 1) {
            // designType = 1 且 pageCode 不为空
            Set<String> pageCodes = list.stream()
                    .filter(e -> e.getDesignType() == 1 && StringUtils.isNotBlank(e.getPageCode()))
                    .map(BizComponentEntity::getPageCode).collect(Collectors.toSet());
            if (pageCodes.isEmpty()) {
                return voList;
            }
            LambdaQueryWrapper<PageEntity> pageQueryWrapper = new LambdaQueryWrapper<>();
            pageQueryWrapper.in(PageEntity::getCode, pageCodes);
            List<PageEntity> pageList = pageService.list(pageQueryWrapper);
            Map<String, BasePageDTO> pageMap = pageList.stream().collect(Collectors.toMap(PageEntity::getCode, PageEntity::getConfig));
            for (BizComponentVO vo : voList) {
                BasePageDTO config = pageMap.get(vo.getPageCode());
                vo.setConfig(config);
            }
        }
        return voList;
    }

    @Override
    public BizComponentVO getInfoByCode(String code) {
        if (StringUtils.isBlank(code)) {
            throw new GlobalException("组件编码不能为空");
        }
        LambdaQueryWrapper<BizComponentEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(BizComponentEntity::getCode, code);
        List<BizComponentEntity> list = list(queryWrapper);
        if (list.size() == 0) {
            throw new GlobalException("组件不存在");
        }
        BizComponentEntity bizComponentEntity = list.get(0);
        BizComponentVO bizComponentVO = BeanConvertUtils.convert(bizComponentEntity, BizComponentVO.class);
        if (bizComponentEntity.getDesignType() == 1 && StringUtils.isNotBlank(bizComponentEntity.getPageCode())) {
            PageEntity pageEntity = pageService.getByCode(bizComponentEntity.getPageCode());
            BasePageDTO config = pageEntity.getConfig();
            bizComponentVO.setConfig(config);
        }
        return bizComponentVO;
    }

    @Override
    public String add(BizComponentDTO componentDTO) {
        boolean repeat = this.checkName(null, componentDTO.getName());
        if (repeat) {
            throw new GlobalException("组件名称重复");
        }
        String code = CodeGenerateUtils.generate("bizComponent");
        componentDTO.setCode(code);
        if (StringUtils.isNotBlank(componentDTO.getCoverPicture())) {
            String base64Str = componentDTO.getCoverPicture();
            String fileUrl = this.saveCoverPicture(base64Str, componentDTO.getCode());
            componentDTO.setCoverPicture(fileUrl);
        }
        // 如果是低代码组件，需要新增页面配置
        if (componentDTO.getDesignType() == 1) {
            BasePageDTO pageDTO = componentDTO.getConfig();
            if (pageDTO == null) {
                pageDTO = BeanConvertUtils.convert(componentDTO, BasePageDTO.class);
                pageDTO.setType(PageDesignConstant.Type.BIG_SCREEN);
            }
            String pageCode = pageService.add(pageDTO);
            componentDTO.setPageCode(pageCode);
        }
        this.save(componentDTO);
        return code;
    }

    @Override
    public void update(BizComponentDTO componentDTO) {
        boolean repeat = this.checkName(componentDTO.getId(), componentDTO.getName());
        if (repeat) {
            throw new GlobalException("组件名称重复");
        }
        if (StringUtils.isNotBlank(componentDTO.getCoverPicture())) {
            String base64Str = componentDTO.getCoverPicture();
            String fileUrl = this.saveCoverPicture(base64Str, componentDTO.getCode());
            componentDTO.setCoverPicture(fileUrl);
        }
        // 如果是低代码组件，需要更新页面配置
        if (componentDTO.getDesignType() == 1) {
            BasePageDTO pageDTO = componentDTO.getConfig();
            if (pageDTO == null) {
                throw new GlobalException("页面配置不能为空");
            }
            pageService.update(pageDTO);
        }
        this.updateById(componentDTO);
    }


    private String saveCoverPicture(String base64String, String fileName) {
        String fileUrl = "";
        if (StringUtils.isBlank(base64String)) {
            return fileUrl;
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
            log.info("组业务件封面保存至：{}", filePath);
            fileUrl = fileEntity.getUrl();
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return fileUrl;
    }


    public static final String COPY_SUFFIX = "-副本";

    @Override
    public String copy(String code) {
        BizComponentEntity copyFrom = this.getInfoByCode(code);
        if (copyFrom == null) {
            throw new GlobalException("源业务组件不存在");
        }
        String oldCode = copyFrom.getCode();
        copyFrom.setId(null);
        String oldName = copyFrom.getName();
        // 检查是否有 -副本，有的话从-副本开始，后面全部去掉
        if (oldName.contains(COPY_SUFFIX)) {
            oldName = oldName.substring(0, oldName.indexOf(COPY_SUFFIX));
            if (StringUtils.isBlank(oldName)) {
                oldName = "组件";
            }
        }
        copyFrom.setName(oldName + COPY_SUFFIX);
        int i = 1;
        while(this.checkName(null, copyFrom.getName())) {
            copyFrom.setName(oldName + COPY_SUFFIX + i);
            i++;
        }
        copyFrom.setCode(CodeGenerateUtils.generate("bizComponent"));
        String copyUrl = this.copyCoverPicture(oldCode, copyFrom.getCode());
        if (StringUtils.isBlank(copyUrl)) {
            copyFrom.setCoverPicture(null);
        } else {
            copyFrom.setCoverPicture(copyUrl);
        }
        // 如果是低代码组件，需要复制页面配置
        if (copyFrom.getDesignType() == 1 && StringUtils.isNotBlank(copyFrom.getPageCode())) {
            PageEntity pageEntity = pageService.getByCode(copyFrom.getPageCode());
            String pageCode = pageService.copy(pageEntity);
            copyFrom.setPageCode(pageCode);
        }
        this.save(copyFrom);
        return copyFrom.getCode();
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
        String newFilePath =  "cover" + File.separator + newFileName + ".png";
        return ossService.copy(oldFile, newFilePath);
    }

    @Override
    public void delete(String id) {
        if (StringUtils.isBlank(id)) {
            throw new GlobalException("组件id不能为空");
        }
        // 如果是低代码组件，需要删除页面配置
        BizComponentEntity entity = this.getById(id);
        if (entity.getDesignType() == 1 && StringUtils.isNotBlank(entity.getPageCode())) {
            pageService.deleteByCode(entity.getPageCode());
        }
        this.removeById(id);
    }

    @Override
    public boolean checkName(String id, String name) {
        LambdaQueryWrapper<BizComponentEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(BizComponentEntity::getId);
        queryWrapper.eq(BizComponentEntity::getName, name);
        if (StringUtils.isNotBlank(id)) {
            queryWrapper.ne(BizComponentEntity::getId, id);
        }
        return this.list(queryWrapper).size() > 0;
    }
}