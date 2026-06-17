package com.gccloud.gcpaas.dataroom.core.datasource.service;

import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.BaseDataSource;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.DataSourceColumnMeta;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.DataSourceTableMeta;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.ExcelDatasource;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.RelationalDatasource;
import com.gccloud.gcpaas.dataroom.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.util.RsaUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * 数据源表和字段元数据查询服务
 */
@Service
@Slf4j
public class DataSourceMetadataService {

    @Resource
    private DataRoomConfig dataRoomConfig;

    @Resource
    private DataSource appDataSource;

    private static final String[] TABLE_TYPES = new String[]{"TABLE", "VIEW"};
    private static final String EXCEL_TABLE_PREFIX = "excel_";

    public List<DataSourceTableMeta> listTables(DataSourceEntity dataSourceEntity) {
        BaseDataSource baseDataSource = requireDataSource(dataSourceEntity);
        if (baseDataSource instanceof ExcelDatasource excelDatasource) {
            return listExcelTables(excelDatasource);
        }
        try (Connection connection = openConnection(baseDataSource)) {
            return listTables(connection);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("获取表信息失败: " + e.getMessage(), e);
        }
    }

    public List<DataSourceColumnMeta> listColumns(DataSourceEntity dataSourceEntity, String tableName) {
        if (StringUtils.isBlank(tableName)) {
            throw new DataRoomException("表名不能为空");
        }
        BaseDataSource baseDataSource = requireDataSource(dataSourceEntity);
        if (baseDataSource instanceof ExcelDatasource excelDatasource) {
            return listExcelColumns(excelDatasource, tableName);
        }
        try (Connection connection = openConnection(baseDataSource)) {
            return listColumns(connection, tableName);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("获取字段信息失败: " + e.getMessage(), e);
        }
    }

    public List<DataSourceTableMeta> listAppExcelTables() {
        try (Connection connection = appDataSource.getConnection()) {
            return listTables(connection).stream()
                    .filter(table -> StringUtils.startsWithIgnoreCase(table.getName(), EXCEL_TABLE_PREFIX))
                    .toList();
        } catch (SQLException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("获取Excel表信息失败: " + e.getMessage(), e);
        }
    }

    public List<DataSourceColumnMeta> listAppExcelColumns(String tableName) {
        if (!StringUtils.startsWithIgnoreCase(tableName, EXCEL_TABLE_PREFIX)) {
            return new ArrayList<>();
        }
        try (Connection connection = appDataSource.getConnection()) {
            return listColumns(connection, tableName);
        } catch (SQLException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("获取Excel字段信息失败: " + e.getMessage(), e);
        }
    }

    private List<DataSourceTableMeta> listExcelTables(ExcelDatasource excelDatasource) {
        if (StringUtils.isBlank(excelDatasource.getTableName())) {
            return new ArrayList<>();
        }
        try (Connection connection = appDataSource.getConnection()) {
            List<DataSourceTableMeta> tables = listTables(connection, excelDatasource.getTableName());
            if (!tables.isEmpty()) {
                return tables;
            }
        } catch (SQLException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            // Excel数据源仍可从保存的配置中返回表结构
        }
        DataSourceTableMeta tableMeta = new DataSourceTableMeta();
        tableMeta.setName(excelDatasource.getTableName());
        tableMeta.setType("TABLE");
        tableMeta.setComment(excelDatasource.getOriginalFileName());
        return List.of(tableMeta);
    }

    private List<DataSourceColumnMeta> listExcelColumns(ExcelDatasource excelDatasource, String tableName) {
        if (!tableName.equals(excelDatasource.getTableName())) {
            return new ArrayList<>();
        }
        try (Connection connection = appDataSource.getConnection()) {
            List<DataSourceColumnMeta> columns = listColumns(connection, tableName);
            if (!columns.isEmpty()) {
                return columns;
            }
        } catch (SQLException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            // Excel数据源仍可从保存的列配置中返回字段结构
        }
        if (excelDatasource.getColumns() == null) {
            return new ArrayList<>();
        }
        return excelDatasource.getColumns().stream().map(column -> {
            DataSourceColumnMeta columnMeta = new DataSourceColumnMeta();
            columnMeta.setName(column.getName());
            columnMeta.setType(column.getType());
            columnMeta.setComment(column.getOriginalHeader());
            return columnMeta;
        }).toList();
    }

    private List<DataSourceTableMeta> listTables(Connection connection) throws SQLException {
        return listTables(connection, null);
    }

    private List<DataSourceTableMeta> listTables(Connection connection, String tableName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        List<DataSourceTableMeta> tables = new ArrayList<>();
        for (String candidate : buildIdentifierCandidates(tableName)) {
            try (ResultSet resultSet = metaData.getTables(connection.getCatalog(), null, candidate, TABLE_TYPES)) {
                while (resultSet.next()) {
                    DataSourceTableMeta tableMeta = new DataSourceTableMeta();
                    tableMeta.setName(resultSet.getString("TABLE_NAME"));
                    tableMeta.setType(resultSet.getString("TABLE_TYPE"));
                    tableMeta.setComment(resultSet.getString("REMARKS"));
                    if (StringUtils.isNotBlank(tableMeta.getName()) && !containsTable(tables, tableMeta.getName())) {
                        tables.add(tableMeta);
                    }
                }
            }
            if (StringUtils.isNotBlank(tableName) && !tables.isEmpty()) {
                break;
            }
        }
        tables.sort((left, right) -> left.getName().compareToIgnoreCase(right.getName()));
        return tables;
    }

    private List<DataSourceColumnMeta> listColumns(Connection connection, String tableName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        List<DataSourceColumnMeta> columns = new ArrayList<>();
        for (String candidate : buildIdentifierCandidates(tableName)) {
            try (ResultSet resultSet = metaData.getColumns(connection.getCatalog(), null, candidate, null)) {
                while (resultSet.next()) {
                    DataSourceColumnMeta columnMeta = new DataSourceColumnMeta();
                    columnMeta.setName(resultSet.getString("COLUMN_NAME"));
                    columnMeta.setType(resultSet.getString("TYPE_NAME"));
                    columnMeta.setComment(resultSet.getString("REMARKS"));
                    if (StringUtils.isNotBlank(columnMeta.getName()) && !containsColumn(columns, columnMeta.getName())) {
                        columns.add(columnMeta);
                    }
                }
            }
            if (!columns.isEmpty()) {
                break;
            }
        }
        return columns;
    }

    private List<String> buildIdentifierCandidates(String identifier) {
        if (StringUtils.isBlank(identifier)) {
            return List.of("%");
        }
        String trimmed = identifier.trim();
        List<String> candidates = new ArrayList<>();
        candidates.add(trimmed);
        String upper = trimmed.toUpperCase(Locale.ROOT);
        if (!candidates.contains(upper)) {
            candidates.add(upper);
        }
        String lower = trimmed.toLowerCase(Locale.ROOT);
        if (!candidates.contains(lower)) {
            candidates.add(lower);
        }
        return candidates;
    }

    private boolean containsTable(List<DataSourceTableMeta> tables, String tableName) {
        return tables.stream().anyMatch(item -> item.getName().equalsIgnoreCase(tableName));
    }

    private boolean containsColumn(List<DataSourceColumnMeta> columns, String columnName) {
        return columns.stream().anyMatch(item -> item.getName().equalsIgnoreCase(columnName));
    }

    private BaseDataSource requireDataSource(DataSourceEntity dataSourceEntity) {
        if (dataSourceEntity == null || dataSourceEntity.getDataSource() == null) {
            throw new DataRoomException("数据源不存在");
        }
        return dataSourceEntity.getDataSource();
    }

    private Connection openConnection(BaseDataSource baseDataSource) throws Exception {
        if (baseDataSource instanceof ExcelDatasource) {
            return appDataSource.getConnection();
        }
        if (baseDataSource instanceof RelationalDatasource relationalDatasource) {
            if (StringUtils.isNotBlank(relationalDatasource.getDriverName())) {
                Class.forName(relationalDatasource.getDriverName());
            }
            String password = relationalDatasource.getPassword();
            if (StringUtils.isNotBlank(password) && StringUtils.isNotBlank(dataRoomConfig.getPrivateKey())) {
                password = RsaUtils.decryptByPrivateKey(password, dataRoomConfig.getPrivateKey());
            }
            return DriverManager.getConnection(relationalDatasource.getUrl(), relationalDatasource.getUsername(), password);
        }
        throw new DataRoomException("不支持的数据源类型");
    }
}
