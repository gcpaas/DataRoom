package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.core.constant.DatasetType;
import com.gccloud.gcpaas.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.core.dataset.bean.DatasetInputParam;
import com.gccloud.gcpaas.core.dataset.bean.DatasetOutputParam;
import com.gccloud.gcpaas.core.dataset.bean.RelationalDataset;
import com.gccloud.gcpaas.core.entity.DatasetEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.util.TypeUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.WithItem;
import net.sf.jsqlparser.util.TablesNamesFinder;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service(value = DatasetType.EXCEL_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
public class ExcelDatasetService extends AbstractDatasetService {

    private static final String EXCEL_TABLE_PREFIX = "excel_";

    @Resource
    private MyBatisService myBatisService;
    @Resource
    private DataSource appDataSource;

    @Override
    public DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        try {
            RelationalDataset relationalDataset = (RelationalDataset) datasetEntity.getDataset();
            String sql = relationalDataset.getSql();
            Map<String, Object> params = buildParams(datasetRunRequest, datasetEntity);
            sql = myBatisService.generateSql(sql, params);
            validateExcelSql(sql);
            return executeSql(sql);
        } catch (DataRoomException e) {
            throw e;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("Excel数据集执行失败：" + e.getMessage(), e);
        }
    }

    public static void validateExcelSql(String sql) {
        if (StringUtils.isBlank(sql)) {
            throw new DataRoomException("SQL不能为空");
        }
        Statement statement;
        try {
            statement = CCJSqlParserUtil.parse(sql);
        } catch (JSQLParserException e) {
            throw new DataRoomException("Excel数据集SQL解析失败：" + e.getMessage(), e);
        }
        if (!(statement instanceof Select select)) {
            throw new DataRoomException("仅允许执行select操作");
        }

        Set<String> cteNames = resolveCteNames(select);
        Set<String> tableNames = new TablesNamesFinder<>().getTables(statement);
        for (String tableName : tableNames) {
            String normalizedTableName = normalizeTableName(tableName);
            if (cteNames.contains(normalizedTableName.toLowerCase(Locale.ROOT))) {
                continue;
            }
            if (!normalizedTableName.toLowerCase(Locale.ROOT).startsWith(EXCEL_TABLE_PREFIX)) {
                throw new DataRoomException("Excel数据集只能查询excel_开头的表：" + tableName);
            }
        }
    }

    private Map<String, Object> buildParams(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        Map<String, Object> params = new HashMap<>();
        List<DatasetInputParam> inputParamList = datasetEntity.getInputList();
        Map<String, DatasetInputParam> inputParamMap = new HashMap<>();
        if (inputParamList != null) {
            for (DatasetInputParam inputParam : inputParamList) {
                inputParamMap.put(inputParam.getName(), inputParam);
                params.put(inputParam.getName(), TypeUtils.transType(inputParam.getDefaultVal(), inputParam.getType()));
            }
        }
        Map<String, Object> realInputParam = datasetRunRequest.getInputParam();
        if (realInputParam != null) {
            realInputParam.forEach((key, value) -> {
                DatasetInputParam defInputParam = inputParamMap.get(key);
                if (defInputParam != null) {
                    params.put(key, TypeUtils.transType(value, defInputParam.getType()));
                } else {
                    params.put(key, value);
                }
            });
        }
        return params;
    }

    private DatasetRunResponse executeSql(String sql) throws Exception {
        DatasetRunResponse datasetRunResponse = new DatasetRunResponse();
        try (Connection connection = appDataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {
            ResultSetMetaData metaData = resultSet.getMetaData();
            int columnCount = metaData.getColumnCount();
            List<DatasetOutputParam> outputParamList = new ArrayList<>();
            for (int i = 1; i <= columnCount; i++) {
                DatasetOutputParam outputParam = new DatasetOutputParam();
                outputParam.setName(metaData.getColumnName(i));
                outputParam.setType(SqlDatasetService.resolveOutputType(
                        metaData.getColumnType(i),
                        metaData.getColumnTypeName(i)
                ));
                outputParam.setDesc(outputParam.getName());
                outputParamList.add(outputParam);
            }
            datasetRunResponse.setOutputList(outputParamList);

            List<Map<String, Object>> resultList = new ArrayList<>();
            while (resultSet.next()) {
                Map<String, Object> row = new HashMap<>(columnCount);
                for (int i = 1; i <= columnCount; i++) {
                    row.put(metaData.getColumnName(i), resultSet.getObject(i));
                }
                resultList.add(row);
            }
            datasetRunResponse.setData(resultList);
        }
        return datasetRunResponse;
    }

    private static Set<String> resolveCteNames(Select select) {
        Set<String> cteNames = new HashSet<>();
        List<WithItem<?>> withItems = select.getWithItemsList();
        if (withItems == null) {
            return cteNames;
        }
        for (WithItem<?> withItem : withItems) {
            String aliasName = withItem.getUnquotedAliasName();
            if (StringUtils.isNotBlank(aliasName)) {
                cteNames.add(normalizeTableName(aliasName).toLowerCase(Locale.ROOT));
            }
        }
        return cteNames;
    }

    private static String normalizeTableName(String tableName) {
        String normalized = StringUtils.trimToEmpty(tableName);
        int dotIndex = normalized.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < normalized.length() - 1) {
            normalized = normalized.substring(dotIndex + 1);
        }
        return unwrapIdentifier(normalized);
    }

    private static String unwrapIdentifier(String identifier) {
        String normalized = StringUtils.trimToEmpty(identifier);
        while (normalized.length() >= 2 && hasWrappingQuotes(normalized)) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }
        return normalized;
    }

    private static boolean hasWrappingQuotes(String identifier) {
        char first = identifier.charAt(0);
        char last = identifier.charAt(identifier.length() - 1);
        return (first == '"' && last == '"')
                || (first == '`' && last == '`')
                || (first == '[' && last == ']');
    }
}
