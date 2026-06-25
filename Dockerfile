FROM docker.io/openjdk:17.0.2-jdk
# 创建运行目录
RUN mkdir -p /opt/gcpaas
# 复制 RELEASE 目录下的部署包，并解压文件修改时间最新的 dataRoom-xxx.zip
COPY RELEASE/dataRoom-*.zip /opt/gcpaas/
RUN set -eu; \
    set -- $(ls -t /opt/gcpaas/dataRoom-*.zip); \
    latest_zip="$1"; \
    test -n "${latest_zip}"; \
    cd /opt/gcpaas; \
    jar -xf "${latest_zip}"; \
    rm -f /opt/gcpaas/dataRoom-*.zip
# 设置工作目录
WORKDIR /opt/gcpaas/dataRoom
# 添加环境变量
ENV RUN_ENV=docker
ENTRYPOINT ["sh", "-c", "java -jar -Duser.timezone=GMT+8 dataRoomServer.jar"]
