package com.gccloud.dataroom.core.module.file.dto;

import com.gccloud.common.dto.SearchDTO;
import lombok.Data;

import java.util.List;

@Data
public class FileSearchDTO extends SearchDTO {

    /**
     * 所属模块
     */
    private String module;

    /**
     * 文件后缀
     */
    private String extension;


    /**
     * 文件后缀列表，批量过滤
     */
    private List<String> extensionList;


}
