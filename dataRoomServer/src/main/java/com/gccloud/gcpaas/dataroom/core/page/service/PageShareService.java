package com.gccloud.gcpaas.dataroom.core.page.service;

import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import com.gccloud.gcpaas.dataroom.core.constant.PageType;
import com.gccloud.gcpaas.dataroom.core.constant.UserStatus;
import com.gccloud.gcpaas.dataroom.core.entity.PageEntity;
import com.gccloud.gcpaas.dataroom.core.entity.PageShareEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.PageMapper;
import com.gccloud.gcpaas.dataroom.core.mapper.PageShareMapper;
import com.gccloud.gcpaas.dataroom.core.page.dto.PageShareSaveDto;
import com.gccloud.gcpaas.dataroom.core.page.vo.PageShareVo;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

@Service
public class PageShareService {

    public static final String SHARE_TOKEN_PREFIX = "share_";

    public static final String SHARE_EXT_FLAG = "shareAccess";

    public static final String SHARE_EXT_PAGE_CODE = "sharePageCode";

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Resource
    private PageShareMapper pageShareMapper;
    @Resource
    private PageMapper pageMapper;
    @Resource
    private ClientAccessService clientAccessService;

    public static boolean isShareToken(String token) {
        return StringUtils.startsWith(token, SHARE_TOKEN_PREFIX);
    }

    public PageShareVo detail(String pageCode, HttpServletRequest request) {
        PageEntity page = requireShareablePage(pageCode);
        PageShareEntity share = pageShareMapper.getByPageCode(pageCode);
        if (share == null) {
            PageShareVo vo = new PageShareVo();
            vo.setPageCode(page.getCode());
            vo.setPageType(page.getPageType());
            vo.setEnabled(true);
            vo.setCreated(false);
            return vo;
        }
        return toVo(share, request);
    }

    @Transactional(rollbackFor = Exception.class)
    public PageShareVo save(PageShareSaveDto dto, HttpServletRequest request) {
        if (dto == null || StringUtils.isBlank(dto.getPageCode())) {
            throw new DataRoomException("页面编码不能为空");
        }
        validateExpireTime(dto.getExpireTime());
        clientAccessService.validateWhitelist(dto.getIpWhitelist());
        PageEntity page = requireShareablePage(dto.getPageCode());
        PageShareEntity share = pageShareMapper.getByPageCode(dto.getPageCode());
        if (share == null) {
            share = new PageShareEntity();
            share.setPageCode(page.getCode());
            share.setPageType(page.getPageType());
            share.setToken(generateShareToken());
            applySaveDto(share, dto);
            pageShareMapper.insert(share);
        } else {
            share.setPageType(page.getPageType());
            if (BooleanUtils.isTrue(dto.getRefreshToken())) {
                share.setToken(generateShareToken());
            }
            applySaveDto(share, dto);
            pageShareMapper.updateById(share);
        }
        return toVo(share, request);
    }

    public LoginUser authenticateShareToken(String token, HttpServletRequest request) {
        PageShareEntity share = pageShareMapper.getByToken(token);
        if (share == null) {
            throw new DataRoomException("分享链接不存在或已失效", 401);
        }
        if (!BooleanUtils.isTrue(share.getEnabled())) {
            throw new DataRoomException("分享链接已停用", 401);
        }
        if (share.getExpireTime() != null && share.getExpireTime().before(new Date())) {
            throw new DataRoomException("分享链接已过期", 401);
        }
        PageEntity page = pageMapper.getByCode(share.getPageCode());
        if (page == null || page.getPageStatus() != PageStatus.PUBLISHED) {
            throw new DataRoomException("页面未发布或不存在", 404);
        }
        String clientIp = clientAccessService.resolveClientIp(request);
        if (!clientAccessService.matchesWhitelist(clientIp, share.getIpWhitelist())) {
            throw new DataRoomException("当前 IP 不允许访问该分享链接", 403);
        }
        LoginUser loginUser = new LoginUser();
        loginUser.setAccount("share");
        loginUser.setUsername("分享访问者");
        loginUser.setRole(DataRoomRole.SHARER);
        loginUser.setStatus(UserStatus.NORMAL);
        Map<String, Object> extProps = new HashMap<>();
        extProps.put(SHARE_EXT_FLAG, true);
        extProps.put(SHARE_EXT_PAGE_CODE, share.getPageCode());
        extProps.put("shareId", share.getId());
        loginUser.setExtProps(extProps);
        return loginUser;
    }

    public void assertShareAccessToPage(LoginUser loginUser, String pageCode, PageStatus pageStatus) {
        if (!isShareUser(loginUser)) {
            return;
        }
        Object sharePageCode = loginUser.getExtProps().get(SHARE_EXT_PAGE_CODE);
        if (!StringUtils.equals(String.valueOf(sharePageCode), pageCode) || pageStatus != PageStatus.PUBLISHED) {
            throw new DataRoomException("页面未发布或不存在", 404);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteByPageCode(String pageCode) {
        if (StringUtils.isBlank(pageCode)) {
            return;
        }
        pageShareMapper.deleteByPageCode(pageCode);
    }

    public String buildShareUrl(PageShareEntity share, HttpServletRequest request) {
        if (share == null || StringUtils.isBlank(share.getToken())) {
            return null;
        }
        StringBuilder url = new StringBuilder();
        if (request != null) {
            url.append(request.getScheme()).append("://").append(request.getServerName());
            int port = request.getServerPort();
            if (port > 0 && port != 80 && port != 443) {
                url.append(":").append(port);
            }
            url.append(StringUtils.defaultString(request.getContextPath()));
        }
        String route = PageType.VISUAL_SCREEN == share.getPageType()
                ? "/#/dataRoom/visualScreenPreview/published/"
                : "/#/dataRoom/pagePreviewer/published/";
        return url.append(route)
                .append(share.getPageCode())
                .append("?dataRoomToken=")
                .append(share.getToken())
                .toString();
    }

    private void validateExpireTime(Date expireTime) {
        if (expireTime != null && expireTime.before(new Date())) {
            throw new DataRoomException("过期时间不能早于当前时间");
        }
    }

    private PageEntity requireShareablePage(String pageCode) {
        PageEntity page = pageMapper.getByCode(pageCode);
        if (page == null) {
            throw new DataRoomException("页面不存在");
        }
        if (PageType.DIRECTORY == page.getPageType()) {
            throw new DataRoomException("目录不支持分享");
        }
        return page;
    }

    private void applySaveDto(PageShareEntity share, PageShareSaveDto dto) {
        share.setEnabled(BooleanUtils.isTrue(dto.getEnabled()));
        share.setExpireTime(dto.getExpireTime());
        share.setIpWhitelist(dto.getIpWhitelist());
    }

    private PageShareVo toVo(PageShareEntity share, HttpServletRequest request) {
        PageShareVo vo = new PageShareVo();
        BeanUtils.copyProperties(share, vo);
        vo.setCreated(true);
        vo.setShareUrl(buildShareUrl(share, request));
        return vo;
    }

    private String generateShareToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return SHARE_TOKEN_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private boolean isShareUser(LoginUser loginUser) {
        return loginUser != null
                && loginUser.getExtProps() != null
                && Boolean.TRUE.equals(loginUser.getExtProps().get(SHARE_EXT_FLAG));
    }
}
