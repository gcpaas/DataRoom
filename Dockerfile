FROM docker.io/openjdk:17.0.2-jdk
# 创建运行目录
RUN mkdir -p /opt/gcpaas/dataRoom
# 复制jar包到运行目录
COPY dataRoomServer/target/dataRoomServer.jar /opt/gcpaas/dataRoom
# 创建前端运行目录
RUN mkdir -p /opt/gcpaas/dataRoom/dataRoomFront
# 复制前端文件到运行目录
COPY dataRoomFront/dataRoom /opt/gcpaas/dataRoom/dataRoomFront
# 创建资源库目录
RUN mkdir -p /opt/gcpaas/dataRoom/dataRoomResource
# 设置工作目录
WORKDIR /opt/gcpaas/dataRoom
# 添加环境变量
ENV RUN_ENV=docker
ENTRYPOINT ["sh", "-c", "java -jar -Duser.timezone=GMT+8 dataRoomServer.jar"]
