package com.gccloud.dataroom.core.module.type.service;

import com.gccloud.dataroom.core.module.type.dto.TypeDTO;
import com.gccloud.dataroom.core.module.type.entity.TypeEntity;
import com.gccloud.common.service.ISuperService;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/26 9:40
 */
public interface ITypeService extends ISuperService<TypeEntity> {


    /**
     * 新增分类
     * @param typeDTO
     * @return
     */
    String add(TypeDTO typeDTO);

    /**
     * 更新分类
     * @param typeDTO
     */
    void update(TypeDTO typeDTO);

    /**
     * 删除分类
     * @param id
     */
    void deleteById(String id);

    /**
     * 根据分类类型查询分类列表
     * @param type
     * @return
     */
    List<TypeEntity> listByType(String type);

    /**
     * code查重
     * @param id
     * @param type
     * @param code
     * @return
     */
    boolean checkCodeRepeat(String id, String type, String code);

    /**
     * name查重
     * @param id
     * @param type
     * @param name
     * @return
     */
    boolean checkNameRepeat(String id, String type, String name);

}
