package com.gccloud.gcpaas.core.dataset.service;

import org.junit.jupiter.api.Test;

import java.sql.Types;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SqlDatasetServiceTest {

    @Test
    void resolveOutputTypeSupportsJdbcStandardTypes() {
        assertEquals("String", SqlDatasetService.resolveOutputType(Types.VARCHAR, "varchar"));
        assertEquals("String", SqlDatasetService.resolveOutputType(Types.CLOB, "CLOB"));
        assertEquals("int", SqlDatasetService.resolveOutputType(Types.INTEGER, "INTEGER"));
        assertEquals("int", SqlDatasetService.resolveOutputType(Types.DECIMAL, "DECIMAL"));
        assertEquals("Date", SqlDatasetService.resolveOutputType(Types.DATE, "DATE"));
        assertEquals("Date", SqlDatasetService.resolveOutputType(Types.TIMESTAMP, "TIMESTAMP"));
        assertEquals("String", SqlDatasetService.resolveOutputType(Types.BOOLEAN, "BOOLEAN"));
    }

    @Test
    void resolveOutputTypeSupportsCommonDatabaseTypeNames() {
        assertEquals("int", SqlDatasetService.resolveOutputType(Types.OTHER, "int4"));
        assertEquals("int", SqlDatasetService.resolveOutputType(Types.OTHER, "NUMBER"));
        assertEquals("int", SqlDatasetService.resolveOutputType(Types.OTHER, "NUMBER(18,2)"));
        assertEquals("int", SqlDatasetService.resolveOutputType(Types.OTHER, "BIGINT UNSIGNED"));
        assertEquals("Date", SqlDatasetService.resolveOutputType(Types.OTHER, "datetime"));
        assertEquals("Date", SqlDatasetService.resolveOutputType(Types.OTHER, "TIMESTAMP WITH TIME ZONE"));
        assertEquals("Date", SqlDatasetService.resolveOutputType(Types.OTHER, "timestamptz"));
        assertEquals("String", SqlDatasetService.resolveOutputType(Types.OTHER, "JSONB"));
        assertEquals("String", SqlDatasetService.resolveOutputType(Types.OTHER, null));
    }
}
