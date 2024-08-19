/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.gccloud.dataroom.core.module.file.controller;

import com.gccloud.common.permission.ApiPermission;
import com.gccloud.dataroom.core.module.file.dto.FileResourceDTO;
import com.gccloud.dataroom.core.module.file.dto.FileSearchDTO;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomFileService;
import com.gccloud.dataroom.core.module.file.service.IDataRoomOssService;
import com.gccloud.dataroom.core.module.file.vo.DataRoomFileVO;
import com.gccloud.common.controller.SuperController;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.vo.PageVO;
import com.gccloud.common.vo.R;
import com.gccloud.dataroom.core.permission.Permission;
import io.swagger.annotations.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * 文件管理
 */
@Slf4j
@RestController
@RequestMapping("/dataroom/file")
@Api(tags = "文件管理")
@ApiSort(value = 100)
public class DataRoomFileController extends SuperController {

    @Resource
    private IDataRoomOssService sysOssService;
    @Resource
    private IDataRoomFileService fileService;

    @ApiPermission(permissions = {Permission.File.VIEW})
    @GetMapping(value = {"", "/"})
    @ApiOperation(value = "列表", position = 10, notes = "分页查询文件", produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiImplicitParams({
            @ApiImplicitParam(name = "current", value = "页码", paramType = "query", required = true, dataType = "int"),
            @ApiImplicitParam(name = "size", value = "每页条数", paramType = "query", required = true, dataType = "int"),
            @ApiImplicitParam(name = "searchKey", value = "查询条件", paramType = "query", dataType = "string")
    })
    public R<PageVO<DataRoomFileVO>> getPage(@ApiParam(name = "查询", value = "传入查询的业务条件", required = true) FileSearchDTO searchDTO) {
        PageVO<DataRoomFileEntity> page = fileService.getPage(searchDTO);
        PageVO<DataRoomFileVO> pageVO = BeanConvertUtils.convertPage(page, DataRoomFileVO.class);
        return R.success(pageVO);
    }

    @ApiPermission(permissions = {Permission.File.UPLOAD})
    @PostMapping("/upload")
    @ApiOperation(value = "上传", notes = "上传", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<DataRoomFileEntity> upload(@RequestParam("file") MultipartFile file, @RequestParam(value = "module", required = false) String module, @RequestParam("hide") Integer hide, HttpServletResponse response, HttpServletRequest request) {
        DataRoomFileEntity entity = new DataRoomFileEntity();
        // 不同业务自己控制
        if (StringUtils.isBlank(module)) {
            module = "";
        }
        entity.setModule(module);
        entity.setHide(hide == null ? 0 : hide);
        sysOssService.upload(file, entity, response, request);
        fileService.save(entity);
        return R.success(entity);
    }


    @ApiPermission(permissions = {Permission.File.UPLOAD})
    @PostMapping("/add")
    @ApiOperation(value = "新增素材", notes = "新增素材", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<DataRoomFileEntity> add(@RequestParam(value = "file", required = false) MultipartFile file,
                                        @RequestParam("module") String module, @RequestParam("originalName") String originalName,
                                        @RequestParam("extension") String extension, @RequestParam("url") String url,
                                        @RequestParam("path") String path, @RequestParam("hide") Integer hide,
                                        @RequestParam("coverUrl") String coverUrl, @RequestParam("coverId") String coverId,
                                        @RequestParam("type") String type,
                                     HttpServletResponse response, HttpServletRequest request) {
        FileResourceDTO fileDTO = FileResourceDTO.builder().module(module).originalName(originalName)
                .extension(extension).url(url).path(path).hide(hide).coverUrl(coverUrl).coverId(coverId)
                .type(type).build();
        if (StringUtils.isBlank(fileDTO.getModule())) {
            fileDTO.setModule("");
        }
        if (fileDTO.getHide() == null) {
            fileDTO.setHide(0);
        }
        DataRoomFileEntity entity = BeanConvertUtils.convert(fileDTO, DataRoomFileEntity.class);
        // 如果是引用资源，调用引用资源接口
        if (fileDTO.getType().equals("reference")) {
            String importId = fileService.importResource(fileDTO);
            return R.success(fileService.getById(importId));
        }
        sysOssService.upload(file, entity, response, request);
        fileService.save(entity);
        return R.success(entity);
    }


    @ApiPermission(permissions = {Permission.File.UPLOAD})
    @PostMapping("/update")
    @ApiOperation(value = "更新素材", notes = "更新素材", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<DataRoomFileEntity> update(@RequestParam(value = "file", required = false) MultipartFile file, @RequestParam("id") String id,
                                        @RequestParam("module") String module, @RequestParam("originalName") String originalName,
                                        @RequestParam("extension") String extension, @RequestParam("url") String url,
                                        @RequestParam("path") String path, @RequestParam("hide") Integer hide,
                                        @RequestParam("coverUrl") String coverUrl, @RequestParam("coverId") String coverId,
                                        @RequestParam("type") String type,
                                        HttpServletResponse response, HttpServletRequest request) {
        FileResourceDTO fileDTO = FileResourceDTO.builder().id(id).module(module).originalName(originalName)
                .extension(extension).url(url).path(path).hide(hide).coverUrl(coverUrl).coverId(coverId)
                .type(type).build();
        if (StringUtils.isBlank(fileDTO.getModule())) {
            fileDTO.setModule("");
        }
        if (fileDTO.getHide() == null) {
            fileDTO.setHide(0);
        }
        DataRoomFileEntity entity = fileService.getById(fileDTO.getId());
        if (entity == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            log.error("素材文件不存在，文件id："+ fileDTO.getId());
            return null;
        }
        entity.setModule(fileDTO.getModule());
        entity.setOriginalName(fileDTO.getOriginalName());
        entity.setExtension(fileDTO.getExtension());
        entity.setUrl(fileDTO.getUrl());
        entity.setPath(fileDTO.getPath());
        entity.setHide(fileDTO.getHide());
        entity.setCoverUrl(fileDTO.getCoverUrl());
        entity.setCoverId(fileDTO.getCoverId());
        entity.setType(fileDTO.getType());
        // 如果封面更新，则删除原封面
        if (StringUtils.isNotBlank(fileDTO.getCoverId()) && !fileDTO.getCoverId().equals(entity.getCoverId())) {
            sysOssService.delete(fileDTO.getCoverId());
        }
        if (!fileDTO.getType().equals("reference")) {
            if (file != null) {
                // 替换文件
                entity = sysOssService.replace(file, entity, response, request);
            }
            fileService.updateById(entity);
            return R.success(entity);
        }
        fileService.updateResource(fileDTO);
        return R.success();
    }


    @ApiPermission(permissions = {Permission.File.VIEW})
    @GetMapping("/reference/{name}")
    @ApiOperation(value = "引用资源重定向", notes = "引用资源重定向", produces = MediaType.APPLICATION_JSON_VALUE)
    public void reference(@PathVariable("name") String name, HttpServletResponse response, HttpServletRequest request) {
        DataRoomFileEntity fileEntity = fileService.getByName(name);
        if (fileEntity == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            log.error("引用的资源不存在，文件名："+ name);
            return;
        }
        String url = fileEntity.getPath();
        if (StringUtils.isBlank(url)) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            log.error("引用的资源不存在，文件名："+ name);
            return;
        }
        // 重定向
        try {
            response.sendRedirect(url);
        } catch (IOException e) {
            log.error("引用的资源重定向失败，文件名："+ name);
            return;
        }
    }

    @ApiPermission(permissions = {Permission.File.UPLOAD})
    @PostMapping("/import")
    @ApiOperation(value = "导入资源", notes = "导入/引用资源，通过url引用，无需文件上传", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> importResource(@RequestBody FileResourceDTO fileResourceDTO){
        String id = fileService.importResource(fileResourceDTO);
        return R.success(id);
    }



    @ApiPermission(permissions = {Permission.File.DOWNLOAD})
    @PostMapping("/download/{id}")
    @ApiOperation(value = "下载", notes = "下载资源", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public void download(@PathVariable("id") String id, HttpServletResponse response, HttpServletRequest request) {
        DataRoomFileEntity fileEntity = fileService.getById(id);
        if (fileEntity == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            log.error("下载的文件不存在，文件id："+ id);
            return;
        }
        if (fileEntity.getPath().equals(DataRoomFileEntity.IMPORT_RESOURCE)) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            log.error("引用的资源无法下载，文件id："+ id);
            return;
        }
        sysOssService.download(id, response, request);
    }

    @ApiPermission(permissions = {Permission.File.VIEW})
    @GetMapping("/getAllFileSuffix")
    @ApiOperation(value = "获取所有文件后缀名", notes = "获取所有文件后缀名", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public R<List<String>> getAllFileSuffix() {
    	List<String> extensions = fileService.getAllExtension();
        // 移除空后缀
        extensions.remove("");
    	return R.success(extensions);
    }

    @ApiPermission(permissions = {Permission.File.DELETE})
    @PostMapping("/delete/{id}")
    @ApiOperation(value = "删除", notes = "删除", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public R<Boolean> delete(@PathVariable("id") String id) {
        DataRoomFileEntity fileEntity = fileService.getById(id);
        if (fileEntity == null) {
            log.error("删除的文件不存在");
            return R.success(true);
        }
        if (fileEntity.getPath().equals(DataRoomFileEntity.IMPORT_RESOURCE)) {
            fileService.removeById(id);
            return R.success(true);
        }
        sysOssService.delete(id);
        // 删除封面文件
        if (StringUtils.isNotBlank(fileEntity.getCoverId())) {
            sysOssService.delete(fileEntity.getCoverId());
        }
        return R.success(true);
    }

    @ApiPermission(permissions = {Permission.File.UPLOAD})
    @PostMapping("/replace")
    @ApiOperation(value = "替换", notes = "替换", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<DataRoomFileEntity> replace(@RequestParam("file") MultipartFile file, @RequestParam(value = "id") String id, HttpServletResponse response, HttpServletRequest request) {
        DataRoomFileEntity entity = fileService.getById(id);
        if (entity == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            log.error("替换的文件不存在，文件id："+ id);
            return null;
        }
        DataRoomFileEntity replace = sysOssService.replace(file, entity, response, request);
        fileService.updateById(replace);
        return R.success(replace);
    }


}