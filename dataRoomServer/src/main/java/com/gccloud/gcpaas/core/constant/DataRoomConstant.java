package com.gccloud.gcpaas.core.constant;

public interface DataRoomConstant {
    /**
     * 数据集
     */
    interface Dataset {
        /**
         * 编码前缀
         */
        String CODE_PREFIX = "dataset";
        String SERVICE_NAME = "DatasetService";

        interface HTTP_DATASET {
            interface METHOD {
                String POST = "post";
                String GET = "get";
            }
        }
    }

    /**
     * 数据源
     */
    interface Datasource {
        /**
         * 编码前缀
         */
        String CODE_PREFIX = "dataSource";
    }
}
