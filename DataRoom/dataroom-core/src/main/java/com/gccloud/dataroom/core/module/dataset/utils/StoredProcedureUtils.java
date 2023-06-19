package com.gccloud.dataroom.core.module.dataset.utils;

import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.module.dataset.constant.OracleTypes;
import com.gccloud.dataroom.core.module.dataset.constant.ReportConstant;
import com.gccloud.dataroom.core.module.dataset.constant.ReportDbType;
import com.gccloud.dataroom.core.module.dataset.constant.ReportLimit;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.utils.JSON;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.json.JSONObject;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 存储过程工具类
 *
 * @author pan.shun
 * @since 2022/4/20 16:46
 */
@Slf4j
public class StoredProcedureUtils {


    private static void fieldSelectFormat(List<String> tableHeadList, Map<String, Integer> fieldIndex) {
        // 每个字段对应的索引号
        int index = 1;
        for (String f : tableHeadList) {
            fieldIndex.put(f, index);
            index++;
        }
    }

    /**
     * 调用存储过程
     *
     * @param sqlProcess       数据集加工sql
     * @param params           参数
     * @param datasourceConfig 数据源配置
     */
    public static Map<String, List<Map<String, Object>>> call(
            Integer pageIndex, Integer pageSize, String sqlProcess, List<DatasetParamDto> params, DatasourceConfig datasourceConfig, Integer limit, boolean isExport) {

        int current = 1;
        int size = 20;
        if (null != pageIndex) {
            current = pageIndex;
        }
        if (null != pageSize) {
            size = pageSize;
        }

        long startTime = System.currentTimeMillis();

        Map<String, List<Map<String, Object>>> map = new HashMap<>();

        List<Map<String, Object>> dataPreview = new ArrayList<>();
        List<Map<String, Object>> structurePreview = new ArrayList<>();

        List<Map<String, Object>> sizePreview = new ArrayList<>();

        Connection myConnection;
        try {
            myConnection = DBUtils.getConnection(datasourceConfig);
        } catch (Exception ex) {
            throw new GlobalException(ex.getMessage());
        }

        if (null == myConnection) {
            log.error("数据源连接建立失败");
            throw new GlobalException("数据源连接建立失败");
        }

        try {
            CallableStatement proc;
            String procedureSql = buildCallSql(datasourceConfig, sqlProcess, params);
            log.info("存储过程执行函数为 :{}", procedureSql);
            proc = myConnection.prepareCall(procedureSql);

            if (datasourceConfig.getSourceType().equals(ReportDbType.ORACLE.getUpInfo())) {
                proc.registerOutParameter(1, OracleTypes.CURSOR);
            }
            if (datasourceConfig.getSourceType().equals(ReportDbType.POSTGRESQL.getUpInfo())) {
                proc.registerOutParameter(1, Types.OTHER);
            }

            proc.execute();
            ResultSet rs;
            if (datasourceConfig.getSourceType().equals(ReportDbType.ORACLE.getUpInfo()) || datasourceConfig.getSourceType().equals(ReportDbType.POSTGRESQL.getUpInfo())) {
                rs = (ResultSet) proc.getObject(1);
            } else {
                rs = proc.getResultSet();
            }
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            // 计数
            int resultCount = 0;
            // 总数
            int totalSize = 0;
            while (rs.next()) {
                resultCount++;
                Map<String, Object> dataMap = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    dataMap.put(metaData.getColumnName(i), rs.getObject(i));
                }
                dataPreview.add(dataMap);
                if (null != limit && resultCount >= limit) {
                    break;
                }
                totalSize++;
                if (resultCount >= ReportLimit.STORE_QUERY_MAX_SIZE) {
                    log.info("该存储过程 {} 执行过程中数据量大于{}条，超过单次查询上限，提前结束。本次共查询数据量: {}条。", procedureSql, ReportLimit.STORE_QUERY_MAX_SIZE, totalSize);
                    break;
                }
            }

            for (int i = 0; i < columnCount; i++) {
                Map<String, Object> structureMap = new ConcurrentHashMap<>();
                structureMap.put("columnName", metaData.getColumnName(i + 1));
                structureMap.put("columnType", metaData.getColumnTypeName(i + 1));
                structurePreview.add(structureMap);
            }

            if (isExport) {
                map.put("dataPreview", dataPreview);
            } else {
                map.put("dataPreview", getPageDataView(dataPreview, current, size));
            }
            map.put("structurePreview", structurePreview);

            Map<String, Object> m = new HashMap<>();
            m.put("totalPage", getTotalPage(totalSize, size));
            m.put("totalSize", totalSize);
            sizePreview.add(m);
            map.put("page", sizePreview);

            long endTime = System.currentTimeMillis();
            log.info("存储过程执行完毕 ,耗时：{} 秒,当前数据量：{}条", (float) (endTime - startTime) / 1000, totalSize);
            return map;
        } catch (Exception ex) {
            log.error("存储过程执行失败");
            log.error(ExceptionUtils.getStackTrace(ex));
            throw new GlobalException(ex.getMessage());
        } finally {
            try {
                myConnection.close();
            } catch (SQLException e) {
                log.error("数据源连接关闭异常,{}", e);
            }
        }
    }

    /**
     * 集合分页
     */
    private static List<Map<String, Object>> getPageDataView(List<Map<String, Object>> dataPreview, int current, int size) {
        log.info("开始进行分批查询数据，当前查询第{}页，每页查询{}条", current, size);
        return dataPreview.stream().skip((current - 1) * size).limit(size).
                collect(Collectors.toList());
    }

    /**
     * 通过总数获取页数
     */
    private static int getTotalPage(int totalSize, int size) {
        if (totalSize % size == 0) {
            return totalSize / size;
        } else {
            return totalSize / size + 1;
        }
    }

    public static String buildCallSql(DatasourceConfig datasourceConfig, String sqlProcess, List<DatasetParamDto> params) {
        if (!CollectionUtils.isEmpty(params)) {
            for (DatasetParamDto param : params) {
                if (null != param.getStatus()) {
                    if (ReportConstant.SqlParamsStatus.VARIABLE.equals(param.getStatus())) {
                        if ("String".equals(param.getType()) || "Date".equals(param.getType())) {
                            sqlProcess = sqlProcess.replaceAll("\\$\\{" + param.getName() + "\\}", "'" + formatString(param.getValue()) + "'");
                        } else {
                            sqlProcess = sqlProcess.replaceAll("\\$\\{" + param.getName() + "\\}", param.getValue());
                        }
                    }
                }
            }
        }
        if (datasourceConfig.getSourceType().equals(ReportDbType.MYSQL.getUpInfo())) {
            if (sqlProcess.contains("?")) {
                if (CollectionUtils.isEmpty(params)) {
                    sqlProcess = sqlProcess.replace("?", "");
                } else {
                    sqlProcess = sqlProcess.substring(0, sqlProcess.lastIndexOf(",")) + ")";
                }
            }
        }
        return "{ " + sqlProcess + " }";
    }

    private static String formatString(String v) {
        if (v.contains(",")) {
            v = v.replaceAll("'", "");
            return v;
        } else {
            return v;
        }
    }

    private static JSONObject parseFieldDesc(String fieldDesc) {
        if (!StringUtils.isEmpty(fieldDesc)) {
            return JSON.parseObject(fieldDesc);
        } else {
            return new JSONObject();
        }
    }
}
