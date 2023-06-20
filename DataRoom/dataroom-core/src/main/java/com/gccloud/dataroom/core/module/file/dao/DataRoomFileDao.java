package com.gccloud.dataroom.core.module.file.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 文件
 */
@Mapper
public interface DataRoomFileDao extends BaseMapper<DataRoomFileEntity> {
    /**
     * 更新文件下载次数
     *
     * @param addCount
     */
    void updateDownloadCount(@Param("addCount") Integer addCount, @Param("id") String fileId);


    /**
     * 获取所有文件后缀(去重)
     * @return
     */
    List<String> getAllExtension();

}
