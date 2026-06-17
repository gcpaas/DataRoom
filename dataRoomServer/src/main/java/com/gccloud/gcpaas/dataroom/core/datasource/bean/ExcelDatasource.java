package com.gccloud.gcpaas.dataroom.core.datasource.bean;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * Excel数据源配置
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ExcelDatasource extends BaseDataSource {

    /**
     * 动态表名 (以 excel_ 开头)
     */
    private String tableName;

    /**
     * 列定义
     */
    private List<ExcelColumn> columns;

    /**
     * 上传文件原始名
     */
    private String originalFileName;

    /**
     * 已导入行数
     */
    private Integer rowCount;

    /**
     * 导入模式: overwrite / append
     */
    private String importMode;

    @Override
    public void desensitize() {
        // Excel数据源无敏感字段
    }

    @Override
    public void updatedSensitive(BaseDataSource baseDataSource) {
        // Excel数据源无敏感字段
    }
}
