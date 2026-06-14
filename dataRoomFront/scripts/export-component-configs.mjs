import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exportComponentConfigs } from './component-config-exporter.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const outputDir = path.resolve(projectRoot, '../dataRoomServer/src/main/resources/mcp/component-configs')

const result = await exportComponentConfigs({ projectRoot, outputDir })

console.log(`Exported ${result.components.length} component config files and ${result.pageConfigs.length} page config files to ${outputDir}`)
