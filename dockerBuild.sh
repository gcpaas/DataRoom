### 打包前端
# 定位到data-room-ui目录
cd ./data-room-ui
# 执行该目录下的rebuild.sh
sh rebuild.sh
### 打包后端
# 定位到DataRoom目录
cd ../DataRoom
# 执行maven打包命令
mvn clean package -Dmaven.test.skip=true -P package
### 打包镜像
# 定位到根目录
cd ..
# 执行docker build命令
#docker build -t gcpass/dataroom:lastest .

