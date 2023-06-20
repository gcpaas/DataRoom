package com.gccloud.dataroom.core.module.manage.dto;

import com.gccloud.common.dto.SearchDTO;
import lombok.Data;

/**
 * @author hongynag
 * @version 1.0
 */
@Data
public class DataRoomSearchDTO extends SearchDTO {

    /**
     * 所属分组
     */
    private String parentCode;

    /**
     * 类型
     */
    private String type;
}
