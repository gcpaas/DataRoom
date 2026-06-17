import { ResourceType } from '../constant/ResourceType'
import {
  applyResourceUploadResult,
  buildResourceUploadFormData,
  createResourceDraft,
  getResourceModelFormat,
  getResourceDisplayName,
  replaceSingleUploadFile,
} from './resourceForm'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

assert(getResourceDisplayName('销售看板.png') === '销售看板', 'should remove a normal file extension')
assert(getResourceDisplayName('archive.tar.gz') === 'archive.tar', 'should remove only the last extension')
assert(getResourceDisplayName('.env') === '.env', 'should keep extension-only hidden file names')

const firstDraft = createResourceDraft(ResourceType.IMAGE, 'root')
const firstUploaded = applyResourceUploadResult(firstDraft, {
  data: {
    name: '销售看板.png',
    originalName: '销售看板.png',
    resourceType: ResourceType.IMAGE,
    path: 'image/first.png',
    url: '/image/first.png',
    size: 8,
  },
})

assert(firstDraft.name === '', 'new upload drafts should start with an empty name')
assert(firstUploaded.name === '销售看板', 'first upload should use the file name without extension')
assert(firstUploaded.originalName === '销售看板.png', 'upload result should keep original file name')
assert(firstUploaded.path === 'image/first.png', 'upload result should keep uploaded path')

const secondDraft = createResourceDraft(ResourceType.IMAGE, 'root')
const secondUploaded = applyResourceUploadResult(secondDraft, {
  data: {
    name: '年度趋势图.jpg',
    originalName: '年度趋势图.jpg',
    resourceType: ResourceType.IMAGE,
    path: 'image/second.jpg',
    url: '/image/second.jpg',
    size: 12,
  },
})

assert(secondDraft.name === '', 'saved resource state should not leak into the next upload draft')
assert(secondUploaded.name === '年度趋势图', 'second upload should parse its own file name without refreshing')

const manualNameUpload = applyResourceUploadResult(
  {
    ...createResourceDraft(ResourceType.IMAGE, 'root'),
    name: '自定义资源名',
  },
  {
    data: {
      name: '不会覆盖.png',
      originalName: '不会覆盖.png',
      resourceType: ResourceType.IMAGE,
      path: 'image/custom.png',
      url: '/image/custom.png',
      size: 5,
    },
  },
)

assert(manualNameUpload.name === '自定义资源名', 'upload should not overwrite a manually entered resource name')

const uploadCalls: string[] = []
const uploadFile = { name: '第二次上传.png' } as File & { uid?: number }
const replaced = replaceSingleUploadFile(
  {
    clearFiles: () => uploadCalls.push('clearFiles'),
    handleStart: (file) => uploadCalls.push(`handleStart:${file.uid}`),
    submit: () => uploadCalls.push('submit'),
  },
  [uploadFile],
  () => 20260603,
)

assert(replaced, 'single upload replacement should report success when a new file exists')
assert(uploadFile.uid === 20260603, 'single upload replacement should assign a new upload uid')
assert(
  uploadCalls.join(',') === 'clearFiles,handleStart:20260603,submit',
  'single upload replacement should clear the old file before submitting the new file',
)
assert(!replaceSingleUploadFile(undefined, [uploadFile], () => 1), 'single upload replacement should ignore missing upload refs')

const uploadDraft = {
  ...createResourceDraft(ResourceType.MODEL, 'root'),
  id: 'resource_1',
  name: '示例模型',
  remark: '模型备注',
}
const mainBlob = new Blob(['main model'])
const coverBlob = new Blob(['cover image'])
const uploadFormData = buildResourceUploadFormData({
  resource: uploadDraft,
  file: mainBlob,
  fileName: 'demo.glb',
  cover: coverBlob,
  coverName: 'demo.png',
})

assert(uploadFormData.get('id') === 'resource_1', 'upload form data should include resource id when editing')
assert(uploadFormData.get('name') === '示例模型', 'upload form data should include resource name')
assert(uploadFormData.get('resourceType') === ResourceType.MODEL, 'upload form data should include resource type')
assert(uploadFormData.get('parentCode') === 'root', 'upload form data should include parent code')
assert(uploadFormData.get('remark') === '模型备注', 'upload form data should include remark')
assert(uploadFormData.get('file') instanceof Blob, 'upload form data should include the main file')
assert(uploadFormData.get('cover') instanceof Blob, 'upload form data should include the cover file')

assert(
  getResourceModelFormat({ config: JSON.stringify({ format: 'glb' }) }) === 'glb',
  'model format should prefer resource config',
)
assert(
  getResourceModelFormat({ originalName: 'warehouse.OBJ', path: 'model/fallback.glb' }) === 'obj',
  'model format should fall back to the original file name',
)
assert(
  getResourceModelFormat({ path: 'model/preview.stl', url: '/dataRoom/resource/file/1' }) === 'stl',
  'model format should use stored path before proxy url',
)
assert(
  getResourceModelFormat({ url: '/dataRoom/resource/file/1' }) === '',
  'model format should be blank when only proxy url is available',
)
