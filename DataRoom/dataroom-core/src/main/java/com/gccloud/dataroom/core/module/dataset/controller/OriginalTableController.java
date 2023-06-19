package com.gccloud.dataroom.core.module.dataset.controller;

import com.gccloud.dataroom.core.module.dataset.dto.OriginalTableDto;
import com.gccloud.dataroom.core.module.dataset.entity.OriginalTable;
import com.gccloud.dataroom.core.module.dataset.service.OriginalTableService;
import com.gccloud.dataroom.core.vo.R;
import com.gccloud.dataroom.core.controller.SuperController;
import com.gccloud.dataroom.core.permission.Permission;
import com.gccloud.dataroom.core.permission.ScreenPermission;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;


/**
 * @author pan.shun
 * @since 2021/9/7 15:05
 */
@Api(tags = "原始表")
@RestController
@RequestMapping("/bigScreen/original")
public class OriginalTableController extends SuperController {
    @Resource
    private OriginalTableService originalTableService;

    @ScreenPermission(permissions = {Permission.DataSet.EDIT})
    @ApiOperation("原始表新增或修改")
    @PostMapping("/addOrUpdate")
    public void addOrUpdate(@RequestBody OriginalTable originalTable) {
        originalTableService.addOrUpdate(originalTable);
    }

    @ScreenPermission(permissions = {Permission.DataSet.VIEW})
    @ApiOperation("获取原始表详情")
    @GetMapping("/getOriginalTableDetailsById/{id}")
    public R<OriginalTable> getOriginalTableDetails(@PathVariable String id) {
        return R.success(originalTableService.getOriginalTableDetails(id));
    }

    @ScreenPermission(permissions = {Permission.DataSet.VIEW})
    @ApiOperation("查询原始表详情")
    @PostMapping("/getOriginalTableDetail")
    public R<Map<String, Object>> getOriginalTableDetail(@RequestBody OriginalTableDto originalTableDto) {
        if (StringUtils.isBlank(originalTableDto.getSourceId())) {
            return R.error("请选择数据源");
        }
        return R.success(originalTableService.getOriginalTableDetail(originalTableDto));
    }

    @ScreenPermission(permissions = {Permission.DataSet.VIEW})
    @ApiOperation("查询原始表字段(仅查询全部字段)")
    @PostMapping("/getOriginalTableFieldInfo")
    public R<List<Map<String, Object>>> getOriginalTableField(@RequestBody OriginalTable originalTable) {
        return R.success(originalTableService.getOriginalTableFieldInfo(originalTable));
    }

}
