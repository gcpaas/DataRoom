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

package com.gccloud.dataroom.core.module.manage.controller;

import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.permission.ApiPermission;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.utils.JSON;
import com.gccloud.common.validator.ValidatorUtils;
import com.gccloud.common.validator.group.Insert;
import com.gccloud.common.validator.group.Update;
import com.gccloud.common.vo.MixinsResp;
import com.gccloud.common.vo.PageVO;
import com.gccloud.common.vo.R;
import com.gccloud.dataroom.core.constant.DataRoomConst;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.dataroom.core.module.basic.entity.PagePreviewEntity;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomSearchDTO;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPagePreviewService;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPageService;
import com.gccloud.dataroom.core.module.manage.vo.StaticFileVO;
import com.gccloud.dataroom.core.permission.Permission;
import com.gccloud.dataroom.core.utils.Webjars;
import com.google.common.collect.Lists;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 10:55
 */
@Slf4j
@RestController
@RequestMapping("/dataroom/design")
@Api(tags = "页面设计")
public class DataRoomPageController {

    @Resource
    private IDataRoomPageService dataRoomPageService;
    @Resource
    private IDataRoomPagePreviewService previewService;

    @ApiPermission(permissions = {Permission.DataRoom.VIEW})
    @GetMapping("/info/code/{code}")
    @ApiOperation(value = "页面详情", position = 10, produces = MediaType.APPLICATION_JSON_VALUE)
    public MixinsResp<BasePageDTO> info(@ApiParam(name = "页面编码", value = "页面编码", required = true)@PathVariable("code") String code,
                                        @ApiParam(name = "是否预览", value = "true表示获取预览数据") Boolean preview) {
        if (Boolean.TRUE.equals(preview)) {
            PagePreviewEntity previewEntity = previewService.getByCode(code);
            BasePageDTO basePageDTO = JSON.parseObject(previewEntity.getConfig(), BasePageDTO.class);
            MixinsResp<BasePageDTO> r = new MixinsResp<BasePageDTO>().setData(basePageDTO);
            r.setCode(DataRoomConst.Response.Code.SUCCESS);
            return r;
        }
        PageEntity pageEntity = dataRoomPageService.getByCode(code);
        BasePageDTO pageDTO = pageEntity.getConfig();
        BeanConvertUtils.convert(pageEntity, pageDTO);
        MixinsResp<BasePageDTO> resp = new MixinsResp<BasePageDTO>().setData(pageDTO);
        resp.setCode(DataRoomConst.Response.Code.SUCCESS);
        return resp;
    }

    @ApiPermission(permissions = {Permission.DataRoom.VIEW})
    @GetMapping("/page")
    @ApiOperation(value = "页面分页列表", position = 10, produces = MediaType.APPLICATION_JSON_VALUE)
    public MixinsResp<PageVO<PageEntity>> page(DataRoomSearchDTO searchDTO) {
        PageVO<PageEntity> page = dataRoomPageService.getByCategory(searchDTO);
        MixinsResp<PageVO<PageEntity>> resp = new MixinsResp<PageVO<PageEntity>>().setData(page);
        resp.setCode(DataRoomConst.Response.Code.SUCCESS);
        return resp;
    }


    @ApiPermission(permissions = {Permission.DataRoom.ADD})
    @PostMapping("/add")
    @ApiOperation(value = "从空白新增页面", position = 20, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> add(@RequestBody Map<String, Object> pageDTO) {
        BasePageDTO basePageDTO = this.getInstanceByClassName(pageDTO);
        // TODO 测试这里的校验实际上是根据示例的className还是实例化时的基类进行的
        ValidatorUtils.validateEntity(basePageDTO, Insert.class);
        dataRoomPageService.add(basePageDTO);
        return R.success(basePageDTO.getCode());
    }




    @ApiPermission(permissions = {Permission.DataRoom.UPDATE})
    @PostMapping("/update")
    @ApiOperation(value = "修改页面配置", position = 30, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> update(@RequestBody Map<String, Object> pageDTO) {
        BasePageDTO basePageDTO = this.getInstanceByClassName(pageDTO);
        if (Boolean.TRUE.equals(pageDTO.get("isPreview"))) {
            // 保存到预览临时缓存表
            String code = previewService.add(basePageDTO);
            return R.success(code);
        }
        ValidatorUtils.validateEntity(basePageDTO, Update.class);
        dataRoomPageService.update(basePageDTO);
        return R.success(basePageDTO.getCode());
    }

    /**
     * 根据className实例化
     * @param pageDTO
     * @return
     */
    private BasePageDTO getInstanceByClassName(Map<String, Object> pageDTO) {
        String className = pageDTO.get("className").toString();
        BasePageDTO basePageDTO;
        try {
            // 根据className实例化
            Class<?> clazz = Class.forName(className);
            basePageDTO = (BasePageDTO) clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new GlobalException("页面类型不存在");
        }
        basePageDTO = JSON.parseObject(JSON.toJSONString(pageDTO), basePageDTO.getClass());
        return basePageDTO;
    }

    @ApiPermission(permissions = {Permission.DataRoom.DELETE})
    @PostMapping("/delete/{code}")
    @ApiOperation(value = "删除页面", position = 40, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<Void> delete(@PathVariable String code) {
        PageEntity pageEntity = dataRoomPageService.getByCode(code);
        if (pageEntity == null) {
            return R.success();
        }
        dataRoomPageService.deleteByCode(code);
        return R.success();
    }

    @ApiPermission(permissions = {Permission.DataRoom.ADD})
    @PostMapping("/copy/{code}")
    @ApiOperation(value = "复制页面", position = 50, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> copy(@PathVariable String code) {
        PageEntity pageEntity = dataRoomPageService.getByCode(code);
        if (pageEntity == null) {
            throw new GlobalException("页面不存在");
        }
        String newCode = dataRoomPageService.copy(pageEntity);
        return R.success(newCode);
    }

    @ApiPermission(permissions = {Permission.DataRoom.ADD})
    @PostMapping("/add/template")
    @ApiOperation(value = "从模板新增页面", position = 20, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> addByTemplate(@RequestBody BasePageDTO pageDTO) {
        String code = dataRoomPageService.addByTemplate(pageDTO);
        return R.success(code);
    }

    @PostMapping("/get/template")
    @ApiOperation(value = "根据模板获取配置", position = 20, produces = MediaType.APPLICATION_JSON_VALUE)
    public MixinsResp<BasePageDTO> getByTemplate(@RequestBody BasePageDTO basePageDTO) {
        BasePageDTO config = dataRoomPageService.getConfigByTemplate(basePageDTO);
        MixinsResp<BasePageDTO> resp = new MixinsResp<BasePageDTO>().setData(config);
        resp.setCode(DataRoomConst.Response.Code.SUCCESS);
        return resp;
    }

    @ApiPermission
    @GetMapping("/map/list/{level}")
    @ApiOperation(value = "地图数据列表", position = 60, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<List<StaticFileVO>> getMapJsonList(@PathVariable("level") String level) {
        List<String> staticFileList = Lists.newArrayList();
        if ("country".equals(level)) {
            staticFileList = Webjars.COUNTRY_MAP_DATA;
        }
        if ("province".equals(level)) {
            staticFileList = Webjars.PROVINCE_MAP_DATA;
        }
        List<StaticFileVO> bgList = Lists.newArrayList();
        String urlPrefix = "static/chinaMap/" + level + "/";
        for (String fileName : staticFileList) {
            StaticFileVO fileVO = new StaticFileVO();
            fileVO.setUrl(fileName);
            fileVO.setName(fileName.replace(".json", ""));
            bgList.add(fileVO);
        }
        return R.success(bgList);
    }

    @ApiPermission
    @PostMapping("/name/repeat")
    @ApiOperation(value = "页面名称是否重复", position = 60, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<Boolean> nameRepeat(@RequestBody PageEntity pageEntity) {
        boolean repeat = dataRoomPageService.checkNameRepeat(pageEntity);
        return R.success(repeat);
    }
}