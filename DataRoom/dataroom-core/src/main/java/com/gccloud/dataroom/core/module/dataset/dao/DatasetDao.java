package com.gccloud.dataroom.core.module.dataset.dao;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetEntity;
import com.gccloud.dataroom.core.dao.DataRoomBaseDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Set;

/**
 * @author zhang.zeJun
 * @date 2022-11-14-11:41
 */
@Mapper
public interface DatasetDao extends DataRoomBaseDao<DatasetEntity> {

    /**
     * 获取数据集分页列表
     *
     * @param page
     * @param name
     * @param datasetType
     * @param typeId
     * @param typeIds
     * @param moduleCode
     * @return
     */
    Page<DatasetEntity> getDataSetPage(
            Page<DatasetEntity> page,
            @Param("name") String name,
            @Param("datasetType") String datasetType,
            @Param("typeId") String typeId,
            @Param("typeIds") Set<String> typeIds,
            @Param(("moduleCode")) String moduleCode);


    /**
     * 获取数据集列表
     *
     * @param name
     * @param datasetType
     * @param typeId
     * @param typeIds
     * @param moduleCode
     * @return
     */
    List<DatasetEntity> getList(
            @Param("name") String name,
            @Param("datasetType") String datasetType,
            @Param("typeId") String typeId,
            @Param("typeIds") Set<String> typeIds,
            @Param("moduleCode") String moduleCode);

}
