package com.gccloud.dataroom.core.module.dataset.process;

import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.module.dataset.model.SqlConditionModel;
import com.gccloud.dataroom.core.module.dataset.model.ViewSqlProcessModel;
import com.gccloud.dataroom.core.module.dataset.model.view.*;
import com.gccloud.dataroom.core.utils.JSON;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 可视化sql加工
 *
 * @author pan.shun
 * @since 2022/7/21 11:22
 */
@Slf4j
public class ViewSqlProcess extends ConditionSqlProcess {


    /**
     * 通过页面可视化配置信息构建SQL语句
     */
    protected static String buildSqlByViewConfig(String codeProcess) {

        ViewSqlProcessModel viewSqlProcessModel = JSON.parseObject(codeProcess, ViewSqlProcessModel.class);

        // 配置校验
        doCheckViewProcessConfig(viewSqlProcessModel);

        // 数据源类型
        String sourceType = viewSqlProcessModel.getDatasourceInfo().getSourceType();

        // SQL语句主体部分
        String sqlBody = buildSqlBody(viewSqlProcessModel.getTableRelate(), sourceType);

        // SQL语句条件部分
        String sqlFilterCondition = buildSqlFilterCondition(sourceType, viewSqlProcessModel.getFilterCondition());

        // 字段集合
        Set<String> fieldList = new HashSet<>(16);

        // 分组字段集合
        Set<String> groupList = new HashSet<>(16);

        // 从配置项中获取查询字段与分组字段
        fieldAndGroupReceiveFromConfig(sourceType, fieldList, groupList, viewSqlProcessModel.getCalculateFieldConfig());

        // 查询字段
        String fieldString = String.join(",", fieldList);

        // 分组字段
        String groupString = String.join(",", groupList);

        // SQL合并
        return sqlProcessFactory(sqlBody, fieldString, groupString, sqlFilterCondition);
    }

    /**
     * 可视化配置校验
     */
    private static void doCheckViewProcessConfig(ViewSqlProcessModel viewSqlProcessModel) {
        List<CalculateFieldConfigModel> calculateFieldConfig = viewSqlProcessModel.getCalculateFieldConfig();

        // 聚合函数判断校验
        CheckViewConfig.checkAggregateCalculation(calculateFieldConfig);

        // 别名重复判断
        CheckViewConfig.checkListIfRepeated(calculateFieldConfig);

        // 表达式中不同表重复字段判断
        CheckViewConfig.checkDifferTableIfHasSameField(viewSqlProcessModel);
    }

    /**
     * sql语句合并
     *
     * @param sqlBody            sql主体部分
     * @param fieldString        查询字段部分
     * @param groupString        分组字段部分
     * @param sqlFilterCondition sql条件部分
     */
    private static String sqlProcessFactory(String sqlBody, String fieldString, String groupString, String sqlFilterCondition) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT ").append(fieldString).append(" FROM ").append(sqlBody);
        // 拼接条件
        if (!StringUtils.isEmpty(sqlFilterCondition)) {
            builder.append(" where ").append(sqlFilterCondition);
        }
        // 拼接分组
        if (!StringUtils.isEmpty(groupString)) {
            builder.append(" GROUP BY ").append(groupString);
        }
        return builder.toString();
    }

    /**
     * 构建条件区SQL结构
     */
    private static String buildSqlFilterCondition(String sourceType, List<FilterConditionModel> filterCondition) {
        StringBuilder builder = new StringBuilder();

        filterCondition.forEach(r -> {
            List<ChildrenFilter> children = r.getChildren();
            if (!CollectionUtils.isEmpty(children)) {
                children.forEach(ch -> {
                    String joiner;
                    if (!StringUtils.isEmpty(ch.getJoiner())) {
                        joiner = ch.getJoiner();
                    } else {
                        joiner = r.getJoiner();
                    }
                    SqlConditionModel childrenBuild = SqlConditionModel.builder()
                            .sourceType(sourceType)
                            .field(r.getField())
                            .tableName(r.getTableName())
                            .type(r.getType())
                            .dateType(r.getDateType())
                            .joiner(joiner)
                            .op(ch.getOp())
                            .value(ch.getValue())
                            .build();
                    String childrenFilterSql = sqlConditionProcessFactory(childrenBuild);
                    if (!StringUtils.isEmpty(childrenFilterSql)) {
                        builder.append(joiner).append(" ").append(childrenFilterSql).append(" ");
                    } else {
                        log.error("构建sql条件片段失败，已弃用当前配置，当前子级配置信息为：{}", childrenBuild);
                    }
                });
            }
        });
        String st = builder.toString();
        if (st.startsWith(STATUS.AND)) {
            st = st.substring(3);
        }
        if (st.startsWith(STATUS.OR)) {
            st = st.substring(2);
        }
        return st;
    }

    /**
     * 构建sql主结构
     */
    private static String buildSqlBody(TableRelateModel tableRelateModel, String sourceType) {
        if (CollectionUtils.isEmpty(tableRelateModel.getChildren())) {
            // 单表
            return tableRelateModel.getMainTableName();
        } else {
            // 关联表
            List<ChildrenRelateModel> children = tableRelateModel.getChildren();
            StringBuilder builder = new StringBuilder();
            builder
                    .append(tableRelateModel.getMainTableName())
                    .append(" ")
                    .append(tableRelateModel.getMainTableName())
                    .append(" ");

            children.forEach(res -> {
                builder.append(res.getRelateType()).append(" join ")
                        .append(res.getTableName()).append(" ").append(res.getTableName()).append(" ");
                builder.append("on ").append(fieldFormat(sourceType, res.getField(), res.getTableName())).append(" = ");
                builder.append(fieldFormat(sourceType, res.getRelateField(), res.getRelateTableName())).append(" ");

            });

            return builder.toString();
        }
    }

    /**
     * 从配置中获取字段与分组
     *
     * @param sourceType           数据源类型
     * @param fieldList            字段集合
     * @param groupList            分组集合
     * @param calculateFieldConfig 计算字段配置信息
     */
    private static void fieldAndGroupReceiveFromConfig(
            String sourceType,
            Set<String> fieldList,
            Set<String> groupList,
            List<CalculateFieldConfigModel> calculateFieldConfig
    ) {

        calculateFieldConfig.forEach(r -> {
            if (r.getType().equals(STATUS.PRIMARY_CONFIG)) {
                // 普调配置
                if (StringUtils.isEmpty(r.getAggregationMethod())) {
                    // 当前值字段
                    fieldList.add(fieldFormat(sourceType, r.getFieldName(), r.getTableName()) + " \"" + r.getFieldAlias() + "\"");

                    if (r.getIfJoinGroup().equals(STATUS.JOIN_GROUP)) {
                        groupList.add(fieldFormat(sourceType, r.getFieldName(), r.getTableName()));
                    }
                } else {
                    // 聚合类型字段
                    fieldList.add(r.getAggregationMethod() + "(" + fieldFormat(sourceType, r.getFieldName(), r.getTableName()) + ") \"" + r.getFieldAlias() + "\"");
                }
            } else {
                // 高级配置
                fieldList.add(r.getFieldExpression() + " \"" + r.getFieldAlias() + "\"");

                if (r.getIfJoinGroup().equals(STATUS.JOIN_GROUP)) {
                    groupList.add(r.getFieldExpression());
                }
            }
        });
    }

    /**
     * 状态
     */
    interface STATUS {
        /**
         * 普调配置
         */
        Integer PRIMARY_CONFIG = 0;
        /**
         * 高级配置
         */
        Integer SENIOR_CONFIG = 1;
        /**
         * 加入分组
         */
        Integer JOIN_GROUP = 1;
        /**
         * 不加入分组
         */
        Integer NOT_JOIN_GROUP = 0;
        /**
         * 与
         */
        String AND = "and";
        /**
         * 或
         */
        String OR = "or";
    }

    /**
     * 校验类
     */
    private static class CheckViewConfig {
        /**
         * 存在聚合函数时对展示字段设置分组的校验
         */
        private static void checkAggregateCalculation(List<CalculateFieldConfigModel> calculateFieldConfig) {
            if (!findIfHasAggFunction(calculateFieldConfig)) {
                String ifHasFieldInGroup = findIfHasFieldInGroup(calculateFieldConfig);
                if (!StringUtils.isEmpty(ifHasFieldInGroup)) {
                    throw new GlobalException("当前存在聚合计算，需把字段 [" + ifHasFieldInGroup + "] 设置为分组");
                }
            }
        }

        /**
         * 判断配置项中是否存在重复的别名字段
         */
        private static void checkListIfRepeated(List<CalculateFieldConfigModel> calculateFieldConfig) {
            List<String> fieldAliasList = new ArrayList<>(16);
            calculateFieldConfig.forEach(res -> fieldAliasList.add(res.getFieldAlias()));
            List<String> repeatList = checkRepeat(fieldAliasList);

            if (!CollectionUtils.isEmpty(repeatList)) {
                String join = String.join("，", repeatList);
                throw new GlobalException("存在重复的别名" + join);
            }
        }

        /**
         * 判断不同表中字段是否存在相同的
         */
        private static void checkDifferTableIfHasSameField(ViewSqlProcessModel viewSqlProcessModel) {
            if (!CollectionUtils.isEmpty(viewSqlProcessModel.getTableInfo())) {
                Map<String, List<String>> tableInfo = viewSqlProcessModel.getTableInfo();
                List<CalculateFieldConfigModel> calculateFieldConfig = viewSqlProcessModel.getCalculateFieldConfig();
                calculateFieldConfig.forEach(res -> {
                    if (res.getType().equals(STATUS.SENIOR_CONFIG)) {
                        // 高级配置
                        if (!StringUtils.isEmpty(res.getFieldExpression())) {
                            expressionCheck(res.getFieldExpression(), tableInfo);
                        }
                    }
                });
            }
        }

        /**
         * 查找是否包含聚合函数
         */
        private static boolean findIfHasAggFunction(List<CalculateFieldConfigModel> calculateFieldConfig) {
            for (CalculateFieldConfigModel res : calculateFieldConfig) {
                if (!StringUtils.isEmpty(res.getAggregationMethod())) {
                    return false;
                }
            }
            return true;
        }

        /**
         * 判断字段是否为分组
         */
        private static String findIfHasFieldInGroup(List<CalculateFieldConfigModel> calculateFieldConfig) {
            for (CalculateFieldConfigModel res : calculateFieldConfig) {
                if (StringUtils.isEmpty(res.getAggregationMethod()) && res.getType().equals(STATUS.PRIMARY_CONFIG)) {
                    if (!res.getIfJoinGroup().equals(STATUS.JOIN_GROUP)) {
                        return res.getFieldName();
                    }
                }
            }
            return null;
        }

        /**
         * 数据库函数表达式校验
         */
        private static void expressionCheck(String fieldExpression, Map<String, List<String>> tableInfo) {
            List<String> fieldList = new ArrayList<>(16);

            List<String> tableNameList = new ArrayList<>(16);

            tableInfo.forEach((k, v) -> tableNameList.add(k));

            tableInfo.forEach((k, v) -> v.forEach(r -> {
                if (checkIfContain(fieldExpression, tableNameList, r)) {
                    fieldList.add(r);
                }
            }));

            if (!CollectionUtils.isEmpty(fieldList)) {
                int max = 0;
                for (String f : fieldList) {
                    if (max < f.length()) {
                        max = f.length();
                    }
                }
                Iterator<String> iterator = fieldList.iterator();
                while (iterator.hasNext()) {
                    String next = iterator.next();
                    if (next.length() != max) {
                        iterator.remove();
                    }
                }
            }
            if (!CollectionUtils.isEmpty(fieldList) && fieldList.size() > 1) {
                throw new GlobalException("表达式 [ " + fieldExpression + " ] 中字段 [" + fieldList.get(0) + "] 请指明具体表名");
            }
        }

        /**
         * 判断字段是否包含于表达式字符串中 ，同时还得排除已取别名的情况
         */
        private static boolean checkIfContain(String fieldExpression, List<String> tableNameList, String field) {
            for (String name : tableNameList) {
                String aliasField = name + "." + field;
                fieldExpression = fieldExpression.replace(aliasField, "");
            }
            return fieldExpression.contains(field);
        }

        /**
         * 集合筛选出重复的
         */
        public static List<String> checkRepeat(List<String> list) {
            return list.stream()
                    .collect(Collectors.toMap(e -> e, e -> 1, (a, b) -> a + b))
                    .entrySet().stream()
                    .filter(entry -> entry.getValue() > 1)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
        }
    }


}
