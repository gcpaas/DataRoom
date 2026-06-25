## Docker 构建流程
* 生成RELEASE部署包
```text
执行 release.sh（Mac/Linux）或 release.bat（Windows）
```
* 构建最新版本，如:3.0.0.2026062401
```shell
docker build -t gcpaas/dataroom:最新版本号 .
```
* 构建latest标签
```shell
docker tag gcpaas/dataroom:最新版本号 gcpaas/dataroom:latest
```
* 推送镜像
```shell
docker push gcpaas/dataroom:最新版本号

docker push gcpaas/dataroom:latest
```

