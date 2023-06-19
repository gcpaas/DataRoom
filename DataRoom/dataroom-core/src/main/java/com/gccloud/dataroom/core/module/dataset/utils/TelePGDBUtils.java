package com.gccloud.dataroom.core.module.dataset.utils;

import com.gccloud.dataroom.core.module.dataset.common.DbCommon;
import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.module.dataset.constant.ReportDbType;
import com.gccloud.dataroom.core.exception.GlobalException;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.parser.CCJSqlParserManager;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.delete.Delete;
import net.sf.jsqlparser.statement.insert.Insert;
import net.sf.jsqlparser.statement.replace.Replace;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.update.Update;
import net.sf.jsqlparser.util.TablesNamesFinder;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.json.JSONObject;
import org.springframework.util.StringUtils;

import java.io.StringReader;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.*;

/**
 * @Description: 数据库连接工具类
 * @Author liyong
 * @Date 2021/11/25
 */
@Slf4j
public class TelePGDBUtils extends DbCommon {

    private static final String CREATE_TABLE_SQL = "CREATE TABLE ";

    private static final String DROP_TABLE_SQL = "DROP TABLE IF EXISTS  ";

    private static final CCJSqlParserManager pm = new CCJSqlParserManager();

    /**
     * 执行 sql脚本 获取数据 及结构
     *
     * @param sql              脚本
     * @param params           入参
     * @param datasourceConfig 数据源
     */
    public static Map<String, List<Map<String, Object>>> getClickHouseValue(String sql, List<DatasetParamDto> params, DatasourceConfig datasourceConfig) {

        List<DatasetParamDto> copyParamsList = new ArrayList<>(params);
        sql = updateParamsConfig(sql, copyParamsList);

        Map<String, List<Map<String, Object>>> map = new HashMap<>();
        List<Map<String, Object>> dataPreview = new ArrayList<>();
        List<Map<String, Object>> structurePreview = new ArrayList<>();
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {

            pStemt = conn.prepareStatement(sql);
            if (copyParamsList.size() > 0) {
                int size = copyParamsList.size();
                for (int i = 0; i < size; i++) {
                    if (StringUtils.isEmpty(copyParamsList.get(i).getValue())) {
                        throw new GlobalException("参数值不能为空");
                    }
                    //判断参数类型是否是时间类型，进行转换
                    if (("Date").equalsIgnoreCase(copyParamsList.get(i).getType())) {
                        if (ReportDbType.POSTGRESQL.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType())) {
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                            Date date = sdf.parse(copyParamsList.get(i).getValue());
                            Timestamp timestamp = new Timestamp(date.getTime());
                            pStemt.setTimestamp(i + 1, timestamp);
                        } else {
                            pStemt.setObject(i + 1, copyParamsList.get(i).getValue());
                        }
                    } else if (("Integer").equalsIgnoreCase(copyParamsList.get(i).getType())) {
                        if (ReportDbType.POSTGRESQL.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType())) {
                            pStemt.setInt(i + 1, Integer.parseInt(copyParamsList.get(i).getValue()));
                        } else {
                            pStemt.setObject(i + 1, Integer.parseInt(copyParamsList.get(i).getValue()));
                        }
                    } else {
                        pStemt.setObject(i + 1, copyParamsList.get(i).getValue());
                    }
                }
            }

            ResultSet clickRs = pStemt.executeQuery();
            ResultSetMetaData metaData = clickRs.getMetaData();
            int columnCount = metaData.getColumnCount();
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

    public static Map<String, List<Map<String, Object>>> getHiveFieldComment(String sql, List<DatasetParamDto> params, DatasourceConfig datasourceConfig) {
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
                for (int i = 1; i <= columnCount; i++) {
                    if (i == 2) {
                        continue;
                    }
                    map1.put(metaData.getColumnName(i), clickRs.getObject(i));
                }
                dataPreview.add(map1);
            }
            for (int i = 0; i < columnCount; i++) {
                if (i == 1) {
                    continue;
                }
                Map<String, Object> map2 = new HashMap<>();
                map2.put("columnName", metaData.getColumnName(i + 1));
                map2.put("columnType", metaData.getColumnTypeName(i + 1));
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
     * 获取hive数仓的数据和字段类型
     *
     * @param sql              sql语句
     * @param params           参数
     * @param datasourceConfig 数据源
     */
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
            pStemt = conn.prepareStatement(sql);
            if (params.size() > 0) {
                int size = params.size();
                for (int i = 0; i < size; i++) {
                    if (StringUtils.isEmpty(params.get(i).getValue())) {
                        throw new GlobalException("参数值不能为空");
                    }
                    if (("Date").equalsIgnoreCase(params.get(i).getType())) {
                        if (ReportDbType.POSTGRESQL.getUpInfo().equalsIgnoreCase(datasetConfig.getSourceType())) {
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                            Date date = sdf.parse(params.get(i).getValue());
                            Timestamp timestamp = new Timestamp(date.getTime());
                            pStemt.setTimestamp(i + 1, timestamp);
                        } else {
                            pStemt.setObject(i + 1, params.get(i).getValue());
                        }
                    } else if (("Integer").equalsIgnoreCase(params.get(i).getType())) {
                        if (ReportDbType.POSTGRESQL.getUpInfo().equalsIgnoreCase(datasetConfig.getSourceType())) {
                            pStemt.setInt(i + 1, Integer.parseInt(params.get(i).getValue()));
                        } else {
                            pStemt.setObject(i + 1, Integer.parseInt(params.get(i).getValue()));
                        }
                    } else {
                        pStemt.setObject(i + 1, params.get(i).getValue());
                    }
                }
            }
            ResultSet clickRs = pStemt.executeQuery();
            ResultSetMetaData metaData = clickRs.getMetaData();
            int columnCount = metaData.getColumnCount();
            while (clickRs.next()) {
                Map<String, Object> map = new LinkedHashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    map.put(metaData.getColumnName(i), clickRs.getString(i));
                    if (!StringUtils.isEmpty(metaData.getColumnTypeName(i))
                            && !StringUtils.isEmpty(clickRs.getString(i))) {
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
        //用于放置每一批次的数据
        List<Map<String, Object>> newDataPreview;
        if (dataPreview != null && dataPreview.size() > 0) {
            //获取字段,拼接初始sql
            List<String> fields = new ArrayList<>();
            Map<String, Object> dataMap = dataPreview.get(0);
            Set<String> keySet = dataMap.keySet();
            if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType())) {
                keySet.forEach(key -> fields.add(key.toLowerCase(Locale.ROOT)));
            } else {
                fields.addAll(keySet);
            }
            StringBuilder sb = new StringBuilder();
            sb.append("(");
            for (String field : fields) {
                sb.append("\"").append(field).append("\",");
            }
            String s = sb.toString();
            String substring = s.substring(0, s.lastIndexOf(","));
            substring += ")";
            String insertSql = "INSERT INTO " + code + substring + "  VALUES";

            int dataPreviewSize = dataPreview.size();
            //分批插入数据的批次
            int insertTime = dataPreviewSize / 5000 + 1;
            //每批数据的开始 和 结束索引
            int startSubListIndex, endSubListIndex;


            for (int i = 0; i < insertTime; i++) {
                // 获取连接
                Connection connInsert = getConnection(datasetConfig);
                PreparedStatement pInsertStemt;

                startSubListIndex = i * 5000;
                int nexIndex = i * 5000 + 5000;
                endSubListIndex = nexIndex > dataPreviewSize ? dataPreviewSize : nexIndex;
                log.info("分批次插入，startSubListIndex:{},endSubListIndex:{}", startSubListIndex, endSubListIndex);
                if (startSubListIndex >= endSubListIndex) {
                    break;
                }
                //获取每一批次的数据，用于遍历循环取值
                newDataPreview = dataPreview.subList(startSubListIndex, endSubListIndex);

                String values = "";
                String finallSql = "";
                for (Map<String, Object> aNewDataPreview : newDataPreview) {
                    StringBuilder stringBuilder = new StringBuilder();
                    Set<String> keys = aNewDataPreview.keySet();
                    stringBuilder.append("(");
                    keys.forEach(key -> {
                        Object obj = aNewDataPreview.get(key);
                        if (obj instanceof Integer || obj instanceof Double || obj instanceof Float || obj == null) {
                            stringBuilder.append(obj).append(",");
                        } else {
                            stringBuilder.append("'").append(obj).append("'").append(",");
                        }
                    });
                    String substr = stringBuilder.substring(0, stringBuilder.lastIndexOf(","));
                    substr = substr + "),\n";
                    values = values + substr;
                }
                finallSql = insertSql + values.substring(0, values.lastIndexOf(","));
                try {
                    pInsertStemt = connInsert.prepareStatement(finallSql);
                    int update = pInsertStemt.executeUpdate();
                    insertSize = insertSize + update;
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
                } finally {
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
     * 根据sql 语句查询数据源数据，获取表结构在TelePG里面建立数据集
     *
     * @param sql           sql语句
     * @param code          表名
     * @param params        动态参数
     * @param tableConfig   原始表数据源
     * @param datasetConfig 数据集数据源
     * @param fieldJson     字段注释Json
     */
    public static void createTableByDatasource(String sql, String code, List<DatasetParamDto> params, DatasourceConfig tableConfig, DatasourceConfig datasetConfig, JSONObject fieldJson) {

        //执行sql脚本，查询数据，完成建表语句
        Connection tableConn = getConnection(tableConfig);
        PreparedStatement tableStemt;
        StringBuilder field = new StringBuilder();
        String createSql;
        try {
            tableStemt = tableConn.prepareStatement(sql);
            if (params.size() > 0) {
                int size = params.size();
                for (int i = 0; i < size; i++) {
                    if (StringUtils.isEmpty(params.get(i).getValue())) {
                        throw new GlobalException("参数值不能为空");
                    }
                    if (("Date").equalsIgnoreCase(params.get(i).getType())) {
                        if (ReportDbType.POSTGRESQL.getUpInfo().equalsIgnoreCase(tableConfig.getSourceType())) {
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                            Date date = sdf.parse(params.get(i).getValue());
                            Timestamp timestamp = new Timestamp(date.getTime());
                            tableStemt.setTimestamp(i + 1, timestamp);
                        } else {
                            tableStemt.setObject(i + 1, params.get(i).getValue());
                        }
                    } else if (("Integer").equalsIgnoreCase(params.get(i).getType())) {
                        if (ReportDbType.POSTGRESQL.getUpInfo().equalsIgnoreCase(tableConfig.getSourceType())) {
                            tableStemt.setInt(i + 1, Integer.parseInt(params.get(i).getValue()));
                        } else {
                            tableStemt.setObject(i + 1, Integer.parseInt(params.get(i).getValue()));
                        }
                    } else {
                        tableStemt.setObject(i + 1, params.get(i).getValue());
                    }
                }
            }

            ResultSet clickRs = tableStemt.executeQuery();
            ResultSetMetaData metaData = clickRs.getMetaData();
            int columnCount = metaData.getColumnCount();
            //等同主键，必须要加！
            //String orderId = metaData.getColumnName(1);
            //最终的注释
            String finalComment = "";
            for (int i = 0; i < columnCount; i++) {
                String columnName = metaData.getColumnName(i + 1);
                String columnType = metaData.getColumnTypeName(i + 1);
                if (!"TelePG".equals(tableConfig.getSourceType())) {
                    columnType = dataTypeMysqlToClickhouse(metaData.getColumnTypeName(i + 1));
                }

                String comment = "";
                if (fieldJson != null) {
                    if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(tableConfig.getSourceType())) {
                        comment = String.valueOf(fieldJson.get(columnName.toUpperCase()));
                    } else {
                        comment = String.valueOf(fieldJson.get(columnName));
                    }
                }
                StringBuilder comStringBuilder = new StringBuilder();
                //判断获取数据的数据源是否为Orcl数据源，如果是，则将字段名转为小写再建表
                if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(tableConfig.getSourceType())) {
                    columnName = columnName.toLowerCase();
                }
                String commentOnColumn = comStringBuilder
                        .append("comment on column ")
                        .append("\"").append(code)
                        .append("\".").append("\"").append(columnName).append("\" is ").append("'").append(comment).append("';\n").toString();
                finalComment += commentOnColumn;

                field.append("\"").append(columnName).append("\"").append(" ").append(columnType).append(",");
            }

            String substringField = "";
            if (!StringUtils.isEmpty(field)) {
                substringField = field.substring(0, field.length() - 1);
            }
            createSql = CREATE_TABLE_SQL + code + " (" + substringField + ");\n " + finalComment;
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
     * 执行telePG sql脚本 删除表 (修改完成)
     *
     * @param tableName        表名
     * @param datasourceConfig 数据源
     */
    public static void dropTable(String tableName, DatasourceConfig datasourceConfig) {
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt = null;
        try {
            String sql = DROP_TABLE_SQL + "\"" + tableName + "\"";
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
     * 执行telePG sql脚本 清空表 (修改完成)
     */
    public static void deleteTable(String tableName, DatasourceConfig datasourceConfig) {
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {
            String sql = "TRUNCATE " + "\"" + tableName + "\"";
            pStemt = conn.prepareStatement(sql);
            pStemt.executeUpdate();

        } catch (SQLException e) {
            log.error("执行clickhouse sql脚本 清空表失败:{}", e.getMessage());
            throw new GlobalException("执行clickhouse sql脚本 清空表失败");
        } catch (Exception e) {
            log.error("清空表失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("清空表失败" + e.getMessage());
        } finally {//关闭连接
            finalUtils(conn);
        }
    }

    /**
     * 删除视图（修改完成）
     *
     * @param viewName         视图名
     * @param datasourceConfig 数据源
     */
    public static void dropView(String viewName, DatasourceConfig datasourceConfig) {
        dropView(viewName, datasourceConfig, ReportDbType.POSTGRESQL.getUpInfo());
    }

    /**
     * jsqlparser 依据sql语句获取表名
     *
     * @param sql sql语句
     */
    public static List<String> getTableNames(String sql) throws Exception {
        List<String> tablenames = null;
        TablesNamesFinder tablesNamesFinder = new TablesNamesFinder();
        Statement statement = pm.parse(new StringReader(sql));
        if (statement instanceof Select) {
            tablenames = tablesNamesFinder.getTableList(statement);
        } else if (statement instanceof Update) {
            return null;
        } else if (statement instanceof Delete) {
            return null;
        } else if (statement instanceof Replace) {
            return null;
        } else if (statement instanceof Insert) {
            return null;
        }
        return tablenames;
    }

    /**
     * 将MySQL数据库的数据类型转换为代码中的数据类型 （修改完成）
     *
     * @param dbFieldType mysql数据类型
     */
    private static String dataTypeMysqlToClickhouse(String dbFieldType) {
        if ("VARCHAR".equalsIgnoreCase(dbFieldType)
                || "String".equalsIgnoreCase(dbFieldType)
                || dbFieldType.contains("CHAR")) {
            return "varchar";
        } else if ("TEXT".equalsIgnoreCase(dbFieldType)
                || dbFieldType.contains("CLOB")) {
            return "text";
        } else if ("BIGINT".equalsIgnoreCase(dbFieldType)
                || "Int64".equalsIgnoreCase(dbFieldType)
                || "NUMBER".equalsIgnoreCase(dbFieldType)) {
            return "bigint";
        } else if ("INT".equalsIgnoreCase(dbFieldType)
                || "Int32".equalsIgnoreCase(dbFieldType)) {
            return "int";
        } else if ("TINYINT".equalsIgnoreCase(dbFieldType)
                || "Int8".equalsIgnoreCase(dbFieldType)) {
            return "smallint";
        } else if ("DATETIME".equalsIgnoreCase(dbFieldType)
                || "TIMESTAMP".equalsIgnoreCase(dbFieldType)
                || "DATE".equals(dbFieldType)) {
            return "timestamp";
        } else if ("DATE".equalsIgnoreCase(dbFieldType)) {
            return "date";
        } else if ("DOUBLE".equalsIgnoreCase(dbFieldType)
                || "Float64".equalsIgnoreCase(dbFieldType)
                || "BINARY_DOUBLE".equalsIgnoreCase(dbFieldType)) {
            return "float8";
        } else if ("FLOAT".equalsIgnoreCase(dbFieldType)
                || "Float32".equalsIgnoreCase(dbFieldType)
                || "BINARY_FLOAT".equalsIgnoreCase(dbFieldType)) {
            return "float4";
        } else if ("DECIMAL".equalsIgnoreCase(dbFieldType)) {
            return "numeric";
        } else {
            return "varchar";
        }
    }
}
