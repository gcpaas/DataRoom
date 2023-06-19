package com.gccloud.dataroom.core.module.chart.service;

import com.gccloud.dataroom.core.module.chart.dto.ChartDataSearchDTO;
import com.gccloud.dataroom.core.module.chart.vo.ChartDataVO;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.components.datasource.BaseChartDataSource;
import com.gccloud.dataroom.core.module.chart.components.datasource.DataSetDataSource;
import com.gccloud.dataroom.core.module.dataset.constant.ReportConstant;
import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.params.ParamsClient;
import com.gccloud.dataroom.core.module.dataset.service.DsService;
import com.gccloud.dataroom.core.module.dataset.vo.DataSetInfoVo;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.utils.JSON;
import com.gccloud.dataroom.core.vo.PageVO;
import com.gccloud.dataroom.core.utils.GroovyUtils;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import com.gccloud.dataroom.core.module.chart.bean.Filter;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import javax.annotation.Resource;
import java.util.*;

/**
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Data
@Slf4j
@Service
public class BaseChartDataService {

    @Resource
    private DsService dsService;

    @Resource
    private ParamsClient paramsClient;

    public ChartDataVO dataQuery(Chart chart, ChartDataSearchDTO searchDTO) {
        BaseChartDataSource dataSource = chart.getDataSource();
        if (dataSource == null) {
            return null;
        }
        if (!dataSource.getClass().equals(DataSetDataSource.class)) {
            return null;
        }
        DataSetDataSource dataSetDataSource = (DataSetDataSource) dataSource;
        DataSetInfoVo dataSetInfo = dsService.getDataSetDetails(dataSetDataSource.getBusinessKey());
        if (dataSetInfo == null) {
            return null;
        }
        if (ReportConstant.DataSetType.JSON.equals(dataSetInfo.getType())) {
            return jsonDataQuery(dataSetInfo, dataSetDataSource);
        }
        return dataSetDataQuery(dataSetDataSource, chart,  searchDTO);
    }



    /**
     * json类型的数据集数据处理
     * @param dataSetInfo
     * @param dataSetDataSource
     * @return
     */
    private ChartDataVO jsonDataQuery(DataSetInfoVo dataSetInfo, DataSetDataSource dataSetDataSource) {
        ChartDataVO dataDTO = new ChartDataVO();
        Object jsonContent = dsService.executeJsonDataSet(dataSetDataSource.getBusinessKey());
        List<Map<String, Object>> data = Lists.newArrayList();
        if (jsonContent instanceof JSONArray) {
            jsonContent = ((JSONArray) jsonContent).toList();
        }
        if (jsonContent instanceof ArrayList) {
            ArrayList list = (ArrayList) jsonContent;
            for (Object o : list) {
                if (o instanceof HashMap) {
                    data.add((HashMap<String, Object>) o);
                }
            }
        }
        if (jsonContent instanceof HashMap) {
            HashMap map = (HashMap) jsonContent;
            data.add(map);
        }
        if (jsonContent instanceof JSONObject) {
            JSONObject jsonObject = (JSONObject) jsonContent;
            data.add(jsonObject.toMap());
        }
        HashMap<String, ChartDataVO.ColumnData> columnData = Maps.newHashMap();
        JSONArray fields = dataSetInfo.getFields();
        fields.forEach(field -> {
            JSONObject fieldMap = (JSONObject) field;
            ChartDataVO.ColumnData column = new ChartDataVO.ColumnData();
            column.setOriginalColumn(fieldMap.get("name").toString());
            column.setAlias(fieldMap.get("name").toString());
            column.setRemark(fieldMap.get("comment").toString());
            column.setTableName(fieldMap.get("sourceTable").toString());
            column.setType(fieldMap.get("type").toString());
            columnData.put(fieldMap.get("name").toString(), column);
        });
        dataDTO.setData(data);
        dataDTO.setSuccess(true);
        dataDTO.setColumnData(columnData);
        return dataDTO;
    }


    /**
     * 根据数据集数据源查询数据
     * @param dataSource
     * @return
     */
    private ChartDataVO dataSetDataQuery(DataSetDataSource dataSource, Chart chart, ChartDataSearchDTO searchDTO) {
        ChartDataVO dataDTO = new ChartDataVO();
        List<DatasetParamDto> params = Lists.newArrayList();
        if (StringUtils.isBlank(dataSource.getBusinessKey())) {
            throw new GlobalException("图表未配置数据集");
        }
        DataSetInfoVo dataSetInfoVo = dsService.getDataSetDetails(dataSource.getBusinessKey());
        HashMap<String, ChartDataVO.ColumnData> columnData = Maps.newHashMap();
        dataDTO.setSql(dataSetInfoVo.getData());
        JSONArray fields = dataSetInfoVo.getFields();
        fields.forEach(field -> {
            JSONObject fieldMap = (JSONObject) field;
            ChartDataVO.ColumnData column = new ChartDataVO.ColumnData();
            column.setOriginalColumn(fieldMap.get("name").toString());
            column.setAlias(fieldMap.get("name").toString());
            column.setRemark(fieldMap.get("comment").toString());
            column.setTableName(fieldMap.get("sourceTable").toString());
            column.setType(fieldMap.get("type").toString());
            columnData.put(fieldMap.get("name").toString(), column);
        });
        if (chart.getType().equals(PageDesignConstant.DataRoom.Type.TABLES)) {
            // 表格的话，要按照dimensionFieldList对columnData进行排序
            List<String> dimensionFieldList = dataSource.getDimensionFieldList();
            LinkedHashMap<String, ChartDataVO.ColumnData> newColumnData = Maps.newLinkedHashMap();
            dimensionFieldList.forEach(dimensionField -> newColumnData.put(dimensionField, columnData.get(dimensionField)));
            // 剩下的字段按照原来的顺序放到后面
            columnData.forEach((key, value) -> {
                if (!newColumnData.containsKey(key)) {
                    newColumnData.put(key, value);
                }
            });
        }
        if (dataSource.getParams() != null && dataSource.getParams().size() > 0) {
            JSONArray setParams = dataSetInfoVo.getParams();
            setParams.forEach(setParam -> {
                JSONObject setParamMap = (JSONObject) setParam;
                if (!dataSource.getParams().containsKey(setParamMap.get("name").toString())) {
                    return;
                }
                DatasetParamDto param = new DatasetParamDto();
                param.setType(setParamMap.get("type").toString());
                param.setName(setParamMap.get("name").toString());
                String value = dataSource.getParams().get(setParamMap.get("name").toString()).toString();
                // 如果传入了过滤条件，优先使用过滤条件
                if (searchDTO.getFilterList() != null && searchDTO.getFilterList().size() > 0) {
                    for (Filter filter : searchDTO.getFilterList()) {
                        if (filter.getColumn() == null) {
                            continue;
                        }
                        if (filter.getColumn().equals(setParamMap.get("name").toString())) {
                            if (filter.getValue() == null || filter.getValue().size() == 0) {
                                continue;
                            }
                            value = filter.getValue().get(0);
                            break;
                        }
                    }
                }
                param.setValue(value);
                param.setStatus(1);
                params.add(param);
            });
        } else {
            // 组件配置的数据集参数为空，则使用数据集默认的参数
            JSONArray setParams = dataSetInfoVo.getParams();
            if (setParams == null) {
                setParams = new JSONArray();
            }
            setParams.forEach(setParam -> {
                JSONObject setParamMap = (JSONObject) setParam;
                DatasetParamDto param = new DatasetParamDto();
                param.setType(setParamMap.get("type").toString());
                param.setName(setParamMap.get("name").toString());
                param.setValue(setParamMap.get("value").toString());
                param.setStatus(1);
                params.add(param);
            });
        }
        dataDTO.setColumnData(columnData);
        Object data;
        DataSetInfoVo dataSetInfo = dsService.getDataSetDetails(dataSource.getBusinessKey());
        if (ReportConstant.DataSetType.SCRIPT.equals(dataSetInfo.getType())) {
            String script = dataSetInfo.getData();
            data = this.runScriptDataSet(script, params);
            dataDTO.setData(data);
            dataDTO.setSuccess(true);
            return dataDTO;
        }
        log.info("查询数据集数据，SQL：{}", dataDTO.getSql().replace("\n", " "));
        log.info("查询数据集数据，参数：{}", JSON.toJSONString(params));
        if (dataSource.getServerPagination() != null && dataSource.getServerPagination() && searchDTO.getSize() != null && searchDTO.getCurrent() != null) {
            PageVO pageResult = dsService.execute(dataSource.getBusinessKey(), params, searchDTO.getCurrent(), searchDTO.getSize());
            data = pageResult.getList();
            dataDTO.setTotalCount((int)pageResult.getTotalCount());
            dataDTO.setTotalPage((int)pageResult.getTotalPage());
        } else {
            data = dsService.execute(dataSource.getBusinessKey(), params);
        }
        dataDTO.setData(data);
        dataDTO.setSuccess(true);
        return dataDTO;
    }

    /**
     * 执行groovy脚本
     * @param script
     * @param params
     * @return
     */
    public Object runScriptDataSet(String script, List<DatasetParamDto> params) {
        params = paramsClient.handleParams(params);
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

    /**
     * 获取聚合函数汉化
     * @param aggregate
     * @return
     */
    public String getAggregateName(String aggregate) {
        switch (aggregate) {
            case PageDesignConstant.DataRoom.Aggregate.COUNT:
                return "[统计]";
            case PageDesignConstant.DataRoom.Aggregate.SUM:
                return "[求和]";
            case PageDesignConstant.DataRoom.Aggregate.AVG:
                return "[平均值]";
            case PageDesignConstant.DataRoom.Aggregate.MAX:
                return "[最大值]";
            case PageDesignConstant.DataRoom.Aggregate.MIN:
                return "[最小值]";
            case PageDesignConstant.DataRoom.Aggregate.COUNT_DISTINCT:
                return "[去重统计]";
            default:
                return "[" + aggregate + "]";
        }
    }
}
