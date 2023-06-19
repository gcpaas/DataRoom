package com.gccloud.dataroom.core.module.dataset.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.module.dataset.constant.ReportConstant;
import com.gccloud.dataroom.core.module.dataset.dao.DatasetDao;
import com.gccloud.dataroom.core.module.dataset.dto.DataSetQueryDto;
import com.gccloud.dataroom.core.module.dataset.dto.DatasetParamDto;
import com.gccloud.dataroom.core.module.dataset.dto.ExecuteDto;
import com.gccloud.dataroom.core.module.dataset.dto.NameCheckRepeatDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetEntity;
import com.gccloud.dataroom.core.module.dataset.params.ParamsClient;
import com.gccloud.dataroom.core.module.dataset.service.CategoryTreeService;
import com.gccloud.dataroom.core.module.dataset.service.DatasetProcessService;
import com.gccloud.dataroom.core.module.dataset.service.DatasetService;
import com.gccloud.dataroom.core.module.dataset.service.OriginalTableService;
import com.gccloud.dataroom.core.utils.GroovyUtils;
import com.gccloud.dataroom.core.utils.JSON;
import com.gccloud.dataroom.core.vo.PageVO;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.StopWatch;
import org.json.JSONObject;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import javax.annotation.Resource;
import java.util.*;


/**
 * @author zhang.zeJun
 * @date 2022-11-15-9:48
 */
@Slf4j
@Service
public class DatasetServiceImpl extends ServiceImpl<DatasetDao, DatasetEntity> implements DatasetService {

    @Lazy
    @Resource
    private DatasetProcessService datasetProcessService;

    @Lazy
    @Resource
    private OriginalTableService originalTableService;

    @Resource
    private CategoryTreeService categoryTreeService;

    @Resource
    private ParamsClient paramsClient;


    @Override
    public PageVO<DatasetEntity> getPage(DataSetQueryDto dataSetQueryDto) {
        Page<DatasetEntity> page = new Page<>(dataSetQueryDto.getCurrent(), dataSetQueryDto.getSize());
        String typeId = dataSetQueryDto.getTypeId();
        Set<String> idList = new HashSet<>();
        if (!StringUtils.isEmpty(typeId)) {
            idList.add(typeId);
            Set<String> data = categoryTreeService.getAllChildren(idList, typeId);
            idList.addAll(data);
        }
        Page<DatasetEntity> result = baseMapper.getDataSetPage(
                page,
                dataSetQueryDto.getName(),
                dataSetQueryDto.getDatasetType(),
                dataSetQueryDto.getTypeId(),
                idList,
                dataSetQueryDto.getModuleCode());
        return new PageVO<>(result);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void removeByIds(String ids) {
        if (StringUtils.isEmpty(ids)) {
            throw new GlobalException("暂无可删除的内容");
        }
        String[] idList = ids.split(",");
        for (String id : idList) {
            DatasetEntity datasetEntity = this.getById(id);
            String datasetType = datasetEntity.getDatasetType();
            if (ReportConstant.DataSetType.ORIGINAL.equals(datasetType)) {
                originalTableService.removeById(datasetEntity.getDatasetRelId());
            }
            if (ReportConstant.DataSetType.CUSTOM.equals(datasetType) || ReportConstant.DataSetType.STORED_PROCEDURE.equals(datasetType)) {
                datasetProcessService.removeById(datasetEntity.getDatasetRelId());
            }
            this.removeById(id);
        }
    }

    @Override
    public Boolean nameCheckRepeat(NameCheckRepeatDto nameCheckRepeatDto) {
        LambdaQueryWrapper<DatasetEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.ne(StringUtils.isNotBlank(nameCheckRepeatDto.getId()), DatasetEntity::getId, nameCheckRepeatDto.getId());
        wrapper.eq(DatasetEntity::getName, nameCheckRepeatDto.getName());
        wrapper.eq(StringUtils.isNotBlank(nameCheckRepeatDto.getModuleCode()), DatasetEntity::getModuleCode, nameCheckRepeatDto.getModuleCode());
        int count = this.count(wrapper);
        return count != 0;
    }


    @Override
    public Object executeDataSet(ExecuteDto executeDto) {
        if (!StringUtils.isEmpty(executeDto.getDataSetId())) {
            String dataSetId = executeDto.getDataSetId();
            DatasetEntity datasetEntity = this.getById(dataSetId);
            if (datasetEntity.getDatasetType().equals(ReportConstant.DataSetType.JSON) || datasetEntity.getDatasetType().equals(ReportConstant.DataSetType.MODEL)) {
                // JSON 数据集和模型数据集
                return datasetEntity.getData();
            }
            if (datasetEntity.getDatasetType().equals(ReportConstant.DataSetType.SCRIPT)) {
                // 脚本数据集
                try {
                    return runScriptDataSet(datasetEntity.getData(), executeDto);
                } catch (Exception e) {
                    throw new GlobalException(e.getMessage());
                }
            }
        } else {
            if (executeDto.getDataSetType().equals(ReportConstant.DataSetType.JSON) || executeDto.getDataSetType().equals(ReportConstant.DataSetType.MODEL)) {
                // JSON 数据集和模型数据集
                return executeDto.getData();
            }
            if (executeDto.getDataSetType().equals(ReportConstant.DataSetType.SCRIPT)) {
                // 脚本数据集
                try {
                    return runScriptDataSet(executeDto.getData(), executeDto);
                } catch (Exception e) {
                    throw new GlobalException(e.getMessage());
                }
            }
        }
        return null;
    }

    private Object runScriptDataSet(String data, ExecuteDto executeDto) {
        JSONObject object = JSON.parseObject(data);
        Map<String, Object> paramMap = new HashMap<>(16);
        if (!CollectionUtils.isEmpty(executeDto.getParams())) {
            List<DatasetParamDto> params = executeDto.getParams();
            List<DatasetParamDto> paramList = paramsClient.handleParams(params);
            paramList.forEach(r -> paramMap.put(r.getName(), r.getValue()));
        }
        String script = object.getString("script");
        Class clazz = GroovyUtils.buildClass(script);
        if (clazz == null) {
            throw new GlobalException("脚本编译异常");
        }
        // 计时
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        Object result = GroovyUtils.run(script, paramMap);
        stopWatch.stop();
        log.info("脚本执行耗时：{}ms", stopWatch.getTime());
        return result;
    }

    @Override
    public void addOrUpdate(DatasetEntity datasetEntity) {
        if (StringUtils.isEmpty(datasetEntity.getTypeId())) {
            datasetEntity.setTypeId(null);
        }
        if (!StringUtils.isEmpty(datasetEntity.getId())) {
            this.updateById(datasetEntity);
        } else {
            this.save(datasetEntity);
        }
    }

    @Override
    public List<DatasetEntity> getList(DataSetQueryDto dataSetQueryDto) {
        String typeId = dataSetQueryDto.getTypeId();
        Set<String> idList = new HashSet<>();
        if (!StringUtils.isEmpty(typeId)) {
            idList.add(typeId);
            Set<String> data = categoryTreeService.getAllChildren(idList, typeId);
            idList.addAll(data);
        }
        return this.baseMapper.getList(
                dataSetQueryDto.getName(),
                dataSetQueryDto.getDatasetType(),
                dataSetQueryDto.getTypeId(),
                idList,
                dataSetQueryDto.getModuleCode());
    }

    @Override
    public Object getDataSetDetailById(String dataSetId) {

        LambdaQueryWrapper<DatasetEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(
                DatasetEntity::getId,
                DatasetEntity::getName,
                DatasetEntity::getTypeId,
                DatasetEntity::getRemark,
                DatasetEntity::getDatasetType,
                DatasetEntity::getModuleCode,
                DatasetEntity::getDatasetRelId,
                DatasetEntity::getData
        );
        queryWrapper.eq(DatasetEntity::getId, dataSetId);
        return this.getOne(queryWrapper);
    }
}
