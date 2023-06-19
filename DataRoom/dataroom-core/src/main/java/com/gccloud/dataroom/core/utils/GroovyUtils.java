package com.gccloud.dataroom.core.utils;


import com.gccloud.dataroom.core.exception.GlobalException;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.google.common.collect.Lists;
import groovy.lang.Binding;
import groovy.lang.GroovyClassLoader;
import groovy.lang.Script;
import groovy.transform.TimedInterrupt;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.codehaus.groovy.ast.stmt.Statement;
import org.codehaus.groovy.ast.stmt.WhileStatement;
import org.codehaus.groovy.control.CompilerConfiguration;
import org.codehaus.groovy.control.MultipleCompilationErrorsException;
import org.codehaus.groovy.control.customizers.ASTTransformationCustomizer;
import org.codehaus.groovy.control.customizers.SecureASTCustomizer;
import org.codehaus.groovy.runtime.InvokerHelper;
import org.codehaus.groovy.syntax.Types;
import org.kohsuke.groovy.sandbox.GroovyInterceptor;
import org.kohsuke.groovy.sandbox.SandboxTransformer;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


/**
 * 函数执行
 *
 * @author liuchengbiao
 * @date 2019-07-14 21:15
 */
@Slf4j
public class GroovyUtils {
    /**
     * 缓存编译好的类
     * key: 脚本
     * value: 编译好的class
     */
    static final Cache<String, Class> CACHE_CLASS = Caffeine.newBuilder().expireAfterWrite(10, TimeUnit.MINUTES).build();

    /**
     * 执行函数
     *
     * @param groovyScript 传入的脚本
     * @param params       传入的参数
     */
    public static Object run(String groovyScript, Map<String, Object> params) {
        Class clazz = buildClass(groovyScript);
        if (clazz == null) {
            return null;
        }
        Binding binding = new Binding();
        // 设置变量
        Map variables = binding.getVariables();
        if (params != null) {
            variables.putAll(params);
        }
        try {
            Script script = InvokerHelper.createScript(clazz, binding);
            Object result = script.run();
            return result;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new GlobalException("脚本执行失败", e);
        }
    }

    /**
     * 脚本编译
     *
     * @param groovyScript
     * @return
     */
    public static Class buildClass(String groovyScript) {
        if (StringUtils.isBlank(groovyScript)) {
            return null;
        }
        Class clazz = CACHE_CLASS.get(groovyScript, (script) -> {
            try {
                return buildClassSafe(script);
            } catch (Exception e) {
                log.error("脚本 {} 编译失败:{}", script, e);
                throw new GlobalException(e.getMessage());
            }
        });
        return clazz;
    }

    public static Class<?> buildClassSafe(String groovyScript) {
        // GroovyInterceptor无法拦截java API的调用，所以这里使用正则表达式判断是否包含文件操作的代码
        boolean fileOperation = containsFileOperation(groovyScript);
        if (fileOperation) {
            throw new GlobalException("脚本中包含不安全的代码，可能为while循环、goto、闭包、文件操作等");
        }
        // 自定义配置
        CompilerConfiguration config = new CompilerConfiguration();
        // 添加线程中断拦截器，可拦截循环体（while）、方法和闭包的首指令
        SecureASTCustomizer secure = new SecureASTCustomizer();
        // 禁止使用闭包
        secure.setClosuresAllowed(true);
        // 禁止使用文件操作（实际上这个也无法完全限制，因为File类可以不import直接使用）
        secure.setDisallowedImports(Lists.newArrayList("java.io.File"));
        secure.setDisallowedReceivers(Lists.newArrayList("java.io.File"));
        List<Integer> tokensBlacklist = new ArrayList<>();
        // 添加关键字黑名单 while和goto
        tokensBlacklist.add(Types.KEYWORD_WHILE);
        tokensBlacklist.add(Types.KEYWORD_GOTO);
        secure.setTokensBlacklist(tokensBlacklist);
        config.addCompilationCustomizers(secure);
        // statement 黑名单，不能使用while循环块
        List<Class<? extends Statement>> statementBlacklist = new ArrayList<>();
        statementBlacklist.add(WhileStatement.class);
        secure.setStatementsBlacklist(statementBlacklist);
        // 添加线程中断拦截器，可中断超时线程，当前定义超时时间为20s
        Map<String, Object> timeoutArgs = new HashMap<>();
        timeoutArgs.put("value", 20);
        config.addCompilationCustomizers(new ASTTransformationCustomizer(timeoutArgs, TimedInterrupt.class));
        // 沙盒环境
        config.addCompilationCustomizers(new SandboxTransformer());
        // 注册至当前线程
        new NoSystemExitSandbox().register();
        new NoRunTimeSandbox().register();
        new NoProcessSandbox().register();

        ClassLoader parent = GroovyUtils.class.getClassLoader();
        GroovyClassLoader loader = new GroovyClassLoader(parent, config);
        Class groovyClass;
        try {
            groovyClass = loader.parseClass(groovyScript);
            loader.close();
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            if (e.getClass() == SecurityException.class || e.getClass() == MultipleCompilationErrorsException.class) {
                throw new GlobalException("脚本中包含不安全的代码，可能为while循环、goto、闭包、文件操作等");
            }
            throw new GlobalException("脚本编译失败");
        }
        return groovyClass;
    }

    public static boolean containsFileOperation(String groovyScript) {
        // 匹配文件操作相关的语句
        Pattern pattern = Pattern.compile("(new\\s+)?(jave.io.File|File|Reader|Writer|InputStream|OutputStream)\\s*\\(");
        Matcher matcher = pattern.matcher(groovyScript);

        // 如果匹配到了，则说明包含文件操作相关语句
        return matcher.find();
    }


    static class NoSystemExitSandbox extends GroovyInterceptor {
        @Override
        public Object onStaticCall(Invoker invoker, Class receiver, String method, Object... args) throws Throwable {
            if (receiver == System.class && method.equals("exit")) {
                throw new SecurityException("No call on System.exit() please");
            }
            return super.onStaticCall(invoker, receiver, method, args);
        }
    }

    static class NoRunTimeSandbox extends GroovyInterceptor {
        @Override
        public Object onStaticCall(Invoker invoker, Class receiver, String method, Object... args) throws Throwable {
            if (receiver == Runtime.class) {
                throw new SecurityException("No call on RunTime please");
            }
            return super.onStaticCall(invoker, receiver, method, args);
        }
    }


    static class NoProcessSandbox extends GroovyInterceptor {
        @Override
        public Object onStaticCall(Invoker invoker, Class receiver, String method, Object... args) throws Throwable {
            if (receiver == Process.class) {
                throw new SecurityException("No call on Process please");
            }
            return super.onStaticCall(invoker, receiver, method, args);
        }
    }

    


}
