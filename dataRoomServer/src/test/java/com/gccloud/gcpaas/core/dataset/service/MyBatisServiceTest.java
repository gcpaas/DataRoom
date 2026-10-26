package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.dataset.service.MyBatisService;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MyBatisServiceTest {

    private MyBatisService newMyBatisService() {
        SqlSessionFactory sqlSessionFactory = (SqlSessionFactory) Proxy.newProxyInstance(
                SqlSessionFactory.class.getClassLoader(),
                new Class<?>[]{SqlSessionFactory.class},
                (proxy, method, args) -> "getConfiguration".equals(method.getName()) ? new Configuration() : null
        );

        MyBatisService myBatisService = new MyBatisService();
        ReflectionTestUtils.setField(myBatisService, "sqlSessionFactory", sqlSessionFactory);
        return myBatisService;
    }

    /**
     * 代理PreparedStatement，按顺序捕获setXxx(index, value)中的value
     */
    private PreparedStatement capturePreparedStatement(List<Object> capturedValues) {
        return (PreparedStatement) Proxy.newProxyInstance(
                PreparedStatement.class.getClassLoader(),
                new Class<?>[]{PreparedStatement.class},
                (proxy, method, args) -> {
                    if (method.getName().startsWith("set") && args != null && args.length >= 2) {
                        capturedValues.add(args[1]);
                    }
                    return null;
                }
        );
    }

    @Test
    void parseKeepsPlaceholderWithoutInliningParam() {
        MyBatisService myBatisService = newMyBatisService();

        BoundSql boundSql = myBatisService.parse(
                "select * from excel_user_info2 where 会员等级 = #{lev}",
                Map.of("lev", "黄金"));

        assertEquals("select * from excel_user_info2 where 会员等级 = ?", boundSql.getSql().trim());
        assertEquals(1, boundSql.getParameterMappings().size());
    }

    @Test
    void parseStripsLegacyQuotesAroundPlaceholder() {
        MyBatisService myBatisService = newMyBatisService();

        BoundSql boundSql = myBatisService.parse(
                "select * from excel_user_info2 where 会员等级 = '#{lev}'",
                Map.of("lev", "黄金"));

        assertEquals("select * from excel_user_info2 where 会员等级 = ?", boundSql.getSql().trim());
        assertEquals(1, boundSql.getParameterMappings().size());
    }

    @Test
    void parseRejectsDollarPlaceholder() {
        MyBatisService myBatisService = newMyBatisService();

        DataRoomException exception = assertThrows(DataRoomException.class,
                () -> myBatisService.parse("select * from ${tableName}", Map.of("tableName", "t")));

        assertTrue(exception.getMessage().contains("${}"));
    }

    @Test
    void bindKeepsInjectionPayloadAsPlainValue() throws Exception {
        MyBatisService myBatisService = newMyBatisService();
        BoundSql boundSql = myBatisService.parse(
                "select * from t where id = #{id} and name = #{name}",
                Map.of("id", "0 OR 1=1", "name", "a' OR '1'='1"));

        assertEquals("select * from t where id = ? and name = ?", boundSql.getSql().trim());

        List<Object> capturedValues = new ArrayList<>();
        myBatisService.bind(capturePreparedStatement(capturedValues), boundSql);

        assertEquals(List.of("0 OR 1=1", "a' OR '1'='1"), capturedValues);
    }

    @Test
    void foreachAdditionalParametersAreBoundInOrder() throws Exception {
        MyBatisService myBatisService = newMyBatisService();
        String dynamicSql = "select * from t where id in "
                + "<foreach collection=\"ids\" item=\"i\" open=\"(\" separator=\",\" close=\")\">#{i}</foreach>";

        BoundSql boundSql = myBatisService.parse(dynamicSql, Map.of("ids", List.of(1, 2, 3)));

        String sql = boundSql.getSql();
        assertEquals(3, sql.length() - sql.replace("?", "").length());

        List<Object> capturedValues = new ArrayList<>();
        myBatisService.bind(capturePreparedStatement(capturedValues), boundSql);

        assertEquals(List.of(1, 2, 3), capturedValues);
    }
}
