package com.gccloud.dataroom.core.module.biz.component.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.module.biz.component.dao.DataRoomBizComponentDao;
import com.gccloud.dataroom.core.module.biz.component.dto.BizComponentSearchDTO;
import com.gccloud.dataroom.core.module.biz.component.entity.BizComponentEntity;
import com.gccloud.dataroom.core.module.biz.component.service.IBizComponentService;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomOssService;
import com.gccloud.dataroom.core.utils.CodeGenerateUtils;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.vo.PageVO;
import com.gccloud.dataroom.core.utils.PathUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.*;
import java.util.Base64;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/5 13:35
 */
@Slf4j
@Service("dataRoomBizComponentService")
public class BizComponentServiceImpl extends ServiceImpl<DataRoomBizComponentDao, BizComponentEntity> implements IBizComponentService {

    @Resource
    private DataRoomConfig bigScreenConfig;

    @Resource
    private IDataRoomOssService ossService;

    @Override
    public PageVO<BizComponentEntity> getPage(BizComponentSearchDTO searchDTO) {
        LambdaQueryWrapper<BizComponentEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(StringUtils.isNotBlank(searchDTO.getName()), BizComponentEntity::getName, searchDTO.getName());
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getType()), BizComponentEntity::getType, searchDTO.getType());
        queryWrapper.orderByAsc(BizComponentEntity::getOrderNum);
        queryWrapper.orderByDesc(BizComponentEntity::getCreateDate);
        PageVO<BizComponentEntity> page = this.page(searchDTO, queryWrapper);
        List<BizComponentEntity> list = page.getList();
        String urlPrefix = bigScreenConfig.getFile().getUrlPrefix();
        if (!urlPrefix.endsWith("/")) {
            urlPrefix += "/";
        }
        for (BizComponentEntity entity : list) {
            if (StringUtils.isBlank(entity.getCoverPicture())) {
                continue;
            }
            entity.setCoverPicture(urlPrefix + entity.getCoverPicture().replace("\\", "/"));
        }
        return page;
    }

    @Override
    public List<BizComponentEntity> getList(BizComponentSearchDTO searchDTO) {
        LambdaQueryWrapper<BizComponentEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(StringUtils.isNotBlank(searchDTO.getName()), BizComponentEntity::getName, searchDTO.getName());
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getType()), BizComponentEntity::getType, searchDTO.getType());
        List<BizComponentEntity> list = this.list(queryWrapper);
        String urlPrefix = bigScreenConfig.getFile().getUrlPrefix();
        if (!urlPrefix.endsWith("/")) {
            urlPrefix += "/";
        }
        for (BizComponentEntity entity : list) {
            if (StringUtils.isBlank(entity.getCoverPicture())) {
                continue;
            }
            entity.setCoverPicture(urlPrefix + entity.getCoverPicture().replace("\\", "/"));
        }
        return list;
    }

    @Override
    public BizComponentEntity getInfoByCode(String code) {
        if (StringUtils.isBlank(code)) {
            throw new GlobalException("组件编码不能为空");
        }
        LambdaQueryWrapper<BizComponentEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(BizComponentEntity::getCode, code);
        List<BizComponentEntity> list = list(queryWrapper);
        if (list.size() == 0) {
            throw new GlobalException("组件不存在");
        }
        BizComponentEntity bizComponentEntity = list.get(0);
        String urlPrefix = bigScreenConfig.getFile().getUrlPrefix();
        if (!urlPrefix.endsWith("/")) {
            urlPrefix += "/";
        }
        for (BizComponentEntity entity : list) {
            String coverPicture = entity.getCoverPicture();
            if (StringUtils.isBlank(coverPicture)) {
                continue;
            }
            if (coverPicture.startsWith("/")) {
                coverPicture = coverPicture.substring(1);
            }
            entity.setCoverPicture(urlPrefix + PathUtils.normalizePath(coverPicture));
        }
        return bizComponentEntity;
    }

    @Override
    public String add(BizComponentEntity entity) {
        boolean repeat = this.checkName(null, entity.getName());
        if (repeat) {
            throw new GlobalException("组件名称重复");
        }
        String code = CodeGenerateUtils.generate("bizComponent");
        entity.setCode(code);
        if (StringUtils.isNotBlank(entity.getCoverPicture())) {
            String base64Str = entity.getCoverPicture();
            String fileUrl = this.saveCoverPicture(base64Str, entity.getCode());
            entity.setCoverPicture(fileUrl);
        }
        this.save(entity);
        return code;
    }

    @Override
    public void update(BizComponentEntity entity) {
        boolean repeat = this.checkName(entity.getId(), entity.getName());
        if (repeat) {
            throw new GlobalException("组件名称重复");
        }
        if (StringUtils.isNotBlank(entity.getCoverPicture())) {
            String base64Str = entity.getCoverPicture();
            String fileUrl = this.saveCoverPicture(base64Str, entity.getCode());
            entity.setCoverPicture(fileUrl);
        }
        this.updateById(entity);
    }


    private String saveCoverPicture(String base64String, String fileName) {
        String fileUrl = "";
        if (StringUtils.isBlank(base64String)) {
            return fileUrl;
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
            log.info("组业务件封面保存至：{}", filePath);
            fileUrl = fileEntity.getUrl();
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return fileUrl;
    }


    public static final String COPY_SUFFIX = "-副本";

    @Override
    public String copy(String code) {
        BizComponentEntity copyFrom = this.getInfoByCode(code);
        if (copyFrom == null) {
            throw new GlobalException("源业务组件不存在");
        }
        String oldCode = copyFrom.getCode();
        copyFrom.setId(null);
        String oldName = copyFrom.getName();
        // 检查是否有 -副本，有的话从-副本开始，后面全部去掉
        if (oldName.contains(COPY_SUFFIX)) {
            oldName = oldName.substring(0, oldName.indexOf(COPY_SUFFIX));
            if (StringUtils.isBlank(oldName)) {
                oldName = "组件";
            }
        }
        copyFrom.setName(oldName + COPY_SUFFIX);
        int i = 1;
        while(this.checkName(null, copyFrom.getName())) {
            copyFrom.setName(oldName + COPY_SUFFIX + i);
            i++;
        }
        copyFrom.setCode(CodeGenerateUtils.generate("bizComponent"));
        String copyUrl = this.copyCoverPicture(oldCode, copyFrom.getCode());
        if (StringUtils.isBlank(copyUrl)) {
            copyFrom.setCoverPicture(null);
        } else {
            copyFrom.setCoverPicture(copyUrl);
        }
        this.save(copyFrom);
        return copyFrom.getCode();
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
        String newFilePath =  "cover" + File.separator + newFileName + ".png";
        return ossService.copy(oldFile, newFilePath);
    }

    @Override
    public void delete(String id) {
        if (StringUtils.isBlank(id)) {
            throw new GlobalException("组件id不能为空");
        }
        this.removeById(id);
    }

    @Override
    public boolean checkName(String id, String name) {
        LambdaQueryWrapper<BizComponentEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(BizComponentEntity::getId);
        queryWrapper.eq(BizComponentEntity::getName, name);
        if (StringUtils.isNotBlank(id)) {
            queryWrapper.ne(BizComponentEntity::getId, id);
        }
        return this.list(queryWrapper).size() > 0;
    }
}
