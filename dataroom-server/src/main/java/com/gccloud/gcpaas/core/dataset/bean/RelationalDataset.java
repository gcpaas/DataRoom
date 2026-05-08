package com.gccloud.gcpaas.core.dataset.bean;

import lombok.Data;

/**
 * 关系型数据库数据集，如：MySQL、Oracle、PG等
 */
@Data
public class RelationalDataset extends BaseDataset {
    /**
     * 执行的SQL
     */
    private String sql;
}