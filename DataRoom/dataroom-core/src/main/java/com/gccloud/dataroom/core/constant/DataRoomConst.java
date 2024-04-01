/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
     * 响应
     */
    interface Response {
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
            int NO_FOUNT = 404;
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