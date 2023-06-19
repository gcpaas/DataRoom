package com.gccloud.dataroom.core.module.dataset.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.module.dataset.constant.ReportConstant;
import com.gccloud.dataroom.core.module.dataset.constant.ReportDbType;
import com.gccloud.dataroom.core.module.dataset.dao.DatasetProcessDao;
import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.dto.DatasetProcessTestSearchDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetEntity;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetProcessEntity;
import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.module.dataset.entity.OriginalTable;
import com.gccloud.dataroom.core.module.dataset.model.ViewSqlProcessModel;
import com.gccloud.dataroom.core.module.dataset.params.ParamsClient;
import com.gccloud.dataroom.core.module.dataset.service.DatasetProcessService;
import com.gccloud.dataroom.core.module.dataset.service.DatasetService;
import com.gccloud.dataroom.core.module.dataset.service.DatasourceConfigService;
import com.gccloud.dataroom.core.module.dataset.service.OriginalTableService;
import com.gccloud.dataroom.core.module.dataset.utils.DBUtils;
import com.gccloud.dataroom.core.module.dataset.utils.ReportUtils;
import com.gccloud.dataroom.core.module.dataset.utils.StoredProcedureUtils;
import com.gccloud.dataroom.core.module.dataset.vo.DatasetProcessTestVo;
import com.gccloud.dataroom.core.module.dataset.model.view.CalculateFieldConfigModel;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.utils.JSON;
import com.gccloud.dataroom.core.utils.BeanConvertUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import javax.annotation.Resource;
import java.util.*;

/**
 * @Description:
 * @Author yang.hw
 * @Date 2021/9/8 14:23
 */
@Service
@Slf4j
public class DatasetProcessServiceImpl extends ServiceImpl<DatasetProcessDao, DatasetProcessEntity> implements DatasetProcessService {

    @Resource
    private DatasourceConfigService datasourceConfigService;

    @Resource
    private OriginalTableService originalTableService;

    @Resource
    private DatasetService datasetService;

    @Resource
    private ParamsClient paramsClient;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public String addDatasetProcess(DatasetProcessEntity entity) {
        // 生成编码
        entity.setCode(generateDataSetCode());
        //保存到数据集
        this.save(entity);
        DatasetEntity datasetEntity = BeanConvertUtils.convert(entity, DatasetEntity.class);
        datasetEntity.setDatasetType(ReportConstant.DataSetType.CUSTOM);
        if (entity.getCuringType().equals(ReportConstant.CuringType.STORED_PROCEDURE)) {
            datasetEntity.setDatasetType(ReportConstant.DataSetType.STORED_PROCEDURE);
        }
        datasetEntity.setDatasetRelId(entity.getId());
        if (StringUtils.isNotEmpty(entity.getTypeId())) {
            datasetEntity.setTypeId(entity.getTypeId());
        } else {
            datasetEntity.setTypeId(null);
        }
        datasetEntity.setEditable(entity.getEditable());
        datasetEntity.setRemark(entity.getRemark());
        datasetEntity.setModuleCode(entity.getModuleCode());
        datasetService.save(datasetEntity);
        return entity.getId();
    }

    /**
     * 自动生成数据集编码
     */
    private String generateDataSetCode() {
        String randomCode = UUID.randomUUID().toString();
        randomCode = randomCode.replace("-", "_") + System.currentTimeMillis();
        LambdaQueryWrapper<DatasetProcessEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DatasetProcessEntity::getCode, randomCode);
        int count = this.count(queryWrapper);
        if (count != 0) {
            return generateDataSetCode();
        }
        return "uid_" + randomCode;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void updateDatasetProcess(DatasetProcessEntity entity) {
        DatasetProcessEntity oldEntity = this.getById(entity.getId());
        String cacheField = oldEntity.getCacheField();
        if (StringUtils.isNotEmpty(cacheField) && !oldEntity.getCuringType().equals(ReportConstant.CuringType.STORED_PROCEDURE)) {
            JSONObject cacheJson = JSON.parseObject(cacheField);
            cacheJson.put("cacheField", entity.getCacheField());
            entity.setCacheField(JSON.toJSONString(cacheJson));
        }

        if (StringUtils.isNotEmpty(cacheField) && oldEntity.getCuringType().equals(ReportConstant.CuringType.STORED_PROCEDURE)) {
            JSONObject cacheJson = JSON.parseObject(cacheField);
            List<Map<String, Object>> cacheList = new ArrayList<>();
            Map<String, Object> cacheMap = new HashMap<>();
            cacheMap.put("cache", entity.getCacheField());
            cacheList.add(cacheMap);
            cacheJson.put("cacheList", cacheList);
            entity.setCacheField(JSON.toJSONString(cacheJson));
        }

        //修改数据集
        this.updateById(entity);
        LambdaQueryWrapper<DatasetEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(DatasetEntity::getId);
        if (entity.getCuringType().equals(ReportConstant.CuringType.STORED_PROCEDURE)) {
            queryWrapper.eq(DatasetEntity::getDatasetRelId, entity.getId()).eq(DatasetEntity::getDatasetType, ReportConstant.DataSetType.STORED_PROCEDURE);
        } else {
            queryWrapper.eq(DatasetEntity::getDatasetRelId, entity.getId()).eq(DatasetEntity::getDatasetType, ReportConstant.DataSetType.CUSTOM);
        }
        DatasetEntity datasetEntity = datasetService.getOne(queryWrapper);
        datasetEntity.setName(entity.getName());
        if (entity.getCuringType().equals(ReportConstant.CuringType.STORED_PROCEDURE)) {
            datasetEntity.setDatasetType(ReportConstant.DataSetType.STORED_PROCEDURE);
        } else {
            datasetEntity.setDatasetType(ReportConstant.DataSetType.CUSTOM);
        }
        datasetEntity.setTypeId(entity.getTypeId());
        datasetEntity.setDatasetRelId(entity.getId());
        datasetEntity.setRemark(entity.getRemark());
        datasetEntity.setEditable(entity.getEditable());
        datasetEntity.setModuleCode(entity.getModuleCode());
        if (StringUtils.isEmpty(datasetEntity.getTypeId())) {
            datasetEntity.setTypeId(null);
        }
        datasetService.updateById(datasetEntity);
    }

    @Override
    public DatasetProcessEntity getDatasetProcessInfo(String id) {

        DatasetEntity datasetEntity = datasetService.getById(id);

        LambdaQueryWrapper<DatasetProcessEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(
                DatasetProcessEntity::getCode,
                DatasetProcessEntity::getCodeProcess,
                DatasetProcessEntity::getCuringType,
                DatasetProcessEntity::getFieldDesc,
                DatasetProcessEntity::getFieldJson,
                DatasetProcessEntity::getId,
                DatasetProcessEntity::getParamConfig,
                DatasetProcessEntity::getProcessType,
                DatasetProcessEntity::getSourceId,
                DatasetProcessEntity::getSqlProcess,
                DatasetProcessEntity::getScript
        );
        queryWrapper.eq(DatasetProcessEntity::getId, datasetEntity.getDatasetRelId());

        DatasetProcessEntity datasetProcessInfo = this.getOne(queryWrapper);
        if (null == datasetProcessInfo) {
            throw new GlobalException("当前数据集不存在");
        }
        datasetProcessInfo.setName(datasetEntity.getName());
        datasetProcessInfo.setTypeId(datasetEntity.getTypeId());
        datasetProcessInfo.setRemark(datasetEntity.getRemark());
        return datasetProcessInfo;
    }


    /**
     * 执行存储过程
     *
     * @param searchDto
     * @param vo
     */
    private void executeProcedure(DatasetProcessTestSearchDto searchDto, DatasetProcessTestVo vo) {

        String sourceId = searchDto.getSourceId();
        DatasourceConfig datasourceConfig = datasourceConfigService.getById(sourceId);
        List<DatasetParamDto> datasetParams = new ArrayList<>();

        if (!StringUtils.isEmpty(searchDto.getParamConfig())) {
            datasetParams = JSON.parseArray(searchDto.getParamConfig(), DatasetParamDto.class);
        }

        Map<String, List<Map<String, Object>>> call = StoredProcedureUtils.call(null, null, searchDto.getSqlProcess(), datasetParams, datasourceConfig, ReportConstant.MaxDataSize.QueryDetailMax.MAX_SIZE, false);
        vo.setDataMap(call);
    }

    @Override
    public DatasetProcessTestVo getDatasetSqlTest(DatasetProcessTestSearchDto searchDto) {
        if (searchDto.getCuringType().equals(ReportConstant.CuringType.STORED_PROCEDURE)) {
            DatasetProcessTestVo datasetProcessTestVo = new DatasetProcessTestVo();
            try {
                this.executeProcedure(searchDto, datasetProcessTestVo);
                if (!StringUtils.isEmpty(searchDto.getDatasetId())) {
                    DatasetProcessEntity processEntity = this.getById(searchDto.getDatasetId());
                    Map<String, List<Map<String, Object>>> dataMap = datasetProcessTestVo.getDataMap();
                    List<Map<String, Object>> mapList = dataMap.get("structurePreview");
                    datasetProcessTestVo.setCacheCoherence(checkCacheFieldIfCoherence(mapList, processEntity.getCacheField(), true));

                    if (searchDto.getSqlProcess().equals(processEntity.getSqlProcess())) {
                        insertFieldInfo(processEntity, mapList, searchDto);
                    }
                }
                return datasetProcessTestVo;
            } catch (Exception e) {
                datasetProcessTestVo.setCode(500);
                datasetProcessTestVo.setMsg(e.getMessage());
                datasetProcessTestVo.setException(ExceptionUtils.getStackTrace(e));
                return datasetProcessTestVo;
            }
        }
        String sqlProcess = searchDto.getSqlProcess();

        if (ReportConstant.ProcessType.VIEW_PROCESS.equals(searchDto.getProcessType())) {
            log.info("当前数据集为可视化数据集加工，开始进行sql语句的构建");
            sqlProcess = ReportUtils.buildViewProcessSql(searchDto.getCodeProcess());
        }

        String paramConfig = searchDto.getParamConfig();

        DatasetProcessTestVo vo = new DatasetProcessTestVo();

        String sourceId = searchDto.getSourceId();
        DatasourceConfig tableConfig = datasourceConfigService.getById(sourceId);
        List<DatasetParamDto> datasetParams = new ArrayList<>();
        if (!StringUtils.isEmpty(paramConfig)) {
            datasetParams = JSON.parseArray(paramConfig, DatasetParamDto.class);
            datasetParams = paramsClient.handleParams(datasetParams);
        }
        if (StringUtils.isEmpty(sqlProcess)) {
            throw new GlobalException("测试sql脚本不能为空");
        }
        //针对没有用户名密码的hive连接，为了可以通过前端校验
        if (("Hive").equalsIgnoreCase(tableConfig.getSourceType())) {
            tableConfig.setUsername(null);
            tableConfig.setPassword(null);
        }
        String sourceType = tableConfig.getSourceType();
        //设置随机别名
        String sqlAlias = "sqlProcess" + (int) (Math.random() * 100);
        String hsqlAlias = "hsqlProcess" + (int) (Math.random() * 100);
        String countSql;
        if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(sourceType)) {
            countSql = "SELECT COUNT(1) AS count FROM " + "(" + sqlProcess + ")";
        } else {
            countSql = "SELECT COUNT(1) AS count FROM " + "(" + sqlProcess + ") " + sqlAlias;
        }
        log.info("数据集加工sql测试，计算总条数 sql语句：{}", countSql);

        DatasetProcessTestVo testVo = DBUtils.checkSql(countSql, datasetParams, tableConfig);
        if (testVo.getCode().equals(500)) {
            return testVo;
        }

        //判断数据分析数据源类型
        Map<String, List<Map<String, Object>>> countMap = null;
        countMap = DBUtils.getClickHouseValue(countSql, datasetParams, tableConfig);
        List<Map<String, Object>> countList = countMap.get("dataPreview");
        //总数
        int totalCount;
        if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(sourceType)) {
            totalCount = Integer.parseInt(String.valueOf(countList.get(0).get("COUNT")));
        } else {
            totalCount = Integer.parseInt(String.valueOf(countList.get(0).get("count")));
        }
        Integer pageSize = searchDto.getSize();

        Integer pageIndex = searchDto.getCurrent();
        int prefix = (pageIndex - 1) * pageSize;
        //获取数据源信息判断分页sql
        String querySql = "";
        if (("Mysql").equalsIgnoreCase(sourceType) || ("ClickHouse").equalsIgnoreCase(sourceType)) {
            querySql = "SELECT * FROM " + "(" + sqlProcess + ")" + " AS " + sqlAlias + " LIMIT " + prefix + "," + pageSize;
        }
        if (("TelePG").equalsIgnoreCase(sourceType)) {
            querySql = "SELECT * FROM " + "(" + sqlProcess + ")" + " AS " + sqlAlias + " LIMIT " + pageSize + " offset " + prefix;
        }
        if (("Hive").equalsIgnoreCase(sourceType)) {
            querySql = "SELECT * from (SELECT (row_number() over()) AS pxid," + sqlAlias + ".* FROM " + "(" + sqlProcess + ")" + " AS " + sqlAlias + ") AS " + hsqlAlias + " WHERE pxid >= " + (prefix + 1) + " LIMIT " + pageSize;
        }
        if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(sourceType)) {
            querySql = "SELECT * FROM ( SELECT TMP.*, ROWNUM ROW_ID FROM ( " + sqlProcess + " ) TMP WHERE ROWNUM <=" + (Math.min(pageIndex * pageSize, totalCount)) + ") WHERE ROW_ID > " + prefix;
        }
        log.info("数据集加工sql测试，分页查询 sql语句：{}", querySql);

        testVo = DBUtils.checkSql(querySql, datasetParams, tableConfig);
        if (testVo.getCode().equals(500)) {
            return testVo;
        }
        Map<String, List<Map<String, Object>>> map = null;
        if (("Hive").equalsIgnoreCase(tableConfig.getSourceType())) {
            map = DBUtils.getHiveValue(querySql, datasetParams, tableConfig);
        } else if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(tableConfig.getSourceType())) {
            //说明是oracle数据源
            map = DBUtils.getOracleValue(querySql, datasetParams, tableConfig);
        } else {
            map = DBUtils.getClickHouseValue(querySql, datasetParams, tableConfig);
        }
        List<Map<String, Object>> structurePreview = map.get("structurePreview");

        //获取字段注释
        String datasetId = searchDto.getDatasetId();
        String oldSqlProcess = "";
        DatasetProcessEntity processEntity = new DatasetProcessEntity();
        if (!StringUtils.isEmpty(datasetId)) {
            processEntity = this.getById(searchDto.getDatasetId());
            oldSqlProcess = processEntity.getSqlProcess();
        }

        //暂定如果数据集id为空，或者 sql脚本发生变化，就从原始表获取字段信息
        if (StringUtils.isEmpty(datasetId) || !oldSqlProcess.equals(sqlProcess)) {
            // 获取字段描述信息
            getFieldDescInfo(structurePreview, searchDto, new ArrayList<>(datasetParams), tableConfig);
        } else {
            insertFieldInfo(processEntity, structurePreview, searchDto);
        }
        vo.setDataMap(map);
        vo.setTotalCount(totalCount);
        // 字段合法性校验
        fieldCheckLegal(map.get("structurePreview"));
        vo.setCacheCoherence(checkCacheFieldIfCoherence(map.get("structurePreview"), processEntity.getCacheField(), false));
        vo.setTableNameList(DBUtils.getTableNames(DBUtils.updateParamsConfig(querySql, new ArrayList<>(datasetParams))));
        return vo;
    }

    private void insertFieldInfo(DatasetProcessEntity processEntity, List<Map<String, Object>> structurePreview, DatasetProcessTestSearchDto searchDto) {
        //否则直接获取 字段注释
        String fieldDesc = processEntity.getFieldDesc();
        if (!StringUtils.isEmpty(fieldDesc)) {
            JSONObject fieldDescObj = JSON.parseObject(fieldDesc);
            structurePreview.forEach(r -> {
                insertIntoFieldInfo(structurePreview, searchDto);
                if (fieldDescObj.has(String.valueOf(r.get("columnName"))) && fieldDescObj.get(String.valueOf(r.get("columnName"))) != null) {
                    r.put("fieldDesc", fieldDescObj.get(String.valueOf(r.get("columnName"))));
                }
            });
        }
    }

    private void insertIntoFieldInfo(List<Map<String, Object>> structurePreview, DatasetProcessTestSearchDto searchDto) {
        if (!StringUtils.isEmpty(searchDto.getDatasetId())) {
            DatasetProcessEntity processEntity = this.getById(searchDto.getDatasetId());
            String fieldJson = processEntity.getFieldJson();
            JSONArray array = JSON.parseArray(fieldJson);
            structurePreview.forEach(r -> {
                String columnName = (String) r.get("columnName");
                array.forEach(res -> {
                    JSONObject res1 = (JSONObject) res;
                    if (columnName.equals(res1.getString("columnName"))) {
                        r.put("orderNum", res1.getInt("orderNum"));
                        r.put("sourceTable", res1.getString("sourceTable"));
                    }
                });
            });
        } else {
            structurePreview.forEach(r -> {
                r.put("orderNum", 0);
                r.put("sourceTable", "");
            });
        }
    }

    /**
     * 将字段描述信息添加进去
     */
    private void getFieldDescInfo(
            List<Map<String, Object>> structurePreview, DatasetProcessTestSearchDto searchDto, List<DatasetParamDto> datasetParams, DatasourceConfig tableConfig
    ) {

        if (searchDto.getProcessType().equals(ReportConstant.ProcessType.VIEW_PROCESS)) {
            // 可视化直接从配置中获取
            ViewSqlProcessModel viewSqlProcessModel = JSON.parseObject(searchDto.getCodeProcess(), ViewSqlProcessModel.class);

            List<CalculateFieldConfigModel> calculateFieldConfig = viewSqlProcessModel.getCalculateFieldConfig();
            JSONObject fieldDescObj = new JSONObject();
            calculateFieldConfig.forEach(r -> fieldDescObj.put(r.getFieldAlias(), r.getName()));
            structurePreview.forEach(r -> {
                insertIntoFieldInfo(structurePreview, searchDto);
                if (null != fieldDescObj.get(String.valueOf(r.get("columnName")))) {
                    r.put("fieldDesc", fieldDescObj.get(String.valueOf(r.get("columnName"))));
                }
            });

        } else {
            // sql加工处理从表中或自助数据集中获取
            List<String> tableNamesList = null;
            try {
                tableNamesList = DBUtils.getTableNames(DBUtils.updateParamsConfig(searchDto.getSqlProcess(), datasetParams));
            } catch (Exception e) {
                log.error("解析sql获取表名失败");
            }

            if (!CollectionUtils.isEmpty(tableNamesList)) {
                for (String tableName : tableNamesList) {
                    //根据表名和数据源id查询原始表导入的 字段注释
                    OriginalTable originalTable = originalTableService.getByTableNameAndSourceId(tableName, tableConfig.getId());
                    if (originalTable != null && !StringUtils.isEmpty(originalTable.getFieldDesc())) {
                        JSONObject fieldDescObj = JSON.parseObject(originalTable.getFieldDesc());
                        structurePreview.forEach(r -> {
                            if (fieldDescObj.has("columnName") && fieldDescObj.get(String.valueOf(r.get("columnName"))) != null) {
                                r.put("fieldDesc", fieldDescObj.get(String.valueOf(r.get("columnName"))));
                            }
                        });
                    } else {
                        //从自助数据集获取字段注释
                        LambdaQueryWrapper<DatasetProcessEntity> lambdaQueryWrapper = new LambdaQueryWrapper<>();
                        lambdaQueryWrapper.eq(DatasetProcessEntity::getCode, tableName);
                        DatasetProcessEntity datasetProcessEntity = this.getOne(lambdaQueryWrapper);
                        if (datasetProcessEntity != null) {
                            if (!StringUtils.isEmpty(datasetProcessEntity.getFieldDesc())) {
                                JSONObject fieldDescObj = JSON.parseObject(datasetProcessEntity.getFieldDesc());
                                structurePreview.forEach(r -> {
                                    insertIntoFieldInfo(structurePreview, searchDto);
                                    if (fieldDescObj.get(String.valueOf(r.get("columnName"))) != null) {
                                        r.put("fieldDesc", fieldDescObj.get(String.valueOf(r.get("columnName"))));
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }

    }

    /**
     * 判断缓存字段是否一致性
     */
    private int checkCacheFieldIfCoherence(List<Map<String, Object>> fieldStructureList, String cacheField, boolean ifStoreProcure) {
        Set<String> fieldList = new HashSet<>();
        Set<String> cacheFieldList = new HashSet<>();

        fieldStructureList.forEach(r -> fieldList.add(String.valueOf(r.get("columnName"))));

        // 非存储过程
        if (!StringUtils.isEmpty(cacheField) && !ifStoreProcure) {
            JSONObject cacheObj = JSON.parseObject(cacheField);
            JSONObject preview = cacheObj.getJSONObject("preview");
            JSONArray structurePreview = preview.getJSONArray("structurePreview");
            structurePreview.forEach(res -> {
                JSONObject structurePreviewMap = (JSONObject) res;
                String columnName = structurePreviewMap.getString("columnName");
                cacheFieldList.add(columnName);
            });
            if (checkDifferent(fieldList, cacheFieldList)) {
                return 0;
            } else {
                return 1;
            }

        }
        // 存储过程
        else if (!StringUtils.isEmpty(cacheField) && ifStoreProcure) {
            JSONObject cacheObj = JSON.parseObject(cacheField);
            JSONArray structurePreview = cacheObj.getJSONArray("structurePreview");
            structurePreview.forEach(res -> {
                JSONObject structurePreviewMap = (JSONObject) res;
                String columnName = structurePreviewMap.getString("columnName");
                cacheFieldList.add(columnName);
            });
            if (checkDifferent(fieldList, cacheFieldList)) {
                return 0;
            } else {
                return 1;
            }
        } else {
            return 0;
        }
    }

    /**
     * 判断集合是否相同
     */
    private boolean checkDifferent(Set<String> list, Set<String> list1) {
        if (list.size() != list1.size()) {
            return false;
        }
        for (String str : list) {
            if (!list1.contains(str)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 字段合法性校验
     */
    private void fieldCheckLegal(List<Map<String, Object>> structureMap) {
        structureMap.forEach(r -> {
            String columnName = String.valueOf(r.get("columnName"));
            if (columnName.length() > 30) {
                throw new GlobalException("【" + columnName + " 】 字段长度大于30，请定义低于长度30的别名");
            }
        });
    }


}

