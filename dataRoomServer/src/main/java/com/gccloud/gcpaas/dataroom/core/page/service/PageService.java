package com.gccloud.gcpaas.dataroom.core.page.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import com.gccloud.gcpaas.dataroom.core.entity.PageEntity;
import com.gccloud.gcpaas.dataroom.core.entity.PageStageEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.PageMapper;
import com.gccloud.gcpaas.dataroom.core.util.CodeWorker;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class PageService extends ServiceImpl<PageMapper, PageEntity> {

    @Resource
    private PageStageService pageStageService;

    @Transactional(rollbackFor = Exception.class)
    public String copyDesign(String pageCode) {
        if (StringUtils.isBlank(pageCode)) {
            throw new DataRoomException("页面编码不能为空");
        }
        PageEntity sourcePage = baseMapper.getByCode(pageCode);
        if (sourcePage == null) {
            throw new DataRoomException("页面不存在");
        }
        PageStageEntity sourceDesign = pageStageService.getByCode(pageCode, PageStatus.DESIGN);
        if (sourceDesign == null) {
            throw new DataRoomException("页面设计态不存在");
        }

        String newCode = CodeWorker.generateCode(null);
        PageEntity copiedPage = new PageEntity();
        BeanUtils.copyProperties(sourcePage, copiedPage);
        clearAuditFields(copiedPage);
        copiedPage.setId(null);
        copiedPage.setCode(newCode);
        copiedPage.setName(sourcePage.getName() + "-副本");
        copiedPage.setPageStatus(PageStatus.DESIGN);
        if (!this.save(copiedPage)) {
            throw new DataRoomException("页面复制失败");
        }

        PageStageEntity copiedStage = new PageStageEntity();
        BeanUtils.copyProperties(sourceDesign, copiedStage);
        clearAuditFields(copiedStage);
        copiedStage.setId(null);
        copiedStage.setPageCode(newCode);
        copiedStage.setPageStatus(PageStatus.DESIGN);
        copiedStage.setRemark("复制自 " + pageCode);
        if (!pageStageService.save(copiedStage)) {
            throw new DataRoomException("页面设计态复制失败");
        }
        return newCode;
    }

    private void clearAuditFields(PageEntity page) {
        page.setCreateDate(null);
        page.setUpdateDate(null);
        page.setCreateUser(null);
        page.setUpdateUser(null);
        page.setTenantCode(null);
    }

    private void clearAuditFields(PageStageEntity pageStage) {
        pageStage.setCreateDate(null);
        pageStage.setUpdateDate(null);
        pageStage.setCreateUser(null);
        pageStage.setUpdateUser(null);
        pageStage.setTenantCode(null);
    }

}
