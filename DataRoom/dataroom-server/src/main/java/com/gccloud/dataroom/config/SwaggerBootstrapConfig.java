package com.gccloud.dataroom.config;

import com.gccloud.dataroom.core.constant.DataRoomConst;
import com.gccloud.dataset.constant.DatasetConstant;
import com.github.xiaoymin.swaggerbootstrapui.annotations.EnableSwaggerBootstrapUI;
import com.google.common.base.Predicates;
import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.mvc.method.RequestMappingInfoHandlerMapping;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.builders.ResponseMessageBuilder;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.ResponseMessage;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.spring.web.plugins.WebMvcRequestHandlerProvider;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.lang.reflect.Field;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Swagger2
 *
 * @Author maoshufeng
 * @Date 2020-03-30 16:12
 * @Version 1.0
 */
@Slf4j
@Component
@Configuration
@EnableSwagger2
@EnableSwaggerBootstrapUI
public class SwaggerBootstrapConfig implements WebMvcConfigurer {

    private static final List<ResponseMessage> RESPONSE_MESSAGES = Lists.newArrayList(
            new ResponseMessageBuilder().code(DataRoomConst.Response.Code.SUCCESS).message("成功").build(),
            new ResponseMessageBuilder().code(DataRoomConst.Response.Code.NO_FOUNT).message("您访问的资源不存在").build(),
            new ResponseMessageBuilder().code(DataRoomConst.Response.Code.NO_LOGIN).message("您没有登录或token已过期").build(),
            new ResponseMessageBuilder().code(DataRoomConst.Response.Code.NO_ACCESS).message("您无权访问该资源").build(),
            new ResponseMessageBuilder().code(DataRoomConst.Response.Code.SERVER_ERROR).message("系统内部异常").build()
    );

    @Bean
    public Docket dataRoomDocket() {
        ApiInfo apiInfo = new ApiInfoBuilder()
                .title("大屏")
                .version("1.0.0")
                .build();
        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("大屏")
                .apiInfo(apiInfo)
                .useDefaultResponseMessages(false)
                .globalResponseMessage(RequestMethod.GET, RESPONSE_MESSAGES)
                .globalResponseMessage(RequestMethod.POST, RESPONSE_MESSAGES)
                .globalResponseMessage(RequestMethod.PUT, RESPONSE_MESSAGES)
                .globalResponseMessage(RequestMethod.DELETE, RESPONSE_MESSAGES)
                .select()
                // 包扫描路径
                .apis(Predicates.or(
                        RequestHandlerSelectors.basePackage(DataRoomConst.ScanPackage.COMPONENT),
                        RequestHandlerSelectors.basePackage(DatasetConstant.ScanPackage.COMPONENT)
                ))
                .paths(PathSelectors.any())
                .build();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
        registry.addResourceHandler("swagger-ui.html")
                .addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
        registry.addResourceHandler("doc.html")
                .addResourceLocations("classpath:/META-INF/resources/");
    }

    // NOTE 解决springfox与springboot新版本不兼容问题
    @Bean
    public BeanPostProcessor springfoxHandlerProviderBeanPostProcessor() {
        return new BeanPostProcessor() {

            @Override
            public Object postProcessAfterInitialization(@NonNull  Object bean, @NonNull String beanName) throws BeansException {
                if (bean instanceof WebMvcRequestHandlerProvider ) {
                    customizeSpringfoxHandlerMappings(getHandlerMappings(bean));
                }
                return bean;
            }

            private <T extends RequestMappingInfoHandlerMapping> void customizeSpringfoxHandlerMappings(List<T> mappings) {
                List<T> copy = mappings.stream()
                        .filter(mapping -> mapping.getPatternParser() == null)
                        .collect(Collectors.toList());
                mappings.clear();
                mappings.addAll(copy);
            }

            @SuppressWarnings("unchecked")
            private List<RequestMappingInfoHandlerMapping> getHandlerMappings(Object bean) {
                try {
                    Field field = ReflectionUtils.findField(bean.getClass(), "handlerMappings");
                    assert field != null;
                    field.setAccessible(true);
                    return (List<RequestMappingInfoHandlerMapping>) field.get(bean);
                } catch (IllegalArgumentException | IllegalAccessException e) {
                    throw new IllegalStateException(e);
                }
            }
        };
    }


}
