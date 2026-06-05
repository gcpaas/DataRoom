package com.gccloud.gcpaas.core.datasource.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.gcpaas.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.core.mapper.DataSourceMapper;
import org.springframework.stereotype.Service;

@Service
public class DatasourceService extends ServiceImpl<DataSourceMapper, DataSourceEntity> {

    public DataSourceEntity getByCode(String code) {
        LambdaQueryWrapper<DataSourceEntity> queryWrapper = new LambdaQueryWrapper<DataSourceEntity>().eq(DataSourceEntity::getCode, code);
        DataSourceEntity dataSourceDefinition = baseMapper.selectOne(queryWrapper);
        return dataSourceDefinition;
    }

}
