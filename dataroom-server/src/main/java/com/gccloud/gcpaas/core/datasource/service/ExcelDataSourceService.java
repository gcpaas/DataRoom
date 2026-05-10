package com.gccloud.gcpaas.core.datasource.service;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.gccloud.gcpaas.core.datasource.bean.ExcelColumn;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * Excel数据源核心服务
 */
@Service
public class ExcelDataSourceService {

    private static final Logger log = LoggerFactory.getLogger(ExcelDataSourceService.class);

    private static final Pattern TABLE_NAME_PATTERN = Pattern.compile("^excel_[a-zA-Z0-9_]+$");
    private static final int BATCH_SIZE = 500;
    private static final int SAMPLE_ROWS = 100;

    @Resource
    private DdlDialectHelper ddlDialectHelper;

    /**
     * 缓存上传解析后的数据，避免二次上传
     * Key: uploadId (UUID)
     * Value: 解析后的全部数据行
     */
    private final Cache<String, List<List<Object>>> uploadCache = Caffeine.newBuilder()
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .maximumSize(50)
            .build();

    /**
     * 解析Excel文件，返回列定义和预览数据
     */
    public ExcelParseResult parseExcel(InputStream inputStream) {
        List<Map<Integer, String>> headerList = new ArrayList<>();
        List<List<Object>> allData = new ArrayList<>();

        EasyExcel.read(inputStream, new ReadListener<Map<Integer, Object>>() {
            private Map<Integer, String> headers;
            private boolean isFirstRow = true;

            @Override
            public void invoke(Map<Integer, Object> data, AnalysisContext context) {
                if (isFirstRow) {
                    // 第一行作为表头
                    headers = new LinkedHashMap<>();
                    data.forEach((k, v) -> headers.put(k, v != null ? v.toString().trim() : "column_" + k));
                    Map<Integer, String> headerCopy = new LinkedHashMap<>(headers);
                    headerList.add(headerCopy);
                    isFirstRow = false;
                } else {
                    List<Object> row = new ArrayList<>();
                    for (int i = 0; i < headers.size(); i++) {
                        Object val = data.get(i);
                        row.add(val != null ? val.toString() : null);
                    }
                    allData.add(row);
                }
            }

            @Override
            public void doAfterAllAnalysed(AnalysisContext context) {
                // 解析完成
            }
        }).headRowNumber(0).sheet(0).doRead();

        if (headerList.isEmpty()) {
            throw new RuntimeException("Excel文件为空或无法解析表头");
        }

        Map<Integer, String> headers = headerList.get(0);

        // 自动检测列类型
        List<ExcelColumn> columns = new ArrayList<>();
        for (Map.Entry<Integer, String> entry : headers.entrySet()) {
            int colIndex = entry.getKey();
            String headerName = entry.getValue();

            // 采样数据检测类型
            List<String> sampleValues = new ArrayList<>();
            int sampleCount = Math.min(allData.size(), SAMPLE_ROWS);
            for (int i = 0; i < sampleCount; i++) {
                List<Object> row = allData.get(i);
                if (colIndex < row.size() && row.get(colIndex) != null) {
                    sampleValues.add(row.get(colIndex).toString());
                }
            }

            ExcelColumn col = new ExcelColumn();
            col.setOriginalHeader(headerName);
            col.setName(sanitizeColumnName(headerName));
            col.setType(autoDetectType(sampleValues));
            col.setPrimaryKey(false);
            columns.add(col);
        }

        // 生成uploadId并缓存数据
        String uploadId = UUID.randomUUID().toString().replace("-", "");
        uploadCache.put(uploadId, allData);

        // 预览数据（前10行）
        List<Map<String, Object>> previewData = new ArrayList<>();
        int previewCount = Math.min(allData.size(), 10);
        for (int i = 0; i < previewCount; i++) {
            List<Object> row = allData.get(i);
            Map<String, Object> rowMap = new LinkedHashMap<>();
            for (int j = 0; j < columns.size(); j++) {
                rowMap.put(columns.get(j).getName(), j < row.size() ? row.get(j) : null);
            }
            previewData.add(rowMap);
        }

        ExcelParseResult result = new ExcelParseResult();
        result.setUploadId(uploadId);
        result.setColumns(columns);
        result.setPreviewData(previewData);
        result.setTotalRows(allData.size());
        return result;
    }

    /**
     * 创建数据库表
     */
    public void createTable(String tableName, List<ExcelColumn> columns) {
        validateTableName(tableName);
        if (ddlDialectHelper.tableExists(tableName)) {
            throw new RuntimeException("表 " + tableName + " 已存在");
        }
        String ddl = ddlDialectHelper.generateCreateTableSql(tableName, columns);
        log.info("创建表DDL: {}", ddl);
        ddlDialectHelper.executeDdl(ddl);
    }

    /**
     * 导入数据
     *
     * @param tableName  表名
     * @param columns    列定义
     * @param uploadId   上传缓存ID（用于获取缓存的数据）
     * @param importMode overwrite / append
     * @return 导入行数
     */
    public int importData(String tableName, List<ExcelColumn> columns, String uploadId, String importMode) {
        List<List<Object>> data = uploadCache.getIfPresent(uploadId);
        if (data == null) {
            throw new RuntimeException("上传数据已过期，请重新上传文件");
        }
        return doImportData(tableName, columns, data, importMode);
    }

    /**
     * 重新导入数据（从新的InputStream解析并导入）
     */
    public int reimportData(String tableName, List<ExcelColumn> columns, InputStream inputStream, String importMode) {
        // 解析新文件的数据（跳过表头行）
        List<List<Object>> allData = new ArrayList<>();

        EasyExcel.read(inputStream, new ReadListener<Map<Integer, Object>>() {
            private boolean isFirstRow = true;
            private int columnCount;

            @Override
            public void invoke(Map<Integer, Object> data, AnalysisContext context) {
                if (isFirstRow) {
                    columnCount = data.size();
                    isFirstRow = false;
                } else {
                    List<Object> row = new ArrayList<>();
                    for (int i = 0; i < columnCount; i++) {
                        Object val = data.get(i);
                        row.add(val != null ? val.toString() : null);
                    }
                    allData.add(row);
                }
            }

            @Override
            public void doAfterAllAnalysed(AnalysisContext context) {
            }
        }).headRowNumber(0).sheet(0).doRead();

        return doImportData(tableName, columns, allData, importMode);
    }

    /**
     * 执行数据导入
     */
    private int doImportData(String tableName, List<ExcelColumn> columns, List<List<Object>> data, String importMode) {
        String insertSql = ddlDialectHelper.generateInsertSql(tableName, columns);

        try (Connection conn = ddlDialectHelper.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // 覆盖模式先删除旧数据
                if ("overwrite".equals(importMode)) {
                    String deleteSql = ddlDialectHelper.generateDeleteAllSql(tableName);
                    try (Statement stmt = conn.createStatement()) {
                        stmt.execute(deleteSql);
                    }
                }

                // 批量插入
                int importedCount = 0;
                try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                    for (List<Object> row : data) {
                        for (int i = 0; i < columns.size(); i++) {
                            Object value = i < row.size() ? row.get(i) : null;
                            setParameterValue(ps, i + 1, value, columns.get(i).getType());
                        }
                        ps.addBatch();
                        importedCount++;

                        if (importedCount % BATCH_SIZE == 0) {
                            ps.executeBatch();
                        }
                    }
                    // 剩余未提交的批次
                    ps.executeBatch();
                }

                conn.commit();
                return importedCount;
            } catch (Exception e) {
                conn.rollback();
                throw new RuntimeException("数据导入失败: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            throw new RuntimeException("获取数据库连接失败", e);
        }
    }

    /**
     * 分页查看表数据
     */
    public ExcelViewDataResult viewData(String tableName, int page, int pageSize) {
        validateTableName(tableName);

        int offset = (page - 1) * pageSize;
        String countSql = ddlDialectHelper.generateCountSql(tableName);
        String querySql = ddlDialectHelper.generatePageQuerySql(tableName, offset, pageSize);

        try (Connection conn = ddlDialectHelper.getConnection()) {
            // 查询总数
            long total;
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(countSql)) {
                rs.next();
                total = rs.getLong(1);
            }

            // 查询分页数据
            List<Map<String, Object>> data = new ArrayList<>();
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(querySql)) {
                ResultSetMetaData metaData = rs.getMetaData();
                int colCount = metaData.getColumnCount();
                while (rs.next()) {
                    Map<String, Object> rowMap = new LinkedHashMap<>();
                    for (int i = 1; i <= colCount; i++) {
                        String colName = metaData.getColumnLabel(i);
                        rowMap.put(colName, rs.getObject(i));
                    }
                    data.add(rowMap);
                }
            }

            ExcelViewDataResult result = new ExcelViewDataResult();
            result.setData(data);
            result.setTotal(total);
            result.setPage(page);
            result.setPageSize(pageSize);
            return result;
        } catch (SQLException e) {
            throw new RuntimeException("查询数据失败: " + e.getMessage(), e);
        }
    }

    /**
     * 校验表名格式
     */
    public void validateTableName(String tableName) {
        if (StringUtils.isBlank(tableName)) {
            throw new RuntimeException("表名不能为空");
        }
        if (!TABLE_NAME_PATTERN.matcher(tableName).matches()) {
            throw new RuntimeException("表名格式不正确，必须以excel_开头，仅支持数字、字母、下划线组合");
        }
    }

    /**
     * 清理上传缓存
     */
    public void removeUploadCache(String uploadId) {
        uploadCache.invalidate(uploadId);
    }

    /**
     * 自动检测列类型
     */
    private String autoDetectType(List<String> sampleValues) {
        if (sampleValues.isEmpty()) {
            return "VARCHAR";
        }

        boolean allInteger = true;
        boolean allDecimal = true;
        boolean allDate = true;

        for (String val : sampleValues) {
            if (StringUtils.isBlank(val)) {
                continue;
            }

            // 检查是否为整数
            if (allInteger) {
                try {
                    Long.parseLong(val.trim());
                } catch (NumberFormatException e) {
                    allInteger = false;
                }
            }

            // 检查是否为小数
            if (allDecimal && !allInteger) {
                try {
                    new BigDecimal(val.trim());
                } catch (NumberFormatException e) {
                    allDecimal = false;
                }
            }

            // 检查是否为日期
            if (allDate && !allInteger && !allDecimal) {
                allDate = isDateValue(val.trim());
            }
        }

        if (allInteger) return "INTEGER";
        if (allDecimal) return "DECIMAL";
        if (allDate) return "DATE";
        return "VARCHAR";
    }

    /**
     * 判断是否为日期格式
     */
    private boolean isDateValue(String value) {
        String[] patterns = {"yyyy-MM-dd", "yyyy/MM/dd", "yyyy-MM-dd HH:mm:ss", "yyyy/MM/dd HH:mm:ss"};
        for (String pattern : patterns) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(pattern);
                sdf.setLenient(false);
                sdf.parse(value);
                return true;
            } catch (ParseException e) {
                // 继续尝试下一个格式
            }
        }
        return false;
    }

    /**
     * 设置PreparedStatement参数值
     */
    private void setParameterValue(PreparedStatement ps, int index, Object value, String columnType) throws SQLException {
        if (value == null || StringUtils.isBlank(value.toString())) {
            ps.setNull(index, Types.VARCHAR);
            return;
        }

        String strValue = value.toString().trim();
        try {
            switch (columnType.toUpperCase()) {
                case "INTEGER" -> ps.setLong(index, Long.parseLong(strValue));
                case "DECIMAL" -> ps.setBigDecimal(index, new BigDecimal(strValue));
                case "DATE" -> ps.setTimestamp(index, parseTimestamp(strValue));
                default -> ps.setString(index, strValue);
            }
        } catch (Exception e) {
            // 类型转换失败时作为字符串存储
            ps.setString(index, strValue);
        }
    }

    /**
     * 解析时间戳
     */
    private Timestamp parseTimestamp(String value) {
        String[] patterns = {"yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd", "yyyy/MM/dd HH:mm:ss", "yyyy/MM/dd"};
        for (String pattern : patterns) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(pattern);
                sdf.setLenient(false);
                java.util.Date date = sdf.parse(value);
                return new Timestamp(date.getTime());
            } catch (ParseException e) {
                // 继续尝试
            }
        }
        throw new RuntimeException("无法解析日期: " + value);
    }

    /**
     * 清理列名（移除特殊字符）
     */
    private String sanitizeColumnName(String header) {
        if (StringUtils.isBlank(header)) {
            return "column_unknown";
        }
        // 将非字母数字字符替换为下划线
        String sanitized = header.replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5_]", "_");
        // 如果以数字开头，加前缀
        if (Character.isDigit(sanitized.charAt(0))) {
            sanitized = "col_" + sanitized;
        }
        return sanitized;
    }

    // ========== 内部结果类 ==========

    /**
     * Excel解析结果
     */
    public static class ExcelParseResult {
        private String uploadId;
        private List<ExcelColumn> columns;
        private List<Map<String, Object>> previewData;
        private int totalRows;

        public String getUploadId() { return uploadId; }
        public void setUploadId(String uploadId) { this.uploadId = uploadId; }
        public List<ExcelColumn> getColumns() { return columns; }
        public void setColumns(List<ExcelColumn> columns) { this.columns = columns; }
        public List<Map<String, Object>> getPreviewData() { return previewData; }
        public void setPreviewData(List<Map<String, Object>> previewData) { this.previewData = previewData; }
        public int getTotalRows() { return totalRows; }
        public void setTotalRows(int totalRows) { this.totalRows = totalRows; }
    }

    /**
     * 分页查看数据结果
     */
    public static class ExcelViewDataResult {
        private List<Map<String, Object>> data;
        private long total;
        private int page;
        private int pageSize;

        public List<Map<String, Object>> getData() { return data; }
        public void setData(List<Map<String, Object>> data) { this.data = data; }
        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getPageSize() { return pageSize; }
        public void setPageSize(int pageSize) { this.pageSize = pageSize; }
    }
}
