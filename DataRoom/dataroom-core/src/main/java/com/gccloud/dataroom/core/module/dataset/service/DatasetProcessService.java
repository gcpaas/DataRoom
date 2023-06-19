package com.gccloud.dataroom.core.module.dataset.service;

import com.gccloud.dataroom.core.module.dataset.dto.DatasetProcessTestSearchDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetProcessEntity;
import com.gccloud.dataroom.core.module.dataset.vo.DatasetProcessTestVo;
import com.gccloud.dataroom.core.service.ISuperService;

/**
 * @Description:
 * @Author yang.hw
 * @Date 2021/9/8 14:22
 */
public interface DatasetProcessService extends ISuperService<DatasetProcessEntity> {

    /**
     * 新增数据集
     *
     * @param entity
     * @return
     */
    String addDatasetProcess(DatasetProcessEntity entity);

    /**
     * 修改数据集
     *
     * @param entity
     */
    void updateDatasetProcess(DatasetProcessEntity entity);

    /**
     * 获取数据集详情
     *
     * @param id
     * @return
     */
    DatasetProcessEntity getDatasetProcessInfo(String id);

    /**
     * 数据集sql测试
     *
     * @param searchDto
     * @return
     */
    DatasetProcessTestVo getDatasetSqlTest(DatasetProcessTestSearchDto searchDto);

}
