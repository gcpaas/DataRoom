package com.gccloud.gcpaas.dataroom.core.config.converter;

import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.convert.converter.Converter;

public class PageStatusConverter implements Converter<String, PageStatus> {

    @Override
    public PageStatus convert(String source) {
        if (StringUtils.isBlank(source)) {
            return null;
        }
        String normalized = source.trim();
        for (PageStatus pageStatus : PageStatus.values()) {
            if (pageStatus.getType().equalsIgnoreCase(normalized) || pageStatus.name().equalsIgnoreCase(normalized)) {
                return pageStatus;
            }
        }
        throw new IllegalArgumentException("不支持的页面状态: " + source);
    }
}
