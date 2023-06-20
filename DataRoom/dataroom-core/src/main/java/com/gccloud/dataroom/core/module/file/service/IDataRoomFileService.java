package com.gccloud.dataroom.core.module.file.service;

import com.gccloud.dataroom.core.module.file.dto.FileSearchDTO;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.common.service.ISuperService;
import com.gccloud.common.vo.PageVO;

import java.util.List;


/**
 * 文件管理
 *
 * @author liuchengbiao
 */
public interface IDataRoomFileService extends ISuperService<DataRoomFileEntity> {
    /**
     * 分页查询
     *
     * @param searchDTO
     * @return
     */
    PageVO<DataRoomFileEntity> getPage(FileSearchDTO searchDTO);

    /**
     * 更新下载次数
     *
     * @param addCount
     * @param fileId
     */
    void updateDownloadCount(Integer addCount, String fileId);


    /**
     * 获取所有文件后缀(去重)
     *
     * @return
     */
    List<String> getAllExtension();

}
