package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.dataset.service.MyBatisService;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * SQL注入防护的真实数据库验证：参数化改造后，注入payload只能作为普通值参与比较，无法改变查询语义
 */
class MyBatisServiceInjectionTest {

    private static final String JDBC_URL = "jdbc:h2:mem:injection_test;DB_CLOSE_DELAY=-1";

    private MyBatisService myBatisService;

    @BeforeEach
    void setUp() throws Exception {
        Class.forName("org.h2.Driver");
        SqlSessionFactory sqlSessionFactory = (SqlSessionFactory) Proxy.newProxyInstance(
                SqlSessionFactory.class.getClassLoader(),
                new Class<?>[]{SqlSessionFactory.class},
                (proxy, method, args) -> "getConfiguration".equals(method.getName()) ? new Configuration() : null
        );
        myBatisService = new MyBatisService();
        ReflectionTestUtils.setField(myBatisService, "sqlSessionFactory", sqlSessionFactory);

        try (Connection connection = DriverManager.getConnection(JDBC_URL);
             Statement statement = connection.createStatement()) {
            statement.execute("DROP TABLE IF EXISTS excel_user_info2");
            statement.execute("CREATE TABLE excel_user_info2 (姓名 NVARCHAR(50), 邮箱 VARCHAR(100), 手机号 VARCHAR(20))");
            statement.execute("INSERT INTO excel_user_info2 VALUES ('张三', 'zhangsan@test.com', '13800000001')");
            statement.execute("INSERT INTO excel_user_info2 VALUES ('李四', 'lisi@test.com', '13800000002')");
        }
    }

    private int executeCount(String dynamicSql, Map<String, Object> params) throws Exception {
        BoundSql boundSql = myBatisService.parse(dynamicSql, params);
        try (Connection connection = DriverManager.getConnection(JDBC_URL);
             PreparedStatement preparedStatement = connection.prepareStatement(boundSql.getSql())) {
            myBatisService.bind(preparedStatement, boundSql);
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                int count = 0;
                while (resultSet.next()) {
                    count++;
                }
                return count;
            }
        }
    }

    @Test
    void normalParamReturnsExactRow() throws Exception {
        int count = executeCount(
                "SELECT * FROM excel_user_info2 where 姓名 = #{name}",
                Map.of("name", "张三"));

        assertEquals(1, count);
    }

    @Test
    void injectionPayloadCannotBypassWhereClause() throws Exception {
        // 旧的文本替换方式下，该payload会拼成 姓名 = '张三' OR '1'='1'，导致全表2行全部返回
        int count = executeCount(
                "SELECT * FROM excel_user_info2 where 姓名 = #{name}",
                Map.of("name", "张三' OR '1'='1"));

        assertEquals(0, count);
    }

    @Test
    void legacyQuotedTemplateIsAlsoSafe() throws Exception {
        // 历史模板带单引号写法，解析时自动去引号后参数化，同样无法注入
        int count = executeCount(
                "SELECT * FROM excel_user_info2 where 姓名 = '#{name}'",
                Map.of("name", "张三' OR '1'='1"));

        assertEquals(0, count);
    }

    @Test
    void multiFieldQueryBindsEachParamIndependently() throws Exception {
        String sql = "SELECT * FROM excel_user_info2 where 姓名 = #{name} AND 邮箱 = #{email} AND 手机号 = #{phone}";

        // 正常组合：命中张三这一行
        assertEquals(1, executeCount(sql, Map.of(
                "name", "张三", "email", "zhangsan@test.com", "phone", "13800000001")));

        // 邮箱字段携带payload：无法绕过其他条件，查不到任何行
        assertEquals(0, executeCount(sql, Map.of(
                "name", "张三", "email", "x' OR '1'='1", "phone", "13800000001")));
    }
}
