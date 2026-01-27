package com.gccloud.gcpaas.core.shiro;

import org.apache.shiro.authc.AuthenticationToken;

/**
 * token
 */
public class ShiroAuthToken implements AuthenticationToken {

    private String token;

    public ShiroAuthToken(String token) {
        this.token = token;
    }

    @Override
    public String getPrincipal() {
        return token;
    }

    @Override
    public Object getCredentials() {
        return token;
    }
}
