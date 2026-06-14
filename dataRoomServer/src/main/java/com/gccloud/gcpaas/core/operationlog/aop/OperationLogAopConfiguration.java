package com.gccloud.gcpaas.core.operationlog.aop;

import com.gccloud.gcpaas.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogPolicy;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogPublisher;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogResolver;
import org.springframework.aop.Advisor;
import org.springframework.aop.support.DefaultPointcutAdvisor;
import org.springframework.aop.support.StaticMethodMatcherPointcut;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.AnnotatedElementUtils;

import java.lang.reflect.Method;

@Configuration
public class OperationLogAopConfiguration {

    @Bean
    public OperationLogMethodInterceptor operationLogMethodInterceptor(OperationLogResolver operationLogResolver,
                                                                       OperationLogPolicy operationLogPolicy,
                                                                       OperationLogPublisher operationLogPublisher) {
        return new OperationLogMethodInterceptor(operationLogResolver, operationLogPolicy, operationLogPublisher);
    }

    @Bean
    public Advisor operationLogAdvisor(OperationLogMethodInterceptor operationLogMethodInterceptor) {
        DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(new OperationLogMetaPointcut(), operationLogMethodInterceptor);
        advisor.setOrder(Ordered.LOWEST_PRECEDENCE - 20);
        return advisor;
    }

    private static class OperationLogMetaPointcut extends StaticMethodMatcherPointcut {
        @Override
        public boolean matches(Method method, Class<?> targetClass) {
            return AnnotatedElementUtils.hasAnnotation(targetClass, OperationLogMeta.class)
                    || AnnotatedElementUtils.hasAnnotation(method, OperationLogMeta.class);
        }
    }
}
