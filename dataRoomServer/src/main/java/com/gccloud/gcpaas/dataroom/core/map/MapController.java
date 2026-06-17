package com.gccloud.gcpaas.dataroom.core.map;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.entity.MapEntity;
import com.gccloud.gcpaas.dataroom.core.mapper.MapMapper;
import com.gccloud.gcpaas.dataroom.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.dataroom.core.util.CodeWorker;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

/**
 * 地图管理
 */
@Tag(name = "地图管理")
@ApiSort(value = 110)
@RestController
@Controller
@RequestMapping("/dataRoom/map")
@OperationLogMeta(targetType = "map", businessType = "map_manage", businessName = "地图管理")
public class MapController {

    private static final String CODE_PREFIX = "map";

    @Resource
    private MapMapper mapMapper;

    @GetMapping("/list")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "列表查询", description = "查询地图列表")
    @Parameters({@Parameter(name = "name", description = "地图名称", in = ParameterIn.QUERY)})
    public Resp<List<MapEntity>> list(@RequestParam(name = "name", required = false) String name) {
        LambdaQueryWrapper<MapEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(MapEntity.class, tableFieldInfo -> {
            // 排除geoJson大字段，列表查询不需要
            return !"geoJson".equals(tableFieldInfo.getProperty());
        });
        queryWrapper.orderByDesc(MapEntity::getUpdateDate);
        if (StringUtils.isNotBlank(name)) {
            queryWrapper.like(MapEntity::getName, name);
        }
        List<MapEntity> list = mapMapper.selectList(queryWrapper);
        return Resp.success(list);
    }

    @GetMapping("/detail/{code}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "详情", description = "根据编码查询地图详情（含geoJson）")
    @Parameters({@Parameter(name = "code", description = "地图编码", in = ParameterIn.PATH)})
    public Resp<MapEntity> detail(@PathVariable("code") String code) {
        MapEntity mapEntity = mapMapper.getByCode(code);
        return Resp.success(mapEntity);
    }

    @PostMapping("/insert")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "新增", description = "新增地图")
    public Resp<String> insert(@RequestBody MapEntity mapEntity) {
        mapEntity.setCode(CodeWorker.generateCode(CODE_PREFIX));
        if (mapEntity.getUploadedGeoJson() == null) {
            mapEntity.setUploadedGeoJson(mapEntity.getGeoJson() != null ? 1 : 0);
        }
        mapMapper.insert(mapEntity);
        return Resp.success(mapEntity.getCode());
    }

    @PostMapping("/update")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "更新", description = "更新地图")
    public Resp<String> update(@RequestBody MapEntity mapEntity) {
        if (mapEntity.getGeoJson() != null) {
            mapEntity.setUploadedGeoJson(1);
        }
        mapEntity.setUpdateDate(new Date());
        mapMapper.updateById(mapEntity);
        return Resp.success(mapEntity.getId());
    }

    @PostMapping("/delete/{code}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "删除", description = "根据编码删除地图")
    @Parameters({@Parameter(name = "code", description = "地图编码", in = ParameterIn.PATH)})
    public Resp<Void> delete(@PathVariable("code") String code) {
        mapMapper.deleteByCode(code);
        return Resp.success(null);
    }
}
