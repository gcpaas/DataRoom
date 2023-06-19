package com.gccloud.dataroom.core.module.dataset.constant;

/**
 * 报表常量
 *
 * @author pan.shun
 * @since 2022/3/4 15:41
 */
public interface ReportConstant {
    /**
     * 结果固化形式
     */
    interface CuringType {
        /**
         * 存储过程
         */
        String STORED_PROCEDURE = "3";
        /**
         * 视图
         */
        String VIEW = "2";
        /**
         * 表
         */
        String TABLE = "1";
    }

    /**
     * 是否去重
     */
    interface DataRepeat {
        /**
         * 不去重
         */
        Integer NOT_REPEAT = 1;
        /**
         * 默认 去重
         */
        Integer DEFAULT = 0;
    }

    /**
     * 报表最大先限制条数
     */
    interface MaxDataSize {
        interface QueryDetailMax {
            /**
             * 预览时查询数据量限制
             */
            Integer MAX_SIZE = 20;
        }
    }

    /**
     * SQL中的参数状态
     */
    interface SqlParamsStatus {
        /**
         * 默认
         */
        Integer DEFAULT = 0;
        /**
         * 变量
         */
        Integer VARIABLE = 1;
    }

    /**
     * SQL中的参数类型
     */
    interface SqlParamsType {

        /**
         * 字符串参数，在替换sql中参数值时，会固定在值两侧加上单引号
         */
        String STRING = "String";

        /**
         * 日期参数
         */
        String DATE = "Date";

        /**
         * 整型
         */
        String INTEGER = "Integer";

        /**
         * 长整型
         */
        String LONG = "Long";

        /**
         * 浮点型
         */
        String DOUBLE = "Double";

    }

    /**
     * 数据集加工类型
     */
    interface ProcessType {
        /**
         * 可视化数据加工
         */
        String VIEW_PROCESS = "1";
        /**
         * sql 数据加工
         */
        String SQL_PROCESS = "2";
        /**
         * 代码编辑器
         */
        String CODE_PROCESS = "3";
    }

    interface DataSetType {
        /**
         * 自助数据集 /SQL
         */
        String CUSTOM = "custom";
        /**
         * 数据模型数据集
         */
        String MODEL = "dataModel";
        /**
         * 原始数据集
         */
        String ORIGINAL = "original";
        /**
         * 脚本数据集
         */
        String SCRIPT = "script";
        /**
         * JSON数据集
         */
        String JSON = "json";
        /**
         * 存储过程数据集
         */
        String STORED_PROCEDURE = "storedProcedure";
    }
}
