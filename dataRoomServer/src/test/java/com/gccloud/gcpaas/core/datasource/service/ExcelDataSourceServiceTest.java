package com.gccloud.gcpaas.core.datasource.service;

import com.gccloud.gcpaas.dataroom.core.datasource.bean.ExcelColumn;
import com.gccloud.gcpaas.dataroom.core.datasource.service.ExcelDataSourceService;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ExcelDataSourceServiceTest {

    @Test
    void parseCsvReturnsColumnsPreviewAndRowCount() {
        ExcelDataSourceService service = new ExcelDataSourceService();
        String csv = "城市,人口,日期\n杭州,123,2026-05-11\n上海,456,2026-05-12\n";

        ExcelDataSourceService.ExcelParseResult result = service.parseCsv(
                new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8))
        );

        List<ExcelColumn> columns = result.getColumns();
        assertEquals(3, columns.size());
        assertEquals("城市", columns.get(0).getOriginalHeader());
        assertEquals("INTEGER", columns.get(1).getType());
        assertEquals("DATE", columns.get(2).getType());
        assertEquals(2, result.getTotalRows());

        Map<String, Object> firstRow = result.getPreviewData().get(0);
        assertEquals("杭州", firstRow.get(columns.get(0).getName()));
        assertEquals("123", firstRow.get(columns.get(1).getName()));
    }
}
