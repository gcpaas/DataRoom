## 📚简介
<p align="center">
	<img alt="logo" width="50" src="./doc/logo.png">
</p>

🔥基于SpringBoot、MyBatisPlus、ElementUI、G2Plot、Echarts等技术栈的大屏设计器，具备大屏目录管理、大屏设计、大屏预览能力，支持MySQL、Oracle、PostgreSQL、JSON等数据集接入，对于复杂数据处理还可以使用Groovy脚本数据集，使用简单，完全免费，代码开源。

<p align="center">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/gcpaas/gc-starter-bigscreen?style=social">
	<img alt="GitHub forks" src="https://img.shields.io/github/forks/gcpaas/gc-starter-bigscreen?style=social">
	<img alt="GitHub license" src="https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg">
    <img alt="Maven Central" src="https://img.shields.io/maven-central/v/com.gccloud/dataroom-core">
	<img alt="Company" src="https://img.shields.io/badge/Author-科大国创云网科技有限公司-blue.svg">
  	<img alt="QQ" src="https://img.shields.io/badge/QQ-322302395-blue.svg">
</p>

-------------------------------------------------------------------------------
## 效果图

#### 管理页
<img alt="logo" src="./doc/images/home.png">

#### 设计器
<img alt="logo" src="./doc/images/design01.png">

## 优势

* 一站式大屏解决方案，从**数据处理**->**大屏设计**->**大屏预览**->**生产使用**
* 支持**多种数据集接入**，可用于生产
* 支持🔥**独立部署**，不对原有工程产生影响，适用于老项目
* 支持🔥**嵌入式集成**，与项目无缝融合，引入依赖包即可，无其他系统框架依赖，减少运维成本，适用于新项目
* 支持🔥**组件在线、离线开发**，在线开发简单组件、离线开发复杂组件
* 支持自定义接口权限、数据权限，轻松对接🔥**Shiro、Security**等认证框架，保证大屏数据安全

## 功能
- [x] 支持大屏管理、设计、预览、导出、集成
- [x] 支持图层上下调整，支持置于顶层、置于底层
- [x] 支持图画布组件框选、组合、取消组合、锁定、批量删除、复制功能
- [x] 支持文本、图片、轮播表、排名表、翻牌器、基础表格、倒计时、系统时间、外链
- [x] 支持基础折线图、梯形图、柱状图、面积图、条形图、饼图、环图、水波图、仪表盘、进度条、词云图、雷达图、漏斗图等
- [x] 支持15种边框组件，支持动画、渐变色设置，支持水平线、垂直线设置
- [x] 支持10多种修饰组件，支持动画、渐变色设置
- [x] 支持资源管理，包含LOGO、3D图标、2D图表、修饰、背景等上百个大屏设计资源，资源支持自定义上传
- [x] 支持组件管理，支持组件化设计，包含系统组件、自定义组件、业务组件，一键复用组件
- [x] 支持数据源管理，支持MySQL、ClickHouse、PostgreSQL、Oracle
- [x] 支持数据集管理，支持原始数据集、自助数据集、存储过程数据集、JSON数据集、脚本数据集、HTTP数据集，接入不同来源数据
- [x] 支持自定义接口权限、数据权限，保证大屏数据安全
- [x] 支持组件自定义规范，按照规范开发自己的大屏组件，满足特殊需求，如：自定义网络拓扑

## 链接

* [使用手册、二次开发、部署手册、常见问题](https://www.yuque.com/chuinixiongkou/bigscreen/index)
* [前端代码仓库(GitHub)](https://github.com/gcpaas/gc-starter-bigscreen-ui)、[前端代码仓库(码云)](https://gitee.com/gcpaas/gc-starter-bigscreen-ui)
* [后端代码仓库(GitHub)](https://github.com/gcpaas/gc-starter-bigscreen)、 [后端代码仓库(码云)](https://gitee.com/gcpaas/gc-starter-bigscreen)

-------------------------------------------------------------------------------

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

点击<a href="https://central.sonatype.com/artifact/com.gccloud/gc-starter-bigscreen-core">查询最新版本号</a>

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
      basePath: /root/big-screen
      # 静态资源访问接口前缀
      urlPrefix: http://127.0.0.1:${server.port}/${server.servlet.context-path}/static/
```

以上配置根据项目实际情况进行合并

### 4. 启动类配置扫描包路径

```java
@SpringBootApplication(scanBasePackages = {BigScreenConst.ScanPackage.COMPONENT})
@MapperScan(value = {BigScreenConst.ScanPackage.DAO})
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
