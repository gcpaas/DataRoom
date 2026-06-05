package com.gccloud.gcpaas.core.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.util.Locale;
import java.util.UUID;

@Slf4j
public class CodeWorker {
    /**
     * 生成编码
     *
     * @param prefix
     * @return
     */
    public static String generateCode(String prefix) {
        String code = UUID.randomUUID().toString().replaceAll("-", "").toUpperCase(Locale.ROOT);
        if (StringUtils.isBlank(prefix)) {
            return code;
        }
        return prefix + "_" + code;
    }

}
