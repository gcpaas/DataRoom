package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.core.exception.DataRoomException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ExcelDatasetServiceTest {

    @Test
    void validateSqlAllowsExcelTablesInSelectJoinSubqueryAndCte() {
        assertDoesNotThrow(() -> ExcelDatasetService.validateExcelSql("""
                with recent_sales as (
                  select id, customer_id from excel_sales where amount > 100
                )
                select s.id, c.name
                from recent_sales s
                join excel_customers c on c.id = s.customer_id
                where exists (
                  select 1 from excel_regions r where r.id = c.region_id
                )
                """));
    }

    @Test
    void validateSqlRejectsNonExcelTables() {
        DataRoomException ex = assertThrows(
                DataRoomException.class,
                () -> ExcelDatasetService.validateExcelSql("select * from excel_sales join sys_user u on u.id = excel_sales.user_id")
        );

        assertTrue(ex.getMessage().contains("Excel数据集只能查询excel_开头的表"));
        assertTrue(ex.getMessage().contains("sys_user"));
    }

    @Test
    void validateSqlRejectsNonExcelTablesInsideCte() {
        DataRoomException ex = assertThrows(
                DataRoomException.class,
                () -> ExcelDatasetService.validateExcelSql("""
                        with bad_source as (
                          select id from sys_user
                        )
                        select * from excel_sales
                        """)
        );

        assertTrue(ex.getMessage().contains("Excel数据集只能查询excel_开头的表"));
        assertTrue(ex.getMessage().contains("sys_user"));
    }

    @Test
    void validateSqlAllowsQuotedExcelTableNames() {
        assertDoesNotThrow(() -> ExcelDatasetService.validateExcelSql("select * from \"excel_sales\""));
    }

    @Test
    void validateSqlRejectsNonSelectStatements() {
        DataRoomException ex = assertThrows(
                DataRoomException.class,
                () -> ExcelDatasetService.validateExcelSql("delete from excel_sales")
        );

        assertTrue(ex.getMessage().contains("仅允许执行select操作"));
    }

    @Test
    void validateSqlRejectsInvalidSqlWithParseMessage() {
        DataRoomException ex = assertThrows(
                DataRoomException.class,
                () -> ExcelDatasetService.validateExcelSql("select from")
        );

        assertTrue(ex.getMessage().contains("Excel数据集SQL解析失败"));
    }
}
