package com.gccloud.gcpaas.core.config;

import com.gccloud.gcpaas.core.constant.PageStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PageStatusConverterTest {

    private final PageStatusConverter converter = new PageStatusConverter();

    @Test
    void convertSupportsTypeValue() {
        assertEquals(PageStatus.HISTORY, converter.convert("history"));
        assertEquals(PageStatus.DESIGN, converter.convert("design"));
    }

    @Test
    void convertSupportsEnumNameIgnoringCase() {
        assertEquals(PageStatus.HISTORY, converter.convert("HISTORY"));
        assertEquals(PageStatus.PUBLISHED, converter.convert("published"));
    }

    @Test
    void convertReturnsNullForBlankInput() {
        assertNull(converter.convert(null));
        assertNull(converter.convert(" "));
    }

    @Test
    void convertRejectsUnknownValue() {
        assertThrows(IllegalArgumentException.class, () -> converter.convert("unknown"));
    }
}
