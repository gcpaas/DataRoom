package com.gccloud.dataroom.core.module.dataset.params;

import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 数据集参数处理
 * @author hongyang
 * @version 1.0
 * @date 2023/5/22 14:02
 */
@Component
public class ParamsClient {

    @Autowired(required = false)
    private IParamsService paramsService;


    /**
     * 处理数据集参数
     * 当有自定义实现时，使用自定义实现，否则使用默认实现
     * @param params
     * @return
     */
    public List<DatasetParamDto> handleParams(List<DatasetParamDto> params) {
        if (paramsService != null) {
            params = paramsService.handleParams(params);
        }
        return params;
    }

}
