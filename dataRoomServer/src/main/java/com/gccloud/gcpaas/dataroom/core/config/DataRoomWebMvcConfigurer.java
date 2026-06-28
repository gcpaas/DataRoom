package com.gccloud.gcpaas.dataroom.core.config;

import com.gccloud.gcpaas.dataroom.core.config.converter.PageStatusConverter;
import com.gccloud.gcpaas.dataroom.core.config.converter.PageTypeConverter;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPersistService;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPolicy;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPublisher;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogResolver;
import com.gccloud.gcpaas.dataroom.core.operationlog.web.OperationLogFilter;
import com.gccloud.gcpaas.dataroom.core.operationlog.web.OperationLogInterceptor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.format.FormatterRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.Executor;

@Configuration
public class DataRoomWebMvcConfigurer implements WebMvcConfigurer {
    /**
     * 添加全局类型格式化器
     *
     * @param registry
     */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new PageStatusConverter());
        registry.addConverter(new PageTypeConverter());
    }

    @Bean("operationLogExecutor")
    public Executor operationLogExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("operation-log-");
        executor.initialize();
        return executor;
    }

    @Bean
    public OperationLogPolicy operationLogPolicy() {
        return new OperationLogPolicy();
    }

    @Bean
    public OperationLogResolver operationLogResolver() {
        return new OperationLogResolver();
    }

    @Bean
    public OperationLogPublisher operationLogPublisher(Executor operationLogExecutor,
                                                       OperationLogPersistService operationLogPersistService) {
        return new OperationLogPublisher(operationLogExecutor, operationLogPersistService);
    }

//    @Bean
    public FilterRegistrationBean<OperationLogFilter> operationLogFilterRegistration(OperationLogPolicy operationLogPolicy,
                                                                                     OperationLogResolver operationLogResolver,
                                                                                     OperationLogPublisher operationLogPublisher) {
        FilterRegistrationBean<OperationLogFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new OperationLogFilter(operationLogPolicy, operationLogResolver, operationLogPublisher));
        registrationBean.addUrlPatterns("/dataRoom/*");
        registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
        return registrationBean;
    }

    @Bean
    public OperationLogInterceptor operationLogInterceptor(OperationLogResolver operationLogResolver) {
        return new OperationLogInterceptor(operationLogResolver);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(operationLogInterceptor(operationLogResolver()))
                .addPathPatterns("/dataRoom/**");
    }
}
