package com.gccloud.gcpaas.dataroom.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.Statements;
import net.sf.jsqlparser.statement.select.Select;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;

import java.util.List;

/**
 * SQL安全校验工具：基于JSqlParser语法树校验，替代脆弱的字符串前缀匹配
 */
@Slf4j
public final class SqlValidateUtils {

    private SqlValidateUtils() {
    }

    /**
     * 校验SQL为单条Select查询（WITH CTE视为Select），校验通过返回解析后的Select
     *
     * @param sql          待校验SQL
     * @param sqlTypeLabel SQL类型标签，用于解析失败时的错误提示前缀，如"Excel数据集"
     * @return 解析后的Select语句
     */
    public static Select validateSelectOnly(String sql, String sqlTypeLabel) {
        if (StringUtils.isBlank(sql)) {
            throw new DataRoomException("SQL不能为空");
        }
        Statements statements;
        try {
            // 使用parseStatements而非parse：parse只消费第一条语句，多语句的后半段会被静默忽略
            statements = CCJSqlParserUtil.parseStatements(sql);
        } catch (JSQLParserException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException(sqlTypeLabel + "SQL解析失败：" + e.getMessage(), e);
        }
        List<Statement> statementList = statements.getStatements();
        if (statementList.size() != 1) {
            throw new DataRoomException("仅允许执行单条select操作");
        }
        if (!(statementList.get(0) instanceof Select select)) {
            throw new DataRoomException("仅允许执行select操作");
        }
        return select;
    }
}
