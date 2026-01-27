package com.gccloud.gcpaas.core.page.dto;

import com.gccloud.gcpaas.core.constant.PageStatus;
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
