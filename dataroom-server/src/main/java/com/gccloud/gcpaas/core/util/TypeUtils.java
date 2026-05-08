package com.gccloud.gcpaas.core.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.SimpleDateFormat;
import java.util.Date;

public class TypeUtils {

    private static final Logger log = LoggerFactory.getLogger(TypeUtils.class);

    public static Object transType(Object val, String expectType) {
        if ("int".equalsIgnoreCase(expectType)) {
            return Integer.parseInt(val.toString());
        }
        if ("String".equalsIgnoreCase(expectType)) {
            return val.toString();
        }
        return val;
    }

    public static String parseType(Object val) {
        if (val instanceof Short || val instanceof Integer || val instanceof Long || val instanceof Float || val instanceof Double) {
            return "int";
        } else if (val instanceof Date) {
            return "Date";
        }
        try {
            new SimpleDateFormat("yyyy-MM").parse(val.toString());
            return "Date";
        } catch (Exception e) {
        }
        try {
            new SimpleDateFormat("yyyy-MM-dd").parse(val.toString());
            return "Date";
        } catch (Exception e) {
        }
        try {
            new SimpleDateFormat("yyyy-MM-dd HH:ss:mm").parse(val.toString());
            return "Date";
        } catch (Exception e) {
        }
        try {
            new SimpleDateFormat("HH:ss:mm").parse(val.toString());
            return "Date";
        } catch (Exception e) {
        }
        return "String";
    }
}
