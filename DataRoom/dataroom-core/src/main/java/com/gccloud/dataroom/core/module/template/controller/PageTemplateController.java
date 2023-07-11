package com.gccloud.dataroom.core.module.template.controller;

import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.module.template.dto.PageTemplateDTO;
import com.gccloud.dataroom.core.module.template.dto.PageTemplateSearchDTO;
import com.gccloud.dataroom.core.module.template.entity.PageTemplateEntity;
import com.gccloud.dataroom.core.module.template.service.IPageTemplateService;
import com.gccloud.dataroom.core.module.template.vo.PageTemplateVO;
import com.gccloud.common.controller.SuperController;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.validator.ValidatorUtils;
import com.gccloud.common.validator.group.Insert;
import com.gccloud.common.validator.group.Update;
import com.gccloud.common.vo.PageVO;
import com.gccloud.common.vo.R;
import io.swagger.annotations.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/20 16:38
 */
@RestController("dataRoomPageTemplateController")
@RequestMapping("/bigScreen/template")
@Api(tags = "页面模板")
@ApiSort(value = 10)
@Slf4j
public class PageTemplateController extends SuperController {

    @Resource
    private IPageTemplateService pageTemplateService;

    @Resource
    private DataRoomConfig bigScreenConfig;

    /**
     * 分页条件查询
     *
     * @param searchDTO
     * @return
     */
    @GetMapping("/page")
    @ApiOperation(value = "分页查询", position = 10, notes = "分页查询列表", produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiImplicitParams({@ApiImplicitParam(name = "current", value = "页码", paramType = "query", required = true, dataType = "int"), @ApiImplicitParam(name = "size", value = "每页条数", paramType = "query", required = true, dataType = "int"), @ApiImplicitParam(name = "searchKey", value = "查询条件", paramType = "query", dataType = "string")})
    public R<PageVO<PageTemplateVO>> getPage(@ApiParam(name = "查询", value = "传入查询的业务条件", required = true) PageTemplateSearchDTO searchDTO) {
        PageVO<PageTemplateEntity> page = pageTemplateService.getPage(searchDTO);
        PageVO<PageTemplateVO> pageVO = BeanConvertUtils.convertPage(page, PageTemplateVO.class, (source, target) -> {
            // 如果缩略图的不是http开头的，那么就拼接上当前服务后端地址
            if (target.getThumbnail() != null && !target.getThumbnail().startsWith("http")) {
                target.setThumbnail(bigScreenConfig.getFile().getUrlPrefix() + target.getThumbnail());
            }
        });
        return success(pageVO);
    }

    /**
     * 列表查询
     *
     * @param searchDTO
     * @return
     */
    @GetMapping("/list")
    @ApiOperation(value = "列表查询", position = 10, notes = "查询列表", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<List<PageTemplateVO>> getList(@ApiParam(name = "查询", value = "传入查询的业务条件", required = true) PageTemplateSearchDTO searchDTO) {
        List<PageTemplateEntity> list = pageTemplateService.getList(searchDTO);
        List<PageTemplateVO> voList = BeanConvertUtils.convert(list, PageTemplateVO.class, (source, target) -> {
            // 如果缩略图的不是http开头的，那么就拼接上当前服务后端地址
            if (target.getThumbnail() != null && !target.getThumbnail().startsWith("http")) {
                target.setThumbnail(bigScreenConfig.getFile().getUrlPrefix() + target.getThumbnail());
            }
        });
        return success(voList);
    }

    /**
     * 根据id获取详情
     *
     * @param id
     * @return
     */
    @GetMapping("/info/{id}")
    @ApiOperation(value = "详情", position = 20, notes = "获取详情", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<PageTemplateVO> getById(@ApiParam(name = "id", value = "传入String格式", required = true) @PathVariable("id") String id) {
        PageTemplateEntity pageTemplateEntity = pageTemplateService.getById(id);
        PageTemplateVO vo = BeanConvertUtils.convert(pageTemplateEntity, PageTemplateVO.class);
        return success(vo);
    }

    /**
     * 保存
     *
     * @param pageTemplateDTO
     * @return
     */
    @PostMapping("/add")
    @ApiOperation(value = "新增", position = 30, notes = "新增数据", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> add(@ApiParam(name = "新增对象", value = "传入json格式", required = true) @RequestBody PageTemplateDTO pageTemplateDTO) {
        ValidatorUtils.validateEntity(pageTemplateDTO, Insert.class);
        PageTemplateEntity pageTemplateEntity = BeanConvertUtils.convert(pageTemplateDTO, PageTemplateEntity.class);
        String id = pageTemplateService.add(pageTemplateEntity);
        return success(id);
    }

    /**
     * 修改
     *
     * @param pageTemplateDTO
     * @return
     */
    @PostMapping("/update")
    @ApiOperation(value = "更新", position = 40, notes = "更新数据", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public R<Void> update(@ApiParam(name = "更新对象", value = "传入json格式", required = true) @RequestBody PageTemplateDTO pageTemplateDTO) {
        ValidatorUtils.validateEntity(pageTemplateDTO, Update.class);
        // 更新实体
        PageTemplateEntity pageTemplateEntity = BeanConvertUtils.convert(pageTemplateDTO, PageTemplateEntity.class);
        pageTemplateService.update(pageTemplateEntity);
        return success();
    }

    /**
     * 删除数据
     *
     * @param idList
     * @return
     */
    @PostMapping("/delete")
    @ApiOperation(value = "删除", position = 50, notes = "删除", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<Void> deleteById(@ApiParam(name = "id列表", value = "传入id列表", required = true) @RequestBody List<String> idList) {
        pageTemplateService.deleteByIds(idList);
        return success();
    }
}
