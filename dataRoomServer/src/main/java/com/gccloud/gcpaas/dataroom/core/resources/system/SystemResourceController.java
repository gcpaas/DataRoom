package com.gccloud.gcpaas.dataroom.core.resources.system;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.entity.ResourceEntity;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "系统素材")
@ApiSort(value = 21)
@RequiredArgsConstructor
@RequestMapping("/dataRoom/resource/systemResource")
@RestController
public class SystemResourceController {

    private final SystemResourceService systemResourceService;

    @GetMapping("/list")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "系统素材列表", description = "查询 classpath 中的系统素材")
    @Parameter(name = "category", description = "分类编码", in = ParameterIn.QUERY)
    public Resp<List<ResourceEntity>> list(@RequestParam(name = "category", required = false) String category) {
        return Resp.success(systemResourceService.getList(category));
    }

    @GetMapping("/categories")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "系统素材分类", description = "查询 classpath 中的系统素材分类")
    public Resp<List<SystemResourceCategory>> categories() {
        return Resp.success(systemResourceService.getCategories());
    }
}
