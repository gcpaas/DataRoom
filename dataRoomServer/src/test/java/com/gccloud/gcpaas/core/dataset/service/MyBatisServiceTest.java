package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.dataset.service.MyBatisService;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MyBatisServiceTest {

    @Test
    void generateSqlUsesProvidedParamsWhenAdditionalParametersDoesNotContainRootParameter() {
        SqlSessionFactory sqlSessionFactory = (SqlSessionFactory) Proxy.newProxyInstance(
                SqlSessionFactory.class.getClassLoader(),
                new Class<?>[]{SqlSessionFactory.class},
                (proxy, method, args) -> "getConfiguration".equals(method.getName()) ? new Configuration() : null
        );

        MyBatisService myBatisService = new MyBatisService();
        ReflectionTestUtils.setField(myBatisService, "sqlSessionFactory", sqlSessionFactory);

        String sql = """
                SELECT
                  *
                FROM
                  excel_user_info2
                where
                  会员等级 = '#{lev}'
                """;

        String parsedSql = myBatisService.generateSql(sql, Map.of("lev", "黄金"));

        assertEquals("""
                SELECT
                  *
                FROM
                  excel_user_info2
                where
                  会员等级 = '黄金'""", parsedSql);
    }
}
