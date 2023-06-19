package com.gccloud.dataroom.core.module.dataset.service;

import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.vo.DataSetInfoVo;

import java.util.List;
import java.util.Map;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/14 11:33
 */
public interface IOtherDatasetService {

    /**
     * 根据数据集id查询数据集详情
     * @param id
     * @return
     */
    DataSetInfoVo getDataSetDetails(String id);


    /**
     * 通过 数据集ID 和 参数 查询数据
     * @param dataSetId
     * @param params
     * @return
     */
    List<Map<String, Object>> execute(String dataSetId, List<DatasetParamDto> params);
}
