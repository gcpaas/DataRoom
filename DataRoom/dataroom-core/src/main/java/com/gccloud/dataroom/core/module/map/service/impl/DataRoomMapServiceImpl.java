package com.gccloud.dataroom.core.module.map.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.utils.JSON;
import com.gccloud.dataroom.core.module.map.dto.DataRoomMapRepeatDTO;
import com.gccloud.dataroom.core.module.map.vo.DataRoomMapVO;
import com.gccloud.dataroom.core.module.map.vo.MapChildVO;
import com.gccloud.dataroom.core.module.map.dao.DataRoomMapDao;
import com.gccloud.dataroom.core.module.map.dto.DataRoomMapDTO;
import com.gccloud.dataroom.core.module.map.dto.MapSearchDTO;
import com.gccloud.dataroom.core.module.map.entity.DataRoomMapEntity;
import com.gccloud.dataroom.core.module.map.service.IDataRoomMapService;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/8/31 14:08
 */
@Service
public class DataRoomMapServiceImpl extends ServiceImpl<DataRoomMapDao, DataRoomMapEntity> implements IDataRoomMapService {

    public static final int YES = 1;
    public static final int NO = 0;

    @Override
    public List<DataRoomMapVO> getList(MapSearchDTO searchDTO) {
        List<DataRoomMapVO> list = this.baseMapper.getList(searchDTO);
        return list;
    }

    @Override
    public String add(DataRoomMapDTO mapDTO) {
        if (StringUtils.isBlank(mapDTO.getParentCode())) {
            mapDTO.setParentCode(SUPER_PARENT_CODE);
        }
        if (StringUtils.isBlank(mapDTO.getMapCode())) {
            throw new GlobalException("地图编码不能为空");
        }
        DataRoomMapEntity mapEntity = BeanConvertUtils.convert(mapDTO, DataRoomMapEntity.class);
        if (StringUtils.isNotBlank(mapEntity.getGeoJson())) {
            mapEntity.setUploadedGeoJson(YES);
        } else {
            mapEntity.setUploadedGeoJson(NO);
        }
        this.save(mapEntity);
        if (mapDTO.getAutoParseNextLevel().equals(YES) && mapEntity.getUploadedGeoJson().equals(YES)) {
            // 自动从geoJson中解析下一级的基础数据，保存到数据库，将geoJson上传状态置为false
            this.parseNextLevelAndSave(mapEntity, mapEntity.getGeoJson());
        }
        return mapEntity.getId();
    }

    @Override
    public void update(DataRoomMapDTO mapDTO) {
        if (StringUtils.isBlank(mapDTO.getId())) {
            throw new GlobalException("地图id不能为空");
        }
        DataRoomMapEntity old = this.getById(mapDTO.getId());
        if (old == null) {
            throw new GlobalException("地图不存在");
        }
        Integer uploadedGeoJson = old.getUploadedGeoJson();
        LambdaUpdateWrapper<DataRoomMapEntity> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(DataRoomMapEntity::getId, mapDTO.getId());
        // 只允许修改名称和是否开启下钻
        updateWrapper.set(DataRoomMapEntity::getName, mapDTO.getName());
        updateWrapper.set(DataRoomMapEntity::getEnableDown, mapDTO.getEnableDown());
        // 如果之前没有上传过geoJson，现在上传了，那么允许更新geoJson
        if (!uploadedGeoJson.equals(YES) && StringUtils.isNotBlank(mapDTO.getGeoJson())) {
            if (mapDTO.getAutoParseNextLevel().equals(YES)) {
                // 自动从geoJson中解析下一级的基础数据，保存到数据库
                this.parseNextLevelAndSave(old, mapDTO.getGeoJson());
            }
            updateWrapper.set(DataRoomMapEntity::getGeoJson, mapDTO.getGeoJson());
            updateWrapper.set(DataRoomMapEntity::getUploadedGeoJson, YES);
        }
        this.update(updateWrapper);
    }

    /**
     * 从geoJson中解析下一级的基础数据，保存到数据库
     * @param old
     * @param geoJson
     */
    private void parseNextLevelAndSave(DataRoomMapEntity old, String geoJson) {
        JSONObject jsonObject = new JSONObject(geoJson);
        JSONArray features = jsonObject.getJSONArray("features");
        if (features == null || features.length() == 0) {
            throw new GlobalException("GeoJson格式不正确，自动解析失败");
        }
        List<DataRoomMapEntity> mapEntityList = Lists.newArrayList();
        for (int i = 0; i < features.length(); i++) {
            JSONObject feature = features.getJSONObject(i);
            JSONObject properties = feature.getJSONObject("properties");
            if (properties == null) {
                continue;
            }
            DataRoomMapEntity childMapEntity = new DataRoomMapEntity();
            childMapEntity.setParentCode(old.getMapCode());
            childMapEntity.setLevel(old.getLevel() + 1);
            childMapEntity.setMapCode(properties.getString("name"));
            childMapEntity.setName(properties.getString("name"));
            childMapEntity.setEnableDown(NO);
            childMapEntity.setUploadedGeoJson(NO);
            mapEntityList.add(childMapEntity);
        }
        if (mapEntityList.size() > 0) {
            this.saveBatch(mapEntityList);
        }
    }

    @Override
    public void delete(String id) {
        if (StringUtils.isBlank(id)) {
            return;
        }
        DataRoomMapEntity mapEntity = this.getById(id);
        if (mapEntity == null) {
            return;
        }
        LambdaQueryWrapper<DataRoomMapEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DataRoomMapEntity::getParentCode, mapEntity.getMapCode());
        List<DataRoomMapEntity> list = this.list(queryWrapper);
        if (list != null && list.size() > 0) {
            throw new GlobalException("该地图下存在子地图，不能删除");
        }
        this.removeById(id);
    }


    /**
     * 级联删除
     * @param id
     */
    @Override
    public void cascadingDelete(String id) {
        if (StringUtils.isBlank(id)) {
            return;
        }
        DataRoomMapEntity mapEntity = this.getById(id);
        if (mapEntity == null) {
            return;
        }
        LambdaQueryWrapper<DataRoomMapEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DataRoomMapEntity::getParentCode, mapEntity.getMapCode());
        List<DataRoomMapEntity> list = this.list(queryWrapper);
        if (list != null && list.size() > 0) {
            for (DataRoomMapEntity entity : list) {
                this.cascadingDelete(entity.getId());
            }
        }
        this.removeById(id);
    }

    @Override
    public DataRoomMapEntity info(String id) {
        DataRoomMapEntity mapEntity = getById(id);
        if (mapEntity == null) {
            throw new GlobalException("地图不存在");
        }
        return mapEntity;
    }

    @Override
    public DataRoomMapEntity infoByMapCode(String mapCode) {
        LambdaQueryWrapper<DataRoomMapEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DataRoomMapEntity::getMapCode, mapCode);
        List<DataRoomMapEntity> list = this.list(queryWrapper);
        if (list == null || list.size() == 0) {
            throw new GlobalException("地图不存在");
        }
        if (list.size() > 1) {
            throw new GlobalException("地图编码重复");
        }
        return list.get(0);
    }


    /**
     * 根据编码获取地图信息，取到geoJson，根据geoJson解析下一级的基础数据
     * @param code
     * @return
     */
    @Override
    public List<MapChildVO> getChildFromGeo(String code) {
        DataRoomMapEntity mapEntity = this.infoByMapCode(code);
        if (mapEntity.getUploadedGeoJson().equals(NO)) {
            return Lists.newArrayList();
        }
        String geoJson = mapEntity.getGeoJson();
        if (StringUtils.isBlank(geoJson)) {
            return Lists.newArrayList();
        }
        JSONObject geoObj = JSON.parseObject(geoJson);
        JSONArray features = geoObj.getJSONArray("features");
        if (features == null || features.length() == 0) {
            return Lists.newArrayList();
        }
        // 查询当前地图下的所有子地图
        LambdaQueryWrapper<DataRoomMapEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(DataRoomMapEntity::getMapCode);
        queryWrapper.eq(DataRoomMapEntity::getParentCode, code);
        List<DataRoomMapEntity> list = this.list(queryWrapper);
        List<String> mapCodeList = list.stream().map(DataRoomMapEntity::getMapCode).collect(Collectors.toList());
        // 解析geoJson，获取下一级的基础数据
        List<MapChildVO> childList = Lists.newArrayList();
        for (int i = 0; i < features.length(); i++) {
            JSONObject feature = features.getJSONObject(i);
            JSONObject properties = feature.getJSONObject("properties");
            String name = properties.getString("name");
            MapChildVO childVO = new MapChildVO();
            childVO.setName(name);
            childVO.setExist(mapCodeList.contains(name));
            childList.add(childVO);
        }
        return childList;
    }


    @Override
    public void uploadGeoJson(String id, String geoJson) {
        if (StringUtils.isBlank(id)) {
            throw new GlobalException("地图id不能为空");
        }
        if (StringUtils.isBlank(geoJson)) {
            throw new GlobalException("geoJson不能为空");
        }
        DataRoomMapEntity mapEntity = this.getById(id);
        if (mapEntity == null) {
            throw new GlobalException("地图不存在");
        }
        if (mapEntity.getUploadedGeoJson().equals(YES)) {
            throw new GlobalException("该地图已上传过geoJson，不能重复上传");
        }
        mapEntity.setGeoJson(geoJson);
        mapEntity.setUploadedGeoJson(YES);
        this.updateById(mapEntity);
    }

    @Override
    public boolean repeatCheck(DataRoomMapRepeatDTO mapDTO) {
        if (StringUtils.isBlank(mapDTO.getMapCode())) {
            throw new GlobalException("地图编码不能为空");
        }
        if (StringUtils.isBlank(mapDTO.getParentCode())) {
            throw new GlobalException("上级地图编码不能为空");
        }
        // TODO 这里存在问题，因为编码只在某个地图下的某个层级下是唯一的，所以如果碰巧有两个地图下的某个层级下的编码相同，就会出现问题
        LambdaQueryWrapper<DataRoomMapEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DataRoomMapEntity::getMapCode, mapDTO.getMapCode());
        queryWrapper.eq(DataRoomMapEntity::getParentCode, mapDTO.getParentCode());
        if (StringUtils.isNotBlank(mapDTO.getId())) {
            queryWrapper.ne(DataRoomMapEntity::getId, mapDTO.getId());
        }
        List<DataRoomMapEntity> list = this.list(queryWrapper);
        return list != null && list.size() > 0;
    }
}
