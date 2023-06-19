package com.gccloud.dataroom.core.module.dataset.process;

import com.gccloud.dataroom.core.module.dataset.constant.ReportDbType;
import com.gccloud.dataroom.core.module.dataset.model.SqlConditionModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author pan.shun
 * @since 2022/7/26 16:17
 */
@Slf4j
class ConditionSqlProcess {

    /**
     * 通过这个构建“ 字段 操作符 值”的sql 片段
     */
    static String sqlConditionProcessFactory(SqlConditionModel sqlConditionModel) {
        switch (sqlConditionModel.getType()) {
            case "text":
                // 字符串处理
                return handleString(sqlConditionModel);
            case "number":
                // 数值处理
                return handleNumber(sqlConditionModel);
            case "date":
                //  日期处理
                return handleDate(sqlConditionModel);
            default:
                return null;
        }
    }

    private static String handleString(SqlConditionModel sqlConditionModel) {
        return OperationProcess.stringProcess(
                sqlConditionModel.getSourceType(),
                sqlConditionModel.getField(),
                sqlConditionModel.getTableName(),
                sqlConditionModel.getOp(),
                sqlConditionModel.getValue());
    }

    private static String handleNumber(SqlConditionModel sqlConditionModel) {
        return OperationProcess.numberProcess(
                sqlConditionModel.getSourceType(),
                sqlConditionModel.getField(),
                sqlConditionModel.getTableName(),
                sqlConditionModel.getOp(),
                sqlConditionModel.getValue());
    }

    private static String handleDate(SqlConditionModel sqlConditionModel) {
        return OperationProcess.dateProcess(
                sqlConditionModel.getSourceType(),
                sqlConditionModel.getField(),
                sqlConditionModel.getTableName(),
                sqlConditionModel.getOp(),
                sqlConditionModel.getValue(),
                sqlConditionModel.getDateType()
        );
    }

    /**
     * 字段包装一下，主要应对数据库关键字字段名称
     */
    static String fieldFormat(String sourceType, String field, String tableName) {
        if (sourceType.equals(ReportDbType.MYSQL.getUpInfo())) {
            return tableName + "." + "`" + field + "`";
        } else {
            return tableName + "." + "\"" + field + "\"";
        }
    }

    /**
     * 操作符转换
     */
    private static String getOperator(String op) {
        switch (op) {
            case "=":
                return "=";
            case "(":
                return ">";
            case "[":
                return ">=";
            case ")":
                return "<";
            case "]":
                return "<=";
            default:
                return null;
        }
    }

    interface CONSTANT {
        String DATE = "date";
        String DATE_TIME = "dateTime";
        String DATE_MONTH = "dateMonth";
    }

    /**
     * 操作符加工类,构建操作符与值之间的关系片段
     */
    private static class OperationProcess {
        /**
         * 操作符集合
         */
        static List<String> operationList = new ArrayList<>(Arrays.asList("=", "!=", ">", "<", ">=", "<="));

        /**
         * 字符串类型
         *
         * @param sourceType 数据源类型
         * @param field      字段
         * @param tableName  表名
         * @param op         操作符
         * @param value      值
         */
        private static String stringProcess(String sourceType, String field, String tableName, String op, String value) {
            switch (op) {
                case "=":
                    return fieldFormat(sourceType, field, tableName) + " = '" + value + "' ";
                case "!=":
                    return fieldFormat(sourceType, field, tableName) + " != '" + value + "' ";
                case "LIKE":
                    return fieldFormat(sourceType, field, tableName) + " like '%" + value + "%' ";
                case "LEFT_LIKE":
                    return fieldFormat(sourceType, field, tableName) + " like '" + value + "%' ";
                case "RIGHT_LIKE":
                    return " like '%" + value + "' ";
                case "IS_NULL":
                    return fieldFormat(sourceType, field, tableName) + " is null ";
                case "NOT_IN":
                    List<String> notInList = Arrays.asList(value.split(","));
                    if (!CollectionUtils.isEmpty(notInList)) {
                        return fieldFormat(sourceType, field, tableName) + " not in (" + buildContain(notInList) + ") ";
                    } else {
                        return null;
                    }
                case "IN":
                    List<String> inList = Arrays.asList(value.split(","));
                    if (!CollectionUtils.isEmpty(inList)) {
                        return fieldFormat(sourceType, field, tableName) + " in (" + buildContain(inList) + ") ";
                    } else {
                        return null;
                    }
                default:
                    return null;
            }
        }

        /**
         * 数值类型
         */
        private static String numberProcess(String sourceType, String field, String tableName, String op, String value) {
            boolean flag = operationList.stream().anyMatch(f -> f.equals(op));
            if (flag) {
                return fieldFormat(sourceType, field, tableName) + " " + op + " " + value + " ";
            } else {
                return null;
            }
        }

        /**
         * 日期类型
         */
        private static String dateProcess(String sourceType, String field, String tableName, String op, String value, String dateType) {
            String dateField = null;
            if (dateType.equals(CONSTANT.DATE)) {
                dateField = getDateField(sourceType, field, tableName);
            }
            if (dateType.equals(CONSTANT.DATE_TIME)) {
                dateField = getDateTimeField(sourceType, field, tableName);
            }

            if (dateType.equals(CONSTANT.DATE_MONTH)) {
                dateField = getDateMonthField(sourceType, field, tableName);
            }

            if (!StringUtils.isEmpty(dateField)) {
                return dateField + " " + getOperator(op) + " '" + value + "' ";
            } else {
                printErrorInfo(sourceType, field, tableName);
                return null;
            }
        }

        private static void printErrorInfo(String sourceType, String field, String tableName) {
            log.error("日期函数转换构建失败，当前数据源类型为：{} ，字段：{} ，表名：{} ,为保证正常允许，已自动弃用该条件\r\n", sourceType, field, tableName);
        }

        private static String buildContain(List<String> list) {
            StringBuilder builder = new StringBuilder();
            list.forEach(r -> builder.append("'").append(r).append("',"));
            String st = builder.toString();
            if (st.endsWith(",")) {
                st = st.substring(0, st.length() - 1);
            }
            return st;
        }

        /**
         * 年月日时分秒
         */
        private static String getDateTimeField(String sourceType, String field, String tableName) {
            if (sourceType.equals(ReportDbType.ORACLE.getUpInfo())) {
                return "TO_CHAR(" + fieldFormat(sourceType, field, tableName) + " ,'yyyy-MM-dd HH24:MI:SS')";
            } else {
                return fieldFormat(sourceType, field, tableName);
            }
        }

        /**
         * 年月日
         */
        private static String getDateField(String sourceType, String field, String tableName) {
            if (sourceType.equals(ReportDbType.MYSQL.getUpInfo())) {
                return "date_format(" + fieldFormat(sourceType, field, tableName) + ",'%Y-%m-%d')";
            }
            if (sourceType.equals(ReportDbType.CLICKHOUSE.getUpInfo())) {
                return "formatDateTime(" + fieldFormat(sourceType, field, tableName) + ",'%Y-%m-%d')";
            }
            if (sourceType.equals(ReportDbType.ORACLE.getUpInfo()) || sourceType.equals(ReportDbType.POSTGRESQL.getUpInfo())) {
                return "TO_CHAR(" + fieldFormat(sourceType, field, tableName) + ",'YYYY-MM-DD')";
            }
            return null;
        }

        /**
         * 年月
         */
        private static String getDateMonthField(String sourceType, String field, String tableName) {
            if (sourceType.equals(ReportDbType.MYSQL.getUpInfo())) {
                return "date_format(" + fieldFormat(sourceType, field, tableName) + ",'%Y-%m')";
            }
            if (sourceType.equals(ReportDbType.CLICKHOUSE.getUpInfo())) {
                return "formatDateTime(" + fieldFormat(sourceType, field, tableName) + ",'%Y-%m')";
            }
            if (sourceType.equals(ReportDbType.ORACLE.getUpInfo()) || sourceType.equals(ReportDbType.POSTGRESQL.getUpInfo())) {
                return "TO_CHAR(" + fieldFormat(sourceType, field, tableName) + ",'YYYY-MM')";
            }
            return null;
        }
    }
}
