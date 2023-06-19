package com.gccloud.dataroom.core.module.dataset.constant;

/**
 * @author pan.shun
 * @since 2022/9/2 13:32
 */
public abstract class OracleTypes {
    public static final int BIT = -7;
    public static final int TINYINT = -6;
    public static final int SMALLINT = 5;
    public static final int INTEGER = 4;
    public static final int BIGINT = -5;
    public static final int FLOAT = 6;
    public static final int REAL = 7;
    public static final int DOUBLE = 8;
    public static final int NUMERIC = 2;
    public static final int DECIMAL = 3;
    public static final int CHAR = 1;
    public static final int VARCHAR = 12;
    public static final int LONGVARCHAR = -1;
    public static final int DATE = 91;
    public static final int TIME = 92;
    public static final int TIMESTAMP = 93;
    public static final int PLSQL_BOOLEAN = 252;
    /**
     * @deprecated
     */
    public static final int TIMESTAMPNS = -100;
    public static final int TIMESTAMPTZ = -101;
    public static final int TIMESTAMPLTZ = -102;
    public static final int INTERVALYM = -103;
    public static final int INTERVALDS = -104;
    public static final int BINARY = -2;
    public static final int VARBINARY = -3;
    public static final int LONGVARBINARY = -4;
    public static final int ROWID = -8;
    public static final int CURSOR = -10;
    public static final int BLOB = 2004;
    public static final int CLOB = 2005;
    public static final int BFILE = -13;
    public static final int STRUCT = 2002;
    public static final int ARRAY = 2003;
    public static final int REF = 2006;
    public static final int NCHAR = -15;
    public static final int NCLOB = 2011;
    public static final int NVARCHAR = -9;
    public static final int LONGNVARCHAR = -16;
    public static final int SQLXML = 2009;
    public static final int OPAQUE = 2007;
    public static final int JAVA_STRUCT = 2008;
    public static final int JAVA_OBJECT = 2000;
    public static final int PLSQL_INDEX_TABLE = -14;
    public static final int BINARY_FLOAT = 100;
    public static final int BINARY_DOUBLE = 101;
    public static final int NULL = 0;
    public static final int NUMBER = 2;
    public static final int RAW = -2;
    public static final int OTHER = 1111;
    public static final int FIXED_CHAR = 999;
    public static final int DATALINK = 70;
    public static final int BOOLEAN = 16;

    public OracleTypes() {
    }
}
