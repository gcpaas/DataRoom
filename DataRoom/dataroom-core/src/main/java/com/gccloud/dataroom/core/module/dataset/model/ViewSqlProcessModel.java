package com.gccloud.dataroom.core.module.dataset.model;

import com.gccloud.dataroom.core.module.dataset.model.view.CalculateFieldConfigModel;
import com.gccloud.dataroom.core.module.dataset.model.view.DataSourceInfoModel;
import com.gccloud.dataroom.core.module.dataset.model.view.FilterConditionModel;
import com.gccloud.dataroom.core.module.dataset.model.view.TableRelateModel;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * @author pan.shun
 * @since 2022/7/21 11:24
 */
@Data
public class ViewSqlProcessModel {

    /**
     * 数据源信息
     */
    private DataSourceInfoModel datasourceInfo;

    /**
     * 表关联
     */
    private TableRelateModel tableRelate;

    /**
     * 计算字段配置
     */
    private List<CalculateFieldConfigModel> calculateFieldConfig;

    /**
     * 过滤条件
     */
    private List<FilterConditionModel> filterCondition;

    /**
     * 表字段信息
     */
    private Map<String, List<String>> tableInfo;
}

