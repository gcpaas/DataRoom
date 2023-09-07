package com.gccloud.dataroom.core.module.map.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gccloud.dataroom.core.module.map.dto.MapSearchDTO;
import com.gccloud.dataroom.core.module.map.entity.DataRoomMapEntity;
import com.gccloud.dataroom.core.module.map.vo.DataRoomMapVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/8/31 13:52
 */
@Mapper
public interface DataRoomMapDao extends BaseMapper<DataRoomMapEntity> {

    /**
     * 获取地图列表
     * @return
     */
    List<DataRoomMapVO> getList(@Param("searchDTO") MapSearchDTO searchDTO);

}
