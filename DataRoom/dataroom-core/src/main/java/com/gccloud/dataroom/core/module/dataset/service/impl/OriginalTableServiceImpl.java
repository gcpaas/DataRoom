package com.gccloud.dataroom.core.module.dataset.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.module.dataset.constant.ReportConstant;
import com.gccloud.dataroom.core.module.dataset.constant.ReportDbType;
import com.gccloud.dataroom.core.module.dataset.dao.OriginalTableDao;
import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.dto.OriginalTableDto;
import com.gccloud.dataroom.core.module.dataset.entity.CategoryTree;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetEntity;
import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.module.dataset.entity.OriginalTable;
import com.gccloud.dataroom.core.module.dataset.service.CategoryTreeService;
import com.gccloud.dataroom.core.module.dataset.service.DatasetService;
import com.gccloud.dataroom.core.module.dataset.service.DatasourceConfigService;
import com.gccloud.dataroom.core.module.dataset.service.OriginalTableService;
import com.gccloud.dataroom.core.module.dataset.utils.DBUtils;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.utils.JSON;
import com.gccloud.dataroom.core.utils.BeanConvertUtils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author pan.shun
 * @since 2021/9/7 15:04
 */
@Service
@Slf4j
public class OriginalTableServiceImpl extends ServiceImpl<OriginalTableDao, OriginalTable> implements OriginalTableService {
    @Resource
    private DatasourceConfigService datasourceConfigService;

    @Resource
    private CategoryTreeService categoryTreeService;

    @Resource
    private DatasetService datasetService;

    @Override
    public void addOrUpdate(OriginalTable originalTable) {
        if (StringUtils.isEmpty(originalTable.getId())) {
            if (StringUtils.isEmpty(originalTable.getTypeId())) {
                originalTable.setTypeId(null);
            }
            this.save(originalTable);
            DatasetEntity datasetEntity = BeanConvertUtils.convert(originalTable, DatasetEntity.class);
            datasetEntity.setDatasetType(ReportConstant.DataSetType.ORIGINAL);
            datasetEntity.setTypeId(originalTable.getTypeId());
            datasetEntity.setDatasetRelId(originalTable.getId());
            datasetEntity.setRemark(originalTable.getRemark());
            datasetEntity.setEditable(originalTable.getEditable());
            datasetEntity.setModuleCode(originalTable.getModuleCode());
            datasetService.save(datasetEntity);
        } else {
            // 编辑时这两个字段是不可修改，防止修改dom元素进行修改，制空不接收
            originalTable.setSourceId(null);
            originalTable.setTableName(null);
            if (StringUtils.isEmpty(originalTable.getTypeId())) {
                originalTable.setTypeId(null);
            }

            this.updateById(originalTable);
            LambdaQueryWrapper<DatasetEntity> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.select(DatasetEntity::getId, DatasetEntity::getName);
            queryWrapper.eq(DatasetEntity::getDatasetRelId, originalTable.getId());
            queryWrapper.eq(DatasetEntity::getDatasetType, ReportConstant.DataSetType.ORIGINAL);
            DatasetEntity datasetEntity = datasetService.getOne(queryWrapper);
            datasetEntity.setDatasetType(ReportConstant.DataSetType.ORIGINAL);
            datasetEntity.setTypeId(originalTable.getTypeId());
            datasetEntity.setDatasetRelId(originalTable.getId());
            datasetEntity.setRemark(originalTable.getRemark());
            datasetEntity.setEditable(originalTable.getEditable());
            datasetEntity.setModuleCode(originalTable.getModuleCode());
            datasetEntity.setName(originalTable.getName());
            datasetService.updateById(datasetEntity);
        }
    }

    @Override
    public OriginalTable getOriginalTableDetails(String id) {

        DatasetEntity datasetEntity = datasetService.getById(id);
        OriginalTable originalTable = this.getById(datasetEntity.getDatasetRelId());
        originalTable.setTypeId(datasetEntity.getTypeId());
        originalTable.setRemark(datasetEntity.getRemark());
        return originalTable;
    }

    @Override
    public Map<String, Object> getOriginalTableDetail(OriginalTableDto origin) {

        String sourceId;
        String tableName;
        String fieldDesc = "";
        String typeName = "";
        String fieldInfo = origin.getFieldInfo();
        // 去重标识关键字
        String distinctFLag;

        Integer repeatStatus = 0;

        if (StringUtils.isEmpty(origin.getId())) {
            sourceId = origin.getSourceId();
            tableName = origin.getTableName();
            if (null != origin.getRepeatStatus()) {
                repeatStatus = origin.getRepeatStatus();
            } else {
                repeatStatus = 1;
            }
        } else {
            OriginalTable originalTable = this.getById(origin.getId());
            sourceId = originalTable.getSourceId();
            tableName = originalTable.getTableName();
            fieldDesc = originalTable.getFieldDesc();
            repeatStatus = originalTable.getRepeatStatus();
            if (null == repeatStatus) {
                repeatStatus = 1;
            }
            LambdaQueryWrapper<DatasetEntity> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(DatasetEntity::getDatasetRelId, origin.getId());
            queryWrapper.eq(DatasetEntity::getDatasetType, ReportConstant.DataSetType.ORIGINAL);
            DatasetEntity datasetEntity = datasetService.getOne(queryWrapper);
            //适配报表设计器为了获取所属分类名称
            CategoryTree categoryTree = categoryTreeService.getById(datasetEntity.getTypeId());
            if (categoryTree != null) {
                typeName = categoryTree.getName();
            }
        }
        DatasourceConfig datasourceConfig = datasourceConfigService.getById(sourceId);
        if (datasourceConfig == null) {
            log.error("当前数据源不存在，数据源ID为：{}，原始表名称为：{}", origin.getSourceId(), origin.getTableName());
            throw new GlobalException("当前数据源不存在");
        }
        if (("Hive").equalsIgnoreCase(datasourceConfig.getSourceType())) {
            datasourceConfig.setUsername(null);
            datasourceConfig.setPassword(null);
        }
        String countSql;
        if (ReportConstant.DataRepeat.NOT_REPEAT.equals(repeatStatus)) {
            countSql = "SELECT COUNT(1) AS count FROM " + tableName;
            distinctFLag = "";
        } else {
            if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType())) {
                countSql = "SELECT COUNT(1) AS count FROM ( SELECT DISTINCT * FROM " + tableName + ") ";
            } else {
                countSql = "SELECT COUNT(1) AS count FROM ( SELECT DISTINCT * FROM " + tableName + ")as " + tableName;
            }
            distinctFLag = " DISTINCT ";
        }

        log.info("当前数据集数据数据{}", repeatStatus.equals(ReportConstant.DataRepeat.DEFAULT) ? "已做去重处理" : "未做去重处理");
        log.info("表结构详情count 语句构建完毕， {}", countSql);

        Map<String, List<Map<String, Object>>> countValue = DBUtils.getClickHouseValue(countSql, new ArrayList<>(), datasourceConfig);
        //Oracle数据库没有小写的count字段
        Integer totalCount;
        if (ReportDbType.ORACLE.getUpInfo().equals(datasourceConfig.getSourceType())) {
            totalCount = Integer.valueOf(String.valueOf(countValue.get("dataPreview").get(0).get("COUNT")));
        } else {
            totalCount = Integer.valueOf(String.valueOf(countValue.get("dataPreview").get(0).get("count")));
        }

        Integer pageSize = origin.getSize();
        Integer pageIndex = origin.getCurrent();
        Integer prefix = (pageIndex - 1) * pageSize;

        String sql;

        // 是否有自选字段
        if (StringUtils.isEmpty(fieldInfo)) {
            sql = "SELECT " + distinctFLag + "* FROM " + tableName + "";
        } else {
            sql = "SELECT " + distinctFLag + fieldInfo + " FROM " + tableName;
        }

        // 根据不同数据源进行分页查询
        if (ReportDbType.MYSQL.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType()) || ReportDbType.CLICKHOUSE.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType())) {
            sql += " LIMIT " + prefix + "," + pageSize;
        }
        if (ReportDbType.POSTGRESQL.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType())) {
            sql += " LIMIT " + pageSize + " offset " + prefix;
        }
        if (ReportDbType.ORACLE.getUpInfo().equalsIgnoreCase(datasourceConfig.getSourceType())) {
            sql = "SELECT * FROM ( SELECT TMP.*, ROWNUM ROW_ID FROM ( " + sql + " ) TMP WHERE ROWNUM <=" + (pageIndex * pageSize > totalCount ? totalCount : (pageIndex * pageSize)) + ") WHERE ROW_ID > " + prefix;
        }

        log.info("表结构详情sql 构建完毕，{}", sql);

        List<DatasetParamDto> datasetParams = new ArrayList<>();
        Map<String, List<Map<String, Object>>> clickHouseValue = DBUtils.getClickHouseValue(sql, datasetParams, datasourceConfig);

        Map<String, Object> valueMap = new HashMap<>();
        clickHouseValue.forEach(valueMap::put);

        valueMap.put("totalCount", totalCount);
        valueMap.put("typeName", typeName);

        List<Map<String, Object>> structurePreview = (List<Map<String, Object>>) valueMap.get("structurePreview");


        Map<String, String> tableCommentMap = DBUtils.getTableFieldComment(tableName, datasourceConfig.getSourceType(), datasourceConfig);
        structurePreview.forEach(r -> {
            if (!CollectionUtils.isEmpty(tableCommentMap)) {
                if (datasourceConfig.getSourceType().equals("Hive")) {
                    String columnName = r.get("columnName").toString();
                    if (tableCommentMap.get(columnName.substring(tableName.length() + 1)) != null) {
                        r.put("fieldDesc", tableCommentMap.get(columnName.substring(tableName.length() + 1)));
                    }
                } else {
                    if (tableCommentMap.get(String.valueOf(r.get("columnName"))) != null) {
                        String desc = tableCommentMap.get(String.valueOf(r.get("columnName")));
                        if ("null".equals(desc)) {
                            desc = "";
                        }
                        r.put("fieldDesc", desc);
                    }
                }
            }
        });

        if (!StringUtils.isEmpty(origin.getId())) {
            JSONObject fieldDescObj = JSON.parseObject(fieldDesc);
            structurePreview.forEach(r -> {
                if (fieldDescObj != null) {
                    if (fieldDescObj.has(String.valueOf(r.get("columnName"))) && !StringUtils.isEmpty(fieldDescObj.getString(String.valueOf(r.get("columnName"))))) {
                        r.put("fieldDesc", fieldDescObj.getString(String.valueOf(r.get("columnName"))));
                    } else {
                        r.put("fieldDesc", String.valueOf(r.get("fieldDesc")));
                    }
                }
            });

        }
        return valueMap;
    }

    @Override
    public OriginalTable getByTableNameAndSourceId(String tableName, String sourceId) {
        LambdaQueryWrapper<OriginalTable> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(OriginalTable::getTableName, tableName);
        queryWrapper.eq(OriginalTable::getSourceId, sourceId);
        OriginalTable originalTable = this.baseMapper.selectOne(queryWrapper);
        return originalTable;
    }

    @Override
    public List<Map<String, Object>> getOriginalTableFieldInfo(OriginalTable originalTable) {
        DatasourceConfig datasourceConfig = datasourceConfigService.getById(originalTable.getSourceId());
        //TODO
        if (("Hive").equalsIgnoreCase(datasourceConfig.getSourceType())) {
            datasourceConfig.setUsername(null);
            datasourceConfig.setPassword(null);
        }
        List<Map<String, Object>> fieldNameAndType = DBUtils.getFieldNameAndType(originalTable.getTableName(), datasourceConfig);
        return fieldNameAndType;
    }

}

