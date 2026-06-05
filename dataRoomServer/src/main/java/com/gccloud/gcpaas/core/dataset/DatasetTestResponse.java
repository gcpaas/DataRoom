package com.gccloud.gcpaas.core.dataset;

import com.gccloud.gcpaas.core.dataset.bean.DatasetOutputParam;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 开发时数据集响应
 */
@Data
public class DatasetTestResponse {
    /**
     * 出参
     */
    private List<DatasetOutputParam> outputParamList = new ArrayList<>();
    /**
     * 数据集执行结果
     */
    private Object data;
}
