package com.gccloud.dataroom.core.module.dataset.dao;

import com.gccloud.dataroom.core.module.dataset.vo.DataSetInfoVo;
import com.gccloud.dataroom.core.dao.DataRoomBaseDao;
import org.apache.ibatis.annotations.Mapper;

/**
 * @author zhang.zeJun
 * @date 2022-11-17-11:03
 */
@Mapper
public interface DsDao extends DataRoomBaseDao<DataSetInfoVo> {
}
