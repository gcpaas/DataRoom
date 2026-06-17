package com.gccloud.gcpaas.dataroom.core.page.dto;

import com.gccloud.gcpaas.dataroom.core.constant.PageType;
import com.gccloud.gcpaas.dataroom.core.page.bean.BasePageConfig;
import lombok.Data;

@Data
public class PageHistoryBackupDto {
    private String pageCode;
    private String remark;
    private PageType pageType;
    private BasePageConfig pageConfig;
}
