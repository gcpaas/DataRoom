package com.gccloud.gcpaas.dataroom.core.page;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.page.dto.PageShareSaveDto;
import com.gccloud.gcpaas.dataroom.core.page.service.PageShareService;
import com.gccloud.gcpaas.dataroom.core.page.vo.PageShareVo;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Controller
@Tag(name = "页面分享")
@RequestMapping("/dataRoom/page/share")
public class PageShareController {

    @Resource
    private PageShareService pageShareService;

    @GetMapping("/detail/{pageCode}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    public Resp<PageShareVo> detail(@PathVariable("pageCode") String pageCode, HttpServletRequest request) {
        return Resp.success(pageShareService.detail(pageCode, request));
    }

    @PostMapping("/save")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    public Resp<PageShareVo> save(@RequestBody PageShareSaveDto dto, HttpServletRequest request) {
        return Resp.success(pageShareService.save(dto, request));
    }
}
