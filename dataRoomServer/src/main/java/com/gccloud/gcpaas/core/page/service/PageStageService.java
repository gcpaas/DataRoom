package com.gccloud.gcpaas.core.page.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.gcpaas.core.constant.PageStatus;
import com.gccloud.gcpaas.core.constant.PageType;
import com.gccloud.gcpaas.core.entity.PageStageEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.mapper.PageStageMapper;
import com.gccloud.gcpaas.core.page.bean.BasePageConfig;
import com.gccloud.gcpaas.core.page.bean.DirectoryPageConfig;
import com.gccloud.gcpaas.core.page.bean.PageConfig;
import com.gccloud.gcpaas.core.page.bean.VisualScreenPageConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

}
