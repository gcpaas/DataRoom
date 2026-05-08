package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.core.constant.DatasetType;
import com.gccloud.gcpaas.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.core.dataset.bean.DatasetInputParam;
import com.gccloud.gcpaas.core.dataset.bean.DatasetOutputParam;
import com.gccloud.gcpaas.core.dataset.bean.RelationalDataset;
import com.gccloud.gcpaas.core.datasource.bean.MySqlDatasource;
import com.gccloud.gcpaas.core.datasource.service.DatasourceService;
import com.gccloud.gcpaas.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.core.entity.DatasetEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.util.RsaUtils;
import com.gccloud.gcpaas.core.util.TypeUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service(value = DatasetType.RELATIONAL_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
public class RelationalDatasetService extends AbstractDatasetService {

    @Resource
    private DatasourceService dataSourceDefinitionService;
    @Resource
    private MyBatisService myBatisService;
    @Resource
    private DataRoomConfig dataRoomConfig;

    private static final Pattern PARAM_PATTERN = Pattern.compile("\\#\\{(.*?)\\}");

    @Override
    public DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        DatasetRunResponse datasetRunResponse = new DatasetRunResponse();
        RelationalDataset relationalDataset = (RelationalDataset) datasetEntity.getDataset();
        try {
            String datasourceCode = datasetEntity.getDataSourceCode();
            DataSourceEntity dataSourceDefinition = dataSourceDefinitionService.getByCode(datasourceCode);
            MySqlDatasource dataSource = (MySqlDatasource) dataSourceDefinition.getDataSource();
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
            String privateKey = dataRoomConfig.getPrivateKey();
            String pwd = RsaUtils.decryptByPrivateKey(dataSource.getPassword(), privateKey);
            Connection connection = DriverManager.getConnection(dataSource.getUrl(), dataSource.getUsername(), pwd);
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            ResultSet resultSet = preparedStatement.executeQuery();
            ResultSetMetaData metaData = resultSet.getMetaData();
            int columnCount = metaData.getColumnCount();
            List<DatasetOutputParam> outputParamList = new ArrayList<>();
            for (int i = 0; i < columnCount; i++) {
                DatasetOutputParam outputParam = new DatasetOutputParam();
                outputParam.setName(metaData.getColumnName(i + 1));
                String type = metaData.getColumnTypeName(i + 1);
                if (type.equalsIgnoreCase("varchar") || type.equalsIgnoreCase("char") || type.equalsIgnoreCase("text")) {
                    outputParam.setType("String");
                } else if (type.equalsIgnoreCase("datetime")) {
                    outputParam.setType("Date");
                } else if (type.equalsIgnoreCase("int")) {
                    outputParam.setType("int");
                } else {
                    outputParam.setType("String");
                }
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
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            datasetRunResponse.setData(new ArrayList<>());
        }
        return datasetRunResponse;
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
