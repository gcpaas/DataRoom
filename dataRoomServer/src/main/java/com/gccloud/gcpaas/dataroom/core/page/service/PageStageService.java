package com.gccloud.gcpaas.dataroom.core.page.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import com.gccloud.gcpaas.dataroom.core.constant.PageType;
import com.gccloud.gcpaas.dataroom.core.entity.PageStageEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.PageStageMapper;
import com.gccloud.gcpaas.dataroom.core.page.bean.DirectoryPageConfig;
import com.gccloud.gcpaas.dataroom.core.page.bean.PageConfig;
import com.gccloud.gcpaas.dataroom.core.page.bean.VisualScreenPageConfig;
import com.gccloud.gcpaas.dataroom.core.page.dto.PageHistoryBackupDto;
import com.gccloud.gcpaas.dataroom.core.page.bean.BasePageConfig;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Slf4j
@Service
public class PageStageService extends ServiceImpl<PageStageMapper, PageStageEntity> {

    public PageStageEntity getByCode(String pageCode, PageStatus status) {
        LambdaQueryWrapper<PageStageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageStageEntity::getPageCode, pageCode)
                .eq(PageStageEntity::getPageStatus, status);
        return baseMapper.selectOne(queryWrapper, false);
    }

    /**
     * 根据类型生成默认的配置、用于初始化
     *
     * @param pageType
     * @return
     */
    public BasePageConfig getDefaultPageConfig(String pageType) {
        BasePageConfig basePageConfig = null;
        switch (pageType) {
            case PageType.DIRECTORY_TYPE:
                basePageConfig = new DirectoryPageConfig();
                break;
            case PageType.PAGE_TYPE:
                basePageConfig = new PageConfig();
                break;
            case PageType.VISUAL_SCREEN_TYPE:
                basePageConfig = new VisualScreenPageConfig();
                break;
            default:
                throw new DataRoomException("不支持的页面类型");
        }
        basePageConfig.init();
        return basePageConfig;
    }

    @Transactional(rollbackFor = Exception.class)
    public String backupHistory(PageHistoryBackupDto dto) {
        validateBackupDto(dto);
        PageStageEntity pageStageEntity = buildHistoryStage(dto.getPageCode(), dto.getRemark(), dto.getPageType(), dto.getPageConfig());
        if (!this.save(pageStageEntity)) {
            throw new DataRoomException("历史备份保存失败");
        }
        return pageStageEntity.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public String rollbackDesignByHistoryId(String id) {
        PageStageEntity targetHistory = this.getById(id);
        if (targetHistory == null) {
            throw new DataRoomException("历史记录不存在");
        }
        if (targetHistory.getPageStatus() != PageStatus.HISTORY) {
            throw new DataRoomException("仅支持从历史记录回滚设计态");
        }

        PageStageEntity currentDesign = this.getByCode(targetHistory.getPageCode(), PageStatus.DESIGN);
        if (currentDesign == null) {
            throw new DataRoomException("页面设计态不存在");
        }

        PageStageEntity rollbackBackup = buildHistoryStage(currentDesign.getPageCode(), "回滚前自动备份", currentDesign.getPageType(), currentDesign.getPageConfig());
        if (!this.save(rollbackBackup)) {
            throw new DataRoomException("回滚前备份保存失败");
        }

        PageStageEntity designUpdate = new PageStageEntity();
        designUpdate.setId(currentDesign.getId());
        designUpdate.setPageConfig(targetHistory.getPageConfig());
        designUpdate.setUpdateDate(new Date());
        if (!this.updateById(designUpdate)) {
            throw new DataRoomException("历史回滚失败");
        }
        return id;
    }

    @Transactional(rollbackFor = Exception.class)
    public String deleteHistoryById(String id) {
        LambdaQueryWrapper<PageStageEntity> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.eq(PageStageEntity::getId, id);
        deleteWrapper.eq(PageStageEntity::getPageStatus, PageStatus.HISTORY);
        if (!this.remove(deleteWrapper)) {
            throw new DataRoomException("历史记录不存在或已被删除");
        }
        return id;
    }

    @Transactional(rollbackFor = Exception.class)
    public String updateHistoryRemark(String id, String remark) {
        if (StringUtils.isBlank(id)) {
            throw new DataRoomException("历史记录ID不能为空");
        }
        LambdaUpdateWrapper<PageStageEntity> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(PageStageEntity::getId, id);
        updateWrapper.eq(PageStageEntity::getPageStatus, PageStatus.HISTORY);
        updateWrapper.set(PageStageEntity::getRemark, remark);
        updateWrapper.set(PageStageEntity::getUpdateDate, new Date());
        if (!this.update(updateWrapper)) {
            throw new DataRoomException("历史记录不存在或已被删除");
        }
        return id;
    }

    private void validateBackupDto(PageHistoryBackupDto dto) {
        if (dto == null || StringUtils.isBlank(dto.getPageCode())) {
            throw new DataRoomException("页面编码不能为空");
        }
        if (dto.getPageType() == null) {
            throw new DataRoomException("页面类型不能为空");
        }
        if (dto.getPageConfig() == null) {
            throw new DataRoomException("页面配置不能为空");
        }
    }

    private PageStageEntity buildHistoryStage(String pageCode, String remark, PageType pageType, BasePageConfig pageConfig) {
        PageStageEntity pageStageEntity = new PageStageEntity();
        pageStageEntity.setPageCode(pageCode);
        pageStageEntity.setRemark(remark);
        pageStageEntity.setPageType(pageType);
        pageStageEntity.setPageConfig(pageConfig);
        pageStageEntity.setPageStatus(PageStatus.HISTORY);
        return pageStageEntity;
    }

}
