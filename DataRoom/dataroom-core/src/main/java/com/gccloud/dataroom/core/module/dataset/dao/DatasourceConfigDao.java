package com.gccloud.dataroom.core.module.dataset.dao;

import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.dao.DataRoomBaseDao;
import org.apache.ibatis.annotations.Mapper;

/**
 * @author pan.shun
 * @since 2021/9/6 14:58
 */
@Mapper
public interface DatasourceConfigDao extends DataRoomBaseDao<DatasourceConfig> {

}
