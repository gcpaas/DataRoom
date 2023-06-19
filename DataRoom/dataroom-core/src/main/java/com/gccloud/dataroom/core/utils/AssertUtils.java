package com.gccloud.dataroom.core.utils;

import com.gccloud.dataroom.core.exception.GlobalException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AssertUtils {

    /**
     * 断言确保表达式成立，如果不成立，将抛出指定异常
     *
     * @param expression
     * @param message
     */
    public static void isTrue(boolean expression, String message) {
        if (!expression) {
            log.error("断言失败: {}",message);
            throw new GlobalException(message);
        }
    }
}
