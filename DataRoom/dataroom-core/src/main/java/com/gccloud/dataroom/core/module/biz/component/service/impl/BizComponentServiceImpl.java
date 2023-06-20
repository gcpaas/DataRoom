package com.gccloud.dataroom.core.module.biz.component.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.module.biz.component.dao.BizComponentDao;
import com.gccloud.dataroom.core.module.biz.component.dto.BizComponentSearchDTO;
import com.gccloud.dataroom.core.module.biz.component.entity.BizComponentEntity;
import com.gccloud.dataroom.core.module.biz.component.service.IBizComponentService;
import com.gccloud.dataroom.core.utils.CodeGenerateUtils;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.vo.PageVO;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/5 13:35
 */
@Slf4j
@Service
public class BizComponentServiceImpl extends ServiceImpl<BizComponentDao, BizComponentEntity> implements IBizComponentService {

    @Resource
    private DataRoomConfig bigScreenConfig;

    @Override
    public PageVO<BizComponentEntity> getPage(BizComponentSearchDTO searchDTO) {
        LambdaQueryWrapper<BizComponentEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(StringUtils.isNotBlank(searchDTO.getName()), BizComponentEntity::getName, searchDTO.getName());
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getType()), BizComponentEntity::getType, searchDTO.getType());
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
            if (StringUtils.isBlank(entity.getCoverPicture())) {
                continue;
            }
            entity.setCoverPicture(urlPrefix + entity.getCoverPicture().replace("\\", "/"));
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
        try {
            // 去除base64字符串前缀，从初始位置，到逗号位置
            base64String = base64String.substring(base64String.indexOf(",") + 1);
            // 解码base64字符串
            byte[] imageBytes = Base64.getDecoder().decode(base64String);
            String basePath = bigScreenConfig.getFile().getBasePath();
            // 不是/结尾，加上/
            if (!basePath.endsWith("/") || !basePath.endsWith("\\")) {
                basePath += File.separator;
            }
            // 检查目录是否存在，不存在则创建
            File file = new File(basePath + "cover");
            if (!file.exists()) {
                file.mkdirs();
            }
            // 保存为图片文件
            String filePath = basePath + "cover" + File.separator + fileName + ".png";
            fileUrl = "cover" + File.separator + fileName + ".png";
            FileOutputStream outputStream = new FileOutputStream(filePath);
            outputStream.write(imageBytes);
            outputStream.close();
            log.info("大屏封面保存至：{}", filePath);
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return fileUrl;
    }

    @Override
    public String copy(String code) {
        BizComponentEntity copyFrom = this.getInfoByCode(code);
        if (copyFrom == null) {
            throw new GlobalException("源业务组件不存在");
        }
        copyFrom.setId(null);
        copyFrom.setName(copyFrom.getName() + "_复制");
        while(this.checkName(null, copyFrom.getName())) {
            copyFrom.setName(copyFrom.getName() + "_复制");
        }
        copyFrom.setCode(CodeGenerateUtils.generate("bizComponent"));
        this.save(copyFrom);
        return copyFrom.getCode();
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
        queryWrapper.eq(BizComponentEntity::getName, name);
        if (StringUtils.isNotBlank(id)) {
            queryWrapper.ne(BizComponentEntity::getId, id);
        }
        return this.count(queryWrapper) > 0;
    }
}
