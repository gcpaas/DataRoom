## 如何集成

下面介绍如何在SpringBoot项目中集成大屏，[📘前端大屏地址在这里](https://github.com/gcpaas/gc-starter-bigscreen-ui)

### 1. 引入依赖

在项目的`pom.xml`文件`<dependencies>`标签中加入以下内容:

```xml
<dependency>
    <groupId>com.gccloud</groupId>
    <artifactId>dataroom-core</artifactId>
    <version>最新版本号</version>
</dependency>
```

点击<a href="https://central.sonatype.com/artifact/com.gccloud/dataroom-core">查询最新版本号</a>

### 2. 初始化SQL

执行 doc/init.sql 文件

### 3. 修改配置文件

修改`application-${spring.profiles.active}.yml`配置信息，其中 `${spring.profiles.active}`配置在`application.yml`文件中定义

```yaml
mybatis-plus:
  # mybatis plus xml配置文件扫描，多个通过分号隔开
  mapper-locations: classpath*:mapper/**/*.xml
  # xml中别名文件扫描，多个通过逗号隔开
  type-handlers-package: com.gccloud
spring:
  resources:
    static-locations: classpath:/static/,classpath:/META-INF/resources/,classpath:/META-INF/resources/webjars/,file:${gc.starter.file.basePath}
  # 静态资源配置
  mvc:
    throw-exception-if-no-handler-found: true
    # 静态资源访问接口前缀
    static-path-pattern: /static/**
    view:
      prefix: classpath:/static/
      suffix: .html
gc:
  starter:
    file:
      # 一个存储文件的绝对路径，需要有写入权限
      basePath: /root/dataroom
      # 静态资源访问接口前缀
      urlPrefix: http://127.0.0.1:${server.port}/${server.servlet.context-path}/static/
```

以上配置根据项目实际情况进行合并

### 4. 启动类配置扫描包路径

```java
@SpringBootApplication(scanBasePackages = {DataRoomConst.ScanPackage.COMPONENT, DatasetConstant.ScanPackage.COMPONENT, CommonConst.ScanPackage.COMPONENT})
@MapperScan(value = {DataRoomConst.ScanPackage.DAO, DatasetConstant.ScanPackage.DAO})
```

## 演示DEMO

<a href="http://gcpaas.gccloud.com/bigScreen"> http://gcpaas.gccloud.com/bigScreen </a>


## 联系我们
<img alt="Email" src="https://img.shields.io/badge/Email-tech@ustcinfo.com-blue.svg">

<img alt="QQ群" src="https://img.shields.io/badge/QQ群-322302395-blue.svg">

<p>
    <img alt="logo" width="200" src="./doc/images/qq.jpeg">
</p>

## License

Apache License 2.0
