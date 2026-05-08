package com.gccloud.gcpaas.core.util;

import com.gccloud.gcpaas.core.shiro.LoginUser;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;

@Slf4j
public class LoginUserUtils {

    public static LoginUser getCurrentUser() {
        Subject subject = null;
        try {
            subject = SecurityUtils.getSubject();
            Object principal = subject.getPrincipal();
            if (principal == null) {
                return null;
            }
            return (LoginUser) principal;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return null;
    }
}
