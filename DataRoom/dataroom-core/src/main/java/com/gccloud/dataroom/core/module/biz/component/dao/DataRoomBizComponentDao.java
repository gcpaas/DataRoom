package com.gccloud.dataroom.core.module.biz.component.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gccloud.dataroom.core.module.biz.component.entity.BizComponentEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/5 11:39
 */
@Mapper
public interface DataRoomBizComponentDao extends BaseMapper<BizComponentEntity> {
}
