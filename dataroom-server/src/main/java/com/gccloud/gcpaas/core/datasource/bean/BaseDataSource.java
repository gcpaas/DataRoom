package com.gccloud.gcpaas.core.datasource.bean;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.gccloud.gcpaas.core.constant.DataSourceType;
import io.swagger.v3.oas.annotations.media.Schema;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "dataSourceType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = MySqlDatasource.class, name = DataSourceType.MYSQL_TYPE),
        @JsonSubTypes.Type(value = PostgreSqlDatasource.class, name = DataSourceType.POSTGRESQL_TYPE),
        @JsonSubTypes.Type(value = OracleDatasource.class, name = DataSourceType.ORACLE_TYPE),
        @JsonSubTypes.Type(value = DorisDatasource.class, name = DataSourceType.DORIS_TYPE),
        @JsonSubTypes.Type(value = DamengDatasource.class, name = DataSourceType.DAMENG_TYPE),
        @JsonSubTypes.Type(value = Db2Datasource.class, name = DataSourceType.DB2_TYPE),
        @JsonSubTypes.Type(value = GbaseDatasource.class, name = DataSourceType.GBASE_TYPE),
        @JsonSubTypes.Type(value = GoldenDbDatasource.class, name = DataSourceType.GOLDENDB_TYPE),
        @JsonSubTypes.Type(value = GreatDbDatasource.class, name = DataSourceType.GREATDB_TYPE),
        @JsonSubTypes.Type(value = SqlServerDatasource.class, name = DataSourceType.SQLSERVER_TYPE),
        @JsonSubTypes.Type(value = MongoDbDatasource.class, name = DataSourceType.MONGODB_TYPE),
        @JsonSubTypes.Type(value = KingbaseDatasource.class, name = DataSourceType.KINGBASE_TYPE),
        @JsonSubTypes.Type(value = ClickHouseDatasource.class, name = DataSourceType.CLICKHOUSE_TYPE),
        @JsonSubTypes.Type(value = MariaDbDatasource.class, name = DataSourceType.MARIADB_TYPE),
        @JsonSubTypes.Type(value = OceanBaseDatasource.class, name = DataSourceType.OCEANBASE_TYPE),
        @JsonSubTypes.Type(value = H2Datasource.class, name = DataSourceType.H2_TYPE),
        @JsonSubTypes.Type(value = PolarDbDatasource.class, name = DataSourceType.POLARDB_TYPE),
        @JsonSubTypes.Type(value = HiveDatasource.class, name = DataSourceType.HIVE_TYPE),
        @JsonSubTypes.Type(value = TDengineDatasource.class, name = DataSourceType.TDENGINE_TYPE),
        @JsonSubTypes.Type(value = DruidDatasource.class, name = DataSourceType.DRUID_TYPE),
        @JsonSubTypes.Type(value = EsDatasource.class, name = DataSourceType.ES_TYPE),
        @JsonSubTypes.Type(value = ExcelDatasource.class, name = DataSourceType.EXCEL_TYPE)
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
