package com.gccloud.dataroom.core.exception;

import com.gccloud.dataroom.core.constant.DataRoomConst;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.vo.R;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

/**
 * 全局异常处理
 *
 * @Author maoshufeng
 * @Date 2020-06-19
 * @Version 1.0.0
 */
@RestControllerAdvice
@Slf4j
@ConditionalOnProperty(prefix = "gc.starter.dataroom.component", name = "DataRoomGlobalExceptionHandler", havingValue = "DataRoomGlobalExceptionHandler", matchIfMissing = true)
public class DataRoomGlobalExceptionHandler {

    @PostConstruct
    public void init() {
        log.info(DataRoomConst.Console.LINE);
        log.info("初始化默认全局异常处理，如果和项目中的全局异常处理冲突，可以在配置文件中配置gc.starter.dataroom.component.DataRoomGlobalExceptionHandler=false禁用该全局异常处理");
        log.info(DataRoomConst.Console.LINE);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public R<String> httpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
        log.error(ExceptionUtils.getStackTrace(e));
        R<String> r = new R<String>();
        r.setCode(DataRoomConst.Response.Code.SERVER_ERROR);
        r.setMsg("不支持该请求方式");
        return r;
    }

    /**
     * 处理自定义异常
     */
    @ExceptionHandler(GlobalException.class)
    public R<String> exception(HttpServletRequest request, GlobalException e) {
        log.error(ExceptionUtils.getStackTrace(e));
        R<String> r = new R<>();
        r.setCode(e.getCode());
        r.setMsg(e.getMessage());
        return r;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public R<String> illegalArgumentException(Exception e) {
        log.error(ExceptionUtils.getStackTrace(e));
        return R.error("参数非法");
    }

    @ExceptionHandler(Exception.class)
    public R<String> handleException(Exception e) {
        log.error(ExceptionUtils.getStackTrace(e));
        return R.error("服务器异常");
    }
}
