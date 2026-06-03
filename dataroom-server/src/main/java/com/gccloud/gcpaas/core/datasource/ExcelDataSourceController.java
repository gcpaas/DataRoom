package com.gccloud.gcpaas.core.datasource;

import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.core.constant.DataRoomRole;
import com.gccloud.gcpaas.core.constant.DataSourceType;
import com.gccloud.gcpaas.core.datasource.bean.ExcelColumn;
import com.gccloud.gcpaas.core.datasource.bean.ExcelDatasource;
import com.gccloud.gcpaas.core.datasource.bean.DataSourceColumnMeta;
import com.gccloud.gcpaas.core.datasource.bean.DataSourceTableMeta;
import com.gccloud.gcpaas.core.datasource.service.ExcelDataSourceService;
import com.gccloud.gcpaas.core.datasource.service.DataSourceMetadataService;
import com.gccloud.gcpaas.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.core.mapper.DataSourceMapper;
import com.gccloud.gcpaas.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.core.operationlog.model.OperationLogDetailLevel;
import com.gccloud.gcpaas.core.util.CodeWorker;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.Data;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;

/**
 * Excel数据源控制器
 */
@Tag(name = "Excel数据源")
@ApiSort(value = 101)
@RestController
@RequestMapping("/dataRoom/dataSource/excel")
@OperationLogMeta(targetType = "datasource", businessType = "excel_datasource_manage", businessName = "Excel数据源管理")
public class ExcelDataSourceController {

    @Resource
    private ExcelDataSourceService excelDataSourceService;

    @Resource
    private DataSourceMetadataService dataSourceMetadataService;

    @Resource
    private DataSourceMapper datasourceMapper;

    /**
     * 上传并解析Excel文件
     */
    @PostMapping("/upload")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "上传解析", description = "上传Excel/CSV文件并解析表头和数据类型")
    @OperationLogMeta(actionType = "上传", actionDesc = "上传并解析Excel文件", businessType = "excel_import", businessName = "Excel导入", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<ExcelDataSourceService.ExcelParseResult> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Resp.error("请选择要上传的文件");
        }
        String originalFilename = file.getOriginalFilename();
        if (!isSupportedFile(originalFilename)) {
            return Resp.error("仅支持xlsx或csv格式的文件");
        }
        try {
            ExcelDataSourceService.ExcelParseResult result = excelDataSourceService.parseFile(originalFilename, file.getInputStream());
            return Resp.success(result);
        } catch (IOException e) {
            return Resp.error("文件读取失败: " + e.getMessage());
        } catch (Exception e) {
            return Resp.error("文件解析失败: " + e.getMessage());
        }
    }

    /**
     * 创建表并导入数据
     */
    @PostMapping("/createAndImport")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "创建并导入", description = "创建数据库表并导入Excel数据")
    @OperationLogMeta(actionType = "新增", actionDesc = "创建Excel数据源并导入数据", businessType = "excel_import", businessName = "Excel导入", targetNameKey = "name", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<ExcelCreateResponse> createAndImport(@RequestBody ExcelCreateRequest request) {
        // 校验表名
        try {
            excelDataSourceService.validateTableName(request.getTableName());
        } catch (Exception e) {
            return Resp.error(e.getMessage());
        }

        // 校验列定义
        if (request.getColumns() == null || request.getColumns().isEmpty()) {
            return Resp.error("列定义不能为空");
        }

        try {
            // 创建表
            excelDataSourceService.createTable(request.getTableName(), request.getColumns());

            // 导入数据
            int rowCount = excelDataSourceService.importData(
                    request.getTableName(),
                    request.getColumns(),
                    request.getUploadId(),
                    "overwrite"
            );

            // 保存数据源记录
            DataSourceEntity entity = new DataSourceEntity();
            entity.setName(request.getName());
            entity.setCode(CodeWorker.generateCode(DataRoomConstant.Datasource.CODE_PREFIX));
            entity.setDataSourceType(DataSourceType.EXCEL);

            ExcelDatasource excelDatasource = new ExcelDatasource();
            excelDatasource.setTableName(request.getTableName());
            excelDatasource.setColumns(request.getColumns());
            excelDatasource.setOriginalFileName(request.getOriginalFileName());
            excelDatasource.setRowCount(rowCount);
            excelDatasource.setImportMode("overwrite");
            entity.setDataSource(excelDatasource);

            datasourceMapper.insert(entity);

            // 清理上传缓存
            excelDataSourceService.removeUploadCache(request.getUploadId());

            ExcelCreateResponse response = new ExcelCreateResponse();
            response.setId(entity.getId());
            response.setCode(entity.getCode());
            response.setTableName(request.getTableName());
            return Resp.success(response);
        } catch (Exception e) {
            return Resp.error("创建失败: " + e.getMessage());
        }
    }

    /**
     * 重新导入数据
     */
    @PostMapping("/reimport")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "重新导入", description = "为已有Excel数据源重新导入数据")
    @OperationLogMeta(actionType = "上传", actionDesc = "重新导入Excel数据", businessType = "excel_import", businessName = "Excel导入", targetIdKey = "code", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<ReimportResponse> reimport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("code") String code,
            @RequestParam("importMode") String importMode) {
        if (file == null || file.isEmpty()) {
            return Resp.error("请选择要上传的文件");
        }
        String originalFilename = file.getOriginalFilename();
        if (!isSupportedFile(originalFilename)) {
            return Resp.error("仅支持xlsx或csv格式的文件");
        }
        if (!"overwrite".equals(importMode) && !"append".equals(importMode)) {
            return Resp.error("导入模式必须为overwrite或append");
        }

        // 查询数据源
        DataSourceEntity entity = datasourceMapper.getByCode(code);
        if (entity == null) {
            return Resp.error("数据源不存在");
        }
        if (!(entity.getDataSource() instanceof ExcelDatasource excelDatasource)) {
            return Resp.error("该数据源不是Excel类型");
        }

        try {
            int rowCount = excelDataSourceService.reimportData(
                    excelDatasource.getTableName(),
                    excelDatasource.getColumns(),
                    originalFilename,
                    file.getInputStream(),
                    importMode
            );

            // 更新数据源记录
            excelDatasource.setOriginalFileName(originalFilename);
            excelDatasource.setImportMode(importMode);
            if ("overwrite".equals(importMode)) {
                excelDatasource.setRowCount(rowCount);
            } else {
                excelDatasource.setRowCount(
                        (excelDatasource.getRowCount() != null ? excelDatasource.getRowCount() : 0) + rowCount
                );
            }
            entity.setUpdateDate(new Date());
            datasourceMapper.updateById(entity);

            ReimportResponse response = new ReimportResponse();
            response.setRowCount(rowCount);
            return Resp.success(response);
        } catch (IOException e) {
            return Resp.error("文件读取失败: " + e.getMessage());
        } catch (Exception e) {
            return Resp.error("导入失败: " + e.getMessage());
        }
    }

    /**
     * 分页查看表数据
     */
    @GetMapping("/viewData")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "查看数据", description = "分页查看Excel数据源对应表的数据")
    @OperationLogMeta(actionType = "查询", actionDesc = "查看Excel导入数据", businessType = "excel_import", businessName = "Excel导入", targetIdKey = "code", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<ExcelDataSourceService.ExcelViewDataResult> viewData(
            @RequestParam("code") String code,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "pageSize", defaultValue = "100") int pageSize) {
        // 查询数据源
        DataSourceEntity entity = datasourceMapper.getByCode(code);
        if (entity == null) {
            return Resp.error("数据源不存在");
        }
        if (!(entity.getDataSource() instanceof ExcelDatasource excelDatasource)) {
            return Resp.error("该数据源不是Excel类型");
        }

        try {
            ExcelDataSourceService.ExcelViewDataResult result =
                    excelDataSourceService.viewData(excelDatasource.getTableName(), page, pageSize);
            return Resp.success(result);
        } catch (Exception e) {
            return Resp.error("查询数据失败: " + e.getMessage());
        }
    }

    @GetMapping("/tables")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "查询Excel表信息", description = "查询应用数据库中excel_开头的表信息")
    public Resp<List<DataSourceTableMeta>> listTables() {
        return Resp.success(dataSourceMetadataService.listAppExcelTables());
    }

    @GetMapping("/tables/{tableName}/columns")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "查询Excel字段信息", description = "根据表名查询应用数据库中excel_开头表的字段信息")
    public Resp<List<DataSourceColumnMeta>> listColumns(@PathVariable("tableName") String tableName) {
        return Resp.success(dataSourceMetadataService.listAppExcelColumns(tableName));
    }

    private boolean isSupportedFile(String originalFilename) {
        if (originalFilename == null) {
            return false;
        }
        String lowerName = originalFilename.toLowerCase();
        return lowerName.endsWith(".xlsx") || lowerName.endsWith(".csv");
    }

    // ========== 请求/响应类 ==========

    @Data
    public static class ExcelCreateRequest {
        private String name;
        private String tableName;
        private String uploadId;
        private List<ExcelColumn> columns;
        private String originalFileName;
    }

    @Data
    public static class ExcelCreateResponse {
        private String id;
        private String code;
        private String tableName;
    }

    @Data
    public static class ReimportResponse {
        private int rowCount;
    }
}
