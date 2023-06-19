package com.gccloud.dataroom.config;

import com.gccloud.dataroom.core.constant.DataRoomConst;
import com.github.xiaoymin.swaggerbootstrapui.annotations.EnableSwaggerBootstrapUI;
import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.builders.ResponseMessageBuilder;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.ResponseMessage;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.List;

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
    public Docket bigScreenDocket() {
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
                .apis(RequestHandlerSelectors.basePackage(DataRoomConst.ScanPackage.COMPONENT))
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
}
