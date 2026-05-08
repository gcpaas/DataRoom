package com.gccloud.gcpaas.core.page;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.gccloud.gcpaas.core.bean.PageVo;
import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.constant.DataRoomRole;
import com.gccloud.gcpaas.core.constant.PageStatus;
import com.gccloud.gcpaas.core.constant.PageType;
import com.gccloud.gcpaas.core.entity.PageEntity;
import com.gccloud.gcpaas.core.entity.PageStageEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.mapper.PageMapper;
import com.gccloud.gcpaas.core.page.bean.BasePageConfig;
import com.gccloud.gcpaas.core.page.bean.PageStageVo;
import com.gccloud.gcpaas.core.page.dto.PageOfflineDto;
import com.gccloud.gcpaas.core.page.dto.PagePublishDto;
import com.gccloud.gcpaas.core.page.dto.PageStageSearchDto;
import com.gccloud.gcpaas.core.page.service.PageService;
import com.gccloud.gcpaas.core.page.service.PageStageService;
import com.gccloud.gcpaas.core.util.CodeWorker;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * 页面
 */
@Slf4j
@RestController
@Controller
@Tag(name = "页面")
@ApiSort(value = 10)
@RequestMapping("/dataRoom/page")
public class PageController {
    @Resource
    private PageService pageService;
    @Resource
    private PageMapper pageMapper;
    @Resource
    private PageStageService pageStageService;

    /**
     * 列表查询
     *
     * @param name
     * @return
     */
    @GetMapping("/list")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "列表查询", description = "根据名称查询")
    @Parameters({
            @Parameter(name = "name", description = "页面名称", in = ParameterIn.QUERY),
            @Parameter(name = "parentCode", description = "目录编码", in = ParameterIn.QUERY)
    })
    public Resp<List<PageEntity>> list(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "parentCode", required = false) String parentCode) {
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(StringUtils.isNotBlank(parentCode), PageEntity::getParentCode, parentCode);
        queryWrapper.like(StringUtils.isNotBlank(name), PageEntity::getName, name);
        queryWrapper.orderByDesc(PageEntity::getUpdateDate);
        List<PageEntity> list = pageService.list(queryWrapper);
        return Resp.success(list);
    }

    /**
     * 详情查询
     *
     * @param code
     * @return
     */
    @GetMapping("/detail/{code}")
    @RequiresRoles(value = DataRoomRole.SHARER)
    @Operation(summary = "详情", description = "根据编码查询")
    @Parameters({@Parameter(name = "code", description = "页面编码", in = ParameterIn.PATH)})
    public Resp<PageEntity> detail(@PathVariable("code") String code) {
        PageEntity pageDesignEntity = pageMapper.getByCode(code);
        return Resp.success(pageDesignEntity);
    }

    /**
     * 新增
     *
     * @param pageEntity
     * @return
     */
    @PostMapping("/insert")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "新增", description = "新增页面")
    public Resp<String> insert(@RequestBody PageEntity pageEntity) {
        log.info("新增页面 {}", pageEntity);
        if (StringUtils.isBlank(pageEntity.getCode())) {
            pageEntity.setCode(CodeWorker.generateCode(null));
        }
        pageEntity.setPageStatus(PageStatus.DESIGN);
        pageService.save(pageEntity);
        if (PageType.DIRECTORY != pageEntity.getPageType()) {
            // 新增一个开发态
            PageStageEntity pageStage = new PageStageEntity();
            pageStage.setPageCode(pageEntity.getCode());
            pageStage.setRemark("初始化新建");
            pageStage.setPageStatus(PageStatus.DESIGN);
            pageStage.setPageType(pageEntity.getPageType());
            BasePageConfig basePageConfig = pageStageService.getDefaultPageConfig(pageEntity.getPageType().getType());
            pageStage.setPageConfig(basePageConfig);
            pageStageService.save(pageStage);
        }
        return Resp.success(pageEntity.getId());
    }

    /**
     * 更新
     *
     * @param pageDesignEntity
     * @return
     */
    @PostMapping("/update")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "更新", description = "更新页面")
    public Resp<String> update(@RequestBody PageEntity pageDesignEntity) {
        pageDesignEntity.setUpdateDate(new Date());
        pageService.updateById(pageDesignEntity);
        return Resp.success(pageDesignEntity.getId());
    }

    /**
     * 发布
     *
     * @param pagePublishDto
     * @return
     * @throws JsonProcessingException
     */
    @PostMapping("/publish")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "发布", description = "发布页面")
    public Resp<String> publish(@RequestBody PagePublishDto pagePublishDto) throws JsonProcessingException {
        // 修改发布状态
        LambdaUpdateWrapper<PageEntity> updateWrapper = new LambdaUpdateWrapper<PageEntity>()
                .set(PageEntity::getPageStatus, PageStatus.PUBLISHED)
                .set(PageEntity::getUpdateDate, new Date())
                .eq(PageEntity::getCode, pagePublishDto.getPageCode());
        pageService.update(updateWrapper);

        // 历史发布转为记录
        LambdaUpdateWrapper<PageStageEntity> pageStateUpdateWrapper = new LambdaUpdateWrapper<PageStageEntity>()
                .eq(PageStageEntity::getPageStatus, PageStatus.PUBLISHED)
                .eq(PageStageEntity::getPageCode, pagePublishDto.getPageCode())
                .set(PageStageEntity::getUpdateDate, new Date())
                .set(PageStageEntity::getRemark, "发布自动备份")
                .set(PageStageEntity::getPageStatus, PageStatus.HISTORY);
        pageStageService.update(pageStateUpdateWrapper);

        // 设计态生成发布
        PageStageEntity pageStage = pageStageService.getByCode(pagePublishDto.getPageCode(), PageStatus.DESIGN);
        PageStageEntity newPageStage = new PageStageEntity();
        BeanUtils.copyProperties(pageStage, newPageStage);
        newPageStage.setId(null);
        newPageStage.setPageStatus(PageStatus.PUBLISHED);
        newPageStage.setRemark(pagePublishDto.getRemark());
        pageStageService.save(newPageStage);
        return Resp.success(pageStage.getId());
    }

    /**
     * 取消发布
     *
     * @param pageOfflineDto
     * @return
     * @throws JsonProcessingException
     */
    @PostMapping("/offline")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "取消发布", description = "取消发布")
    public Resp<Void> offline(@RequestBody PageOfflineDto pageOfflineDto) {
        LambdaUpdateWrapper<PageEntity> updateWrapper = new LambdaUpdateWrapper<PageEntity>()
                .set(PageEntity::getPageStatus, PageStatus.DESIGN)
                .set(PageEntity::getUpdateDate, new Date())
                .eq(PageEntity::getCode, pageOfflineDto.getCode());
        pageService.update(updateWrapper);

        // 历史发布转为记录
        LambdaUpdateWrapper<PageStageEntity> pageStateUpdateWrapper = new LambdaUpdateWrapper<PageStageEntity>()
                .eq(PageStageEntity::getPageStatus, PageStatus.PUBLISHED)
                .eq(PageStageEntity::getPageCode, pageOfflineDto.getCode())
                .set(PageStageEntity::getUpdateDate, new Date())
                .set(PageStageEntity::getRemark, pageOfflineDto.getRemark())
                .set(PageStageEntity::getPageStatus, PageStatus.HISTORY);
        pageStageService.update(pageStateUpdateWrapper);
        return Resp.success(null);
    }

    /**
     * 删除
     *
     * @param pageCode
     * @return
     */
    @PostMapping("/delete/{code}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "删除", description = "根据编码删除")
    @Parameters({@Parameter(name = "code", description = "页面编码", in = ParameterIn.PATH)})
    public Resp<Void> delete(@PathVariable("code") String pageCode) {

        LambdaQueryWrapper<PageStageEntity> deleteStageWrapper = new LambdaQueryWrapper<>();
        deleteStageWrapper.eq(PageStageEntity::getPageCode, pageCode);
        pageStageService.remove(deleteStageWrapper);

        LambdaQueryWrapper<PageEntity> deleteDesignWrapper = new LambdaQueryWrapper<>();
        deleteDesignWrapper.eq(PageEntity::getCode, pageCode);
        pageService.remove(deleteDesignWrapper);

        return Resp.success(null);
    }

    /**
     * 更新页面配置、仅能更新设计态
     *
     * @param pageStage
     * @return
     */
    @PostMapping("/updatePageConfig")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "更新页面配置", description = "更新页面配置")
    public Resp<Boolean> updatePageConfig(@RequestBody PageStageEntity pageStage) {
        LambdaUpdateWrapper<PageStageEntity> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.set(PageStageEntity::getPageConfig, JSON.toJSONString(pageStage.getPageConfig()));
        updateWrapper.eq(PageStageEntity::getPageCode, pageStage.getPageCode());
        updateWrapper.eq(PageStageEntity::getPageStatus, PageStatus.DESIGN);
        updateWrapper.set(PageStageEntity::getUpdateDate, new Date());
        pageStageService.update(updateWrapper);
        return Resp.success(true);
    }

    /**
     * 更新页面配置、仅能更新预览态
     *
     * @param pageStage
     * @return
     */
    @PostMapping("/updatePageConfig4Preview")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "更新页面配置", description = "更新页面配置")
    public Resp<Boolean> updatePageConfig4Preview(@RequestBody PageStageEntity pageStage) {
        // 查看是否有预览态
        PageStageEntity pageStageEntity = pageStageService.getByCode(pageStage.getPageCode(), PageStatus.PREVIEW);
        if (pageStageEntity == null) {
            // 新增一个预览态
            PageStageEntity newPageStage = new PageStageEntity();
            newPageStage.setPageCode(pageStage.getPageCode());
            newPageStage.setRemark("初始化预览");
            newPageStage.setPageStatus(PageStatus.PREVIEW);
            newPageStage.setPageType(pageStage.getPageType());
            BasePageConfig basePageConfig = pageStageService.getDefaultPageConfig(pageStage.getPageType().getType());
            newPageStage.setPageConfig(basePageConfig);
            pageStageService.save(newPageStage);
        } else {
            // 更新
            LambdaUpdateWrapper<PageStageEntity> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.set(PageStageEntity::getPageConfig, JSON.toJSONString(pageStage.getPageConfig()));
            updateWrapper.eq(PageStageEntity::getPageCode, pageStage.getPageCode());
            updateWrapper.eq(PageStageEntity::getPageStatus, PageStatus.PREVIEW);
            updateWrapper.set(PageStageEntity::getUpdateDate, new Date());
            pageStageService.update(updateWrapper);
        }
        return Resp.success(true);
    }

    /**
     * 获取指定页面指定状态数据
     *
     * @param pageCode
     * @param pageStatusStr
     * @return
     */
    @GetMapping("/getPageConfig/{pageCode}/{pageStatus}")
    @RequiresRoles(value = DataRoomRole.SHARER)
    @Operation(summary = "获取页面配置", description = "获取页面配置,仅支持获取设计态、预览态、发布态")
    public Resp<PageStageVo> getPageConfig(@PathVariable("pageCode") String pageCode, @PathVariable("pageStatus") String pageStatusStr) {
        PageStatus pageStatus = PageStatus.valueOf(pageStatusStr.toUpperCase());
        LambdaQueryWrapper<PageStageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageStageEntity::getPageCode, pageCode);
        queryWrapper.eq(PageStageEntity::getPageStatus, pageStatus);
        PageStageEntity stageEntity = pageStageService.getOne(queryWrapper);
        if (stageEntity == null) {
            log.error("未找到 pageCode:{} pageStatus:{} 的页面数据", pageCode, pageStatus);
            throw new DataRoomException("页面对应的数据不存在");
        }
        // 根据编码获取页面数据
        PageEntity pageEntity = pageMapper.getByCode(pageCode);
        PageStageVo stageVo = new PageStageVo();
        BeanUtils.copyProperties(stageEntity, stageVo);
        stageVo.setName(pageEntity.getName());
        // 做一些兼容性操作
        stageVo.compat();
        return Resp.success(stageVo);
    }

    /**
     * 获取页面中转状态列表
     *
     * @param stageSearch
     * @return
     * @throws ParseException
     */
    @GetMapping("/stage/list")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "历史记录", description = "根据时间、状态查询历史")
    public Resp<PageVo<PageStageEntity>> stagePage(PageStageSearchDto stageSearch) throws ParseException {
        Page<PageStageEntity> searchPage = new Page<>(stageSearch.getCurrent(), stageSearch.getSize());
        LambdaQueryWrapper<PageStageEntity> queryWrapper = new LambdaQueryWrapper<>();
        // 排除的字段
        List<String> excludeFields = Lists.newArrayList("pageConfig");
        queryWrapper.select(PageStageEntity.class, tableFieldInfo -> {
            if (excludeFields.contains(tableFieldInfo.getProperty())) {
                return false;
            }
            return true;
        });
        queryWrapper.eq(PageStageEntity::getPageCode, stageSearch.getCode());
        queryWrapper.eq(stageSearch.getPageStatus() != null, PageStageEntity::getPageStatus, stageSearch.getPageStatus());
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        queryWrapper.ge(StringUtils.isNotBlank(stageSearch.getStartDate()), PageStageEntity::getCreateDate, sdf.parse(stageSearch.getStartDate()));
        queryWrapper.lt(StringUtils.isNotBlank(stageSearch.getEndDate()), PageStageEntity::getCreateDate, sdf.parse(stageSearch.getEndDate()));
        Page<PageStageEntity> page = pageStageService.page(searchPage, queryWrapper);
        return Resp.success(PageVo.build(page));
    }

    /**
     * 删除中转记录
     *
     * @param id
     * @return
     */
    @PostMapping("/stage/delete/{id}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "删除单条历史", description = "根据主键删除历史")
    @Parameters({@Parameter(name = "id", description = "历史主键", in = ParameterIn.PATH)})
    public Resp<String> stageDelete(@PathVariable("id") String id) {
        pageStageService.removeById(id);
        return Resp.success(id);
    }

    /**
     * 清空历史、快照记录
     *
     * @return
     */
    @PostMapping("/stage/clear/{code}/{state}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "历史清空", description = "根据页面编码清空对应历史")
    @Parameters({@Parameter(name = "code", description = "页面编码", in = ParameterIn.PATH)})
    public Resp<Void> stageClear(@PathVariable("code") String code, @PathVariable("state") String state) {
        PageStatus pageStatus = PageStatus.valueOf(state.toUpperCase());
        if (!(pageStatus == PageStatus.HISTORY || pageStatus == PageStatus.SNAPSHOT)) {
            throw new DataRoomException("状态错误");
        }
        LambdaQueryWrapper<PageStageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageStageEntity::getPageCode, code);
        queryWrapper.eq(PageStageEntity::getPageStatus, pageStatus);
        pageStageService.remove(queryWrapper);
        return Resp.success(null);
    }

    /**
     * 回退到某个历史、快照
     *
     * @param id
     * @return
     */
    @PostMapping("/stage/rollback/{id}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "回退", description = "根据历史记录回退")
    @Parameters({@Parameter(name = "id", description = "历史记录ID", in = ParameterIn.PATH)})
    public Resp<String> stageRollback(@PathVariable("id") String id) {
        PageStageEntity pageStage = pageStageService.getById(id);

        // 当前设计态修改为历史
        LambdaUpdateWrapper<PageStageEntity> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(PageStageEntity::getPageCode, pageStage.getPageCode());
        updateWrapper.eq(PageStageEntity::getPageStatus, PageStatus.DESIGN);
        updateWrapper.set(PageStageEntity::getUpdateDate, new Date());
        updateWrapper.set(PageStageEntity::getPageStatus, PageStatus.HISTORY);
        pageStageService.update(updateWrapper);

        // 历史态转为设计态
        updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(PageStageEntity::getId, id);
        updateWrapper.set(PageStageEntity::getUpdateDate, new Date());
        updateWrapper.set(PageStageEntity::getPageStatus, PageStatus.DESIGN);
        pageStageService.update(updateWrapper);

        return Resp.success(id);
    }

}