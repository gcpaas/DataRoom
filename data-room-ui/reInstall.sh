echo '开始重新安装依赖'

echo '删除当前目录下的 node_modules'
rm -rf node_modules ./

echo '删除当前目录下的 package-lock.json'
rm  package-lock.json ./

echo '开始安装依赖'
npm install --registry=http://registry.npmmirror.com

echo '安装依赖完毕'

echo '开始启动'

# npm run serve
