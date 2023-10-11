package com.gccloud.dataroom.core.module.manage.controller;

import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.constant.DataRoomConst;
import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.dataroom.core.module.basic.entity.PagePreviewEntity;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomSearchDTO;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPagePreviewService;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPageService;
import com.gccloud.dataroom.core.module.manage.vo.StaticFileVO;
import com.gccloud.dataroom.core.permission.Permission;
import com.gccloud.common.permission.ApiPermission;
import com.gccloud.dataroom.core.utils.Webjars;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.validator.ValidatorUtils;
import com.gccloud.common.validator.group.Insert;
import com.gccloud.common.validator.group.Update;
import com.gccloud.common.vo.MixinsResp;
import com.gccloud.common.vo.PageVO;
import com.gccloud.common.vo.R;
import com.google.common.collect.Lists;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 10:55
 */
@Slf4j
@RestController
@RequestMapping("/bigScreen/design")
@Api(tags = "大屏页以及大屏组件设计")
public class DataRoomPageController {

    @Resource
    private IDataRoomPageService bigScreenPageService;
    @Resource
    private DataRoomConfig bigScreenConfig;
    @Resource
    private IDataRoomPagePreviewService previewService;

    @ApiPermission(permissions = {Permission.DataRoom.VIEW})
    @GetMapping("/info/code/{code}")
    @ApiOperation(value = "大屏页/组件详情", position = 10, produces = MediaType.APPLICATION_JSON_VALUE)
    public MixinsResp<DataRoomPageDTO> info(@PathVariable("code") String code) {
        if (code.startsWith(IDataRoomPagePreviewService.PREVIEW_KEY)) {
            PagePreviewEntity preview = previewService.getByCode(code);
            MixinsResp<DataRoomPageDTO> r = new MixinsResp<DataRoomPageDTO>().setData((DataRoomPageDTO) preview.getConfig());
            r.setCode(DataRoomConst.Response.Code.SUCCESS);
            return r;
        }
        PageEntity bigScreen = bigScreenPageService.getByCode(code);
        DataRoomPageDTO bigScreenPageDTO = (DataRoomPageDTO) bigScreen.getConfig();
        BeanConvertUtils.convert(bigScreen, bigScreenPageDTO);
        MixinsResp<DataRoomPageDTO> resp = new MixinsResp<DataRoomPageDTO>().setData(bigScreenPageDTO);
        resp.setCode(DataRoomConst.Response.Code.SUCCESS);
        return resp;
    }

    @ApiPermission(permissions = {Permission.DataRoom.VIEW})
    @GetMapping("/page")
    @ApiOperation(value = "大屏/组件分页列表", position = 10, produces = MediaType.APPLICATION_JSON_VALUE)
    public MixinsResp<PageVO<PageEntity>> page(DataRoomSearchDTO searchDTO) {
        PageVO<PageEntity> page = bigScreenPageService.getByCategory(searchDTO);
        MixinsResp<PageVO<PageEntity>> resp = new MixinsResp<PageVO<PageEntity>>().setData(page);
        resp.setCode(DataRoomConst.Response.Code.SUCCESS);
        return resp;
    }


    @ApiPermission(permissions = {Permission.DataRoom.ADD})
    @PostMapping("/add")
    @ApiOperation(value = "从空白新增大屏/组件", position = 20, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> add(@RequestBody DataRoomPageDTO bigScreenPageDTO) {
        ValidatorUtils.validateEntity(bigScreenPageDTO, Insert.class);
        bigScreenPageService.add(bigScreenPageDTO);
        return R.success(bigScreenPageDTO.getCode());
    }

    @ApiPermission(permissions = {Permission.DataRoom.UPDATE})
    @PostMapping("/update")
    @ApiOperation(value = "修改大屏/组件", position = 30, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> update(@RequestBody DataRoomPageDTO bigScreenPageDTO) {
        if (Boolean.TRUE.equals(bigScreenPageDTO.getIsPreview())) {
            // 保存到预览临时缓存表
            String code = previewService.add(bigScreenPageDTO);
            return R.success(code);
        }
        ValidatorUtils.validateEntity(bigScreenPageDTO, Update.class);
        bigScreenPageService.update(bigScreenPageDTO);
        return R.success(bigScreenPageDTO.getCode());
    }

    @ApiPermission(permissions = {Permission.DataRoom.DELETE})
    @PostMapping("/delete/{code}")
    @ApiOperation(value = "删除大屏/组件", position = 40, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<Void> delete(@PathVariable String code) {
        PageEntity bigScreenPage = bigScreenPageService.getByCode(code);
        if (bigScreenPage == null) {
            return R.success();
        }
        bigScreenPageService.deleteByCode(code);
        return R.success();
    }

    @ApiPermission(permissions = {Permission.DataRoom.ADD})
    @PostMapping("/copy/{code}")
    @ApiOperation(value = "复制大屏/组件", position = 50, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> copy(@PathVariable String code) {
        PageEntity bigScreenPage = bigScreenPageService.getByCode(code);
        if (bigScreenPage == null) {
            throw new GlobalException("大屏页不存在");
        }
        String newCode = bigScreenPageService.copy(bigScreenPage);
        return R.success(newCode);
    }

    @ApiPermission(permissions = {Permission.DataRoom.ADD})
    @PostMapping("/add/template")
    @ApiOperation(value = "从模板新增大屏页", position = 20, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> addByTemplate(@RequestBody DataRoomPageDTO bigScreenPageDTO) {
        String code = bigScreenPageService.addByTemplate(bigScreenPageDTO);
        return R.success(code);
    }

    @PostMapping("/get/template")
    @ApiOperation(value = "根据模板获取配置", position = 20, produces = MediaType.APPLICATION_JSON_VALUE)
    public MixinsResp<DataRoomPageDTO> getByTemplate(@RequestBody DataRoomPageDTO bigScreenPageDTO) {
        DataRoomPageDTO config = bigScreenPageService.getConfigByTemplate(bigScreenPageDTO);
        MixinsResp<DataRoomPageDTO> resp = new MixinsResp<DataRoomPageDTO>().setData(config);
        resp.setCode(DataRoomConst.Response.Code.SUCCESS);
        return resp;
    }


    @ApiPermission
    @GetMapping("/bg/list")
    @ApiOperation(value = "背景图片列表", position = 60, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<List<StaticFileVO>> getBgList() {
        List<String> staticFileList = Webjars.BIG_SCREEN_BG;
        List<StaticFileVO> bgList = Lists.newArrayList();
        String urlPrefix = bigScreenConfig.getFile().getUrlPrefix() + "bigScreenBg/";
        for (String fileName : staticFileList) {
            StaticFileVO fileVO = new StaticFileVO();
            fileVO.setUrl(urlPrefix + fileName);
            fileVO.setName(fileName);
            bgList.add(fileVO);
        }
        return R.success(bgList);
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
    @ApiOperation(value = "大屏/组件名称是否重复", position = 60, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<Boolean> nameRepeat(@RequestBody PageEntity pageEntity) {
        boolean repeat = bigScreenPageService.checkNameRepeat(pageEntity);
        return R.success(repeat);
    }
}
