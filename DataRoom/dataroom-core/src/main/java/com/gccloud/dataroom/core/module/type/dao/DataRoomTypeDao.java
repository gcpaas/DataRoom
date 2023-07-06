package com.gccloud.dataroom.core.module.type.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gccloud.dataroom.core.module.type.entity.TypeEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * @Author qianxing
 * @Date 2022/06/07
 * @Version 1.0.0
 */
@Mapper
public interface DataRoomTypeDao extends BaseMapper<TypeEntity> {

}