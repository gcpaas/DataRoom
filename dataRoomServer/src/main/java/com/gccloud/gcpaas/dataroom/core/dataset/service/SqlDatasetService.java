package com.gccloud.gcpaas.dataroom.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.DatasetInputParam;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.DatasetOutputParam;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.RelationalDataset;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.BaseDataSource;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.ExcelDatasource;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.RelationalDatasource;
import com.gccloud.gcpaas.dataroom.core.datasource.service.DatasourceService;
import com.gccloud.gcpaas.dataroom.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.util.RsaUtils;
import com.gccloud.gcpaas.dataroom.core.util.TypeUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service(value = DatasetType.SQL_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
public class SqlDatasetService extends AbstractDatasetService {

    @Resource
    private DatasourceService dataSourceDefinitionService;
    @Resource
    private MyBatisService myBatisService;
    @Resource
    private DataRoomConfig dataRoomConfig;
    @Resource
    private DataSource appDataSource;

    private static final Pattern PARAM_PATTERN = Pattern.compile("\\#\\{(.*?)\\}");

    @Override
    public DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        DatasetRunResponse datasetRunResponse = new DatasetRunResponse();
        RelationalDataset relationalDataset = (RelationalDataset) datasetEntity.getDataset();
        try {
            String datasourceCode = datasetEntity.getDataSourceCode();
            DataSourceEntity dataSourceDefinition = dataSourceDefinitionService.getByCode(datasourceCode);
            BaseDataSource baseDataSource = dataSourceDefinition.getDataSource();
            Map<String, Object> params = new HashMap<>();
            List<DatasetInputParam> inputParamList = datasetEntity.getInputList();
            Map<String, DatasetInputParam> inputParamMap = new HashMap<>();
            for (DatasetInputParam inputParam : inputParamList) {
                inputParamMap.put(inputParam.getName(), inputParam);
                params.put(inputParam.getName(), TypeUtils.transType(inputParam.getDefaultVal(), inputParam.getType()));
            }
            Map<String, Object> realInputParam = datasetRunRequest.getInputParam();
            // 组合实际传入参数
            realInputParam.entrySet().forEach((entry) -> {
                DatasetInputParam defInputParam = inputParamMap.get(entry.getKey());
                if (defInputParam != null) {
                    params.put(entry.getKey(), TypeUtils.transType(entry.getValue(), defInputParam.getType()));
                } else {
                    params.put(entry.getKey(), entry.getValue());
                }
            });
            // 参数替换
            String sql = relationalDataset.getSql();
            // 动态替换SQL
            sql = myBatisService.generateSql(sql, params);
            // 仅允许执行查询操作
            if (!sql.toLowerCase().startsWith("select")) {
                throw new DataRoomException("仅允许执行select操作");
            }
            // 根据数据源类型获取连接
            Connection connection;
            if (baseDataSource instanceof ExcelDatasource) {
                // Excel数据源的数据存储在应用自身数据库中，使用应用数据源连接
                connection = appDataSource.getConnection();
            } else if (baseDataSource instanceof RelationalDatasource relationalDs) {
                // 关系型数据源使用配置的连接信息
                String privateKey = dataRoomConfig.getPrivateKey();
                String pwd = RsaUtils.decryptByPrivateKey(relationalDs.getPassword(), privateKey);
                Class.forName(relationalDs.getDriverName());
                connection = DriverManager.getConnection(relationalDs.getUrl(), relationalDs.getUsername(), pwd);
            } else {
                throw new DataRoomException("不支持的数据源类型");
            }
            try {
                PreparedStatement preparedStatement = connection.prepareStatement(sql);
                ResultSet resultSet = preparedStatement.executeQuery();
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                List<DatasetOutputParam> outputParamList = new ArrayList<>();
                for (int i = 0; i < columnCount; i++) {
                    DatasetOutputParam outputParam = new DatasetOutputParam();
                    outputParam.setName(metaData.getColumnName(i + 1));
                    outputParam.setType(resolveOutputType(
                            metaData.getColumnType(i + 1),
                            metaData.getColumnTypeName(i + 1)
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
            } finally {
                connection.close();
            }
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            datasetRunResponse.setData(new ArrayList<>());
        }
        return datasetRunResponse;
    }

    static String resolveOutputType(int jdbcType, String typeName) {
        return switch (jdbcType) {
            case Types.DATE, Types.TIME, Types.TIME_WITH_TIMEZONE,
                 Types.TIMESTAMP, Types.TIMESTAMP_WITH_TIMEZONE -> "Date";
            case Types.TINYINT, Types.SMALLINT, Types.INTEGER, Types.BIGINT,
                 Types.REAL, Types.FLOAT, Types.DOUBLE, Types.NUMERIC, Types.DECIMAL -> "int";
            case Types.CHAR, Types.VARCHAR, Types.LONGVARCHAR,
                 Types.NCHAR, Types.NVARCHAR, Types.LONGNVARCHAR,
                 Types.CLOB, Types.NCLOB -> "String";
            default -> resolveOutputTypeByName(typeName);
        };
    }

    private static String resolveOutputTypeByName(String typeName) {
        if (typeName == null) {
            return "String";
        }
        String normalizedTypeName = typeName
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s*\\(.*\\)", "")
                .trim();
        if (normalizedTypeName.isEmpty()) {
            return "String";
        }
        if (isDateTypeName(normalizedTypeName)) {
            return "Date";
        }
        if (isNumberTypeName(normalizedTypeName)) {
            return "int";
        }
        return "String";
    }

    private static boolean isDateTypeName(String typeName) {
        return typeName.contains("date")
                || typeName.contains("time")
                || "year".equals(typeName);
    }

    private static boolean isNumberTypeName(String typeName) {
        String baseTypeName = typeName.split("\\s+")[0];
        return "int".equals(baseTypeName)
                || "integer".equals(baseTypeName)
                || "tinyint".equals(baseTypeName)
                || "smallint".equals(baseTypeName)
                || "mediumint".equals(baseTypeName)
                || "bigint".equals(baseTypeName)
                || baseTypeName.matches("u?int(8|16|32|64|128|256)?")
                || "int2".equals(baseTypeName)
                || "int4".equals(baseTypeName)
                || "int8".equals(baseTypeName)
                || "serial".equals(baseTypeName)
                || "smallserial".equals(baseTypeName)
                || "bigserial".equals(baseTypeName)
                || "number".equals(baseTypeName)
                || "numeric".equals(baseTypeName)
                || "decimal".equals(baseTypeName)
                || baseTypeName.matches("decimal(32|64|128|256)")
                || "dec".equals(baseTypeName)
                || "float".equals(baseTypeName)
                || baseTypeName.matches("float(32|64)")
                || "float4".equals(baseTypeName)
                || "float8".equals(baseTypeName)
                || "double".equals(baseTypeName)
                || "real".equals(baseTypeName)
                || "money".equals(baseTypeName)
                || "smallmoney".equals(baseTypeName)
                || "binary_float".equals(baseTypeName)
                || "binary_double".equals(baseTypeName);
    }


    public static void main(String[] args) {
        String sql = "select * from mv_page where name = '#{   name  }' or name like '#{  name}'";
        String regex = "\\#\\{\\s*" + Pattern.quote("name") + "\\s*\\}";
        System.out.println(sql.replaceAll(regex, "admin"));
        Matcher matcher = PARAM_PATTERN.matcher(sql);

        while (matcher.find()) {
            String name = matcher.group(1);
            System.out.println(name.trim());
        }
    }


}
