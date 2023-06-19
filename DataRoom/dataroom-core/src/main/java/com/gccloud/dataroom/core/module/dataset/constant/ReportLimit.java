package com.gccloud.dataroom.core.module.dataset.constant;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;


/**
 * @author pan.shun
 * @since 2022/5/12 17:24
 */
@Slf4j
@Component
public class ReportLimit {
    /**
     * 存储过程导出最大数据量
     */
    public static Integer STORE_EXPORT_MAX_SIZE;

    /**
     * 存储过程单次查询最大数据量
     */
    public static Integer STORE_QUERY_MAX_SIZE;

    /**
     * 汇总统计单次导出最大上限
     */
    public static Integer EXPORT_MAX_SIZE;

    /**
     * 不开启分页清单单次查询上限
     */
    public static Integer CHECK_LIST_MAX_QUERY_SIZE;
    /**
     * 不开启分页汇总统计单次查询上限
     */
    public static Integer SUMMARY_MAX_QUERY_SIZE;

    @Value("${store-procedure-export-max-size:500000}")
    private Integer storeProcedureExportMaxSize;

    @Value("${store-procedure-query-max-size:20000}")
    private Integer maxStoreProcedureQuerySize;

    @Value("${summary-export-max-size:8000}")
    private Integer summaryExportMaxSize;

    @Value("${check-list-query-max-size:10000}")
    private Integer checkListQueryMaxSize;

    @Value("${summary-query-max-size:100000}")
    private Integer summaryQueryMaxSize;

    @PostConstruct
    public void initSize() {
        STORE_EXPORT_MAX_SIZE = storeProcedureExportMaxSize;
        STORE_QUERY_MAX_SIZE = maxStoreProcedureQuerySize;
        EXPORT_MAX_SIZE = summaryExportMaxSize;
        CHECK_LIST_MAX_QUERY_SIZE = checkListQueryMaxSize;
        SUMMARY_MAX_QUERY_SIZE = summaryQueryMaxSize;
    }
}
