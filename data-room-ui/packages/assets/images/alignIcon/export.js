
const svgFiles = require.context('./svg', true, /\.svg$/)
const iconList = svgFiles.keys()?.map(item => svgFiles(item))
export default {
  getNameList () {
    console.log(iconList)
    return iconList?.map(item => {
      return item?.default?.id?.split('-')[1]
    }) || []
  }
}
