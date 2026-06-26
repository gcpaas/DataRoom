package com.gccloud.gcpaas.dataroom.core.util;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Date;
import java.util.regex.Pattern;

public class TypeUtils {

    private static final Pattern YEAR_MONTH_PATTERN = Pattern.compile("\\d{4}-\\d{2}");
    private static final Pattern DATE_PATTERN = Pattern.compile("\\d{4}-\\d{2}-\\d{2}");
    private static final Pattern DATE_TIME_PATTERN = Pattern.compile("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}");
    private static final Pattern TIME_PATTERN = Pattern.compile("\\d{2}:\\d{2}:\\d{2}");

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
        if (val instanceof Short || val instanceof Integer || val instanceof Long || val instanceof Float || val instanceof Double
                || val instanceof BigInteger || val instanceof BigDecimal) {
            return "int";
        } else if (val instanceof Date) {
            return "Date";
        }
        if (val == null) {
            return "String";
        }
        return isDateString(val.toString()) ? "Date" : "String";
    }

    private static boolean isDateString(String val) {
        String text = val.trim();
        if (YEAR_MONTH_PATTERN.matcher(text).matches()) {
            return isValidMonth(parseInt(text, 5, 7));
        }
        if (DATE_PATTERN.matcher(text).matches()) {
            return isValidDate(text);
        }
        if (DATE_TIME_PATTERN.matcher(text).matches()) {
            return isValidDate(text.substring(0, 10)) && isValidTime(text.substring(11));
        }
        if (TIME_PATTERN.matcher(text).matches()) {
            return isValidTime(text);
        }
        return false;
    }

    private static boolean isValidDate(String text) {
        int year = parseInt(text, 0, 4);
        int month = parseInt(text, 5, 7);
        int day = parseInt(text, 8, 10);
        return isValidMonth(month) && day >= 1 && day <= maxDayOfMonth(year, month);
    }

    private static boolean isValidTime(String text) {
        int hour = parseInt(text, 0, 2);
        int minute = parseInt(text, 3, 5);
        int second = parseInt(text, 6, 8);
        return hour <= 23 && minute <= 59 && second <= 59;
    }

    private static boolean isValidMonth(int month) {
        return month >= 1 && month <= 12;
    }

    private static int maxDayOfMonth(int year, int month) {
        if (month == 2) {
            return isLeapYear(year) ? 29 : 28;
        }
        if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        }
        return 31;
    }

    private static boolean isLeapYear(int year) {
        return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    }

    private static int parseInt(String text, int start, int end) {
        return Integer.parseInt(text.substring(start, end));
    }
}
