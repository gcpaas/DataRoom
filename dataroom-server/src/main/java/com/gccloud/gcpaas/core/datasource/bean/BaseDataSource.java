package com.gccloud.gcpaas.core.datasource.bean;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.gccloud.gcpaas.core.constant.DataSourceType;
import io.swagger.v3.oas.annotations.media.Schema;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "dataSourceType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = MySqlDatasource.class, name = DataSourceType.MYSQL_TYPE),
        @JsonSubTypes.Type(value = PostgreSqlDatasource.class, name = DataSourceType.POSTGRESQL_TYPE),
        @JsonSubTypes.Type(value = OracleDatasource.class, name = DataSourceType.ORACLE_TYPE)
})
public abstract class BaseDataSource {

    @Schema(description = "数据源类型", requiredMode = Schema.RequiredMode.REQUIRED)
    private DataSourceType dataSourceType;

    /**
     * 脱敏
     */
    public abstract void desensitize();

    /**
     * 更新敏感信息
     */
    public abstract void updatedSensitive(BaseDataSource baseDataSource);
}