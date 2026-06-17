package com.gccloud.gcpaas.dataroom.core.page.dto;

import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import lombok.Data;

@Data
public class PageStageSearchDto {
    private Integer size;
    private Integer current;
    private String code;
    private PageStatus pageStatus;
    private String startDate;
    private String endDate;
}
