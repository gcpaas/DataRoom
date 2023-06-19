package com.gccloud.dataroom.core.controller;

import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.vo.R;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.util.Strings;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author liuchengbiao
 * @date 2020-06-17 13:37
 */
public class SuperController {

    public <T> R<T> success(T data) {
        return R.success(data);
    }

    public <T> R<T> success() {
        return R.success();
    }

    public <T> R<T> error() {
        return R.error();
    }

    /**
     * 字符串数组更改
     *
     * @param idStr
     * @return
     */
    public List<String> convert(String idStr) {
        //判断id是否为空
        if (Strings.isBlank(idStr)) {
            throw new GlobalException("id不允许为空");
        }
        // 将ids 拆分为数组,分隔符为"-"
        String[] idStrArr = StringUtils.split(idStr, "-");
        return Arrays.stream(idStrArr).map(id -> (id)).collect(Collectors.toList());
    }
}
