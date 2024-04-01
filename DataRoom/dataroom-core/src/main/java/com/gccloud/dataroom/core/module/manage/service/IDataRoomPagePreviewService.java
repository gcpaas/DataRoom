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

    String PREVIEW_KEY = "preview";

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
