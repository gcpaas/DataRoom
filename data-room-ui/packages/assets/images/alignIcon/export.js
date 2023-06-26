
const svgFiles = require.context('./svg', true, /\.svg$/)
const iconList = svgFiles.keys()?.map(item => svgFiles(item))
export default {
  getNameList () {
    return iconList?.map(item => {
      return item?.default?.id?.split('-')[1]
    }) || []
  }
}
