package com.gccloud.gcpaas.core.exception;

import lombok.Data;


@Data
public class DataRoomException extends RuntimeException {

    private int code = 500;
    
    public DataRoomException(String msg) {
        super(msg);
    }

    public DataRoomException(String msg, Throwable e) {
        super(msg, e);
    }

    public DataRoomException(String msg, int code) {
        super(msg);
        this.setCode(code);
    }

    public DataRoomException(String msg, int code, Throwable e) {
        super(msg, e);
        this.setCode(code);
    }
}
