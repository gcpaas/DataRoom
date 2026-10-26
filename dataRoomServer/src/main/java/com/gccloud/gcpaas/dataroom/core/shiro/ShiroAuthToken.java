package com.gccloud.gcpaas.dataroom.core.shiro;

import org.apache.shiro.authc.AuthenticationToken;

/**
 * token
 */
public class ShiroAuthToken implements AuthenticationToken {

    private final String token;
    private final boolean mcpToken;

    public ShiroAuthToken(String token) {
        this(token, false);
    }

    public ShiroAuthToken(String token, boolean mcpToken) {
        this.token = token;
        this.mcpToken = mcpToken;
    }

    public boolean isMcpToken() {
        return mcpToken;
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
