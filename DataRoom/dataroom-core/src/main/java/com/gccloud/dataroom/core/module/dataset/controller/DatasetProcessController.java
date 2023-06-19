package com.gccloud.dataroom.core.module.dataset.controller;

import com.gccloud.dataroom.core.module.dataset.dto.DatasetProcessTestSearchDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetProcessEntity;
import com.gccloud.dataroom.core.module.dataset.service.DatasetProcessService;
import com.gccloud.dataroom.core.module.dataset.vo.DatasetProcessTestVo;
import com.gccloud.dataroom.core.vo.R;
import com.gccloud.dataroom.core.permission.Permission;
import com.gccloud.dataroom.core.permission.ScreenPermission;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;


/**
 * @Description:
 * @Author yang.hw
 * @Date 2021/9/8 15:12
 */
@Api(tags = "自助数据集")
@RestController
@RequestMapping("/bigScreen/datasetProcess")
public class DatasetProcessController {

    @Resource
    private DatasetProcessService datasetProcessService;

    @ScreenPermission(permissions = {Permission.DataSet.EDIT})
    @ApiOperation("新增自助数据集")
    @PostMapping("/add")
    public R<String> add(@RequestBody DatasetProcessEntity processEntity) {
        return R.success(datasetProcessService.addDatasetProcess(processEntity));
    }

    @ScreenPermission(permissions = {Permission.DataSet.EDIT})
    @ApiOperation("修改自助数据集")
    @PostMapping("/update")
    public void update(@RequestBody DatasetProcessEntity processEntity) {
        datasetProcessService.updateDatasetProcess(processEntity);
    }

    @ScreenPermission(permissions = {Permission.DataSet.VIEW})
    @ApiOperation("获取自助数据集详情")
    @GetMapping("/getDatasetInfo/{id}")
    public R<DatasetProcessEntity> getDatasetInfo(@PathVariable String id) {
        return R.success(datasetProcessService.getDatasetProcessInfo(id));
    }

    @ScreenPermission(permissions = {Permission.DataSet.EXECUTE})
    @ApiOperation("sql脚本测试")
    @PostMapping("/sqlTest")
    public R<DatasetProcessTestVo> sqlTest(@RequestBody DatasetProcessTestSearchDto searchDto) {
        return R.success(datasetProcessService.getDatasetSqlTest(searchDto));
    }
}
