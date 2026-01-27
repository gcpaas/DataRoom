package com.gccloud.gcpaas.core.page.bean;

import com.gccloud.gcpaas.core.entity.PageStageEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class PageStageVo extends PageStageEntity {

    @Schema(description = "页面名称")
    private String name;
}
