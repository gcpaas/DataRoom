package com.gccloud.dataroom.core.utils;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.LambdaUtils;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.gccloud.dataroom.core.dto.SearchDTO;
import com.gccloud.dataroom.core.dto.SortField;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

/**
 * EntityWrapper的封装，用于查询使用
 */
public class QueryWrapperUtils {

    public static Map<String, Map<String, SFunction>> SORT_FUNCTION = Maps.newHashMap();

    public static <T> List<SortField> getSortFieldList(Class<T> entityClass, SearchDTO searchDTO, Map<String, String> aliasMap, SFunction<T, ?>... sortNameList) {
        return getSortFieldList(null, entityClass, searchDTO, aliasMap, sortNameList);
    }

    public static <T> List<SortField> getSortFieldList(String prefix, Class<T> entityClass, SearchDTO searchDTO, Map<String, String> aliasMap, SFunction<T, ?>... sortNameList) {
        Map<String, String> sortFieldMap = searchDTO.getSortFieldMap();
        if (sortFieldMap == null || sortFieldMap.size() == 0) {
            return null;
        }
        List<String> sortFieldOrderList = searchDTO.getSortFieldOrderList();
        if (sortFieldOrderList == null || sortFieldOrderList.size() == 0) {
            return null;
        }
        String className = entityClass.getName();
        if (StringUtils.isNotBlank(prefix)) {
            className = prefix + className;
        }
        Map<String, SFunction> cachedSortFunctionMap = SORT_FUNCTION.computeIfAbsent(className, (k) -> {
            Map<String, SFunction> sortFunctionMap = Maps.newHashMap();
            for (SFunction<T, ?> sortFunction : sortNameList) {
                // getXXX、isXXX
                String implMethodName = LambdaUtils.resolve(sortFunction).getImplMethodName();
                String name = null;
                if (implMethodName.startsWith("get")) {
                    name = implMethodName.substring(3);
                } else if (implMethodName.startsWith("is")) {
                    name = implMethodName.substring(2);
                }
                name = org.springframework.util.StringUtils.uncapitalize(name);
                sortFunctionMap.put(name, sortFunction);
            }
            return sortFunctionMap;
        });
        List<SortField> sortFieldList = Lists.newArrayList();
        for (String fieldName : sortFieldOrderList) {
            /**
             * 映射名称
             * 但前端使用使用的是vo的别名进行展示时，数据库中是没有该字段的，需要指定映射
             */
            if (aliasMap != null) {
                String alias = aliasMap.get(fieldName);
                if (StringUtils.isNotBlank(alias)) {
                    sortFieldMap.put(alias, sortFieldMap.get(fieldName));
                    fieldName = alias;
                }
            }
            SFunction orderFunction = cachedSortFunctionMap.get(fieldName);
            String order = sortFieldMap.get(fieldName);
            if (orderFunction != null) {
                SortField sortField = new SortField();
                // 实体属性转驼峰法
                String columnName = TableUtils.getColumnName(entityClass, fieldName);
                sortField.setFieldName(columnName);
                if ("descending".equals(order) || "desc".equals(order)) {
                    sortField.setOrder("DESC");
                } else if ("ascending".equals(order) || "asc".equals(order)) {
                    sortField.setOrder("ASC");
                } else {
                    continue;
                }
                sortFieldList.add(sortField);
            }
        }
        return sortFieldList;
    }

    public static <T> LambdaQueryWrapper<T> wrapperSort(String prefix, Class<T> entityClass, LambdaQueryWrapper<T> queryWrapper, SearchDTO searchDTO, Map<String, String> aliasMap, SFunction<T, ?>... sortNameList) {
        Map<String, String> sortFieldMap = searchDTO.getSortFieldMap();
        if (sortFieldMap == null || sortFieldMap.size() == 0) {
            return queryWrapper;
        }
        List<String> sortFieldOrderList = searchDTO.getSortFieldOrderList();
        if (sortFieldOrderList == null || sortFieldOrderList.size() == 0) {
            return queryWrapper;
        }
        String className = entityClass.getName();
        if (StringUtils.isNotBlank(prefix)) {
            className = prefix + className;
        }
        Map<String, SFunction> cachedSortFunctionMap = SORT_FUNCTION.computeIfAbsent(className, (k) -> {
            Map<String, SFunction> sortFunctionMap = Maps.newHashMap();
            for (SFunction<T, ?> sortFunction : sortNameList) {
                // getXXX、isXXX
                String implMethodName = LambdaUtils.resolve(sortFunction).getImplMethodName();
                String name = null;
                if (implMethodName.startsWith("get")) {
                    name = implMethodName.substring(3);
                } else if (implMethodName.startsWith("is")) {
                    name = implMethodName.substring(2);
                }
                name = org.springframework.util.StringUtils.uncapitalize(name);
                sortFunctionMap.put(name, sortFunction);
            }
            return sortFunctionMap;
        });
        for (String fieldName : sortFieldOrderList) {
            /**
             * 映射名称
             * 但前端使用使用的是vo的别名进行展示时，数据库中是没有该字段的，需要指定映射
             */
            if (aliasMap != null) {
                String alias = aliasMap.get(fieldName);
                if (StringUtils.isNotBlank(alias)) {
                    sortFieldMap.put(alias, sortFieldMap.get(fieldName));
                    fieldName = alias;
                }
            }
            SFunction orderFunction = cachedSortFunctionMap.get(fieldName);
            String order = sortFieldMap.get(fieldName);
            if (orderFunction != null) {
                if ("descending".equals(order) || "desc".equals(order)) {
                    queryWrapper.orderByDesc(orderFunction);
                } else if ("ascending".equals(order) || "asc".equals(order)) {
                    queryWrapper.orderByAsc(orderFunction);
                }
            }
        }
        return queryWrapper;
    }

    /**
     * 模糊查询
     *
     * @param queryWrapper
     * @param searchKey    查询的关键字，多关键字之间使用空格隔开
     * @param fieldNames
     * @return
     */
    public static <T> LambdaQueryWrapper<T> wrapperLike(LambdaQueryWrapper<T> queryWrapper, String searchKey, SFunction<T, ?>... fieldNames) {
        if (fieldNames == null || fieldNames.length == 0 || StringUtils.isBlank(searchKey)) {
            return queryWrapper;
        }
        /**
         * 多个条件之间使用空格隔开
         */
        String[] searchKeyArr = searchKey.split(" ");
        for (String key : searchKeyArr) {
            if (StringUtils.isBlank(key)) {
                continue;
            }
            queryWrapper.and(wrapper -> {
                for (int i = 0; i < fieldNames.length; i++) {
                    if (StringUtils.isBlank(key)) {
                        continue;
                    }
                    wrapper.or().like(fieldNames[i], key);
                }
            });
        }
        return queryWrapper;
    }

    /**
     * 模糊查询封装
     *
     * @param ew         必须传入
     * @param searchKey  多条件之间使用空格隔开
     * @param columNames 实体对应的属性
     * @return
     */
    public static <T> QueryWrapper wrapperLike(QueryWrapper<T> ew, String searchKey, String... columNames) {
        if (columNames == null || columNames.length == 0) {
            return ew;
        }
        /**
         * 按照属性模糊查询
         */
        if (StringUtils.isNotBlank(searchKey)) {
            /**
             * 多个条件之间使用空格隔开
             */
            String[] searchKeyArr = searchKey.split(" ");
            for (String key : searchKeyArr) {
                if (StringUtils.isBlank(key)) {
                    continue;
                }
                ew.and(wrapper -> {
                    for (int i = 0; i < columNames.length; i++) {
                        String column = columNames[i];
                        wrapper.or().like(StringUtils.isNotBlank(key), column, key);
                    }
                });
            }
        }
        return ew;
    }
}
