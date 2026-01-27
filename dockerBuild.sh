echo "准备打包前端"
cd ./dataroom-ui
npm run build
echo "前端打包完毕"

cd ..
echo "准备打包后端"
mvn clean package -Dmaven.test.skip=true
echo "后端打包完毕"

echo "准备构建镜像"
docker build -t gcpass/dataroom-plus:lastest .