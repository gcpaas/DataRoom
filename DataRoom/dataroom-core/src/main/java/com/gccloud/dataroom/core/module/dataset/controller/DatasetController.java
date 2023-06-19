package com.gccloud.dataroom.core.module.dataset.controller;

import com.gccloud.dataroom.core.module.dataset.dto.DataSetQueryDto;
import com.gccloud.dataroom.core.module.dataset.dto.ExecuteDto;
import com.gccloud.dataroom.core.module.dataset.dto.NameCheckRepeatDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetEntity;
import com.gccloud.dataroom.core.module.dataset.service.DatasetService;
import com.gccloud.dataroom.core.vo.PageVO;
import com.gccloud.dataroom.core.vo.R;
import com.gccloud.dataroom.core.permission.Permission;
import com.gccloud.dataroom.core.permission.ScreenPermission;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * @author zhang.zeJun
 * @date 2022-11-15-10:21
 */
@Api(tags = "主数据集")
@RestController
@RequestMapping("/bigScreen/dataset")
public class DatasetController {

    @Resource
    private DatasetService datasetService;

    @ScreenPermission(permissions = {Permission.DataSet.VIEW})
    @ApiOperation("主数据集分页查询")
    @GetMapping("/page")
    public R<PageVO<DatasetEntity>> getPage(@ApiParam(name = "查询", value = "传入查询条件", required = true) DataSetQueryDto dataSetQueryDto) {
        return R.success(datasetService.getPage(dataSetQueryDto));
    }

    @ScreenPermission(permissions = {Permission.DataSet.DELETE})
    @ApiOperation("数据集删除")
    @GetMapping("/remove/{ids}")
    public void remove(@PathVariable String ids) {
        datasetService.removeByIds(ids);
    }

    @ScreenPermission
    @ApiOperation("数据集名称查重校验")
    @PostMapping("/nameCheckRepeat")
    public R<Boolean> tableNameCheckRepeat(@RequestBody NameCheckRepeatDto nameCheckRepeatDto) {
        return R.success(datasetService.nameCheckRepeat(nameCheckRepeatDto));
    }

    @ScreenPermission(permissions = {Permission.DataSet.EXECUTE})
    @ApiOperation("数据集执行")
    @PostMapping("/execute")
    public R<Object> execute(@RequestBody ExecuteDto executeDto) {
        return R.success(datasetService.executeDataSet(executeDto));
    }

    @ScreenPermission(permissions = {Permission.DataSet.EDIT})
    @ApiOperation("数据集新增或修改接口")
    @PostMapping("/addOrUpdate")
    public void addOrUpdate(@RequestBody DatasetEntity datasetEntity) {
        datasetService.addOrUpdate(datasetEntity);
    }

    @ScreenPermission(permissions = {Permission.DataSet.VIEW})
    @ApiOperation("获取数据集详情")
    @GetMapping("/getDataSetDetailById")
    public R<Object> getDataSetDetailById(String id) {
        return R.success(datasetService.getDataSetDetailById(id));
    }

}
