package com.gccloud.dataroom.core.module.file.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.QueryWrapperUtils;
import com.gccloud.common.vo.PageVO;
import com.gccloud.dataroom.core.module.file.dao.DataRoomFileDao;
import com.gccloud.dataroom.core.module.file.dto.FileResourceDTO;
import com.gccloud.dataroom.core.module.file.dto.FileSearchDTO;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomFileService;
import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 文件管理
 */
@Service
@Slf4j
@ConditionalOnProperty(prefix = "gc.starter.dataroom.component", name = "IDataRoomFileService", havingValue = "DataRoomFileServiceImpl", matchIfMissing = true)
public class DataRoomFileServiceImpl extends ServiceImpl<DataRoomFileDao, DataRoomFileEntity> implements IDataRoomFileService {

    @Override
    public PageVO<DataRoomFileEntity> getPage(FileSearchDTO searchDTO) {
        LambdaQueryWrapper<DataRoomFileEntity> queryWrapper = QueryWrapperUtils.wrapperLike(new LambdaQueryWrapper(),
                searchDTO.getSearchKey(), DataRoomFileEntity::getOriginalName, DataRoomFileEntity::getNewName);
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getModule()), DataRoomFileEntity::getModule, searchDTO.getModule());
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getExtension()), DataRoomFileEntity::getExtension, searchDTO.getExtension());
        queryWrapper.in(searchDTO.getType() != null && !searchDTO.getType().isEmpty(), DataRoomFileEntity::getType, searchDTO.getType());
        queryWrapper.eq(searchDTO.getHide() != null, DataRoomFileEntity::getHide, searchDTO.getHide());
        if (searchDTO.getExtensionList() != null && searchDTO.getExtensionList().size() > 0) {
            queryWrapper.in(DataRoomFileEntity::getExtension, searchDTO.getExtensionList());
        }
        queryWrapper.orderByDesc(DataRoomFileEntity::getUpdateDate);
        return page(searchDTO, queryWrapper);
    }

    @Override
    public void updateDownloadCount(Integer addCount, String fileId) {
        if (addCount <= 0) {
            throw new GlobalException("下载次数不允许为负数或0");
        }
        if (StringUtils.isBlank(fileId)) {
            throw new GlobalException("文件id不能为空");
        }
        DataRoomFileEntity fileEntity = this.getById(fileId);
        if (fileEntity == null) {
            throw new GlobalException("文件不存在");
        }
        LambdaUpdateWrapper<DataRoomFileEntity> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(DataRoomFileEntity::getId, fileId);
        updateWrapper.set(DataRoomFileEntity::getDownloadCount, fileEntity.getDownloadCount() + addCount);
        this.update(updateWrapper);
    }

    @Override
    public List<String> getAllExtension() {
        LambdaQueryWrapper<DataRoomFileEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(DataRoomFileEntity::getExtension);
        queryWrapper.groupBy(DataRoomFileEntity::getExtension);
        List<DataRoomFileEntity> list = this.list(queryWrapper);
        if (list == null || list.size() == 0) {
            return Lists.newArrayList();
        }
        return list.stream().map(DataRoomFileEntity::getExtension).collect(Collectors.toList());
    }


    @Override
    public String importResource(FileResourceDTO fileResourceDTO) {
        String path = fileResourceDTO.getPath();
        // 从url中解析出文件后缀:最后一个斜杠后面的最后一个点后面的字符串
        String extension = null;
        try {
            String pathPart = path.substring(path.lastIndexOf("/") + 1);
            extension = pathPart.substring(pathPart.lastIndexOf(".") + 1);
        } catch (Exception ignore) {
        }
        // 生成随机文件名
        String newName = System.currentTimeMillis() + (extension == null ? "" : "." + extension);
        String newUrl = "/dataroom/file/reference/" + newName;
        DataRoomFileEntity fileEntity = new DataRoomFileEntity();
        fileEntity.setModule(fileResourceDTO.getModule());
        fileEntity.setExtension(fileResourceDTO.getExtension());
        fileEntity.setOriginalName(fileResourceDTO.getOriginalName());
        fileEntity.setNewName(newName);
        fileEntity.setSize(0L);
        fileEntity.setDownloadCount(0);
        fileEntity.setUrl(newUrl);
        fileEntity.setPath(path);
        fileEntity.setType(fileResourceDTO.getType());
        fileEntity.setHide(fileResourceDTO.getHide());
        fileEntity.setCoverUrl(fileResourceDTO.getCoverUrl());
        fileEntity.setCoverId(fileResourceDTO.getCoverId());
        this.save(fileEntity);
        return fileEntity.getId();
    }

    @Override
    public void updateResource(FileResourceDTO fileResourceDTO) {
        if (StringUtils.isBlank(fileResourceDTO.getId())) {
            throw new GlobalException("文件id不能为空");
        }
        DataRoomFileEntity fileEntity = this.getById(fileResourceDTO.getId());
        if (fileEntity == null) {
            throw new GlobalException("文件不存在");
        }
        LambdaUpdateWrapper<DataRoomFileEntity> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(DataRoomFileEntity::getId, fileResourceDTO.getId());
        updateWrapper.set(DataRoomFileEntity::getModule, fileResourceDTO.getModule());
        updateWrapper.set(DataRoomFileEntity::getExtension, fileResourceDTO.getExtension());
        updateWrapper.set(DataRoomFileEntity::getOriginalName, fileResourceDTO.getOriginalName());
        updateWrapper.set(DataRoomFileEntity::getHide, fileResourceDTO.getHide());
        updateWrapper.set(DataRoomFileEntity::getCoverUrl, fileResourceDTO.getCoverUrl());
        updateWrapper.set(DataRoomFileEntity::getCoverId, fileResourceDTO.getCoverId());
        updateWrapper.set(DataRoomFileEntity::getType, fileResourceDTO.getType());
        updateWrapper.set(DataRoomFileEntity::getPath, fileResourceDTO.getUrl());
        this.update(updateWrapper);
    }

    @Override
    public DataRoomFileEntity getByName(String newName) {
        LambdaQueryWrapper<DataRoomFileEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DataRoomFileEntity::getNewName, newName);
        List<DataRoomFileEntity> list = this.list(queryWrapper);
        if (list == null || list.isEmpty()) {
            return null;
        }
        return list.get(0);

    }
}
