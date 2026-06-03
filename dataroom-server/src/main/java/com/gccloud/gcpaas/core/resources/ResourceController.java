package com.gccloud.gcpaas.core.resources;

import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.constant.DataRoomRole;
import com.gccloud.gcpaas.core.constant.ResourceType;
import com.gccloud.gcpaas.core.entity.ResourceEntity;
import com.gccloud.gcpaas.core.mapper.ResourceMapper;
import com.gccloud.gcpaas.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.core.operationlog.model.OperationLogDetailLevel;
import com.gccloud.gcpaas.core.resources.storage.ResourceFileVariant;
import com.gccloud.gcpaas.core.resources.storage.ResourceStorageService;
import com.gccloud.gcpaas.core.resources.storage.ResourceStoreRequest;
import com.gccloud.gcpaas.core.resources.storage.ResourceStream;
import com.gccloud.gcpaas.core.resources.storage.StoredResource;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * 素材库
 */
@Tag(name = "素材库")
@ApiSort(value = 20)
@Slf4j
@RequestMapping("/dataRoom/resource")
@RestController
@OperationLogMeta(targetType = "resource", businessType = "resource_manage", businessName = "素材管理")
public class ResourceController {

    @Resource
    private ResourceMapper resourceMapper;
    @Resource
    private ResourceStorageService resourceStorageService;

    @GetMapping("/list")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "列表查询", description = "根据名称查询")
    @Parameters({
            @Parameter(name = "name", description = "资源名称", in = ParameterIn.QUERY),
            @Parameter(name = "parentCode", description = "目录编码", in = ParameterIn.QUERY),
            @Parameter(name = "resourceType", description = "资源类型", in = ParameterIn.QUERY)
    })
    public Resp<List<ResourceEntity>> list(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "parentCode", required = false) String parentCode,
            @RequestParam(name = "resourceType", required = false) String resourceType) {
        if (StringUtils.isBlank(parentCode)) {
            parentCode = "root";
        }
        LambdaQueryWrapper<ResourceEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(StringUtils.isNotBlank(parentCode), ResourceEntity::getParentCode, parentCode);
        queryWrapper.like(StringUtils.isNotBlank(name), ResourceEntity::getName, name);
        if (StringUtils.isNotBlank(resourceType)) {
            try {
                queryWrapper.eq(ResourceEntity::getResourceType, ResourceType.valueOf(resourceType.toUpperCase()));
            } catch (IllegalArgumentException ignored) {
                log.error(ExceptionUtils.getStackTrace(ignored));
            }
        }
        queryWrapper.orderByDesc(ResourceEntity::getUpdateDate);
        List<ResourceEntity> list = resourceMapper.selectList(queryWrapper);
        return Resp.success(normalizeResourceAccessUrl(list));
    }

    @GetMapping("/detail/{id}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "详情", description = "根据主键查询")
    @Parameters({@Parameter(name = "id", description = "资源id", in = ParameterIn.PATH)})
    public Resp<ResourceEntity> detail(@PathVariable("id") String id) {
        ResourceEntity resourceEntity = resourceMapper.selectById(id);
        return Resp.success(normalizeResourceAccessUrl(resourceEntity));
    }

    @PostMapping("/upload")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "上传", description = "上传素材并保存资源记录")
    @OperationLogMeta(actionType = "上传", actionDesc = "上传素材资源", businessType = "resource_upload", businessName = "素材上传", targetNameKey = "name", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<ResourceEntity> upload(
            @RequestParam(value = "id", required = false) String id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "cover", required = false) MultipartFile cover,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "resourceType", required = false) String resourceType,
            @RequestParam(value = "parentCode", required = false) String parentCode,
            @RequestParam(value = "remark", required = false) String remark) throws IOException {
        boolean update = StringUtils.isNotBlank(id);
        ResourceEntity oldResource = null;
        ResourceEntity resourceEntity;
        if (update) {
            oldResource = resourceMapper.selectById(id);
            if (oldResource == null) {
                return Resp.error("资源不存在");
            }
            resourceEntity = cloneResource(oldResource);
        } else {
            if (file == null || file.isEmpty()) {
                return Resp.error("请上传文件");
            }
            resourceEntity = new ResourceEntity();
            resourceEntity.setId(IdWorker.getIdStr());
            resourceEntity.setParentCode(StringUtils.defaultIfBlank(parentCode, "root"));
        }

        applyMetadata(resourceEntity, file, name, resourceType, parentCode, remark, update);

        ResourceStorageService storageService = resourceStorageService;
        List<String> newObjectKeyList = new ArrayList<>();
        try {
            if (file != null && !file.isEmpty()) {
                StoredResource stored = storeMainFile(storageService, resourceEntity, file, resourceType);
                newObjectKeyList.add(stored.getObjectKey());
            }
            if (cover != null && !cover.isEmpty()) {
                StoredResource storedCover = storeCoverFile(storageService, resourceEntity, cover);
                newObjectKeyList.add(storedCover.getObjectKey());
            }

            resourceEntity.setUpdateDate(new Date());
            if (update) {
                resourceMapper.updateById(resourceEntity);
                cleanupOldObjects(storageService, oldResource, resourceEntity);
            } else {
                resourceMapper.insert(resourceEntity);
            }
            return Resp.success(normalizeResourceAccessUrl(resourceEntity));
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            rollbackNewObjects(storageService, newObjectKeyList);
            if (e instanceof IOException ioException) {
                throw ioException;
            }
            throw new IOException("保存素材失败", e);
        }
    }

    @GetMapping("/file/{id}")
    @Operation(summary = "读取资源文件", description = "公开代理读取素材主文件")
    @OperationLogMeta(actionType = "读取", actionDesc = "读取素材文件", businessType = "resource_file", businessName = "素材文件", targetIdKey = "id", detailLevel = OperationLogDetailLevel.SUMMARY)
    public void file(@PathVariable("id") String id, HttpServletRequest request, HttpServletResponse response) throws IOException {
        writeResourceFile(id, ResourceFileVariant.MAIN, request, response);
    }

    @GetMapping("/file/{id}/thumbnail")
    @Operation(summary = "读取资源封面", description = "公开代理读取素材封面文件")
    @OperationLogMeta(actionType = "读取", actionDesc = "读取素材封面", businessType = "resource_file", businessName = "素材封面", targetIdKey = "id", detailLevel = OperationLogDetailLevel.SUMMARY)
    public void thumbnail(@PathVariable("id") String id, HttpServletRequest request, HttpServletResponse response) throws IOException {
        writeResourceFile(id, ResourceFileVariant.THUMBNAIL, request, response);
    }

    @PostMapping("/insert")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "新增", description = "新增素材")
    public Resp<String> insert(@RequestBody ResourceEntity resourceEntity) {
        resourceEntity.setUpdateDate(new Date());
        resourceMapper.insert(resourceEntity);
        return Resp.success(resourceEntity.getId());
    }

    @PostMapping("/update")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "更新", description = "更新素材")
    public Resp<String> update(@RequestBody ResourceEntity resourceEntity) {
        resourceEntity.setUpdateDate(new Date());
        resourceMapper.updateById(resourceEntity);
        return Resp.success(resourceEntity.getId());
    }

    @PostMapping("/delete/{id}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "删除", description = "根据主键删除素材")
    @Parameters({@Parameter(name = "id", description = "素材ID", in = ParameterIn.PATH)})
    public Resp<Void> delete(@PathVariable("id") String id) {
        ResourceEntity resource = resourceMapper.selectById(id);
        if (resource == null) {
            return Resp.success(null);
        }
        try {
            ResourceStorageService storageService = resourceStorageService;
            storageService.delete(resource.getPath());
            storageService.delete(resource.getThumbnail());
            resourceMapper.deleteById(id);
            return Resp.success(null);
        } catch (Exception e) {
            log.error("删除素材失败，id={}", id, e);
            return Resp.error("删除素材文件失败");
        }
    }

    @PostMapping("/updateModelConfig")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "更新模型配置", description = "更新模型的配置和封面")
    @OperationLogMeta(actionType = "修改", actionDesc = "更新模型配置", businessType = "resource_model", businessName = "模型资源", targetIdKey = "id", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<Void> updateModelConfig(
            @RequestParam("id") String id,
            @RequestParam(value = "config", required = false) String config,
            @RequestParam(value = "thumbnail", required = false) String thumbnail) {
        ResourceEntity entity = resourceMapper.selectById(id);
        if (entity == null) {
            return Resp.error("资源不存在");
        }
        if (StringUtils.isNotBlank(config)) {
            entity.setConfig(config);
        }
        if (StringUtils.isNotBlank(thumbnail)) {
            entity.setThumbnail(thumbnail);
        }
        entity.setUpdateDate(new Date());
        resourceMapper.updateById(entity);
        return Resp.success(null);
    }

    @PostMapping("/uploadModelCover")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "上传模型封面", description = "上传模型封面图片")
    @OperationLogMeta(actionType = "上传", actionDesc = "上传模型封面", businessType = "resource_model", businessName = "模型资源", targetIdKey = "id", detailLevel = OperationLogDetailLevel.SUMMARY)
    public Resp<ResourceEntity> uploadModelCover(
            @RequestParam("id") String id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "cover", required = false) MultipartFile cover) throws IOException {
        MultipartFile coverFile = cover != null && !cover.isEmpty() ? cover : file;
        if (coverFile == null || coverFile.isEmpty()) {
            return Resp.error("请上传封面");
        }
        return upload(id, null, coverFile, null, null, null, null);
    }

    private void applyMetadata(ResourceEntity resourceEntity, MultipartFile file, String name, String resourceType, String parentCode, String remark, boolean update) {
        if (StringUtils.isNotBlank(name)) {
            resourceEntity.setName(name);
        } else if (!update && file != null && StringUtils.isBlank(resourceEntity.getName())) {
            resourceEntity.setName(getDisplayName(file.getOriginalFilename()));
        }
        if (StringUtils.isNotBlank(parentCode)) {
            resourceEntity.setParentCode(parentCode);
        }
        if (remark != null) {
            resourceEntity.setRemark(remark);
        }
        if (StringUtils.isNotBlank(resourceType)) {
            try {
                resourceEntity.setResourceType(ResourceType.valueOf(resourceType.toUpperCase()));
            } catch (IllegalArgumentException ignored) {
                log.error(ExceptionUtils.getStackTrace(ignored));
            }
        }
    }

    private StoredResource storeMainFile(ResourceStorageService storageService, ResourceEntity resourceEntity, MultipartFile file, String resourceType) throws IOException {
        String originalFilename = StringUtils.defaultIfBlank(file.getOriginalFilename(), "resource");
        String extension = FilenameUtils.getExtension(originalFilename).toLowerCase();
        ResourceType type = resolveResourceType(resourceType, extension);
        String objectKey = buildObjectKey(type, extension);
        StoredResource stored = storageService.store(ResourceStoreRequest.builder()
                .file(file)
                .objectKey(objectKey)
                .resourceType(type)
                .build());
        resourceEntity.setOriginalName(originalFilename);
        if (StringUtils.isBlank(resourceEntity.getName())) {
            resourceEntity.setName(getDisplayName(originalFilename));
        }
        resourceEntity.setPath(stored.getObjectKey());
        resourceEntity.setUrl(isMinioStorage() ? getProxyUrl(resourceEntity.getId()) : stored.getAccessUrl());
        resourceEntity.setSize(stored.getSize());
        resourceEntity.setResourceType(type);
        if (type == ResourceType.MODEL) {
            resourceEntity.setConfig(mergeModelFormat(resourceEntity.getConfig(), extension));
        }
        return stored;
    }

    private StoredResource storeCoverFile(ResourceStorageService storageService, ResourceEntity resourceEntity, MultipartFile cover) throws IOException {
        String originalFilename = StringUtils.defaultIfBlank(cover.getOriginalFilename(), "cover");
        String extension = FilenameUtils.getExtension(originalFilename).toLowerCase();
        ResourceType type = resourceEntity.getResourceType() == null ? ResourceType.IMAGE : resourceEntity.getResourceType();
        StoredResource stored = storageService.store(ResourceStoreRequest.builder()
                .file(cover)
                .objectKey(buildObjectKey(type, extension))
                .resourceType(type)
                .build());
        resourceEntity.setThumbnail(isMinioStorage() ? stored.getObjectKey() : stored.getAccessUrl());
        return stored;
    }

    private void writeResourceFile(String id, ResourceFileVariant variant, HttpServletRequest request, HttpServletResponse response) throws IOException {
        ResourceEntity resource = resourceMapper.selectById(id);
        if (resource == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        try {
            ResourceStream stream = resourceStorageService.load(resource, variant);
            if (stream == null || stream.getInputStream() == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            writeStream(stream, variant == ResourceFileVariant.MAIN, request, response);
        } catch (FileNotFoundException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        } catch (IOException e) {
            log.error("读取素材文件失败，id={}, variant={}", id, variant, e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private void writeStream(ResourceStream stream, boolean supportRange, HttpServletRequest request, HttpServletResponse response) throws IOException {
        long totalLength = stream.getContentLength() == null ? -1 : stream.getContentLength();
        String contentType = StringUtils.defaultIfBlank(stream.getContentType(), MediaType.APPLICATION_OCTET_STREAM_VALUE);
        response.setContentType(contentType);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodeFileName(stream.getFileName()) + "\"");
        response.setHeader(HttpHeaders.ACCEPT_RANGES, "bytes");

        String rangeHeader = request.getHeader(HttpHeaders.RANGE);
        try (var inputStream = stream.getInputStream(); ServletOutputStream outputStream = response.getOutputStream()) {
            Range range = parseRange(rangeHeader, totalLength);
            if (supportRange && range != null) {
                response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
                response.setHeader(HttpHeaders.CONTENT_RANGE, "bytes " + range.start() + "-" + range.end() + "/" + totalLength);
                response.setContentLengthLong(range.length());
                IOUtils.copyLarge(inputStream, outputStream, range.start(), range.length());
                return;
            }
            if (totalLength >= 0) {
                response.setContentLengthLong(totalLength);
            }
            IOUtils.copy(inputStream, outputStream);
        }
    }

    private Range parseRange(String rangeHeader, long totalLength) {
        if (StringUtils.isBlank(rangeHeader) || totalLength <= 0 || !rangeHeader.startsWith("bytes=")) {
            return null;
        }
        String rangeValue = rangeHeader.substring("bytes=".length()).trim();
        String[] parts = rangeValue.split("-", 2);
        try {
            long start = StringUtils.isBlank(parts[0]) ? 0 : Long.parseLong(parts[0]);
            long end = parts.length > 1 && StringUtils.isNotBlank(parts[1]) ? Long.parseLong(parts[1]) : totalLength - 1;
            if (start < 0 || end < start || start >= totalLength) {
                return null;
            }
            return new Range(start, Math.min(end, totalLength - 1));
        } catch (NumberFormatException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return null;
        }
    }

    private void cleanupOldObjects(ResourceStorageService storageService, ResourceEntity oldResource, ResourceEntity newResource) {
        cleanupOldObject(storageService, oldResource.getPath(), newResource.getPath());
        cleanupOldObject(storageService, oldResource.getThumbnail(), newResource.getThumbnail());
    }

    private void cleanupOldObject(ResourceStorageService storageService, String oldObjectKey, String newObjectKey) {
        if (StringUtils.isBlank(oldObjectKey) || oldObjectKey.equals(newObjectKey)) {
            return;
        }
        try {
            storageService.delete(oldObjectKey);
        } catch (Exception e) {
            log.warn("清理旧素材文件失败，objectKey={}", oldObjectKey, e);
        }
    }

    private void rollbackNewObjects(ResourceStorageService storageService, List<String> objectKeyList) {
        for (String objectKey : objectKeyList) {
            try {
                storageService.delete(objectKey);
            } catch (Exception e) {
                log.warn("回滚新素材文件失败，objectKey={}", objectKey, e);
            }
        }
    }

    private List<ResourceEntity> normalizeResourceAccessUrl(List<ResourceEntity> resourceList) {
        return resourceList.stream().map(this::normalizeResourceAccessUrl).toList();
    }

    private ResourceEntity normalizeResourceAccessUrl(ResourceEntity resource) {
        if (resource == null) {
            return null;
        }
        ResourceEntity copy = cloneResource(resource);
        if (isMinioStorage() && !isDirectoryResource(copy)) {
            copy.setUrl(getProxyUrl(copy.getId()));
            if (StringUtils.isNotBlank(copy.getThumbnail())) {
                copy.setThumbnail(getProxyThumbnailUrl(copy.getId()));
            }
        }
        return copy;
    }

    private ResourceEntity cloneResource(ResourceEntity resource) {
        ResourceEntity copy = new ResourceEntity();
        BeanUtils.copyProperties(resource, copy);
        return copy;
    }

    private boolean isDirectoryResource(ResourceEntity resource) {
        return resource.getResourceType() == ResourceType.DIRECTORY;
    }

    private boolean isMinioStorage() {
        return "minio".equalsIgnoreCase(resourceStorageService.getStorageType());
    }

    private String buildObjectKey(ResourceType type, String extension) {
        String newFileName = UUID.randomUUID().toString().replace("-", "");
        if (StringUtils.isNotBlank(extension)) {
            newFileName += "." + extension;
        }
        return getSubDir(type) + "/" + newFileName;
    }

    private String getProxyUrl(String id) {
        return "/dataRoom/resource/file/" + id;
    }

    private String getProxyThumbnailUrl(String id) {
        return getProxyUrl(id) + "/thumbnail";
    }

    private String getDisplayName(String originalFilename) {
        String baseName = FilenameUtils.getBaseName(originalFilename);
        return StringUtils.defaultIfBlank(baseName, StringUtils.defaultIfBlank(originalFilename, "未命名素材"));
    }

    private ResourceType resolveResourceType(String resourceType, String extension) {
        if (StringUtils.isNotBlank(resourceType)) {
            try {
                return ResourceType.valueOf(resourceType.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                log.error(ExceptionUtils.getStackTrace(ignored));
            }
        }
        return ResourceType.getByExtension(extension);
    }

    private String mergeModelFormat(String configJson, String extension) {
        JSONObject config = StringUtils.isNotBlank(configJson) ? JSONObject.parseObject(configJson) : new JSONObject();
        config.put("format", extension.toUpperCase());
        return config.toJSONString();
    }

    private String getSubDir(ResourceType type) {
        if (type == null) {
            return "image";
        }
        return switch (type) {
            case VIDEO -> "video";
            case MODEL -> "model";
            default -> "image";
        };
    }

    private String encodeFileName(String fileName) {
        return URLEncoder.encode(StringUtils.defaultIfBlank(fileName, "resource"), StandardCharsets.UTF_8).replace("+", "%20");
    }

    private record Range(long start, long end) {
        long length() {
            return end - start + 1;
        }
    }
}
