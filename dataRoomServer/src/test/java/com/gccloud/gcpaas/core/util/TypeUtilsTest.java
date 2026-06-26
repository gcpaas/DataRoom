package com.gccloud.gcpaas.core.util;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.gccloud.gcpaas.dataroom.core.util.TypeUtils;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TypeUtilsTest {

    @Test
    void parseTypeTreatsPlainTextAsStringWithoutErrorLogs() {
        Logger logger = (Logger) LoggerFactory.getLogger(TypeUtils.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            assertEquals("String", TypeUtils.parseType("张三"));
        } finally {
            logger.detachAppender(appender);
        }

        assertTrue(appender.list.stream().noneMatch(event -> event.getLevel().isGreaterOrEqual(Level.ERROR)));
    }

    @Test
    void parseTypeDetectsCommonRuntimeTypes() {
        assertEquals("int", TypeUtils.parseType(1));
        assertEquals("Date", TypeUtils.parseType(new Date()));
        assertEquals("Date", TypeUtils.parseType("2026-06"));
        assertEquals("Date", TypeUtils.parseType("2026-06-26"));
        assertEquals("Date", TypeUtils.parseType("2026-06-26 12:30:45"));
        assertEquals("Date", TypeUtils.parseType("12:30:45"));
    }
}
