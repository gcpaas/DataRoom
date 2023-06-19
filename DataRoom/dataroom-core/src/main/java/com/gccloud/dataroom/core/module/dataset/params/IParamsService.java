package com.gccloud.dataroom.core.module.dataset.params;

import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;

import java.util.List;

/**
 * 数据集参数处理，可通过实现该接口来自定义参数处理逻辑
 * @author hongyang
 * @version 1.0
 * @date 2023/5/22 13:58
 */
public interface IParamsService {


    /**
     * 处理数据集参数
     * @param params 数据集参数
     * @return 处理后的数据集参数
     */
    List<DatasetParamDto> handleParams(List<DatasetParamDto> params);

}
