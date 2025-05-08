package com.gccloud.dataroom.core.constant;

/**
 * @author liuchengbiao
 * @date 2020-06-21 13:33
 */
public interface DataRoomConst {
    /**
     * 控制台
     */
    interface Console {
        /**
         * 控制台line
         */
        String LINE = "----------------------------------------";
    }

    /**
     * jwt
     */
    interface Jwt {
        /**
         * 用户ID
         */
        String USER_ID = "uid";
        /**
         * jwt的唯一标识
         */
        String ID = "id";
        /**
         * 账号
         */
        String USER_NAME = "uname";
        /**
         * 角色编码
         */
        String ROLE = "role";
        /**
         * 角色权限
         */
        String PERMISSIONS = "permissions";

        /**
         * 存储策略
         */
        enum StoreStrategy {
            /**
             * 无状态存储
             */
            NONE,
            /**
             * 进程内存储，也叫单节点
             */
            PROCESS,
            /**
             * 分布式存储
             * Distributed
             */
            DIS;
        }
    }

    /**
     * 验证码
     */
    interface Captcha {
        /**
         * 类型
         */
        interface Type {
            /**
             * 动图
             */
            int GIF = 0;
            /**
             * 中文
             */
            int CHINESE = 1;
            /**
             * 中文动图
             */
            int CHINESE_GIF = 2;
            /**
             * 算术
             */
            int ARITHMETIC = 3;
            /**
             * 字符
             */
            int CHARACTER = 4;
        }
    }
    /**
     * 响应
     */
    interface Response {
        /**
         * 响应信息
         */
        interface Msg {
            String NO_LOGIN = "check if you set token in (header|cookie|path)";
        }
        /**
         * 响应码
         */
        interface Code {
            /**
             * 未登录
             */
            int NO_LOGIN = 401;
            /**
             * 无权限
             */
            int NO_ACCESS = 403;
            /**
             * 资源不存在
             */
            int NO_FOUND = 404;
            /**
             * 服务端异常
             */
            int SERVER_ERROR = 500;
            /**
             * 成功
             */
            int SUCCESS = 200;
        }
    }

    /**
     * 扫描包路径
     */
    interface ScanPackage {

        /**
         * 基础包路径
         */
        String COMPONENT = "com.gccloud.dataroom";

        /**
         * dao路径
         */
        String DAO = "com.gccloud.dataroom.core.**.dao";

    }

}
