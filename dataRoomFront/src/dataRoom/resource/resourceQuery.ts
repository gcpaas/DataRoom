import { ResourceType } from '../constants/ResourceType'

export interface ResourceListQueryState {
  name?: string
  parentCode?: string
  resourceType?: string
}

export interface ResourceListQueryParams {
  name?: string
  parentCode: string
  resourceType?: string
}

const searchableResourceTypes = new Set<string>([
  ResourceType.IMAGE,
  ResourceType.VIDEO,
  ResourceType.MODEL,
])

export const buildResourceListQueryParams = ({
  name,
  parentCode,
  resourceType,
}: ResourceListQueryState): ResourceListQueryParams => {
  const params: ResourceListQueryParams = {
    parentCode: parentCode || 'root',
  }
  const keyword = name?.trim()
  if (keyword) {
    params.name = keyword
  }
  if (resourceType && searchableResourceTypes.has(resourceType)) {
    params.resourceType = resourceType
  }
  return params
}
