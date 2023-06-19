package com.gccloud.dataroom.core.module.dataset.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.module.dataset.constant.ReportConstant;
import com.gccloud.dataroom.core.module.dataset.constant.ReportDbType;
import com.gccloud.dataroom.core.module.dataset.dao.DsDao;
import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetEntity;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetProcessEntity;
import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.module.dataset.entity.OriginalTable;
import com.gccloud.dataroom.core.module.dataset.params.ParamsClient;
import com.gccloud.dataroom.core.module.dataset.service.*;
import com.gccloud.dataroom.core.module.dataset.utils.DBUtils;
import com.gccloud.dataroom.core.module.dataset.utils.StoredProcedureUtils;
import com.gccloud.dataroom.core.module.dataset.vo.DataSetInfoVo;
import com.gccloud.dataroom.core.utils.GroovyUtils;
import com.gccloud.dataroom.core.utils.JSON;
import com.gccloud.dataroom.core.vo.PageVO;
import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.*;


/**
 * @author zhang.zeJun
 * @date 2022-11-17-11:02
 */

@Service
@Slf4j
public class DsServiceImpl extends ServiceImpl<DsDao, DataSetInfoVo> implements DsService {

    @Resource
    private DatasetService datasetService;

    @Resource
    private OriginalTableService originalTableService;

    @Lazy
    @Resource
    private DatasetProcessService datasetProcessService;

    @Lazy
    @Resource
    private DatasourceConfigService datasourceConfigService;

    @Resource
    private ParamsClient paramsClient;

    @Autowired(required = false)
    private IOtherDatasetService otherDatasetService;


    @Override
    public DataSetInfoVo getDataSetDetails(String id) {
        DataSetInfoVo dataSetInfoVo = new DataSetInfoVo();
        DatasetEntity datasetEntity = datasetService.getById(id);
        if (null == datasetEntity) {
            return null;
        }
        dataSetInfoVo.setId(id);
        dataSetInfoVo.setName(datasetEntity.getName());
        dataSetInfoVo.setType(datasetEntity.getDatasetType());
        dataSetInfoVo.setEditAble(datasetEntity.getEditable());

        StringBuilder dataBuilder = new StringBuilder();
        String datasetType = datasetEntity.getDatasetType();

        boolean handled = false;
        if (ReportConstant.DataSetType.ORIGINAL.equals(datasetType)) {
            handled = true;
            OriginalTable originalTable = originalTableService.getById(datasetEntity.getDatasetRelId());
            dataSetInfoVo.setDataSourceKey(originalTable.getSourceId());
            dataBuilder.append("select ");
            if (!StringUtils.isEmpty(originalTable.getFieldInfo())) {
                dataBuilder.append(originalTable.getFieldInfo());
            } else {
                dataBuilder.append("*");
            }
            dataBuilder.append(" from ").append(originalTable.getTableName());
        }

        // 自助数据集
        if (ReportConstant.DataSetType.CUSTOM.equals(datasetType) || ReportConstant.DataSetType.STORED_PROCEDURE.equals(datasetType)) {
            handled = true;
            DatasetProcessEntity datasetProcessEntity = datasetProcessService.getById(datasetEntity.getDatasetRelId());
            dataSetInfoVo.setDataSourceKey(datasetProcessEntity.getSourceId());
            dataBuilder.append(datasetProcessEntity.getSqlProcess());
            if (!StringUtils.isEmpty(datasetProcessEntity.getParamConfig())) {
                dataSetInfoVo.setParams(JSON.parseArray(datasetProcessEntity.getParamConfig()));
            }
            dataSetInfoVo.setFields(fieldFormat(datasetProcessEntity.getFieldJson()));
            String data = dataBuilder.toString();
            dataSetInfoVo.setData(data);
        }

        // 原始数据集
        if (ReportConstant.DataSetType.ORIGINAL.equals(datasetType)) {
            handled = true;
            OriginalTable originalTable = originalTableService.getById(datasetEntity.getDatasetRelId());
            dataSetInfoVo.setDataSourceKey(originalTable.getSourceId());
            dataSetInfoVo.setFields(fieldFormat(originalTable.getFieldJson()));
            dataSetInfoVo.setData(dataBuilder.toString());
        }

        // JSON数据集
        if (ReportConstant.DataSetType.JSON.equals(datasetType)) {
            handled = true;
            String data = datasetEntity.getData();
            JSONObject object = JSON.parseObject(data);

            Object json = object.get("json");
            dataSetInfoVo.setData(String.valueOf(json));
            dataSetInfoVo.setFields(fieldDescHandle(object));
        }

        // 模型数据集
        if (ReportConstant.DataSetType.MODEL.equals(datasetType)) {
            handled = true;
            String data = datasetEntity.getData();
            JSONObject object = JSON.parseObject(data);
            if (object.has("dataModel")) {
                // 模型编码
                dataSetInfoVo.setData(object.getString("dataModel"));
            }
            if (object.has("sourceId")) {
                // 数据源id
                dataSetInfoVo.setDataSourceKey(object.getString("sourceId"));
            }
        }

        // 脚本数据集
        if (ReportConstant.DataSetType.SCRIPT.equals(datasetType)) {
            handled = true;
            String data = datasetEntity.getData();
            JSONObject object = JSON.parseObject(data);

            if (object.has("script")) {
                dataSetInfoVo.setData(object.getString("script"));
            }

            dataSetInfoVo.setFields(fieldDescHandle(object));
            if (object.has("paramsList") && object.getJSONArray("paramsList").length() != 0) {
                dataSetInfoVo.setParams(object.getJSONArray("paramsList"));
            }
        }
        if (!handled) {
            return otherDatasetService.getDataSetDetails(id);
        }
        return dataSetInfoVo;
    }

    private JSONArray fieldDescHandle(JSONObject object) {
        JSONObject fieldDesc = object.getJSONObject("fieldDesc");
        Set<String> key = fieldDesc.keySet();
        JSONArray array = new JSONArray();
        for (String k : key) {
            JSONObject obj = new JSONObject();
            obj.put("type", "");
            obj.put("comment", fieldDesc.get(k));
            obj.put("name", k);
            obj.put("orderNum", 0);
            obj.put("sourceTable", "");
            array.put(obj);
        }
        return array;
    }

    private JSONArray fieldFormat(String fieldJson) {
        JSONArray array = new JSONArray();
        if (!StringUtils.isEmpty(fieldJson)) {
            JSONArray jsonArray = JSON.parseArray(fieldJson);
            jsonArray.forEach(r -> {
                JSONObject obj = new JSONObject();
                JSONObject r1 = (JSONObject) r;
                if (r1.has("columnType")) {
                    obj.put("type", r1.get("columnType"));
                }
                if (r1.has("fieldDesc")) {
                    obj.put("comment", r1.get("fieldDesc"));
                }
                if (r1.has("columnName")) {
                    obj.put("name", r1.get("columnName"));
                }
                if (r1.has("orderNum")) {
                    obj.put("orderNum", r1.get("orderNum"));
                }
                if (r1.has("sourceTable")) {
                    obj.put("sourceTable", r1.get("sourceTable"));
                }
                array.put(obj);
            });
        }
        return array;
    }

    @Override
    public Object getData(String dataSetId, List<DatasetParamDto> params) {
        DatasetEntity datasetEntity = datasetService.getById(dataSetId);
        if (null == datasetEntity) {
            throw new GlobalException("数据集不存在");
        }
        params = paramsClient.handleParams(params);
        String datasetType = datasetEntity.getDatasetType();
        if (datasetType.equals(ReportConstant.DataSetType.JSON)) {
            return this.executeJsonDataSet(dataSetId);
        }
        if (datasetType.equals(ReportConstant.DataSetType.SCRIPT)) {
            String scriptJson = datasetEntity.getData();
            JSONObject object = JSON.parseObject(scriptJson);
            String script = object.getString("script");
            return this.runScriptDataSet(script, params);
        }
        return this.execute(dataSetId, params);
    }

    /**
     * 执行groovy脚本
     *
     * @param script
     * @param params
     * @return
     */
    public Object runScriptDataSet(String script, List<DatasetParamDto> params) {
        Map<String, Object> paramMap = new HashMap<>(16);
        if (!CollectionUtils.isEmpty(params)) {
            params.forEach(r -> paramMap.put(r.getName(), r.getValue()));
        }
        Class clazz = GroovyUtils.buildClass(script);
        if (clazz == null) {
            throw new GlobalException("脚本编译异常");
        }
        return GroovyUtils.run(script, paramMap);
    }

    @Override
    public List<Map<String, Object>> execute(String dataSetId, List<DatasetParamDto> params) {
        DatasetEntity datasetEntity = datasetService.getById(dataSetId);
        if (null == datasetEntity) {
            throw new GlobalException("数据集不存在");
        }
        params = paramsClient.handleParams(params);
        List<String> datasetTypes = Lists.newArrayList(ReportConstant.DataSetType.CUSTOM,
                ReportConstant.DataSetType.SCRIPT,
                ReportConstant.DataSetType.JSON,
                ReportConstant.DataSetType.MODEL,
                ReportConstant.DataSetType.ORIGINAL,
                ReportConstant.DataSetType.STORED_PROCEDURE);
        if (!datasetTypes.contains(datasetEntity.getDatasetType())) {
            return otherDatasetService.execute(dataSetId, params);
        }
        String sql;
        if (datasetEntity.getDatasetType().equals(ReportConstant.DataSetType.CUSTOM)
                || datasetEntity.getDatasetType().equals(ReportConstant.DataSetType.STORED_PROCEDURE)) {
            DatasetProcessEntity datasetProcessEntity = datasetProcessService.getById(datasetEntity.getDatasetRelId());
            DatasourceConfig datasourceConfig = datasourceConfigService.getById(datasetProcessEntity.getSourceId());

            if (datasetEntity.getDatasetType().equals(ReportConstant.DataSetType.CUSTOM)) {
                sql = datasetProcessEntity.getSqlProcess();
                return DBUtils.getClickHouseValue(sql, params, datasourceConfig).get("dataPreview");
            }
            Map<String, List<Map<String, Object>>> call = StoredProcedureUtils.call(null, null, datasetProcessEntity.getSqlProcess(), params, datasourceConfig, ReportConstant.MaxDataSize.QueryDetailMax.MAX_SIZE, false);
            return call.get("dataPreview");
        }
        OriginalTable originalTable = originalTableService.getById(datasetEntity.getDatasetRelId());
        DatasourceConfig datasourceConfig = datasourceConfigService.getById(originalTable.getSourceId());
        String fieldInfo = originalTable.getFieldInfo();
        if (StringUtils.isEmpty(fieldInfo)) {
            fieldInfo = "*";
        }
        sql = "select " + fieldInfo + " from " + originalTable.getTableName();
        return DBUtils.getClickHouseValue(sql, params, datasourceConfig).get("dataPreview");
    }

    @Override
    public PageVO execute(String dataSetId, List<DatasetParamDto> params, int current, int size) {
        DatasetEntity datasetEntity = datasetService.getById(dataSetId);
        if (null == datasetEntity) {
            throw new GlobalException("数据集不存在");
        }
        if (CollectionUtils.isEmpty(params)) {
            params = new ArrayList<>();
        }
        params = paramsClient.handleParams(params);
        String sql;
        int prefix = (current - 1) * size;
        if (datasetEntity.getDatasetType().equals(ReportConstant.DataSetType.CUSTOM) || datasetEntity.getDatasetType().equals(ReportConstant.DataSetType.STORED_PROCEDURE)) {
            DatasetProcessEntity datasetProcessEntity = datasetProcessService.getById(datasetEntity.getDatasetRelId());
            DatasourceConfig datasourceConfig = datasourceConfigService.getById(datasetProcessEntity.getSourceId());
            String countSql = "";
            if (ReportConstant.CuringType.VIEW.equals(datasetProcessEntity.getCuringType()) && !StringUtils.isEmpty(datasetProcessEntity.getSourceId())) {
                if (!StringUtils.isEmpty(datasetProcessEntity.getParamConfig())) {
                    if (CollectionUtils.isEmpty(params)) {
                        params = JSON.parseArray(datasetProcessEntity.getParamConfig(), DatasetParamDto.class);
                    }
                }
                countSql = "select COUNT(1) AS count FROM( " + datasetProcessEntity.getSqlProcess() + " ) varCount";
                log.info("数据集数据详情计算总条数 sql语句：{}", countSql);
            }
            Map<String, List<Map<String, Object>>> clickHouseValue = DBUtils.getClickHouseValue(countSql, params, datasourceConfig);
            List<Map<String, Object>> countList = clickHouseValue.get("dataPreview");
            //总数
            String varCount = "count";
            if (datasourceConfig.getSourceType().equals(ReportDbType.ORACLE.getUpInfo())) {
                varCount = "COUNT";
            }
            Integer totalCount = Integer.valueOf(String.valueOf(countList.get(0).get(varCount)));
            if (datasourceConfig.getSourceType().equals(ReportDbType.POSTGRESQL.getUpInfo())) {
                sql = "select * from (" + datasetProcessEntity.getSqlProcess() + ") as " + datasetProcessEntity.getCode() + " LIMIT " + size + " OFFSET " + prefix;
            } else if (datasourceConfig.getSourceType().equals(ReportDbType.ORACLE.getUpInfo())) {
                sql = "SELECT * FROM ( SELECT TMP.*, ROWNUM ROW_ID FROM ( " + datasetProcessEntity.getSqlProcess() + " ) TMP WHERE ROWNUM <=" + (current * size > totalCount ? totalCount : (current * size)) + ") WHERE ROW_ID > " + prefix;
            } else {
                sql = "select * from (" + datasetProcessEntity.getSqlProcess() + ")  " + datasetProcessEntity.getCode() + " LIMIT " + prefix + "," + size;
            }
            Integer totalPage = (totalCount + size - 1) / size;
            List<Map<String, Object>> dataPreview = DBUtils.getClickHouseValue(sql, params, datasourceConfig).get("dataPreview");
            PageVO<Map<String, Object>> pageVO = new PageVO<>();
            pageVO.setList(dataPreview);
            pageVO.setTotalCount(totalCount);
            pageVO.setTotalPage(totalPage);
            pageVO.setCurrent(current);
            pageVO.setSize(size);
            return pageVO;
        } else {
            OriginalTable originalTable = originalTableService.getById(datasetEntity.getDatasetRelId());
            DatasourceConfig datasourceConfig = datasourceConfigService.getById(originalTable.getSourceId());
            String fieldInfo = originalTable.getFieldInfo();
            if (StringUtils.isEmpty(fieldInfo)) {
                fieldInfo = "*";
            }
            String countSql;
            if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType())) {
                countSql = "SELECT COUNT(1)AS count FROM ( SELECT * FROM " + originalTable.getTableName() + ") ";
            } else {
                countSql = "SELECT COUNT(1)AS count FROM ( SELECT * FROM " + originalTable.getTableName() + ")as " + originalTable.getTableName();
            }
            log.info("数据集数据详情计算总条数 sql语句：{}", countSql);
            Map<String, List<Map<String, Object>>> countValue = DBUtils.getClickHouseValue(countSql, new ArrayList<>(), datasourceConfig);
            Integer totalCount;
            if (ReportDbType.ORACLE.getUpInfo().equals(datasourceConfig.getSourceType())) {
                totalCount = Integer.valueOf(String.valueOf(countValue.get("dataPreview").get(0).get("COUNT")));
            } else {
                totalCount = Integer.valueOf(String.valueOf(countValue.get("dataPreview").get(0).get("count")));
            }
            if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType())) {
                sql = "SELECT * FROM ( SELECT TMP.*, ROWNUM ROW_ID FROM (SELECT " + fieldInfo + " FROM " + originalTable.getTableName() + " ) TMP WHERE ROWNUM <=" + (current * size > totalCount ? totalCount : (current * size)) + ") WHERE ROW_ID > " + prefix;
            } else if (datasourceConfig.getSourceType().equals(ReportDbType.POSTGRESQL.getUpInfo())) {
                sql = "SELECT " + fieldInfo + " FROM " + originalTable.getTableName() + " LIMIT " + size + " OFFSET " + prefix;
            } else {
                sql = "SELECT " + fieldInfo + " FROM " + originalTable.getTableName() + " LIMIT " + prefix + "," + size;
            }
            Integer totalPage = (totalCount + size - 1) / size;
            List<Map<String, Object>> dataPreview = DBUtils.getClickHouseValue(sql, params, datasourceConfig).get("dataPreview");
            PageVO<Map<String, Object>> pageVO = new PageVO<>();
            pageVO.setList(dataPreview);
            pageVO.setTotalCount(totalCount);
            pageVO.setTotalPage(totalPage);
            pageVO.setCurrent(current);
            pageVO.setSize(size);
            return pageVO;
        }
    }

    // TODO 入参优化
    @Override
    public Object executeJsonDataSet(String dataSetId) {
        DatasetEntity datasetEntity = datasetService.getById(dataSetId);
        if (datasetEntity != null) {
            if (datasetEntity.getDatasetType().equals(ReportConstant.DataSetType.JSON)) {
                String data = datasetEntity.getData();
                JSONObject object = JSON.parseObject(data);

                if (!object.has("json") || null == object.get("json")) {
                    throw new GlobalException("当前JSON数据集为空");
                }
                return object.get("json");
            } else {
                throw new GlobalException("当前数据集非JSON数据集");
            }
        } else {
            throw new GlobalException("数据集不存在");
        }
    }
}
