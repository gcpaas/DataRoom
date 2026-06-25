package com.gccloud.gcpaas.dataroom.core.datasource;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.DataSourceColumnMeta;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.DataSourceTableMeta;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.MqttDatasource;
import com.gccloud.gcpaas.dataroom.core.datasource.service.DataSourceMetadataService;
import com.gccloud.gcpaas.dataroom.core.datasource.service.MqttDatasourceConnectionService;
import com.gccloud.gcpaas.dataroom.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.dataroom.core.mapper.DataSourceMapper;
import com.gccloud.gcpaas.dataroom.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.dataroom.core.util.CodeWorker;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import com.google.common.collect.Lists;
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
 * 数据源
 */
@Tag(name = "数据源")
@ApiSort(value = 100)
@RestController
@Controller
@RequestMapping("/dataRoom/dataSource")
@OperationLogMeta(targetType = "datasource", businessType = "datasource_manage", businessName = "数据源管理")
public class DataSourceController {

    @Resource
    private DataSourceMapper datasourceMapper;

    @Resource
    private DataSourceMetadataService dataSourceMetadataService;

    @Resource
    private MqttDatasourceConnectionService mqttDatasourceConnectionService;

    @PostMapping("/test")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "连接测试", description = "测试数据源连接")
    public Resp<MqttDatasourceConnectionService.ConnectionTestResult> test(@RequestBody DataSourceEntity datasourceEntity) {
        if (!(datasourceEntity.getDataSource() instanceof MqttDatasource mqtt)) {
            return Resp.success(MqttDatasourceConnectionService.ConnectionTestResult.fail("configInvalid", "仅支持MQTT数据源连接测试"));
        }
        MqttDatasourceConnectionService.ConnectionTestResult result = mqttDatasourceConnectionService.test(mqtt);
        return Resp.success(result);
    }

    @GetMapping("/list")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "列表查询", description = "根据名称查询")
    @Parameters({@Parameter(name = "name", description = "数据源名称", in = ParameterIn.QUERY)})
    public Resp<List<DataSourceEntity>> list(@RequestParam(name = "name", required = false) String name) {
        LambdaQueryWrapper<DataSourceEntity> queryWrapper = new LambdaQueryWrapper<>();
        // 排除的字段
        List<String> excludeFields = Lists.newArrayList("dataSource");
        queryWrapper.select(DataSourceEntity.class, tableFieldInfo -> {
            if (excludeFields.contains(tableFieldInfo.getProperty())) {
                return false;
            }
            return true;
        });
        queryWrapper.orderByDesc(DataSourceEntity::getUpdateDate);
        if (StringUtils.isNotBlank(name)) {
            queryWrapper.like(DataSourceEntity::getName, name);
        }
        List<DataSourceEntity> list = datasourceMapper.selectList(queryWrapper);
        return Resp.success(list);
    }


    @GetMapping("/detail/{code}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "详情", description = "根据编码查询")
    @Parameters({@Parameter(name = "code", description = "数据源编码", in = ParameterIn.PATH)})
    public Resp<DataSourceEntity> detail(@PathVariable("code") String code) {
        DataSourceEntity datasourceEntity = datasourceMapper.getByCode(code);
        // 脱敏
        datasourceEntity.getDataSource().desensitize();
        return Resp.success(datasourceEntity);
    }

    @GetMapping("/{code}/tables")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "查询表信息", description = "根据数据源编码查询表信息")
    @Parameters({@Parameter(name = "code", description = "数据源编码", in = ParameterIn.PATH)})
    public Resp<List<DataSourceTableMeta>> listTables(@PathVariable("code") String code) {
        DataSourceEntity datasourceEntity = datasourceMapper.getByCode(code);
        return Resp.success(dataSourceMetadataService.listTables(datasourceEntity));
    }

    @GetMapping("/{code}/tables/{tableName}/columns")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "查询字段信息", description = "根据数据源编码和表名查询字段信息")
    @Parameters({
            @Parameter(name = "code", description = "数据源编码", in = ParameterIn.PATH),
            @Parameter(name = "tableName", description = "表名", in = ParameterIn.PATH)
    })
    public Resp<List<DataSourceColumnMeta>> listColumns(@PathVariable("code") String code, @PathVariable("tableName") String tableName) {
        DataSourceEntity datasourceEntity = datasourceMapper.getByCode(code);
        return Resp.success(dataSourceMetadataService.listColumns(datasourceEntity, tableName));
    }

    @PostMapping("/insert")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "新增", description = "新增数据源")
    public Resp<String> insert(@RequestBody DataSourceEntity datasourceEntity) {
        if (datasourceEntity.getDataSource() instanceof MqttDatasource mqtt) {
            mqtt.validate(true);
        }
        datasourceEntity.setCode(CodeWorker.generateCode(DataRoomConstant.Datasource.CODE_PREFIX));
        datasourceMapper.insert(datasourceEntity);
        return Resp.success(datasourceEntity.getId());
    }

    @PostMapping("/update")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "更新", description = "更新数据源")
    public Resp<String> update(@RequestBody DataSourceEntity datasourceEntity) {
        DataSourceEntity dbDataSourceEntity = datasourceMapper.getByCode(datasourceEntity.getCode());
        datasourceEntity.getDataSource().updatedSensitive(dbDataSourceEntity.getDataSource());
        if (datasourceEntity.getDataSource() instanceof MqttDatasource mqtt) {
            mqtt.validate(false);
        }
        datasourceEntity.setUpdateDate(new Date());
        datasourceMapper.updateById(datasourceEntity);
        return Resp.success(datasourceEntity.getId());
    }

    @PostMapping("/delete/{code}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "删除", description = "根据编码删除数据源")
    @Parameters({@Parameter(name = "code", description = "数据源编码", in = ParameterIn.PATH)})
    public Resp<Void> delete(@PathVariable("code") String code) {
        datasourceMapper.deleteByCode(code);
        return Resp.success(null);
    }
}
