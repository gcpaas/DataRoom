package com.gccloud.gcpaas.core.datasource.bean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.constant.DataSourceType;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.BaseDataSource;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.GreatDbDatasource;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.RelationalDatasource;
import com.gccloud.gcpaas.dataroom.core.entity.DataSourceEntity;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;

class DataSourceJsonTest {

    @ParameterizedTest
    @MethodSource("newRelationalDatasourceCases")
    void deserializeNewDatasourceTypesAsRelationalDatasource(String dataSourceType, String driverName, String username, String url) throws Exception {
        String json = """
                {
                  "name": "新增数据源",
                  "dataSourceType": "%s",
                  "dataSource": {
                    "dataSourceType": "%s",
                    "driverName": "%s",
                    "username": "%s",
                    "password": "encrypted",
                    "url": "%s"
                  }
                }
                """.formatted(dataSourceType, dataSourceType, driverName, username, url);

        DataSourceEntity entity = new ObjectMapper().readValue(json, DataSourceEntity.class);

        assertEquals(dataSourceType, entity.getDataSourceType().getValue());
        RelationalDatasource datasource = assertInstanceOf(RelationalDatasource.class, entity.getDataSource());
        assertEquals(driverName, datasource.getDriverName());
        assertEquals(url, datasource.getUrl());
        assertEquals(username, datasource.getUsername());
    }

    static Stream<Arguments> newRelationalDatasourceCases() {
        return Stream.of(
                Arguments.of("mongodb", "com.mongodb.jdbc.MongoDriver", "mongo", "jdbc:mongodb://localhost:27017/?database=test"),
                Arguments.of("kingbase", "com.kingbase8.Driver", "system", "jdbc:kingbase8://localhost:54321/test"),
                Arguments.of("clickhouse", "com.clickhouse.jdbc.ClickHouseDriver", "default", "jdbc:clickhouse://localhost:8123/default"),
                Arguments.of("mariadb", "org.mariadb.jdbc.Driver", "root", "jdbc:mariadb://localhost:3306/test"),
                Arguments.of("oceanbase", "com.oceanbase.jdbc.Driver", "root", "jdbc:oceanbase://localhost:2881/test"),
                Arguments.of("hive", "org.apache.hive.jdbc.HiveDriver", "hive", "jdbc:hive2://localhost:10000/default"),
                Arguments.of("tdengine", "com.taosdata.jdbc.ws.WebSocketDriver", "root", "jdbc:TAOS-WS://localhost:6041/test?varcharAsString=true"),
                Arguments.of("druid", "org.apache.calcite.avatica.remote.Driver", "druid", "jdbc:avatica:remote:url=http://localhost:8888/druid/v2/sql/avatica/;transparent_reconnection=true"),
                Arguments.of("greatdb", "com.mysql.cj.jdbc.Driver", "greatdb", "jdbc:mysql://localhost:3306/test"),
                Arguments.of("h2", "org.h2.Driver", "sa", "jdbc:h2:file:./db/dataroom"),
                Arguments.of("polardb", "com.mysql.cj.jdbc.Driver", "root", "jdbc:mysql://localhost:3306/test"),
                Arguments.of("tidb", "com.mysql.cj.jdbc.Driver", "root", "jdbc:mysql://localhost:4000/test"),
                Arguments.of("starrocks", "com.mysql.cj.jdbc.Driver", "root", "jdbc:mysql://localhost:9030/test")
        );
    }

    @Test
    void deserializeEsDatasourceAsApiDatasourceAndDesensitizesSecrets() throws Exception {
        String json = """
                {
                  "name": "ES数据源",
                  "dataSourceType": "es",
                  "dataSource": {
                    "dataSourceType": "es",
                    "baseUrl": "http://localhost:9200",
                    "authType": "basic",
                    "username": "elastic",
                    "password": "encryptedPassword",
                    "bearerToken": "encryptedBearer",
                    "apiKey": "encryptedApiKey"
                  }
                }
                """;

        DataSourceEntity entity = new ObjectMapper().readValue(json, DataSourceEntity.class);

        assertEquals("es", entity.getDataSourceType().getValue());
        BaseDataSource datasource = entity.getDataSource();
        assertEquals("EsDatasource", datasource.getClass().getSimpleName());
        assertEquals("http://localhost:9200", fieldValue(datasource, "baseUrl"));
        assertEquals("basic", fieldValue(datasource, "authType"));
        assertEquals("elastic", fieldValue(datasource, "username"));
        assertEquals("encryptedPassword", fieldValue(datasource, "password"));
        assertEquals("encryptedBearer", fieldValue(datasource, "bearerToken"));
        assertEquals("encryptedApiKey", fieldValue(datasource, "apiKey"));

        datasource.desensitize();

        assertNull(fieldValue(datasource, "password"));
        assertNull(fieldValue(datasource, "bearerToken"));
        assertNull(fieldValue(datasource, "apiKey"));
    }

    @Test
    void esDatasourcePreservesExistingSecretsWhenUpdatePayloadLeavesThemBlank() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        BaseDataSource dbDatasource = objectMapper.readValue("""
                {
                  "dataSourceType": "es",
                  "baseUrl": "http://localhost:9200",
                  "authType": "apiKey",
                  "username": "elastic",
                  "password": "oldPassword",
                  "bearerToken": "oldBearer",
                  "apiKey": "oldApiKey"
                }
                """, BaseDataSource.class);
        BaseDataSource updateDatasource = objectMapper.readValue("""
                {
                  "dataSourceType": "es",
                  "baseUrl": "http://localhost:9201",
                  "authType": "apiKey",
                  "username": "elastic",
                  "password": "",
                  "bearerToken": "",
                  "apiKey": ""
                }
                """, BaseDataSource.class);

        updateDatasource.updatedSensitive(dbDatasource);

        assertEquals("oldPassword", fieldValue(updateDatasource, "password"));
        assertEquals("oldBearer", fieldValue(updateDatasource, "bearerToken"));
        assertEquals("oldApiKey", fieldValue(updateDatasource, "apiKey"));
    }

    @Test
    void relationalDatasourceDesensitizesPasswordAndPreservesItWhenUpdatePayloadLeavesItBlank() {
        RelationalDatasource dbDatasource = new RelationalDatasource();
        dbDatasource.setPassword("oldEncryptedPassword");
        RelationalDatasource updateDatasource = new RelationalDatasource();
        updateDatasource.setPassword("");

        updateDatasource.updatedSensitive(dbDatasource);
        assertEquals("oldEncryptedPassword", updateDatasource.getPassword());

        updateDatasource.desensitize();
        assertNull(updateDatasource.getPassword());
    }

    @Test
    void relationalDatasourceUsesSubmittedPasswordWhenUpdatePayloadProvidesIt() {
        RelationalDatasource dbDatasource = new RelationalDatasource();
        dbDatasource.setPassword("oldEncryptedPassword");
        RelationalDatasource updateDatasource = new RelationalDatasource();
        updateDatasource.setPassword("newEncryptedPassword");

        updateDatasource.updatedSensitive(dbDatasource);

        assertEquals("newEncryptedPassword", updateDatasource.getPassword());
    }

    @Test
    void serializeGreatDbDatasourceKeepsGreatDbTypeId() throws Exception {
        DataSourceEntity entity = new DataSourceEntity();
        entity.setName("万里数据库");
        entity.setDataSourceType(DataSourceType.GREATDB);
        GreatDbDatasource datasource = new GreatDbDatasource();
        datasource.setDriverName("com.mysql.cj.jdbc.Driver");
        datasource.setUsername("greatdb");
        datasource.setPassword("encrypted");
        datasource.setUrl("jdbc:mysql://localhost:3306/test");
        entity.setDataSource(datasource);

        String json = new ObjectMapper().writeValueAsString(entity);

        assertEquals("greatdb", new ObjectMapper().readTree(json).path("dataSource").path("dataSourceType").asText());
    }

    @Test
    void deserializeDamengDatasourceAsRelationalDatasource() throws Exception {
        String json = """
                {
                  "name": "达梦数据源",
                  "dataSourceType": "dameng",
                  "dataSource": {
                    "dataSourceType": "dameng",
                    "driverName": "dm.jdbc.driver.DmDriver",
                    "username": "SYSDBA",
                    "password": "encrypted",
                    "url": "jdbc:dm://localhost:5236"
                  }
                }
                """;

        DataSourceEntity entity = new ObjectMapper().readValue(json, DataSourceEntity.class);

        assertEquals("dameng", entity.getDataSourceType().getValue());
        RelationalDatasource datasource = assertInstanceOf(RelationalDatasource.class, entity.getDataSource());
        assertEquals("dm.jdbc.driver.DmDriver", datasource.getDriverName());
        assertEquals("jdbc:dm://localhost:5236", datasource.getUrl());
        assertEquals("SYSDBA", datasource.getUsername());
    }

    @Test
    void deserializeDb2DatasourceAsRelationalDatasource() throws Exception {
        String json = """
                {
                  "name": "DB2数据源",
                  "dataSourceType": "db2",
                  "dataSource": {
                    "dataSourceType": "db2",
                    "driverName": "com.ibm.db2.jcc.DB2Driver",
                    "username": "db2inst1",
                    "password": "encrypted",
                    "url": "jdbc:db2://localhost:50000/sample"
                  }
                }
                """;

        DataSourceEntity entity = new ObjectMapper().readValue(json, DataSourceEntity.class);

        assertEquals("db2", entity.getDataSourceType().getValue());
        RelationalDatasource datasource = assertInstanceOf(RelationalDatasource.class, entity.getDataSource());
        assertEquals("com.ibm.db2.jcc.DB2Driver", datasource.getDriverName());
        assertEquals("jdbc:db2://localhost:50000/sample", datasource.getUrl());
        assertEquals("db2inst1", datasource.getUsername());
    }

    @Test
    void deserializeGbaseDatasourceAsRelationalDatasource() throws Exception {
        String json = """
                {
                  "name": "GBase数据源",
                  "dataSourceType": "gbase",
                  "dataSource": {
                    "dataSourceType": "gbase",
                    "driverName": "com.gbasedbt.jdbc.Driver",
                    "username": "gbasedbt",
                    "password": "encrypted",
                    "url": "jdbc:gbasedbt-sqli://localhost:9088/test:GBASEDBTSERVER=gbase01;"
                  }
                }
                """;

        DataSourceEntity entity = new ObjectMapper().readValue(json, DataSourceEntity.class);

        assertEquals("gbase", entity.getDataSourceType().getValue());
        RelationalDatasource datasource = assertInstanceOf(RelationalDatasource.class, entity.getDataSource());
        assertEquals("com.gbasedbt.jdbc.Driver", datasource.getDriverName());
        assertEquals("jdbc:gbasedbt-sqli://localhost:9088/test:GBASEDBTSERVER=gbase01;", datasource.getUrl());
        assertEquals("gbasedbt", datasource.getUsername());
    }

    @Test
    void deserializeGoldenDbDatasourceAsRelationalDatasource() throws Exception {
        String json = """
                {
                  "name": "GoldenDB数据源",
                  "dataSourceType": "goldendb",
                  "dataSource": {
                    "dataSourceType": "goldendb",
                    "driverName": "com.mysql.cj.jdbc.Driver",
                    "username": "goldendb",
                    "password": "encrypted",
                    "url": "jdbc:mysql://localhost:3306/test"
                  }
                }
                """;

        DataSourceEntity entity = new ObjectMapper().readValue(json, DataSourceEntity.class);

        assertEquals("goldendb", entity.getDataSourceType().getValue());
        RelationalDatasource datasource = assertInstanceOf(RelationalDatasource.class, entity.getDataSource());
        assertEquals("com.mysql.cj.jdbc.Driver", datasource.getDriverName());
        assertEquals("jdbc:mysql://localhost:3306/test", datasource.getUrl());
        assertEquals("goldendb", datasource.getUsername());
    }

    private static Object fieldValue(Object target, String fieldName) throws Exception {
        Class<?> clazz = target.getClass();
        while (clazz != null && clazz != Object.class) {
            try {
                java.lang.reflect.Field field = clazz.getDeclaredField(fieldName);
                field.setAccessible(true);
                return field.get(target);
            } catch (NoSuchFieldException ignored) {
                System.err.println(ExceptionUtils.getStackTrace(ignored));
                clazz = clazz.getSuperclass();
            }
        }
        throw new NoSuchFieldException(fieldName);
    }
}
