package com.gccloud.gcpaas.core.page.dto;

import com.gccloud.gcpaas.core.constant.PageType;
import com.gccloud.gcpaas.core.page.bean.BasePageConfig;
import lombok.Data;

@Data
public class PageHistoryBackupDto {
    private String pageCode;
    private String remark;
    private PageType pageType;
    private BasePageConfig pageConfig;
}
