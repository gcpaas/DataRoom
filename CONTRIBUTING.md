## Docker 构建流程

### 1. 自动发布-构建包
* 自动生成并确认版本号后构建、发布 Docker 镜像
```shell
./dockerRelease.sh
```

脚本会按 `pom.xml` 中的项目版本号加当前时间生成镜像版本号，格式如 `3.4.0.20260630153045`。确认时可直接回车使用生成版本号，也可输入自定义版本号覆盖。

### 2. 自动发布-不构建包
如果已经存在 `RELEASE/dataRoom-*.zip`，只想把已有部署包构建成 Docker 镜像，可跳过重新打包：
```shell
./dockerRelease.sh --use-existing-release
```

### 3. 手动发布

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
