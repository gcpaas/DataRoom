VERSION=$(grep -A 1 '<artifactId>DataRoom-Plus</artifactId>' ./pom.xml | grep '<version>' | sed 's/.*<version>\(.*\)<\/version>.*/\1/' | xargs)
echo "当前版本号: $VERSION"

echo "准备打包前端"
cd ./dataroom-ui
npm run build
echo "前端打包完毕"

cd ..
echo "准备打包后端"
mvn clean package -Dmaven.test.skip=true
echo "后端打包完毕"

echo "准备构建RELEASE包"
rm -rf ./RELEASE
mkdir -p RELEASE/dataRoom-${VERSION}
cd RELEASE/dataRoom-${VERSION}
cp ../../dataroom-server/target/dataRoomServer.jar .
mkdir dataroom-ui
cp -r ../../dataroom-ui/dataRoomFront dataroom-ui
mkdir config
cp ../../dataroom-server/src/main/resources/*.yml config
cd ..
zip -r dataRoom-${VERSION}.zip dataRoom-${VERSION}/
echo "dataRoom-${VERSION}.zip包构建完毕"
rm -rf ./dataRoom-${VERSION}