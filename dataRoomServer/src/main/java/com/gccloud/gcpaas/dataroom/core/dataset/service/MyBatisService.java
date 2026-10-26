package com.gccloud.gcpaas.dataroom.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.ParameterMapping;
import org.apache.ibatis.mapping.SqlSource;
import org.apache.ibatis.parsing.XNode;
import org.apache.ibatis.parsing.XPathParser;
import org.apache.ibatis.scripting.xmltags.XMLScriptBuilder;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.TypeHandler;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@Slf4j
public class MyBatisService {

    /**
     * 兼容历史模板：去掉 #{} 占位符外层的单引号，如 '#{name}' -> #{name}
     */
    private static final Pattern QUOTED_PARAM_PATTERN = Pattern.compile("'(#\\{[^}]*\\})'");

    @Resource
    private SqlSessionFactory sqlSessionFactory;

    /**
     * 解析动态SQL，返回带参数占位符?的BoundSql，参数值不做文本替换
     *
     * @param dynamicSql 动态SQL模板
     * @param params     参数
     * @return 带参数占位符的BoundSql
     */
    public BoundSql parse(String dynamicSql, Map<String, Object> params) {
        if (dynamicSql.contains("${")) {
            throw new DataRoomException("SQL中不允许使用${}动态拼接，存在SQL注入风险");
        }
        try {
            // 历史模板中 '#{param}' 的写法统一去掉外层单引号，避免参数化后残留引号
            String sql = QUOTED_PARAM_PATTERN.matcher(dynamicSql).replaceAll("$1");
            Configuration configuration = sqlSessionFactory.getConfiguration();
            String xml = "<script>" + sql + "</script>";
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
            Node node = doc.getFirstChild();
            XPathParser xpathParser = new XPathParser(doc);
            XNode xNode = new XNode(xpathParser, node, null);
            XMLScriptBuilder scriptBuilder = new XMLScriptBuilder(configuration, xNode, Map.class);
            SqlSource sqlSource = scriptBuilder.parseScriptNode();
            return sqlSource.getBoundSql(params);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("生成SQL失败");
        }
    }

    /**
     * 将BoundSql中的参数按顺序绑定到PreparedStatement，取值顺序与MyBatis DefaultParameterHandler一致
     *
     * @param preparedStatement 预编译语句
     * @param boundSql          parse方法返回的BoundSql
     */
    public void bind(PreparedStatement preparedStatement, BoundSql boundSql) throws SQLException {
        Configuration configuration = sqlSessionFactory.getConfiguration();
        List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
        Object parameterObject = boundSql.getParameterObject();
        for (int i = 0; i < parameterMappings.size(); i++) {
            ParameterMapping parameterMapping = parameterMappings.get(i);
            String property = parameterMapping.getProperty();
            Object value;
            if (boundSql.hasAdditionalParameter(property)) {
                // <foreach>等动态标签生成的附加参数
                value = boundSql.getAdditionalParameter(property);
            } else if (parameterObject == null) {
                value = null;
            } else {
                value = configuration.newMetaObject(parameterObject).getValue(property);
            }
            @SuppressWarnings("unchecked")
            TypeHandler<Object> typeHandler = (TypeHandler<Object>) parameterMapping.getTypeHandler();
            typeHandler.setParameter(preparedStatement, i + 1, value, parameterMapping.getJdbcType());
        }
    }
}
