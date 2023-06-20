package com.gccloud.dataroom.core.module.biz.component.service;

import com.gccloud.dataroom.core.module.biz.component.dto.BizComponentSearchDTO;
import com.gccloud.dataroom.core.module.biz.component.entity.BizComponentEntity;
import com.gccloud.common.service.ISuperService;
import com.gccloud.common.vo.PageVO;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/5 11:39
 */
public interface IBizComponentService extends ISuperService<BizComponentEntity> {

    /**
     * 获取组件列表分页
     * @param searchDTO
     * @return
     */
    PageVO<BizComponentEntity> getPage(BizComponentSearchDTO searchDTO);

    /**
     * 获取组件列表
     * @param searchDTO
     * @return
     */
    List<BizComponentEntity> getList(BizComponentSearchDTO searchDTO);


    /**
     * 根据编码获取组件
     * @param code
     * @return
     */
    BizComponentEntity getInfoByCode(String code);

    /**
     * 新增组件
     * @param entity
     * @return
     */
    String add(BizComponentEntity entity);

    /**
     * 更新组件
     * @param entity
     */
    void update(BizComponentEntity entity);

    /**
     * 复制
     * @param code
     * @return
     */
    String copy(String code);

    /**
     * 删除组件
     * @param id
     */
    void delete(String id);

    /**
     * 名称查重
     * @param id
     * @param name
     * @return
     */
    boolean checkName(String id, String name);
}
