import { ResourceType } from '../constants/ResourceType'
import { buildResourceListQueryParams } from './resourceQuery'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const allParams = buildResourceListQueryParams({
  name: '  销售素材  ',
  parentCode: 'folder-1',
  resourceType: '',
})
assert(allParams.parentCode === 'folder-1', 'resource list query should keep current parent code')
assert(allParams.name === '销售素材', 'resource list query should trim resource name')
assert(!('resourceType' in allParams), 'all resource type should not send resourceType to server')

const imageParams = buildResourceListQueryParams({
  parentCode: 'root',
  resourceType: ResourceType.IMAGE,
})
assert(imageParams.resourceType === ResourceType.IMAGE, 'image resource type should be sent to server')

const videoParams = buildResourceListQueryParams({
  parentCode: 'root',
  resourceType: ResourceType.VIDEO,
})
assert(videoParams.resourceType === ResourceType.VIDEO, 'video resource type should be sent to server')

const modelParams = buildResourceListQueryParams({
  parentCode: 'root',
  resourceType: ResourceType.MODEL,
})
assert(modelParams.resourceType === ResourceType.MODEL, 'model resource type should be sent to server')

const directoryParams = buildResourceListQueryParams({
  parentCode: 'root',
  resourceType: ResourceType.DIRECTORY,
})
assert(!('resourceType' in directoryParams), 'directory should not be exposed as a material type filter')
