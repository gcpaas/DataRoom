package com.gccloud.dataroom.core.module.dataset.service;

import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.vo.DataSetInfoVo;
import com.gccloud.dataroom.core.vo.PageVO;
import com.gccloud.dataroom.core.service.ISuperService;

import java.util.List;
import java.util.Map;

/**
 * @author zhang.zeJun
 * @date 2022-11-17-10:27
 */
public interface DsService extends ISuperService<DataSetInfoVo> {

    /**
     * 根据数据集id查询数据集详情
     *
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
    Object getData(String dataSetId, List<DatasetParamDto> params);

    /**
     * 通过数据集ID 和参数查询数据
     *
     * @param dataSetId
     * @param params
     * @return
     */
    List<Map<String, Object>> execute(String dataSetId, List<DatasetParamDto> params);

    /**
     * 通过数据集ID 和参数 分页查询数据
     *
     * @param dataSetId
     * @param params
     * @param current
     * @param size
     * @return
     */
    PageVO execute(String dataSetId, List<DatasetParamDto> params, int current, int size);

    /**
     * 处理JSON数据集
     *
     * @param dataSetId
     * @return
     */
    Object executeJsonDataSet(String dataSetId);
}
