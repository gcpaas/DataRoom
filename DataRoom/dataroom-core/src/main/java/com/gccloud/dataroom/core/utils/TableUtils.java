package com.gccloud.dataroom.core.utils;

import com.baomidou.mybatisplus.core.metadata.TableFieldInfo;
import com.baomidou.mybatisplus.core.metadata.TableInfo;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.google.common.base.Joiner;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

/**
 * @author liuchengbiao
 * @date 2021/7/7 11:17 上午
 */
@Slf4j
public class TableUtils {

    protected static final Map<String, Map<String, TableFieldInfo>> FIELD_NAME_MAP = Maps.newHashMap();

    public TableUtils() {
        throw new IllegalStateException("不允许创建");
    }

    public static String getAllColumn(TableInfo tableInfo) {
        List<String> columnList = Lists.newArrayList();
        List<TableFieldInfo> fieldList = tableInfo.getFieldList();
        columnList.add(tableInfo.getKeyColumn());
        for (TableFieldInfo field : fieldList) {
            columnList.add(field.getColumn());
        }
        return Joiner.on(",").join(columnList);
    }

    public static <T> String getColumnName(Class<T> entity, String fieldName) {
        Map<String, TableFieldInfo> entityFieldMap = FIELD_NAME_MAP.computeIfAbsent(entity.getName(), k -> {
            Map<String, TableFieldInfo> innerEntityFieldMap = Maps.newHashMap();
            TableInfo tableInfo = TableInfoHelper.getTableInfo(entity);
            List<TableFieldInfo> fieldList = tableInfo.getFieldList();
            fieldList.forEach(field -> innerEntityFieldMap.put(field.getProperty(), field));
            return innerEntityFieldMap;
        });
        TableFieldInfo tableFieldInfo = entityFieldMap.get(fieldName);
        return tableFieldInfo.getColumn();
    }
}
