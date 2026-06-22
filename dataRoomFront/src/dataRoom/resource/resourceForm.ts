import { ResourceType } from '../constants/ResourceType'
import type { ResourceEntity } from './api'

export interface ResourceUploadResponse {
  name?: string
  data?: Partial<ResourceEntity>
}

export interface ResourceUploadFormDataPayload {
  resource: ResourceEntity
  file?: Blob | null
  cover?: Blob | null
  fileName?: string
  coverName?: string
}

export interface SingleUploadController<RawFile extends { uid?: number } = File & { uid?: number }> {
  clearFiles: () => void
  handleStart: (file: RawFile) => void
  submit: () => void
}

export const getResourceDisplayName = (fileName?: string) => {
  const normalizedFileName = fileName?.trim().split(/[\\/]/).pop()
  if (!normalizedFileName) {
    return ''
  }
  const extensionIndex = normalizedFileName.lastIndexOf('.')
  if (extensionIndex <= 0) {
    return normalizedFileName
  }
  return normalizedFileName.slice(0, extensionIndex)
}

const supportedModelFormats = new Set(['glb', 'gltf', 'obj', 'stl'])

const getFormatFromFileName = (fileName?: string) => {
  const normalizedFileName = fileName?.trim().split(/[\\/]/).pop()
  if (!normalizedFileName) {
    return ''
  }
  const extensionIndex = normalizedFileName.lastIndexOf('.')
  if (extensionIndex < 0 || extensionIndex === normalizedFileName.length - 1) {
    return ''
  }
  const extension = normalizedFileName.slice(extensionIndex + 1).toLowerCase()
  return supportedModelFormats.has(extension) ? extension : ''
}

export const getResourceModelFormat = (
  resource?: Pick<ResourceEntity, 'config' | 'originalName' | 'path' | 'url'> | null,
) => {
  if (!resource) {
    return ''
  }
  if (resource.config) {
    try {
      const config = JSON.parse(resource.config) as { format?: unknown }
      const format = typeof config.format === 'string' ? config.format.toLowerCase() : ''
      if (supportedModelFormats.has(format)) {
        return format
      }
    } catch {
      // ignore invalid legacy config and continue with file-name fallbacks
    }
  }
  return (
    getFormatFromFileName(resource.originalName) ||
    getFormatFromFileName(resource.path) ||
    getFormatFromFileName(resource.url)
  )
}

export const createResourceDraft = (resourceType: string, parentCode: string): ResourceEntity => ({
  name: '',
  resourceType,
  parentCode,
})

export const applyResourceUploadResult = (
  resource: ResourceEntity,
  response: ResourceUploadResponse,
): ResourceEntity => {
  const uploadedResource = response.data
  if (!uploadedResource) {
    return resource
  }

  const uploadedName = getResourceDisplayName(
    uploadedResource.originalName || uploadedResource.name || response.name,
  )
  const resourceName = resource.name?.trim() ? resource.name : uploadedName

  return {
    ...resource,
    name: resourceName,
    originalName: uploadedResource.originalName ?? resource.originalName,
    path: uploadedResource.path ?? resource.path,
    url: uploadedResource.url ?? resource.url,
    thumbnail: uploadedResource.thumbnail ?? resource.thumbnail,
    size: uploadedResource.size ?? resource.size,
    resourceType: uploadedResource.resourceType || resource.resourceType || ResourceType.IMAGE,
    config: uploadedResource.config ?? resource.config,
  }
}

const appendStringValue = (formData: FormData, key: string, value?: string | number | null) => {
  if (value === undefined || value === null) {
    return
  }
  const normalizedValue = String(value)
  if (normalizedValue.trim() === '') {
    return
  }
  formData.append(key, normalizedValue)
}

const getBlobFileName = (file: Blob, fallback?: string) => {
  if (fallback) {
    return fallback
  }
  const maybeNamedFile = file as Blob & { name?: unknown }
  return typeof maybeNamedFile.name === 'string' && maybeNamedFile.name ? maybeNamedFile.name : undefined
}

const appendFileValue = (formData: FormData, key: string, file?: Blob | null, fileName?: string) => {
  if (!file) {
    return
  }
  const normalizedFileName = getBlobFileName(file, fileName)
  if (normalizedFileName) {
    formData.append(key, file, normalizedFileName)
    return
  }
  formData.append(key, file)
}

export const buildResourceUploadFormData = ({
  resource,
  file,
  cover,
  fileName,
  coverName,
}: ResourceUploadFormDataPayload) => {
  const formData = new FormData()
  appendStringValue(formData, 'id', resource.id)
  appendStringValue(formData, 'name', resource.name)
  appendStringValue(formData, 'resourceType', resource.resourceType)
  appendStringValue(formData, 'parentCode', resource.parentCode)
  appendStringValue(formData, 'remark', resource.remark)
  appendFileValue(formData, 'file', file, fileName)
  appendFileValue(formData, 'cover', cover, coverName)
  return formData
}

export const replaceSingleUploadFile = <RawFile extends File & { uid?: number }>(
  upload: SingleUploadController<RawFile> | undefined,
  files: File[],
  createUid: () => number,
) => {
  const file = files[0] as RawFile | undefined
  if (!upload || !file) {
    return false
  }

  upload.clearFiles()
  file.uid = createUid()
  upload.handleStart(file)
  upload.submit()
  return true
}
