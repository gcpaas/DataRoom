
const svgFiles = require.context('./svg', true, /\.svg$/)
const iconList = svgFiles.keys().map(item => svgFiles(item))
export default {
  getIconList () {
    return iconList.map(item => item.default.id.split('-')[1])
  }
}
