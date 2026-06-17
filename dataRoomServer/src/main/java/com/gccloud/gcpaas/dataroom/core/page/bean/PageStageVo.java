package com.gccloud.gcpaas.dataroom.core.page.bean;

import com.gccloud.gcpaas.dataroom.core.entity.PageStageEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class PageStageVo extends PageStageEntity {

    @Schema(description = "页面名称")
    private String name;
}
