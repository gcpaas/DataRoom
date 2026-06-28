package com.gccloud.gcpaas.dataroom.core.dataset;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.bean.KeyVal;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.DatasetOutputParam;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.HttpDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.service.AbstractDatasetService;
import com.gccloud.gcpaas.dataroom.core.dataset.service.DatasetServiceFactory;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.DatasetMapper;
import com.gccloud.gcpaas.dataroom.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.dataroom.core.operationlog.model.OperationLogDetailLevel;
import com.gccloud.gcpaas.dataroom.core.util.CodeWorker;
import com.gccloud.gcpaas.dataroom.core.util.TypeUtils;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Controller;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 数据集
 */
@Slf4j
@Tag(name = "数据集")
@ApiSort(value = 200)
@RestController
@Controller
@RequestMapping("/dataRoom/dataset")
@OperationLogMeta(targetType = "dataset", businessType = "dataset_manage", businessName = "数据集管理")
public class DatasetController {

    @Resource
    private DatasetMapper datasetMapper;
    @Resource
    private DatasetServiceFactory datasetServiceFactory;

    @GetMapping("/list")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "列表查询", description = "根据名称查询")
    @Parameters({
            @Parameter(name = "name", description = "数据集名称", in = ParameterIn.QUERY),
            @Parameter(name = "parentCode", description = "目录编码", in = ParameterIn.QUERY)
    })
    public Resp<List<DatasetEntity>> list(@RequestParam(name = "name", required = false) String name, @RequestParam(name = "parentCode", required = false) String parentCode) {
        LambdaQueryWrapper<DatasetEntity> queryWrapper = new LambdaQueryWrapper<>();
        // 排除的字段
        List<String> excludeFields = Lists.newArrayList("dataset", "inputList", "outputList");
        queryWrapper.select(DatasetEntity.class, tableFieldInfo -> {
            if (excludeFields.contains(tableFieldInfo.getProperty())) {
                return false;
            }
            return true;
        });
        queryWrapper.eq(StringUtils.isNotBlank(parentCode), DatasetEntity::getParentCode, parentCode);
        queryWrapper.like(StringUtils.isNotBlank(name), DatasetEntity::getName, name);
        queryWrapper.orderByAsc(DatasetEntity::getName);
        List<DatasetEntity> list = datasetMapper.selectList(queryWrapper);
        return Resp.success(list);
    }


    @GetMapping("/detail/{code}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "详情", description = "根据编码查询")
    @Parameters({@Parameter(name = "code", description = "数据集编码", in = ParameterIn.PATH)})
    public Resp<DatasetEntity> detail(@PathVariable("code") String code) {
        DatasetEntity datasetEntity = datasetMapper.getByCode(code);
        desensitizeHttpDatasetHeaders(datasetEntity);
        return Resp.success(datasetEntity);
    }

    @PostMapping("/insert")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "新增", description = "新增数据集")
    public Resp<String> insert(@RequestBody DatasetEntity datasetEntity) {
        datasetEntity.setCode(CodeWorker.generateCode(DataRoomConstant.Dataset.CODE_PREFIX));
        datasetMapper.insert(datasetEntity);
        return Resp.success(datasetEntity.getId());
    }

    @PostMapping("/update")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "更新", description = "更新数据集")
    public Resp<String> update(@RequestBody DatasetEntity datasetEntity) {
        preserveHttpDatasetHeaderSensitive(datasetEntity);
        datasetEntity.setUpdateDate(new Date());
        datasetMapper.updateById(datasetEntity);
        return Resp.success(datasetEntity.getId());
    }

    @PostMapping("/delete/{code}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "删除", description = "根据编码删除数据集")
    @Parameters({@Parameter(name = "code", description = "数据集编码", in = ParameterIn.PATH)})
    public Resp<Void> delete(@PathVariable("code") String code) {
        datasetMapper.deleteByCode(code);
        return Resp.success(null);
    }

    @PostMapping("/run")
    @RequiresRoles(value = DataRoomRole.SHARER)
    @Operation(summary = "执行", description = "执行数据集")
    @Tool(name = "runDataset", description = "执行DataRoom数据集。参数datasetCode为数据集编码，inputParam为数据集入参键值对；返回数据集执行结果、输出字段和执行状态。")
    @OperationLogMeta(actionType = "执行", actionDesc = "数据集执行", businessType = "dataset", businessName = "数据集运行", targetIdKey = "datasetCode", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<DatasetRunResponse> run(@RequestBody DatasetRunRequest datasetRunRequest) {
        DatasetEntity datasetEntity = datasetMapper.getByCode(datasetRunRequest.getDatasetCode());
        Assert.isTrue(datasetEntity != null, "数据集不存在");
        AbstractDatasetService dataSetService = datasetServiceFactory.getDatasetService(datasetEntity.getDatasetType().getType());
        DatasetRunResponse datasetRunResponse = dataSetService.run(datasetRunRequest, datasetEntity);
        return Resp.success(datasetRunResponse);
    }

    @PostMapping("/run/test")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "测试执行", description = "测试数据集")
    @OperationLogMeta(actionType = "执行", actionDesc = "数据集测试执行", businessType = "dataset_runtime", businessName = "数据集运行", targetIdKey = "dataset", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<DatasetRunResponse> runTest(@RequestBody DatasetTestRequest datasetTestRequest) {
        log.info("入参 {}", datasetTestRequest.getInputParam());
        DatasetEntity datasetEntity = datasetTestRequest.getDataset();
        Assert.isTrue(datasetEntity != null, "数据集不存在");
        AbstractDatasetService dataSetService = datasetServiceFactory.getDatasetService(datasetEntity.getDatasetType().getType());
        DatasetRunRequest datasetRunRequest = new DatasetRunRequest();
        datasetRunRequest.setInputParam(datasetTestRequest.getInputParam());
        DatasetRunResponse datasetRunResponse = dataSetService.run(datasetRunRequest, datasetEntity);
        Object data = datasetRunResponse.getData();
        if (data == null) {
            throw new DataRoomException("数据集执行结果为空");
        }
        if (!(data instanceof List)) {
            List<Object> list = new ArrayList<>();
            list.add(data);
            data = list;
        }
        // 自动解析字段说明
        List<DatasetOutputParam> outputParamList = new ArrayList<>();
        if (data instanceof List list) {
            if (list.size() == 0) {
                throw new DataRoomException("数据集执行结果为空");
            }
            Object firstObj = list.get(0);
            if (firstObj instanceof Map firstMapObj) {
                for (Object key : firstMapObj.keySet()) {
                    DatasetOutputParam outputParam = new DatasetOutputParam();
                    outputParam.setName(key.toString());
                    outputParam.setDesc(key.toString());
                    Object val = firstMapObj.get(key);
                    outputParam.setType(TypeUtils.parseType(val));
                    outputParamList.add(outputParam);
                }
            }
        }
        datasetRunResponse.setOutputList(outputParamList);
        datasetRunResponse.setData(data);
        return Resp.success(datasetRunResponse);
    }

    private void desensitizeHttpDatasetHeaders(DatasetEntity datasetEntity) {
        if (datasetEntity == null || !(datasetEntity.getDataset() instanceof HttpDataset httpDataset)) {
            return;
        }
        List<KeyVal> headerList = httpDataset.getHeaderList();
        if (headerList == null) {
            return;
        }
        for (KeyVal header : headerList) {
            if (header != null && Boolean.TRUE.equals(header.getEncrypted()) && StringUtils.isNotBlank(header.getVal())) {
                header.setVal("******");
            }
        }
    }

    private void preserveHttpDatasetHeaderSensitive(DatasetEntity datasetEntity) {
        if (datasetEntity == null || StringUtils.isBlank(datasetEntity.getCode()) || !(datasetEntity.getDataset() instanceof HttpDataset updateDataset)) {
            return;
        }
        DatasetEntity dbEntity = datasetMapper.getByCode(datasetEntity.getCode());
        if (dbEntity == null || !(dbEntity.getDataset() instanceof HttpDataset dbDataset)) {
            return;
        }
        Map<String, KeyVal> oldHeaders = new java.util.HashMap<>();
        if (dbDataset.getHeaderList() != null) {
            for (KeyVal oldHeader : dbDataset.getHeaderList()) {
                if (oldHeader != null && StringUtils.isNotBlank(oldHeader.getKey())) {
                    oldHeaders.put(normalizeHeaderKey(oldHeader.getKey()), oldHeader);
                }
            }
        }
        if (updateDataset.getHeaderList() == null) {
            return;
        }
        for (KeyVal updateHeader : updateDataset.getHeaderList()) {
            if (updateHeader == null
                    || !Boolean.TRUE.equals(updateHeader.getEncrypted())
                    || StringUtils.isBlank(updateHeader.getKey())
                    || (StringUtils.isNotBlank(updateHeader.getVal()) && !"******".equals(updateHeader.getVal()))) {
                continue;
            }
            KeyVal oldHeader = oldHeaders.get(normalizeHeaderKey(updateHeader.getKey()));
            if (oldHeader != null) {
                updateHeader.setVal(oldHeader.getVal());
            }
        }
    }

    private static String normalizeHeaderKey(String key) {
        return key.trim().toLowerCase(Locale.ROOT);
    }
}
