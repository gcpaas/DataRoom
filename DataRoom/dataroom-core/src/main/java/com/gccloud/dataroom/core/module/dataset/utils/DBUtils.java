package com.gccloud.dataroom.core.module.dataset.utils;

import com.gccloud.dataroom.core.module.dataset.common.DbCommon;
import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.module.dataset.vo.DatasetProcessTestVo;
import com.gccloud.dataroom.core.module.dataset.constant.ReportDbType;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.utils.JSON;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.json.JSONObject;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.sql.*;
import java.util.*;

/**
 * @author yang.hw
 * @Description: 数据库连接工具类
 * @date 2021/9/13 11:23
 */
@Slf4j
@Component
public class DBUtils extends DbCommon {

    private static final String CREATE_TABLE_SQL = "CREATE TABLE ";

    private static final String DROP_TABLE_SQL = "DROP TABLE IF EXISTS  ";


    /**
     * 最大限制条数
     */
    private static final Integer MAX_SIZE = 10000;

    /**
     * 执行 sql脚本 获取数据 及结构，暂提供 clickhouse、mysql
     *
     * @param sql              脚本
     * @param params           入参
     * @param datasourceConfig 数据源
     * @return
     */
    public static Map<String, List<Map<String, Object>>> getClickHouseValue(String sql, List<DatasetParamDto> params, DatasourceConfig datasourceConfig) {

        List<DatasetParamDto> copyParamsList = new ArrayList<>(params);
        sql = updateParamsConfig(sql, copyParamsList);
        log.info("执行sql:{}", sql);
        Map<String, List<Map<String, Object>>> map = new HashMap<>();
        List<Map<String, Object>> dataPreview = new ArrayList<>();
        List<Map<String, Object>> structurePreview = new ArrayList<>();
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {
            pStemt = conn.prepareStatement(sql);
            insertParamsConfig(copyParamsList, pStemt);
            long sqlExecuteStartTime = System.currentTimeMillis();

            ResultSet clickRs = pStemt.executeQuery();
            ResultSetMetaData metaData = clickRs.getMetaData();
            int columnCount = metaData.getColumnCount();
            while (clickRs.next()) {
                //LinkedHashMap 保证数据字段顺序同数据库一致
                LinkedHashMap<String, Object> map1 = new LinkedHashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    String columnTypeName = metaData.getColumnTypeName(i);
                    if ("NCLOB".equalsIgnoreCase(columnTypeName)
                            || "CLOB".equalsIgnoreCase(columnTypeName)
                            || "BLOB".equalsIgnoreCase(columnTypeName)) {
                        map1.put(metaData.getColumnName(i), clickRs.getString(i));
                    } else if ("timestamp".equalsIgnoreCase(columnTypeName)) {
                        String time = clickRs.getString(i);
                        if (time != null && time.contains(".")) {
                            time = time.substring(0, time.lastIndexOf("."));
                        }
                        map1.put(metaData.getColumnName(i), time);
                    } else {
                        map1.put(metaData.getColumnName(i), clickRs.getObject(i));
                    }
                }
                dataPreview.add(map1);
            }

            long sqlExecuteEndTime = System.currentTimeMillis();

            log.info("SQL执行耗时：{}s", (float) (sqlExecuteEndTime - sqlExecuteStartTime) / 1000);

            for (int i = 0; i < columnCount; i++) {
                Map<String, Object> map2 = new HashMap<>();
                map2.put("columnName", metaData.getColumnName(i + 1));
                map2.put("columnType", metaData.getColumnTypeName(i + 1));
                structurePreview.add(map2);
            }
            map.put("dataPreview", dataPreview);
            map.put("structurePreview", structurePreview);

        } catch (SQLException e) {
            if (e.getMessage().contains("doesn't exist") || e.getMessage().contains("does not exist")) {
                log.error("数据查询失败：查询表不存在：{}", e.getMessage());
                throw new GlobalException("数据查询失败：查询表不存在");
            } else if (e.getMessage().contains("parameter")) {
                log.error("数据查询失败：请检查参数是否配置规范：{}", e.getMessage());
                throw new GlobalException("数据查询失败：请检查参数是否配置规范");
            } else {
                log.error("数据查询失败：{}", e.getMessage());
                throw new GlobalException("数据查询失败");
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            log.error(e.getMessage());
            throw new GlobalException("请检查参数配置与SQL加工脚本是否对应");
        } catch (Exception e) {
            log.error("数据查询失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("数据查询失败" + e.getMessage());
        } finally {//关闭连接
            finalUtils(conn);
        }
        return map;
    }

    public static Map<String, List<Map<String, Object>>> getOracleValue(String sql, List<DatasetParamDto> param, DatasourceConfig datasourceConfig) {
        List<DatasetParamDto> params = new ArrayList<>(param);
        sql = updateParamsConfig(sql, params);
        log.info("执行sql:{}", sql);
        Map<String, List<Map<String, Object>>> map = new HashMap<>();
        List<Map<String, Object>> dataPreview = new ArrayList<>();
        List<Map<String, Object>> structurePreview = new ArrayList<>();
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {
            pStemt = conn.prepareStatement(sql);
            insertParamsConfig(params, pStemt);
            ResultSet clickRs = pStemt.executeQuery();
            ResultSetMetaData metaData = clickRs.getMetaData();
            int columnCount = metaData.getColumnCount() - 1;
            while (clickRs.next()) {
                //LinkedHashMap 保证数据字段顺序同数据库一致
                LinkedHashMap<String, Object> map1 = new LinkedHashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    map1.put(metaData.getColumnName(i), clickRs.getObject(i));
                }
                dataPreview.add(map1);
            }
            for (int i = 0; i < columnCount; i++) {
                Map<String, Object> map2 = new HashMap<>();
                map2.put("columnName", metaData.getColumnName(i + 1));
                map2.put("columnType", metaData.getColumnTypeName(i + 1));
                structurePreview.add(map2);
            }
            map.put("dataPreview", dataPreview);
            map.put("structurePreview", structurePreview);

        } catch (SQLException e) {
            if (e.getMessage().contains("doesn't exist") || e.getMessage().contains("does not exist")) {
                log.error("数据查询失败：查询表不存在：{}", e.getMessage());
                throw new GlobalException("数据查询失败：查询表不存在");
            } else if (e.getMessage().contains("parameter")) {
                log.error("数据查询失败：请检查参数是否配置规范：{}", e.getMessage());
                throw new GlobalException("数据查询失败：请检查参数是否配置规范");
            } else {
                log.error("数据查询失败：{}", e.getMessage());
                throw new GlobalException("数据查询失败");
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            log.error(e.getMessage());
            throw new GlobalException("请检查参数配置与SQL加工脚本是否对应");
        } catch (Exception e) {
            log.error("数据查询失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("数据查询失败" + e.getMessage());
        } finally {//关闭连接
            finalUtils(conn);
        }
        return map;
    }

    public static Map<String, List<Map<String, Object>>> getHiveValue(String sql, List<DatasetParamDto> params, DatasourceConfig datasourceConfig) {
        Map<String, List<Map<String, Object>>> map = new HashMap<>();
        List<Map<String, Object>> dataPreview = new ArrayList<>();
        List<Map<String, Object>> structurePreview = new ArrayList<>();
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {
            pStemt = conn.prepareStatement(sql);
            insertParamsConfig(params, pStemt);
            ResultSet clickRs = pStemt.executeQuery();
            ResultSetMetaData metaData = clickRs.getMetaData();
            int columnCount = metaData.getColumnCount();
            while (clickRs.next()) {
                //LinkedHashMap 保证数据字段顺序同数据库一致
                LinkedHashMap<String, Object> map1 = new LinkedHashMap<>();
                for (int i = 2; i <= columnCount; i++) {
                    map1.put(metaData.getColumnName(i), clickRs.getObject(i));
                }
                dataPreview.add(map1);
            }
            for (int i = 2; i <= columnCount; i++) {
                Map<String, Object> map2 = new HashMap<>();
                map2.put("columnName", metaData.getColumnName(i));
                map2.put("columnType", metaData.getColumnTypeName(i));
                structurePreview.add(map2);
            }

            map.put("dataPreview", dataPreview);
            map.put("structurePreview", structurePreview);

        } catch (SQLException e) {
            if (e.getMessage().contains("doesn't exist")) {
                log.error("数据查询失败：查询表不存在：{}", e.getMessage());
                throw new GlobalException("数据查询失败：查询表不存在");
            } else {
                log.error("数据查询失败：{}", e.getMessage());
                throw new GlobalException("数据查询失败");
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            log.error(e.getMessage());
            throw new GlobalException("请检查参数配置与SQL加工脚本是否对应");
        } catch (Exception e) {
            log.error("数据查询失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("数据查询失败" + e.getMessage());
        } finally {//关闭连接
            finalUtils(conn);
        }

        return map;
    }

    /**
     * 根据sql脚本获取数据并批量插入数据集 暂提供clickhouse、mysql
     *
     * @param sql              脚本
     * @param code             表名
     * @param params           入参
     * @param datasourceConfig 执行sql脚本的数据源
     * @param datasetConfig    执行批量插入的数据源
     * @return
     */
    public static Integer batchInsertData(String sql, String code, List<DatasetParamDto> params, DatasourceConfig datasourceConfig, DatasourceConfig datasetConfig) {
        Integer insertSize = 0;
        //根据sql脚本获取数据
        List<Map<String, Object>> dataPreview = new ArrayList<>();
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {
            sql = updateParamsConfig(sql, params);
            pStemt = conn.prepareStatement(sql);
            insertParamsConfig(params, pStemt);
            ResultSet clickRs = pStemt.executeQuery();
            ResultSetMetaData metaData = clickRs.getMetaData();
            int columnCount = metaData.getColumnCount();
            while (clickRs.next()) {
                Map<String, Object> map = new LinkedHashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    map.put(metaData.getColumnName(i), clickRs.getString(i));
                    //适配数据库时间查询为datetime 存在.0(udal数据库出现) .357(telepg数据库出现)
                    if (!StringUtils.isEmpty(metaData.getColumnTypeName(i)) && !StringUtils.isEmpty(clickRs.getString(i))) {
                        if (("datetime".equalsIgnoreCase(metaData.getColumnTypeName(i))
                                || "timestamp".equalsIgnoreCase(metaData.getColumnTypeName(i)))
                                && clickRs.getString(i).contains(".")) {
                            String substring = clickRs.getString(i).substring(0, clickRs.getString(i).lastIndexOf("."));
                            map.put(metaData.getColumnName(i), substring);
                        }
                    }
                }
                dataPreview.add(map);
            }
        } catch (SQLException e) {
            log.error("执行sql脚本的查询数据失败:{}", e.getMessage());
            throw new GlobalException("执行sql脚本的查询数据失败" + e.getMessage());
        } catch (ArrayIndexOutOfBoundsException e) {
            log.error(e.getMessage());
            throw new GlobalException("请检查参数配置与SQL加工脚本是否对应");
        } catch (Exception e) {
            log.error("执行sql脚本的查询数据失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("执行sql脚本的查询数据失败" + e.getMessage());
        } finally {//关闭连接
            finalUtils(conn);
        }
        String jsonString;
        List<Map<String, Object>> newDataPreview;
        if (dataPreview.size() > 0) {
            int dataPreviewSize = dataPreview.size();
            int insertTime = dataPreviewSize / 10000 + 1;
            int startSubListIndex, endSubListIndex;

            for (int i = 0; i < insertTime; i++) {
                Connection connInsert = getConnection(datasetConfig);
                PreparedStatement pInsertStemt;

                startSubListIndex = i * 10000;
                int nexIndex = i * 10000 + 10000;
                endSubListIndex = nexIndex > dataPreviewSize ? dataPreviewSize : nexIndex;
                log.info("分批次插入，startSubListIndex:{},endSubListIndex:{}", startSubListIndex, endSubListIndex);
                if (startSubListIndex >= endSubListIndex) {
                    break;
                }
                newDataPreview = dataPreview.subList(startSubListIndex, endSubListIndex);

                jsonString = JSON.toJSONString(newDataPreview);
                try {
                    jsonString = jsonString.substring(1, jsonString.length() - 1);
                    String insertSql = "INSERT INTO " + code + " FORMAT JSONEachRow" + jsonString;
                    if (insertSql.contains("?")) {
                        insertSql = insertSql.replaceAll("\\?", "\\\\?");
                    }
                    pInsertStemt = connInsert.prepareStatement(insertSql);
                    pInsertStemt.executeUpdate();
                    insertSize += newDataPreview.size();
                    log.info("累计插入个数，insertSize:{}", insertSize);
                } catch (SQLException e) {
                    if (insertSize > 0) {
                        log.error("分批插入，插入成功条数：{}条,插入失败错误信息:{}", insertSize, e.getMessage());
                        return insertSize;
                    } else {
                        log.error("分批插入,插入失败:{}", e.getMessage());
                        throw new GlobalException("分批插入,插入失败" + e.getMessage());
                    }
                } catch (Exception e) {
                    log.error("分批插入,插入失败:{}", ExceptionUtils.getStackTrace(e));
                    throw new GlobalException("分批插入,插入失败" + e.getMessage());
                } finally {//关闭连接
                    finalUtils(connInsert);
                }
            }
        } else {
            log.info("**********批量插入数据集插入数据为空**********");
            return insertSize;
        }
        return insertSize;
    }

    /**
     * 执行clickhouse sql脚本 建立新表
     *
     * @param sql              脚本
     * @param code             表名
     * @param params           参数
     * @param datasourceConfig 数据源
     */
    public static void createTable(String sql, String code, List<DatasetParamDto> params, DatasourceConfig datasourceConfig) {
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt = null;
        PreparedStatement pStemt2 = null;
        try {
            //获取新建表的一个字段作为Order by 引擎
            pStemt = conn.prepareStatement(sql);
            insertParamsConfig(params, pStemt);
            ResultSet clickRs = pStemt.executeQuery();
            ResultSetMetaData metaData = clickRs.getMetaData();
            String columnName = metaData.getColumnName(1);

            //执行创建表的 sql脚本
            String createSql = CREATE_TABLE_SQL + code + " ENGINE = MergeTree ORDER BY " + columnName + "  AS " + sql;
            pStemt2 = conn.prepareStatement(createSql);
            insertParamsConfig(params, pStemt2);
            pStemt2.executeUpdate();
        } catch (SQLException e) {
            log.error(e.getMessage());
            throw new GlobalException(e.getMessage());
        } catch (ArrayIndexOutOfBoundsException e) {
            log.error(e.getMessage());
            throw new GlobalException("请检查参数配置与SQL加工脚本是否对应");
        } finally {//关闭连接
            finalUtils(conn);
        }
    }

    /**
     * 根据sql 语句查询数据源数据，获取表结构在clickHouse里面建立数据集
     *
     * @param sql           sql语句
     * @param code          表名
     * @param params        动态参数
     * @param tableConfig   原始表数据源
     * @param datasetConfig 数据集数据源
     * @param fieldJson     字段注释Json
     */
    public static void createTableByDatasource(
            String sql,
            String code,
            List<DatasetParamDto> params,
            DatasourceConfig tableConfig,
            DatasourceConfig datasetConfig,
            JSONObject fieldJson) {

        //执行sql脚本，查询数据，完成建表语句
        Connection tableConn = getConnection(tableConfig);
        PreparedStatement tableStemt;
        StringBuilder field = new StringBuilder();
        String createSql;
        try {
            sql = updateParamsConfig(sql, params);
            tableStemt = tableConn.prepareStatement(sql);
            insertParamsConfig(params, tableStemt);
            ResultSet clickRs = tableStemt.executeQuery();
            ResultSetMetaData metaData = clickRs.getMetaData();
            int columnCount = metaData.getColumnCount();
            //等同主键，必须要加！
            String orderId = metaData.getColumnName(1);

            for (int i = 0; i < columnCount; i++) {
                String columnName = metaData.getColumnName(i + 1);
                String columnType = metaData.getColumnTypeName(i + 1);
                if (!"ClickHouse".equals(tableConfig.getSourceType())) {
                    columnType = dataTypeMysqlToClickhouse(metaData.getColumnTypeName(i + 1));
                }
                String comment = "";
                if (null != fieldJson && !fieldJson.isEmpty()) {

                    comment = String.valueOf(fieldJson.get(columnName));

                }
                field.append("\"").append(columnName).append("\"").append(" ").append(columnType).append(" COMMENT ").append("'").append(comment).append("'").append(",");
            }

            String substringField = "";
            if (!StringUtils.isEmpty(field)) {
                substringField = field.substring(0, field.length() - 1);
            }
            createSql = CREATE_TABLE_SQL + code + " (" + substringField + ") " + "ENGINE = MergeTree() ORDER BY " + orderId;
            log.info("创建数据集sql最终脚本：{}", createSql);
        } catch (SQLException e) {
            log.error("生成建表语句失败：{}", e.getMessage());
            throw new GlobalException("生成建表语句失败");
        } catch (ArrayIndexOutOfBoundsException e) {
            log.error(e.getMessage());
            throw new GlobalException("请检查参数配置与SQL加工脚本是否对应");
        } catch (Exception e) {
            log.error("生成建表语句失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("生成建表语句失败" + e.getMessage());
        } finally {//关闭连接
            finalUtils(tableConn);
        }
        //建立数据集
        Connection datasetConn = getConnection(datasetConfig);
        PreparedStatement datasetStemt;
        try {
            //执行创建表的 sql脚本
            datasetStemt = datasetConn.prepareStatement(createSql);
            datasetStemt.executeUpdate();
        } catch (SQLException e) {
            log.error("根据建表语句新建数据集失败:{}", e.getMessage());
            throw new GlobalException("根据建表语句新建数据集失败");
        } catch (Exception e) {
            log.error("根据建表语句新建数据集失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("根据建表语句新建数据集失败" + e.getMessage());
        } finally {//关闭连接
            finalUtils(datasetConn);
        }
    }

    /**
     * 执行clickhouse sql脚本 删除表
     *
     * @param tableName        表名
     * @param datasourceConfig 数据源
     */
    public static void dropTable(String tableName, DatasourceConfig datasourceConfig) {
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {
            String sql = DROP_TABLE_SQL + tableName;
            pStemt = conn.prepareStatement(sql);
            pStemt.executeUpdate();

        } catch (SQLException e) {
            log.error("删除表失败:{}", e.getMessage());
            throw new GlobalException("删除表失败");
        } catch (Exception e) {
            log.error("删除表失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("删除表失败" + e.getMessage());
        } finally {//关闭连接
            finalUtils(conn);
        }
    }

    /**
     * 执行clickhouse sql脚本 清空表
     */
    public static void deleteTable(String tableName, DatasourceConfig datasourceConfig) {
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {
            String sql = "ALTER TABLE " + tableName + " DELETE WHERE 1 = 1";
            pStemt = conn.prepareStatement(sql);
            pStemt.executeUpdate();

        } catch (SQLException e) {
            log.error("执行clickhouse sql脚本 清空表失败:{}", e.getMessage());
            throw new GlobalException("执行clickhouse sql脚本 清空表失败");
        } catch (Exception e) {
            log.error("执行clickhouse sql脚本 清空表失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("执行clickhouse sql脚本 清空表失败");
        } finally {//关闭连接
            finalUtils(conn);
        }
    }

    /**
     * 删除视图
     *
     * @param viewName         视图名
     * @param datasourceConfig 数据源
     */
    public static void dropView(String viewName, DatasourceConfig datasourceConfig) {
        dropView(viewName, datasourceConfig, ReportDbType.MYSQL.getUpInfo());
    }

    /**
     * jsqlparser 依据sql语句获取表名
     *
     * @param sql sql语句
     */
    public static List<String> getTableNames(String sql) {

        return TableNameUtils.getFromTo(sql);
    }

    /**
     * 将MySQL数据库的数据类型转换为代码中的数据类型
     *
     * @param dbFieldType mysql数据类型
     */
    private static String dataTypeMysqlToClickhouse(String dbFieldType) {
        if ("VARCHAR".equalsIgnoreCase(dbFieldType)
                || "TEXT".equalsIgnoreCase(dbFieldType)
                || "CHAR".contains(dbFieldType)) {
            return "String";
        } else if ("BIGINT".equalsIgnoreCase(dbFieldType)
                || "NUMBER".equalsIgnoreCase(dbFieldType)) {
            return "Int64";
        } else if ("INT".equalsIgnoreCase(dbFieldType)) {
            return "Int32";
        } else if ("TINYINT".equalsIgnoreCase(dbFieldType)) {
            return "Int8";
        } else if ("DATETIME".equalsIgnoreCase(dbFieldType)
                || "TIMESTAMP".equalsIgnoreCase(dbFieldType)
        ) {
            return "DateTime";
        } else if ("DATE".equalsIgnoreCase(dbFieldType)) {
            return "Date";
        } else if ("DOUBLE".equalsIgnoreCase(dbFieldType)
                || "BINARY_DOUBLE".equalsIgnoreCase(dbFieldType)) {
            return "Float64";
        } else if ("FLOAT".equalsIgnoreCase(dbFieldType)
                || "DECIMAL".equalsIgnoreCase(dbFieldType)
                || "BINARY_FLOAT".equalsIgnoreCase(dbFieldType)) {
            return "Float32";
        } else {
            return "String";
        }
    }


    /**
     * 获取分批页数
     */
    private static int getPageSize(Integer totalCount) {
        int size = totalCount / MAX_SIZE;
        int remain = totalCount % MAX_SIZE;
        if (remain != 0) {
            size += 1;
        }
        return size;
    }

    /**
     * 获取总数
     */
    private static int getTotalCount(Connection conn, String sql) {
        try {
            String countSql = "select count(1) from (" + sql + " )f";
            PreparedStatement pStemt = conn.prepareStatement(countSql);
            ResultSet clickRs = pStemt.executeQuery();
            boolean next = clickRs.next();
            int totalCount = 0;
            if (next) {
                totalCount = clickRs.getInt(1);
            }
            return totalCount;
        } catch (SQLException e) {
            log.error("获取总数失败，{}", e);
            return 0;
        }
    }

    /**
     * 用于测试SQL语法是否正常
     */
    public static DatasetProcessTestVo checkSql(String sql, List<DatasetParamDto> param, DatasourceConfig datasourceConfig) {
        DatasetProcessTestVo datasetProcessTestVo = new DatasetProcessTestVo();
        List<DatasetParamDto> params = new ArrayList<>(param);
        sql = updateParamsConfig(sql, params);
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {
            pStemt = conn.prepareStatement(sql);
            insertParamsConfig(params, pStemt);
            datasetProcessTestVo.setCode(200);
            datasetProcessTestVo.setSql(sql);
            pStemt.executeQuery();
            return datasetProcessTestVo;
        } catch (Exception e) {
            datasetProcessTestVo.setCode(500);
            datasetProcessTestVo.setMsg(e.getMessage());
            datasetProcessTestVo.setException(ExceptionUtils.getStackTrace(e));
            return datasetProcessTestVo;
        }
    }
}
