package com.gccloud.dataroom.core.module.dataset.common;

import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.constant.ReportConstant;
import com.gccloud.dataroom.core.module.dataset.constant.ReportDbType;
import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.module.dataset.utils.DBUtils;
import com.gccloud.dataroom.core.module.dataset.utils.DESUtils;
import com.gccloud.dataroom.core.module.dataset.utils.ReportUtils;
import com.gccloud.dataroom.core.module.dataset.utils.TelePGDBUtils;
import com.gccloud.dataroom.core.exception.GlobalException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.sql.*;
import java.util.*;

/**
 * 数据源工具类公共类
 *
 * @author pan.shun
 * @since 2022/9/6 09:13
 */
@Slf4j
public class DbCommon {

    private static final String SQL = "SELECT * FROM  ";

    /**
     * 获取数据库连接
     *
     * @param datasourceConfig 数据源
     */
    public static Connection getConnection(DatasourceConfig datasourceConfig) {
        Connection connection;
        try {
            Class.forName(datasourceConfig.getDriverClassName());
            if (datasourceConfig.getUsername() != null && datasourceConfig.getPassword() != null) {
                connection = DriverManager.getConnection(
                        datasourceConfig.getUrl(), datasourceConfig.getUsername(), DESUtils.getDecryptString(datasourceConfig.getPassword()));
            } else {
                connection = DriverManager.getConnection(datasourceConfig.getUrl());
            }

        } catch (SQLSyntaxErrorException e) {
            log.error(e.getMessage());
            throw new GlobalException("数据库不存在");
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new GlobalException(getExceptionMessage(e.getMessage()));
        }
        return connection;
    }


    /**
     * 关闭连接
     */
    protected static void finalUtils(Connection conn) {
        try {
            if (conn != null) {
                conn.close();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 异常提示信息汉化处理
     *
     * @param message 异常message
     */
    private static String getExceptionMessage(String message) {
        if (message.contains("Connection refused")) {
            return "数据源连接超时";
        } else if (message.contains("password")) {
            return "数据源用户名或密码有误";
        } else if (message.contains("Database")) {
            return "数据库不存在";
        } else if (message.contains("driver")) {
            return "数据源连接url格式有误";
        } else if (message.contains("TCP/IP connection")) {
            return "数据源连接超时";
        } else if (message.contains("does not exist")) {
            return "数据库不存在";
        } else {
            return message;
        }
    }

    /**
     * 将sql语句中中进行非空标签的处理，同时参数变量替换成实际值
     *
     * @param sql    sql语句
     * @param params 参数配置
     */
    public static String updateParamsConfig(String sql, List<DatasetParamDto> params) {
        if (CollectionUtils.isEmpty(params)) {
            return sql;
        }
        for (DatasetParamDto param : params) {
            if (null == param.getStatus()) {
                continue;
            }
            if (!ReportConstant.SqlParamsStatus.VARIABLE.equals(param.getStatus())) {
                continue;
            }
//            checkParamsCode(sql, param.getName());
            if (sql.contains("<" + param.getName() + ">") && sql.contains("</" + param.getName() + ">")) {
                if (StringUtils.isEmpty(param.getValue())) {
                    // 具备非空判断标签中的内容给去掉
                    sql = ReportUtils.subRangeString(sql, "<" + param.getName() + ">", "</" + param.getName() + ">");
                } else {
                    sql = sql
                            .replaceAll("<" + param.getName() + ">", "")
                            .replaceAll("</" + param.getName() + ">", "");
                    sql = parameterReplace(param, sql);
                }
            } else {
                // 不具备非空判断标签
                sql = parameterReplace(param, sql);
            }
        }
        params.removeIf(next -> next.getStatus() != null && next.getStatus().equals(ReportConstant.SqlParamsStatus.VARIABLE));
        return sql;
    }

    /**
     * 将sql语句中?参数值插入进去
     */
    protected static void insertParamsConfig(List<DatasetParamDto> params, PreparedStatement pStemt) throws SQLException {
        if (params.size() > 0) {
            int size = params.size();
            for (int i = 0; i < size; i++) {
                if (StringUtils.isEmpty(params.get(i).getValue())) {
                    throw new GlobalException("参数值不能为空");
                }
                pStemt.setObject(i + 1, params.get(i).getValue());
            }
        }
    }

    /**
     * 参数名合法性校验
     */
    private static void checkParamsCode(String sql, String paramName) {
        if (!sql.contains("${" + paramName + "}")) {
            throw new GlobalException("全局变量 ${" + paramName + "}暂未配置");
        }
    }

    /**
     * sq语句中参数变量赋值
     */
    private static String parameterReplace(DatasetParamDto param, String sql) {
        if ("String".equalsIgnoreCase(param.getType()) || "Date".equalsIgnoreCase(param.getType())) {
            if (param.getValue().contains(",")) {
                sql = sql.replaceAll("\\$\\{" + param.getName() + "\\}", param.getValue());
            } else {
                sql = sql.replaceAll("\\$\\{" + param.getName() + "\\}", "'" + param.getValue() + "'");
            }
        } else {
            sql = sql.replaceAll("\\$\\{" + param.getName() + "\\}", param.getValue());
        }
        return sql;
    }


    /**
     * 获取数据库表字段、属性 暂提供 mysql clickHouse
     *
     * @param tableName        表名
     * @param datasourceConfig 数据源
     */
    public static List<Map<String, Object>> getFieldNameAndType(String tableName, DatasourceConfig datasourceConfig) {
        List<Map<String, Object>> fieldAndTypeList = new ArrayList<>();
        Connection conn = getConnection(datasourceConfig);

        String sourceType = datasourceConfig.getSourceType();
        /*列名注释集合*/
        List<String> columnComments = new ArrayList<>();
        switch (sourceType) {
            case "Mysql":
                PreparedStatement pStemt;
                ResultSet rs;
                String tableSql = SQL + tableName + " limit 0";
                try {
                    pStemt = conn.prepareStatement(tableSql);
                    ResultSetMetaData rsmd = pStemt.getMetaData();
                    rs = pStemt.executeQuery("show full columns from " + tableName);
                    while (rs.next()) {
                        columnComments.add(rs.getString("Comment"));
                    }
                    int size = rsmd.getColumnCount();
                    insertIntoFieldTypeList(size, rsmd, columnComments, fieldAndTypeList);

                } catch (SQLException e) {
                    log.error("获取" + tableName + "表字段失败：" + e.getMessage());
                    throw new GlobalException("获取" + tableName + "表字段失败");
                } catch (Exception e) {
                    log.error("获取表字段失败:{}", ExceptionUtils.getStackTrace(e));
                    throw new GlobalException("获取表字段失败" + e.getMessage());
                } finally {//关闭连接
                    finalUtils(conn);
                }
                break;
            case "ClickHouse":
                PreparedStatement statement;
                String cTableSql = SQL + "\"" + tableName + "\"" + " limit 0";
                try {
                    statement = conn.prepareStatement(cTableSql);
                    ResultSet clickRs = statement.executeQuery();
                    ResultSetMetaData rsmd = clickRs.getMetaData();
                    //获取字段注释
                    ResultSet resultSet = statement.executeQuery("SELECT name as COLUMN_NAME,comment as COLUMN_COMMENT FROM system.columns c WHERE `table` = '" + tableName + "'");
                    while (resultSet.next()) {
                        columnComments.add(resultSet.getString("COLUMN_COMMENT"));
                    }
                    int size = rsmd.getColumnCount();
                    insertIntoFieldTypeList(size, rsmd, columnComments, fieldAndTypeList);

                } catch (SQLException e) {
                    log.error("获取" + tableName + "表字段失败：" + e.getMessage());
                    throw new GlobalException("获取" + tableName + "表字段失败");
                } catch (Exception e) {
                    log.error("获取表字段失败:{}", ExceptionUtils.getStackTrace(e));
                    throw new GlobalException("获取表字段失败" + e.getMessage());
                } finally {//关闭连接
                    finalUtils(conn);
                }
                break;
            case "TelePG":
                PreparedStatement tstatement;
                String tTableSql = SQL + tableName + " limit 0";
                try {
                    tstatement = conn.prepareStatement(tTableSql);
                    ResultSet clickRs = tstatement.executeQuery();
                    ResultSetMetaData rsmd = clickRs.getMetaData();
                    //获取注释
                    tstatement = conn.prepareStatement("SELECT A.attname as COLUMN_NAME,col_description ( A.attrelid,A.attnum ) as COLUMN_COMMENT FROM pg_class as C,pg_attribute as A WHERE C.relname = '" + tableName + "' and A.attrelid = C.oid and A.attnum > 0");
                    ResultSet resultSet = tstatement.executeQuery();
                    while (resultSet.next()) {
                        columnComments.add(resultSet.getString("column_comment"));
                    }
                    int size = rsmd.getColumnCount();
                    insertIntoFieldTypeList(size, rsmd, columnComments, fieldAndTypeList);

                } catch (SQLException e) {
                    log.error("获取" + tableName + "表字段失败：" + e.getMessage());
                    throw new GlobalException("获取" + tableName + "表字段失败");
                } catch (Exception e) {
                    log.error("获取表字段失败:{}", ExceptionUtils.getStackTrace(e));
                    throw new GlobalException("获取表字段失败" + e.getMessage());
                } finally {//关闭连接
                    finalUtils(conn);
                }
                break;
            case "Hive":
                PreparedStatement hstatement;
                String hTableSql = SQL + tableName;
                try {
                    hstatement = conn.prepareStatement(hTableSql);
                    ResultSet clickRs = hstatement.executeQuery();
                    ResultSetMetaData rsmd = clickRs.getMetaData();
                    int size = rsmd.getColumnCount();
                    for (int i = 0; i < size; i++) {
                        Map<String, Object> map = new HashMap<>(16);
                        map.put("columnName", rsmd.getColumnName(i + 1));
                        map.put("columnType", rsmd.getColumnTypeName(i + 1));
                        fieldAndTypeList.add(map);
                    }
                } catch (SQLException e) {
                    log.error("获取" + tableName + "表字段失败：" + e.getMessage());
                    throw new GlobalException("获取" + tableName + "表字段失败");
                } catch (Exception e) {
                    log.error("获取表字段失败:{}", ExceptionUtils.getStackTrace(e));
                    throw new GlobalException("获取表字段失败" + e.getMessage());
                } finally {//关闭连接
                    finalUtils(conn);
                }
                break;

            case "Oracle":
                PreparedStatement ostatement;
                PreparedStatement ostatement1;
                String oTableSql = SQL + "\"" + tableName + "\"" + " where ROWNUM=0 ";
                try {
                    ostatement = conn.prepareStatement(oTableSql);
                    ResultSet clickRs = ostatement.executeQuery();
                    ResultSetMetaData rsmd = clickRs.getMetaData();

                    //获取字段注释
                    String fieldAndCommentSql =
                            "SELECT a.column_name,b.comments FROM user_tab_columns a, user_col_comments b WHERE a.table_name = '" + tableName + "' and b.table_name = '" + tableName + "' and a.column_name = b.column_name";
                    ostatement1 = conn.prepareStatement(fieldAndCommentSql);
                    ResultSet resultSet = ostatement1.executeQuery();
                    Map<String, String> fieldCommentMap = new HashMap<>();
                    while (resultSet.next()) {
                        fieldCommentMap.put(resultSet.getString("COLUMN_NAME"), resultSet.getString("COMMENTS"));
                    }
                    int size = rsmd.getColumnCount();
                    for (int i = 0; i < size; i++) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("columnName", rsmd.getColumnName(i + 1));
                        map.put("columnType", rsmd.getColumnTypeName(i + 1));
                        Set<String> filedNames = fieldCommentMap.keySet();
                        for (String filedName : filedNames) {
                            if (filedName.equals(rsmd.getColumnName(i + 1))) {
                                map.put("columnComment", fieldCommentMap.get(filedName));
                                break;
                            }
                        }
                        fieldAndTypeList.add(map);
                    }
                } catch (SQLException e) {
                    log.error("获取" + tableName + "表字段失败：" + e.getMessage());
                    throw new GlobalException("获取" + tableName + "表字段失败");
                } catch (Exception e) {
                    log.error("获取表字段失败:{}", ExceptionUtils.getStackTrace(e));
                    throw new GlobalException("获取表字段失败" + e.getMessage());
                } finally {//关闭连接
                    finalUtils(conn);
                }
                break;
            default:
                log.error("获取" + tableName + "表字段失败");
                throw new GlobalException("获取" + tableName + "表字段失败");
        }
        return fieldAndTypeList;
    }

    private static void insertIntoFieldTypeList(
            int size,
            ResultSetMetaData resultSetMetaData,
            List<String> columnComments,
            List<Map<String, Object>> fieldAndTypeList) throws SQLException {
        for (int i = 0; i < size; i++) {
            Map<String, Object> map = new HashMap<>(16);
            map.put("columnName", resultSetMetaData.getColumnName(i + 1));
            map.put("columnType", resultSetMetaData.getColumnTypeName(i + 1));
            map.put("columnComment", columnComments.get(i));
            fieldAndTypeList.add(map);
        }
    }

    /**
     * 创建视图
     */
    public static void createView(String sql, String code, List<DatasetParamDto> params, DatasourceConfig datasourceConfig) {
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        sql = updateParamsConfig(sql, params);
        try {
            //执行创建表的 sql脚本
            String createSql = "CREATE VIEW " + code + "  AS " + sql;
            pStemt = conn.prepareStatement(createSql);
            insertParamsConfig(params, pStemt);
            pStemt.executeUpdate();
        } catch (SQLException e) {
            log.error("创建视图失败：{}", e.getMessage());
            throw new GlobalException("创建视图失败");
        } catch (ArrayIndexOutOfBoundsException e) {
            log.error(e.getMessage());
            throw new GlobalException("请检查参数配置与SQL加工脚本是否对应");
        } catch (Exception e) {
            log.error("创建视图失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("创建视图失败" + e.getMessage());
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
    protected static void dropView(String viewName, DatasourceConfig datasourceConfig, String dbType) {
        Connection conn = getConnection(datasourceConfig);
        PreparedStatement pStemt;
        try {
            String sql;
            if (ReportDbType.POSTGRESQL.getUpInfo().equals(dbType)) {
                sql = "DROP VIEW IF EXISTS " + "\"" + viewName + "\"";
            } else {
                sql = "DROP VIEW IF EXISTS " + viewName;
            }
            pStemt = conn.prepareStatement(sql);
            pStemt.executeUpdate();
        } catch (SQLException e) {
            log.error("删除视图失败：{}", e.getMessage());
            throw new GlobalException("删除视图失败");
        } catch (Exception e) {
            log.error("删除视图失败:{}", ExceptionUtils.getStackTrace(e));
            throw new GlobalException("删除视图失败" + e.getMessage());
        } finally {//关闭连接
            finalUtils(conn);
        }
    }


    /**
     * 获取表字段描述信息
     */
    public static Map<String, String> getTableFieldComment(String tableName, String sourceType, DatasourceConfig datasourceConfig) {
        String sql;
        Map<String, List<Map<String, Object>>> valueMap;
        Map<String, String> fieldCommentMap = new HashMap<>(16);
        switch (sourceType) {
            case "Mysql":
                sql = "select column_name,column_comment from information_schema.columns where table_name='" + tableName + "'";
                valueMap = DBUtils.getClickHouseValue(sql, new ArrayList<>(), datasourceConfig);
                valueMap.get("dataPreview").forEach((r) -> fieldCommentMap.put(String.valueOf(r.get("column_name")), String.valueOf(r.get("column_comment"))));
                return fieldCommentMap;
            case "ClickHouse":
                sql = "SELECT name as COLUMN_NAME,comment as COLUMN_COMMENT FROM system.columns c WHERE `table` = '" + tableName + "'";
                valueMap = DBUtils.getClickHouseValue(sql, new ArrayList<>(), datasourceConfig);
                valueMap.get("dataPreview").forEach((r) -> fieldCommentMap.put(String.valueOf(r.get("COLUMN_NAME")), String.valueOf(r.get("COLUMN_COMMENT"))));
                return fieldCommentMap;
            case "TelePG":
                sql = "SELECT A.attname AS COLUMN_NAME,col_description ( A.attrelid, A.attnum ) AS COLUMN_COMMENT FROM pg_class AS C,pg_attribute AS A WHERE C.relname = '" + tableName + "'  AND A.attrelid = C.oid  AND A.attnum > 0";
                valueMap = TelePGDBUtils.getClickHouseValue(sql, new ArrayList<>(), datasourceConfig);
                valueMap.get("dataPreview").forEach((r) -> fieldCommentMap.put(String.valueOf(r.get("column_name")), String.valueOf(r.get("column_comment"))));
                return fieldCommentMap;
            case "Hive":
                sql = "describe extended " + tableName;
                valueMap = TelePGDBUtils.getHiveFieldComment(sql, new ArrayList<>(), datasourceConfig);
                valueMap.get("dataPreview").forEach((r) -> fieldCommentMap.put(String.valueOf(r.get("col_name")), String.valueOf(r.get("comment"))));
                return fieldCommentMap;
            case "Oracle":
                sql = "SELECT a.column_name,b.comments FROM user_tab_columns a, user_col_comments b WHERE a.table_name = '" + tableName + "' and b.table_name = '" + tableName + "' and a.column_name = b.column_name";
                valueMap = DBUtils.getClickHouseValue(sql, new ArrayList<>(), datasourceConfig);
                valueMap.get("dataPreview").forEach((r) -> fieldCommentMap.put(String.valueOf(r.get("COLUMN_NAME")), String.valueOf(r.get("COMMENTS"))));
                return fieldCommentMap;
            default:
                return new HashMap<>();
        }
    }

    /**
     * 获取表描述信息
     */
    public static Map<String, String> getTableComment(List<String> tableName, DatasourceConfig datasourceConfig) {
        if (CollectionUtils.isEmpty(tableName)) {
            return null;
        }
        StringBuilder sqlConditionBuilder = new StringBuilder();
        for (String tName : tableName) {
            sqlConditionBuilder.append("'").append(tName).append("'").append(",");
        }
        String sqlCondition = sqlConditionBuilder.toString();
        if (sqlCondition.endsWith(",")) {
            sqlCondition = sqlCondition.substring(0, sqlCondition.length() - 1);
        }
        sqlCondition = " in (" + sqlCondition + ") ";

        Map<String, String> tableCommentMap = new HashMap<>(16);

        String sql;

        switch (datasourceConfig.getSourceType()) {
            case "Mysql":
                sql = "SELECT table_name,table_comment FROM `information_schema`.tables where table_comment is not null  and TABLE_NAME " + sqlCondition;
                return buildMap(tableCommentMap, sql, datasourceConfig);
            case "ClickHouse":
                return null;
            case "TelePG":
                sql = "select relname as TABLE_NAME,cast ( obj_description ( relfilenode,'pg_class' ) as VARCHAR ) as TABLE_COMMENT from pg_class C where cast ( obj_description ( relfilenode, 'pg_class' ) as VARCHAR ) is not null and relname " + sqlCondition;
                return buildMap(tableCommentMap, sql, datasourceConfig);
            case "Oracle":
                sql = "select TABLE_NAME,COMMENTS AS table_comment from user_tab_comments WHERE TABLE_NAME " + sqlCondition;
                return buildMap(tableCommentMap, sql, datasourceConfig);
            default:
                throw new GlobalException("当前数据源【" + datasourceConfig.getSourceType() + "】暂未作适配，请联系管理员");
        }
    }

    private static Map<String, String> buildMap(Map<String, String> tableCommentMap, String sql, DatasourceConfig datasourceConfig) {
        String tableNameKey;
        String tableCommentKey;
        if (datasourceConfig.getSourceType().equalsIgnoreCase(ReportDbType.ORACLE.getUpInfo())) {
            tableNameKey = "TABLE_NAME";
            tableCommentKey = "TABLE_COMMENT";
        } else {
            tableNameKey = "table_name";
            tableCommentKey = "table_comment";
        }
        Map<String, List<Map<String, Object>>> valueMap = DBUtils.getClickHouseValue(sql, new ArrayList<>(), datasourceConfig);
        List<Map<String, Object>> mapList = valueMap.get("dataPreview");
        mapList.forEach(map -> tableCommentMap.put(String.valueOf(map.get(tableNameKey)), !StringUtils.isEmpty(map.get(tableCommentKey)) ? String.valueOf(map.get(tableCommentKey)) : null));
        return tableCommentMap;
    }

}
