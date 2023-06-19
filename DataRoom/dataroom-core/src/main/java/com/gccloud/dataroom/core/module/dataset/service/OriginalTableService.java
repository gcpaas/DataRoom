package com.gccloud.dataroom.core.module.dataset.service;

import com.gccloud.dataroom.core.module.dataset.dto.OriginalTableDto;
import com.gccloud.dataroom.core.module.dataset.entity.OriginalTable;
import com.gccloud.dataroom.core.service.ISuperService;

import java.util.List;
import java.util.Map;

/**
 * @author pan.shun
 * @since 2021/9/7 15:04
 */
public interface OriginalTableService extends ISuperService<OriginalTable> {

    /**
     * 原始数据集新增或修改
     *
     * @param originalTable
     */
    void addOrUpdate(OriginalTable originalTable);

    /**
     * 根据id获取原始数据集详情
     *
     * @param id
     * @return
     */
    OriginalTable getOriginalTableDetails(String id);

    /**
     * 获取原始表详情以及数据
     *
     * @param originalTableDto
     * @return
     */
    Map<String, Object> getOriginalTableDetail(OriginalTableDto originalTableDto);

    /**
     * 根据表名和数据源id获取原始表
     *
     * @param tableName
     * @param sourceId
     * @return
     */
    OriginalTable getByTableNameAndSourceId(String tableName, String sourceId);

    /**
     * 查询原始表字段信息（名称和类型）
     *
     * @param originalTable
     * @return
     */
    List<Map<String, Object>> getOriginalTableFieldInfo(OriginalTable originalTable);

}
