package com.gccloud.dataroom.core.module.manage.service;

import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.dataroom.core.module.basic.service.IBasePageService;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomSearchDTO;
import com.gccloud.common.vo.PageVO;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 10:59
 */
public interface IDataRoomPageService extends IBasePageService {

    /**
     * 从空白新增大屏页
     *
     * @param bigScreenPageDTO
     * @return
     */
    String add(DataRoomPageDTO bigScreenPageDTO);


    /**
     * 从模板新增大屏页
     *
     * @param bigScreenPageDTO
     * @return
     */
    String addByTemplate(DataRoomPageDTO bigScreenPageDTO);

    /**
     * 根据编码获取大屏页配置
     *
     * @param bigScreenPageDTO
     * @return
     */
    DataRoomPageDTO getConfigByTemplate(DataRoomPageDTO bigScreenPageDTO);

    /**
     * 分页查询
     *
     * @param searchDTO
     * @return
     */
    PageVO<PageEntity> getByCategory(DataRoomSearchDTO searchDTO);

    /**
     * 更新大屏页
     *
     * @param bigScreenPageDTO
     */
    void update(DataRoomPageDTO bigScreenPageDTO);

    /**
     * 复制大屏页
     * @param screenEntity
     * @return
     */
    String copy(PageEntity screenEntity);

    /**
     * 根据编码删除
     *
     * @param code
     */
    void deleteByCode(String code);

}
