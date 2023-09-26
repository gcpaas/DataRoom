package com.gccloud.dataroom.core.module.map.service;

import com.gccloud.common.service.ISuperService;
import com.gccloud.dataroom.core.module.map.dto.DataRoomMapRepeatDTO;
import com.gccloud.dataroom.core.module.map.vo.DataRoomMapVO;
import com.gccloud.dataroom.core.module.map.vo.MapChildVO;
import com.gccloud.dataroom.core.module.map.dto.DataRoomMapDTO;
import com.gccloud.dataroom.core.module.map.dto.MapSearchDTO;
import com.gccloud.dataroom.core.module.map.entity.DataRoomMapEntity;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/8/31 13:53
 */
public interface IDataRoomMapService extends ISuperService<DataRoomMapEntity> {

    /**
     * 顶级父级id
     */
    String SUPER_PARENT_ID = "0";


    /**
     * 获取地图列表
     * @param searchDTO
     * @return
     */
    List<DataRoomMapVO> getList(MapSearchDTO searchDTO);


    /**
     * 获取可用的地图树
     * @param level
     * @return
     */
    List<DataRoomMapVO> getAvailableTree(Integer level);

    /**
     * 添加地图
     * @param mapDTO
     * @return
     */
    String add(DataRoomMapDTO mapDTO);


    /**
     * 修改地图
     * @param mapDTO
     */
    void update(DataRoomMapDTO mapDTO);


    /**
     * 删除地图
     * @param id
     * @return
     */
    boolean delete(String id);

    /**
     * 级联删除地图，删除地图及其子地图...
     * @param id
     */
    void cascadingDelete(String id);


    /**
     * 获取地图
     * @param id
     * @return
     */
    DataRoomMapEntity info(String id);

    /**
     * 根据父级id和编码获取地图
     * @param parentId
     * @param code
     * @return
     */
    DataRoomMapEntity getByParentIdAndCode(String parentId, String code);


    /**
     * 获取地图
     * @param mapCode
     * @return
     */
    DataRoomMapEntity infoByMapCode(String mapCode);


    /**
     * 根据编码获取地图信息，取到geoJson，根据geoJson解析下一级的基础数据
     * @param code
     * @return
     */
    List<MapChildVO> getChildFromGeo(String code);


    /**
     * 上传geoJson
     * @param id
     * @param geoJson
     */
    void uploadGeoJson(String id, String geoJson);

    /**
     * 编码重复校验
     * @param mapDTO
     * @return
     */
    boolean codeRepeatCheck(DataRoomMapRepeatDTO mapDTO);


    /**
     * 名称重复校验
     * 只在相同的父级下校验
     * @param mapDTO
     * @return
     */
    boolean nameRepeatCheck(DataRoomMapRepeatDTO mapDTO);
}
