const files = require.context('./', true, /index.vue$/)
const customDatasetComponents = []

files.keys().forEach(key => {
  const title = key.split('/')[1].replace('.vue', '')
  const config = require(`./${title}/config.js`).default
  customDatasetComponents.push({
    title: config.title || title,
    vueSysComponentDirName: title,
    vueFile: files(key).default,
    ...config
  })
})

export default customDatasetComponents
