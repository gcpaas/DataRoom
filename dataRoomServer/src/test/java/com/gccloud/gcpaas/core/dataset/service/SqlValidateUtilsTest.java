package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.dataset.service.SqlValidateUtils;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import net.sf.jsqlparser.statement.select.Select;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SqlValidateUtilsTest {

    private static final String LABEL = "数据集";

    @Test
    void allowsSimpleSelectWithPlaceholder() {
        Select select = SqlValidateUtils.validateSelectOnly("select * from excel_t where id = ?", LABEL);
        assertNotNull(select);
    }

    @Test
    void allowsCteSelect() {
        assertDoesNotThrow(() -> SqlValidateUtils.validateSelectOnly(
                "with cte as (select id from excel_a) select * from cte", LABEL));
    }

    @Test
    void allowsLeadingCommentAndWhitespace() {
        // startsWith("select") 会被前导注释/空白误杀，语法树校验不受影响
        assertDoesNotThrow(() -> SqlValidateUtils.validateSelectOnly(
                "  /* 注释 */\n select * from excel_t ", LABEL));
    }

    @Test
    void rejectsMultiStatements() {
        // parseStatements 必须解析出且仅解析出一条语句，防止后半段被静默忽略
        DataRoomException e = assertThrows(DataRoomException.class,
                () -> SqlValidateUtils.validateSelectOnly("select * from excel_t; drop table excel_t", LABEL));
        assertTrue(e.getMessage().contains("仅允许执行单条select操作"));
    }

    @Test
    void rejectsNonSelectStatements() {
        String[] nonSelectSqls = {
                "update excel_t set a = 1",
                "delete from excel_t",
                "insert into excel_t values (1)"
        };
        for (String sql : nonSelectSqls) {
            DataRoomException e = assertThrows(DataRoomException.class,
                    () -> SqlValidateUtils.validateSelectOnly(sql, LABEL));
            assertTrue(e.getMessage().contains("仅允许执行select操作"), sql);
        }
    }

    @Test
    void rejectsBlankSql() {
        DataRoomException e = assertThrows(DataRoomException.class,
                () -> SqlValidateUtils.validateSelectOnly("  ", LABEL));
        assertTrue(e.getMessage().contains("SQL不能为空"));
    }

    @Test
    void rejectsInvalidSqlWithLabeledMessage() {
        DataRoomException e = assertThrows(DataRoomException.class,
                () -> SqlValidateUtils.validateSelectOnly("select from", LABEL));
        assertTrue(e.getMessage().contains("数据集SQL解析失败"));
    }
}
