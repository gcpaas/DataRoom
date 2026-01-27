package com.gccloud.gcpaas.core.dataset;

import com.gccloud.gcpaas.core.dataset.bean.DatasetOutputParam;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 数据集执行响应
 */
@Data
public class DatasetRunResponse {
    /**
     * 出参
     */
    private List<DatasetOutputParam> outputList = new ArrayList<>();
    /**
     * 数据集执行结果
     */
    private Object data;
}
