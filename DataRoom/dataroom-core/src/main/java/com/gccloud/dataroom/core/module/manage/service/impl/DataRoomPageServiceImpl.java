package com.gccloud.dataroom.core.module.manage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.basic.dao.DataRoomPageDao;
import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.dataroom.core.module.basic.entity.PagePreviewEntity;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import com.gccloud.dataroom.core.module.chart.bean.Linkage;
import com.gccloud.dataroom.core.module.chart.components.datasource.DataSetDataSource;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomFileService;
import com.gccloud.dataroom.core.module.file.service.IDataRoomOssService;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomSearchDTO;
import com.gccloud.dataroom.core.module.manage.extend.DataRoomExtendClient;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPagePreviewService;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPageService;
import com.gccloud.dataroom.core.module.template.entity.PageTemplateEntity;
import com.gccloud.dataroom.core.module.template.service.IPageTemplateService;
import com.gccloud.dataroom.core.permission.DataRoomPermissionClient;
import com.gccloud.dataroom.core.utils.CodeGenerateUtils;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.AssertUtils;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.vo.PageVO;
import com.gccloud.dataroom.core.utils.PathUtils;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.tomcat.util.http.fileupload.FileItem;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.annotation.Resource;
import java.io.*;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 11:05
 */
@Service
@Slf4j
public class DataRoomPageServiceImpl extends ServiceImpl<DataRoomPageDao, PageEntity> implements IDataRoomPageService {


    @Resource
    private IPageTemplateService pageTemplateService;

    @Resource
    private DataRoomConfig bigScreenConfig;

    @Resource
    private DataRoomExtendClient dataRoomExtendClient;

    @Resource
    private DataRoomPermissionClient permissionClient;

    @Resource
    private IDataRoomPagePreviewService previewService;

    @Resource
    private IDataRoomOssService ossService;

    @Override
    public PageEntity getByCode(String code) {
        if (code.startsWith(IDataRoomPagePreviewService.PREVIEW_KEY)) {
            PagePreviewEntity preview = previewService.getByCode(code);
            return BeanConvertUtils.convert(preview, PageEntity.class);
        }
        return IDataRoomPageService.super.getByCode(code);
    }

    @Override
    public String add(DataRoomPageDTO bigScreenPageDTO) {
        if (StringUtils.isBlank(bigScreenPageDTO.getCode())) {
            String code = CodeGenerateUtils.generate(bigScreenPageDTO.getType());
            bigScreenPageDTO.setCode(code);
        }
        List<Chart> chartList = bigScreenPageDTO.getChartList();
        if (CollectionUtils.isEmpty(chartList)) {
            chartList = Lists.newArrayList();
        }
        for (Chart chart : chartList) {
            if (StringUtils.isNotBlank(chart.getCode())) {
                continue;
            }
            chart.setCode(CodeGenerateUtils.generate(chart.getType() == null ? "chart" : chart.getType()));
        }
        if (StringUtils.isNotBlank(bigScreenPageDTO.getCoverPicture())) {
            String base64Str = bigScreenPageDTO.getCoverPicture();
            String fileUrl = this.saveCoverPicture(base64Str, bigScreenPageDTO.getCode());
            bigScreenPageDTO.setCoverPicture(fileUrl);
        }
        PageEntity bigScreenEntity = BeanConvertUtils.convert(bigScreenPageDTO, PageEntity.class);
        bigScreenEntity.setConfig(bigScreenPageDTO);
        AssertUtils.isTrue(!checkNameRepeat(bigScreenEntity), "名称重复");
        AssertUtils.isTrue(!checkCodeRepeat(bigScreenEntity), "编码重复");
        this.save(bigScreenEntity);
        dataRoomExtendClient.afterAdd(bigScreenEntity.getCode());
        return bigScreenEntity.getCode();
    }


    /**
     * 将base64字符串转为图片文件存储
     *
     * @param base64String
     * @param fileName
     * @return
     */
    private String saveCoverPicture(String base64String, String fileName) {
        String fileUrl = "";
        if (StringUtils.isBlank(base64String)) {
            return fileUrl;
        }
        // 如果不是base64字符串，直接返回 NOTE 因为如果前端截图失败，会将原封面地址传过来
        if (!base64String.startsWith("data:image")) {
            return base64String;
        }
        try {
            // 去除base64字符串前缀，从初始位置，到逗号位置
            base64String = base64String.substring(base64String.indexOf(",") + 1);
            // 解码base64字符串
            byte[] imageBytes = Base64.getDecoder().decode(base64String);
            InputStream inputStream = new ByteArrayInputStream(imageBytes);
            DataRoomFileEntity fileEntity = new DataRoomFileEntity();
            String filePath = "cover" + File.separator + fileName + ".png";
            ossService.upload(inputStream, filePath, 0, fileEntity);
            // 封面先不保存到资源库
            // fileService.save(fileEntity);
            log.info("大屏封面保存至：{}", filePath);
            fileUrl = fileEntity.getUrl();
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return fileUrl;
    }


    /**
     * 复制封面文件
     * @param oldFileName
     * @param newFileName
     * @return
     */
    private String copyCoverPicture(String oldFileName, String newFileName) {
        if (StringUtils.isBlank(oldFileName)) {
            return "";
        }
        String oldFile = "cover" + File.separator + oldFileName + ".png";
        String newFilePath = "cover" + File.separator + newFileName + ".png";
        return ossService.copy(oldFile, newFilePath);
    }

    @Override
    public String addByTemplate(DataRoomPageDTO bigScreenPageDTO) {
        if (StringUtils.isBlank(bigScreenPageDTO.getPageTemplateId())) {
            throw new GlobalException("页面模板不能为空");
        }
        bigScreenPageDTO = getConfigByTemplate(bigScreenPageDTO);
        return add(bigScreenPageDTO);
    }

    @Override
    public DataRoomPageDTO getConfigByTemplate(DataRoomPageDTO bigScreenPageDTO) {
        String pageTemplateId = bigScreenPageDTO.getPageTemplateId();
        PageTemplateEntity pageTemplate = pageTemplateService.getById(pageTemplateId);
        AssertUtils.isTrue(pageTemplate != null, "页面模板不存在");
        AssertUtils.isTrue(Objects.equals(pageTemplate.getType(), PageDesignConstant.Type.BIG_SCREEN), "页面模板类型不正确");
        DataRoomPageDTO config = (DataRoomPageDTO) pageTemplate.getConfig();
        String name = bigScreenPageDTO.getName();
        if (StringUtils.isBlank(name)) {
            int i = 0;
            String newName = pageTemplate.getName() + "副本";
            while (checkNameRepeat(bigScreenPageDTO.getAppCode(), newName, null, "bigScreen")) {
                i++;
                newName = pageTemplate.getName() + "副本" + i;
            }
            name = newName;
        }
        config.setName(name);
        config.setCode(bigScreenPageDTO.getCode());
        config.setParentCode(bigScreenPageDTO.getParentCode());
        config.setId(bigScreenPageDTO.getId());
        config.setAppCode(bigScreenPageDTO.getAppCode());
        List<Chart> chartList = config.getChartList();
        if (CollectionUtils.isEmpty(chartList)) {
            chartList = Lists.newArrayList();
        }
        for (Chart chart : chartList) {
            chart.setCode("");
            chart.setDataSource(new DataSetDataSource());
        }
        return config;
    }

    @Override
    public PageVO<PageEntity> getByCategory(DataRoomSearchDTO searchDTO) {
        if (StringUtils.isBlank(searchDTO.getType())) {
            throw new GlobalException("类型不能为空");
        }
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(StringUtils.isNotBlank(searchDTO.getSearchKey()), PageEntity::getName, searchDTO.getSearchKey());
        if (StringUtils.isNotBlank(searchDTO.getParentCode())) {
            queryWrapper.eq(PageEntity::getParentCode, searchDTO.getParentCode());
        }
        queryWrapper.eq(PageEntity::getType, searchDTO.getType());
        queryWrapper.select(PageEntity::getCode);
        List<PageEntity> idEntityList = this.list(queryWrapper);
        if (idEntityList == null || idEntityList.isEmpty()) {
            PageVO<PageEntity> pageVO = new PageVO<>();
            pageVO.setList(Lists.newArrayList());
            return pageVO;
        }
        List<String> codeList = idEntityList.stream().map(PageEntity::getCode).collect(Collectors.toList());
        List<String> filterByPermission = permissionClient.filterByPermission(codeList);
        if (filterByPermission == null || filterByPermission.isEmpty()) {
            PageVO<PageEntity> pageVO = new PageVO<>();
            pageVO.setList(Lists.newArrayList());
            return pageVO;
        }
        LambdaQueryWrapper<PageEntity> reQueryWrapper =  new LambdaQueryWrapper<>();
        if (idEntityList.size() == filterByPermission.size()) {
            // 说明没有过滤掉任何一个, 按照原来的条件查询
            reQueryWrapper = queryWrapper;
        } else {
            // 说明过滤掉了一些, 按照过滤后的编码查询
            reQueryWrapper.in(PageEntity::getCode, filterByPermission);
        }
        reQueryWrapper.select(PageEntity::getId, PageEntity::getAppCode, PageEntity::getCode, PageEntity::getName, PageEntity::getParentCode, PageEntity::getOrderNum, PageEntity::getCoverPicture, PageEntity::getUpdateDate);
        // 优先序号升序，其次创建时间降序
        reQueryWrapper.orderByAsc(PageEntity::getOrderNum);
        reQueryWrapper.orderByDesc(PageEntity::getCreateDate);
        PageVO<PageEntity> page = this.page(searchDTO, reQueryWrapper);
        List<PageEntity> list = page.getList();
        if (list == null || list.isEmpty()) {
            return page;
        }
        String urlPrefix = bigScreenConfig.getFile().getUrlPrefix();
        if (!urlPrefix.endsWith("/")) {
            urlPrefix += "/";
        }
        for (PageEntity pageEntity : list) {
            String coverPicture = pageEntity.getCoverPicture();
            if (StringUtils.isBlank(coverPicture)) {
                continue;
            }
            if (coverPicture.startsWith("/")) {
                coverPicture = coverPicture.substring(1);
            }
            pageEntity.setCoverPicture(urlPrefix + PathUtils.normalizePath(coverPicture));
        }
        return page;
    }


    @Override
    public void update(DataRoomPageDTO bigScreenPageDTO) {
        AssertUtils.isTrue(StringUtils.isNotBlank(bigScreenPageDTO.getCode()), "编码不能为空");
        AssertUtils.isTrue(StringUtils.isNotBlank(bigScreenPageDTO.getName()), "名称不能为空");
        List<Chart> chartList = bigScreenPageDTO.getChartList();
        if (CollectionUtils.isNotEmpty(chartList)) {
            for (Chart chart : chartList) {
                if (StringUtils.isNotBlank(chart.getCode())) {
                    continue;
                }
                chart.setCode(CodeGenerateUtils.generate(chart.getType() == null ? "chart" : chart.getType()));
            }
        }
        if (StringUtils.isNotBlank(bigScreenPageDTO.getCoverPicture())) {
            String coverPicture = this.saveCoverPicture(bigScreenPageDTO.getCoverPicture(), bigScreenPageDTO.getCode());
            bigScreenPageDTO.setCoverPicture(coverPicture);
        }
        PageEntity bigScreenEntity = BeanConvertUtils.convert(bigScreenPageDTO, PageEntity.class);
        bigScreenEntity.setConfig(bigScreenPageDTO);
        AssertUtils.isTrue(!checkNameRepeat(bigScreenEntity), "名称重复");
        AssertUtils.isTrue(!checkCodeRepeat(bigScreenEntity), "编码重复");
        this.updateById(bigScreenEntity);
        PAGE_ENTITY_CACHE.invalidate(bigScreenEntity.getCode());
    }


    public static final String COPY_SUFFIX = "-副本";

    @Override
    public String copy(PageEntity screenEntity) {
        DataRoomPageDTO config = (DataRoomPageDTO) screenEntity.getConfig();
        screenEntity.setId(null);
        String oldCode = screenEntity.getCode();
        screenEntity.setCode(CodeGenerateUtils.generate(screenEntity.getType()));
        int i = 1;
        String oldName = screenEntity.getName();
        // 检查是否有 -副本，有的话从-副本开始，后面全部去掉
        if (oldName.contains(COPY_SUFFIX)) {
            oldName = oldName.substring(0, oldName.indexOf(COPY_SUFFIX));
            if (StringUtils.isBlank(oldName)) {
                oldName = "大屏";
            }
        }
        screenEntity.setName(oldName + COPY_SUFFIX);
        while (checkNameRepeat(screenEntity)) {
           // 如果重复，采取 -副本1，-副本2的方式
            screenEntity.setName(oldName + COPY_SUFFIX + i);
            i++;
        }
        config.setName(screenEntity.getName());
        config.setCode(screenEntity.getCode());
        List<Chart> chartList = config.getChartList();
        // 新旧编码映射
        Map<String, String> chartCodeMap = Maps.newHashMap();
        for (Chart chart : chartList) {
            String oldChartCode = chart.getCode();
            chart.setCode(CodeGenerateUtils.generate(chart.getType() == null ? "chart" : chart.getType()));
            chartCodeMap.put(oldChartCode, chart.getCode());
        }
        // 处理图表之间的联动
        for (Chart chart : chartList) {
            Linkage linkage = chart.getLinkage();
            if (linkage == null) {
                continue;
            }
            List<Linkage.Component> components = linkage.getComponents();
            if (components == null || components.isEmpty()) {
                continue;
            }
            for (Linkage.Component component : components) {
                String componentKey = component.getComponentKey();
                if (StringUtils.isBlank(componentKey)) {
                    continue;
                }
                String newCode = chartCodeMap.get(componentKey);
                component.setComponentKey(newCode);
            }
        }
        // 处理定时器
        DataRoomPageDTO.PageConfig pageConfig = config.getPageConfig();
        List<DataRoomPageDTO.RefreshConfig> refreshConfigList = pageConfig.getRefreshConfig();
        if (refreshConfigList != null) {
            for (DataRoomPageDTO.RefreshConfig refreshConfig : refreshConfigList) {
                String oldChartCode = refreshConfig.getCode();
                refreshConfig.setCode(chartCodeMap.get(oldChartCode));
            }
        }
        String copyUrl = this.copyCoverPicture(oldCode, screenEntity.getCode());
        if (StringUtils.isBlank(copyUrl)) {
            screenEntity.setCoverPicture(null);
        } else {
            screenEntity.setCoverPicture(copyUrl);
        }
        this.save(screenEntity);
        dataRoomExtendClient.afterAdd(screenEntity.getCode());
        return screenEntity.getCode();
    }

    @Override
    public void deleteByCode(String code) {
        LambdaQueryWrapper<PageEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageEntity::getCode, code);
        this.remove(queryWrapper);
        PAGE_ENTITY_CACHE.invalidate(code);
        // 调用拓展接口
        dataRoomExtendClient.deleteByCode(code);
        // 移除权限拓展
        dataRoomExtendClient.afterDelete(code);
    }
}
