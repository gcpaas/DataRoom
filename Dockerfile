FROM openjdk:8-jdk-alpine
# 创建运行目录
RUN mkdir -p /app/dataRoom
# 复制jar包到运行目录
COPY DataRoom/dataroom-server/target/dataroom-server.jar /app/dataRoom
# 创建配置文件目录
RUN mkdir -p /app/dataRoom/config
# 复制配置文件到运行目录
COPY doc/docker/application-docker.yml /app/dataRoom/config
# 创建前端运行目录
RUN mkdir -p /app/dataRoom/ui
# 复制前端文件到运行目录
COPY data-room-ui/dataroom /app/dataRoom/ui
# 复制docker环境的配置文件到运行目录
COPY doc/docker/index-production.js /app/dataRoom/ui/config
# 创建资源保存目录
RUN mkdir -p /data
# 创建数据库文件目录
RUN mkdir -p /db
# 设置工作目录
WORKDIR /app/dataRoom
# 添加环境变量
ENV RUN_ENV=docker
ENTRYPOINT ["sh", "-c", "java -jar -Duser.timezone=GMT+8 dataroom-server.jar --spring.profiles.active=docker --server.servlet.context-path= "]

