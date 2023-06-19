package com.gccloud.dataroom.mybatis.p6spy;

import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.p6spy.engine.spy.appender.MessageFormattingStrategy;

/**
 * 自定义格式化SQL打印日志
 *
 * @author liuchengbiao
 * @date 2020-07-16 09:14
 */
public class P6SpyLogger implements MessageFormattingStrategy {

    @Override
    public String formatMessage(int connectionId, String now, long elapsed, String category,
                                String prepared, String sql, String url) {
        return StringUtils.isNotBlank(sql) ? " 耗时：" + elapsed + " ms " + now + "\n SQL：" + sql.replaceAll("[\\s]+", " ") + "\n" : "";
    }
}