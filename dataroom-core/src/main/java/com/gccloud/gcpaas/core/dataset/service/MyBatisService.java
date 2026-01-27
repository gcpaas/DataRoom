package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.core.exception.DataRoomException;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.ParameterMapping;
import org.apache.ibatis.mapping.SqlSource;
import org.apache.ibatis.parsing.XNode;
import org.apache.ibatis.parsing.XPathParser;
import org.apache.ibatis.scripting.xmltags.XMLScriptBuilder;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class MyBatisService {

    @Resource
    private SqlSessionFactory sqlSessionFactory;

    /**
     * 生成SQL
     *
     * @param dynamicSql
     * @param params
     * @return
     */
    public String generateSql(String dynamicSql, Map<String, Object> params) {
        try {
            Configuration configuration = sqlSessionFactory.getConfiguration();
            String xml = "<script>" + dynamicSql + "</script>";
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes()));
            Node node = doc.getFirstChild();
            XPathParser xpathParser = new XPathParser(doc);
            XNode xNode = new XNode(xpathParser, node, null);
            XMLScriptBuilder scriptBuilder = new XMLScriptBuilder(configuration, xNode, Map.class);
            SqlSource sqlSource = scriptBuilder.parseScriptNode();
            BoundSql boundSql = sqlSource.getBoundSql(params);
            String parsedSql = boundSql.getSql();
            List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
            Map<String, Object> additionalParameters = boundSql.getAdditionalParameters();
            for (ParameterMapping mapping : parameterMappings) {
                String property = mapping.getProperty();
                Object val = additionalParameters.get(property);
                if (val == null) {
                    Map<String, Object> map = (Map<String, Object>) additionalParameters.get("_parameter");
                    val = map.get(property);
                }
                String valueStr = val.toString().replace("'", "''");
                parsedSql = parsedSql.replaceFirst("\\?", "" + valueStr + "");
            }
            return parsedSql;
        } catch (Exception e) {
            log.error("生成SQL失败", e);
            throw new DataRoomException("生成SQL失败");
        }
    }
}
