package com.gccloud.dataroom.core.module.dataset.utils;

import com.gccloud.dataroom.core.module.dataset.entity.DatasetProcessEntity;
import com.gccloud.dataroom.core.module.dataset.constant.ReportConstant;
import com.gccloud.dataroom.core.module.dataset.process.ViewSqlProcess;
import com.gccloud.dataroom.core.exception.GlobalException;
import groovy.lang.GroovyClassLoader;
import groovy.lang.GroovyObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author pan.shun
 * @since 2022/5/28 09:58
 */
@Slf4j
public class ReportUtils extends ViewSqlProcess {

    /**
     * 去除字符串中所有数字
     */
    public static String trimNumber(String v) {
        return v.replaceAll("\\d+", "");
    }

    /**
     * 去除字符串中所有字母
     */
    public static Integer trimStr(String v) {
        String regEx = "[A-Za-z]";
        Pattern p = Pattern.compile(regEx);
        Matcher m = p.matcher(v);
        return Integer.valueOf(m.replaceAll("").trim());
    }

    /**
     * 去除字符串中某两个字符串之间的内容
     *
     * @param body 字符串整体
     * @param str1 起始字符串
     * @param str2 结束字符串
     */
    public static String subRangeString(String body, String str1, String str2) {
        while (true) {
            int index1 = body.indexOf(str1);
            if (index1 != -1) {
                int index2 = body.indexOf(str2, index1);
                if (index2 != -1) {
                    body = body.substring(0, index1) + body.substring(index2 + str2.length());
                } else {
                    return body;
                }
            } else {
                return body;
            }
        }
    }


    /**
     * 构建可视化数据集加工sql语句
     *
     * @param codeProcess 参数配置信息
     */
    public static String buildViewProcessSql(String codeProcess) {
        if (StringUtils.isEmpty(codeProcess)) {
            throw new GlobalException("可视化数据集加工配置信息不能为空");
        }
        // 这里写解析代码
        String viewProcessSql = buildSqlByViewConfig(codeProcess);
        log.info("可视化自助数据SQL构建完毕： {}", viewProcessSql);
        return viewProcessSql;
    }

    public static void buildProcessSql(DatasetProcessEntity datasetProcessEntity) {
        if (null != datasetProcessEntity && ReportConstant.ProcessType.VIEW_PROCESS.equals(datasetProcessEntity.getProcessType())) {
            // 可视化数据集加工
            String processSql = buildViewProcessSql(datasetProcessEntity.getCodeProcess());
            datasetProcessEntity.setSqlProcess(processSql);
        }
    }

    /**
     * Groovy 执行
     */
    public static Object invoke(String scriptText, String function, Object... objects) {
        GroovyClassLoader classLoader = new GroovyClassLoader();
        Class groovyClass = classLoader.parseClass(scriptText);
        try {
            GroovyObject groovyObject = (GroovyObject) groovyClass.newInstance();
            return groovyObject.invokeMethod(function, objects);
        } catch (InstantiationException | IllegalAccessException e) {
            return null;
        }
    }
}
