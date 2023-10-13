package com.gccloud.dataroom.core.module.file.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.module.file.dao.DataRoomFileDao;
import com.gccloud.dataroom.core.module.file.dto.FileSearchDTO;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomFileService;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.QueryWrapperUtils;
import com.gccloud.common.vo.PageVO;
import com.google.common.collect.Maps;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 文件管理
 */
@Service
@Slf4j
@ConditionalOnProperty(prefix = "gc.starter.dataroom.component", name = "IDataRoomFileService", havingValue = "DataRoomFileServiceImpl", matchIfMissing = true)
public class DataRoomFileServiceImpl extends ServiceImpl<DataRoomFileDao, DataRoomFileEntity> implements IDataRoomFileService {

    @Override
    public PageVO<DataRoomFileEntity> getPage(FileSearchDTO searchDTO) {
        LambdaQueryWrapper<DataRoomFileEntity> queryWrapper = QueryWrapperUtils.wrapperLike(new LambdaQueryWrapper(), searchDTO.getSearchKey(), DataRoomFileEntity::getOriginalName);
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getModule()), DataRoomFileEntity::getModule, searchDTO.getModule());
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getExtension()), DataRoomFileEntity::getExtension, searchDTO.getExtension());
        if (searchDTO.getExtensionList() != null && searchDTO.getExtensionList().size() > 0) {
            queryWrapper.in(DataRoomFileEntity::getExtension, searchDTO.getExtensionList());
        }
        queryWrapper.orderByDesc(DataRoomFileEntity::getCreateDate);
        return page(searchDTO, queryWrapper);
    }

    @Override
    public void updateDownloadCount(Integer addCount, String fileId) {
        if (addCount <= 0) {
            throw new GlobalException("下载次数不允许为负数或0");
        }
        baseMapper.updateDownloadCount(addCount, fileId);
    }

    @Override
    public List<String> getAllExtension() {
        // 去重获取所有文件后缀名
        return baseMapper.getAllExtension();
    }
}
