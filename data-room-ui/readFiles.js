const fs = require('fs')
const path = require('path')
const md5 = require('md5')

const directoryPath = path.join(__dirname, 'packages/components')
const changeLogJsonArray = []

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error(' ', err)
    return
  }

  const promises = files.map(file => {
    const filePath = path.join(directoryPath, file)

    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('无法获取文件状态:', err)
          reject(err)
          return
        }

        if (stats.isDirectory()) {
          const filesToRead = ['index.vue', 'baseDefinition.js', 'declaration.js', 'CHANGE.LOG', 'panel/index.vue']
          const filePromises = filesToRead.map(mainFile => {
            const filePath = path.join(directoryPath, file, mainFile)

            return new Promise((resolve, reject) => {
              fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                  console.error('无法读取文件内容', err)
                  reject(err)
                } else {
                  if (mainFile === 'baseDefinition.js') {
                    const regex = /version = .*/
                    const match = data.match(regex)
                    if (match) {
                      data = data.replace(match[0], '')
                    }
                  }
                  resolve(data)
                }
              })
            })
          })

          Promise.all(filePromises).then(dataArray => {
            let allContent = ''
            dataArray.forEach(data => {
              allContent += data
            })
            const version = md5(allContent)
            console.log(version)

            const baseDefinitionPath = path.join(directoryPath, file, 'baseDefinition.js')
            const declarationPath = path.join(directoryPath, file, 'declaration.js')
            const changeLogPath = path.join(directoryPath, file, 'CHANGE.LOG')

            Promise.all([
              fs.promises.readFile(baseDefinitionPath, 'utf8'),
              fs.promises.readFile(declarationPath, 'utf8'),
              fs.promises.readFile(changeLogPath, 'utf8')
            ]).then(([baseDefinitionData, declarationData, changeLogData]) => {
              const versionRegex = /version = .*/
              const match = baseDefinitionData.match(versionRegex)
              if (match) {
                const newContent = `version = '${version}'`
                const result = baseDefinitionData.replace(versionRegex, newContent)
                fs.writeFile(baseDefinitionPath, result, 'utf8', err => {
                  if (err) {
                    console.error('文件写入失败', err)
                  }
                })
              }

              const typeRegex = /type: .*/
              const typeMatch = declarationData.match(typeRegex)
              const type = typeMatch[0].split(':')[1].trim()
              const typeName = type.substring(1, type.length - 2)

              const nameRegex = /name = .*/
              const nameMatch = declarationData.match(nameRegex)
              const name = nameMatch[0].split('=')[1].trim()
              const componentName = name.substring(1, name.length - 2)

              const changeLog = changeLogData.replace(/\n/g, ' ')

              const changeLogJson = {
                version,
                typeName,
                componentName,
                changeLog
              }
              changeLogJsonArray.push(changeLogJson)

              resolve()
            })
          })
        } else {
          resolve()
        }
      })
    })
  })

  Promise.all(promises).then(() => {
    const changeLogJsonPath = path.join(__dirname, 'packages/bigScreen/CHANGE.LOG.json')
    fs.writeFile(changeLogJsonPath, JSON.stringify(changeLogJsonArray), 'utf8', err => {
      if (err) {
        console.error('文件写入失败', err)
      } else {
        console.log('所有数据写入成功')
      }
    })
  })
})
