package com.gccloud.dataroom.core.module.file.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 文件
 */
@Mapper
public interface DataRoomFileDao extends BaseMapper<DataRoomFileEntity> {

}
