import { Box3, BoxGeometry, Group, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three'
import { createModelTransform, updateModelTransform } from './modelTransform'
import { normalizeModelTransformConfig, parseModelAppearanceConfig } from './modelConfig'
import { applyResourceToChart, getResourceChartType } from '../designer/utils/resourceChart'
import { getInstance } from '../components/DrModel3D/install'
import { readFileSync } from 'node:fs'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const near = (actual: number, expected: number, message: string) => {
  assert(Math.abs(actual - expected) < 1e-8, `${message}: ${actual} !== ${expected}`)
}

const vectorNear = (actual: Vector3, expected: Vector3, message: string) => {
  near(actual.x, expected.x, `${message} X`)
  near(actual.y, expected.y, `${message} Y`)
  near(actual.z, expected.z, `${message} Z`)
}

const bounds = (object: Group) => {
  object.updateWorldMatrix(true, true)
  return new Box3().setFromObject(object)
}

// 模型几何、子节点及原根节点均不在原点，根节点带非单位、非均匀缩放和旋转。
const geometry = new BoxGeometry(4, 2, 3)
geometry.translate(3, -2, 5)
const material = new MeshBasicMaterial()
const mesh = new Mesh(geometry, material)
mesh.position.set(-2, 4, 1)
const root = new Group()
root.add(mesh)
root.position.set(12, -7, 9)
root.scale.set(2, 3, 0.5)
root.rotation.set(0.2, 0.7, -0.3)
root.updateMatrix()
const originalPosition = root.position.clone()
const originalScale = root.scale.clone()
const originalQuaternion = root.quaternion.clone()
const originalMatrix = root.matrix.clone()
const originalBounds = bounds(root)
const originalCenter = originalBounds.getCenter(new Vector3())
const originalSize = originalBounds.getSize(new Vector3())
const expectedFit = 2 / Math.max(originalSize.x, originalSize.y, originalSize.z)

const transform = createModelTransform(root)
vectorNear(bounds(transform.container).getCenter(new Vector3()), new Vector3(), '基准适配后应居中')
const fittedSize = bounds(transform.container).getSize(new Vector3())
near(Math.max(fittedSize.x, fittedSize.y, fittedSize.z), 2, '大模型最大边应缩至 2')
near(transform.fitGroup.scale.x, expectedFit, '基准缩放应基于包含原变换的边界')
vectorNear(root.position, originalPosition, '原根节点位置应保留')
vectorNear(root.scale, originalScale, '原根节点缩放应保留')
assert(root.quaternion.equals(originalQuaternion), '原根节点旋转应保留')
assert(root.matrix.equals(originalMatrix), '原根节点矩阵应保留')

const config = { modelScale: 2.5, modelPosition: { x: 6, y: -4, z: 8 } }
const expectedPosition = new Vector3(6, -4, 8)
for (let i = 0; i < 100; i++) updateModelTransform(transform, config)
vectorNear(transform.container.scale, new Vector3(2.5, 2.5, 2.5), '重复更新不应累乘')
vectorNear(bounds(transform.container).getCenter(new Vector3()), expectedPosition, '用户偏移不应被用户缩放放大')
vectorNear(bounds(transform.container).getSize(new Vector3()), fittedSize.clone().multiplyScalar(2.5), '用户缩放应叠加于基准适配')
near(transform.fitGroup.scale.x, expectedFit, '配置更新不应修改基准缩放')

// 使用原始包围盒中心作为枢轴检查，避免旋转后 AABB 变化影响不对称模型的判断。
for (let i = 0; i < 1000; i++) {
  transform.rotationGroup.rotation.y += 0.005
  transform.container.updateWorldMatrix(true, true)
  vectorNear(transform.fitGroup.localToWorld(originalCenter.clone()), expectedPosition, '自动旋转枢轴不应漂移')
  vectorNear(bounds(transform.container).getCenter(new Vector3()), expectedPosition, '对称模型旋转后的中心应保持配置偏移')
}
const rotationBeforeUpdate = transform.rotationGroup.rotation.y
updateModelTransform(transform, { modelScale: 0.1, modelPosition: { x: -3, y: 2, z: -5 } })
near(transform.rotationGroup.rotation.y, rotationBeforeUpdate, '更新配置不应重置旋转')
vectorNear(bounds(transform.container).getCenter(new Vector3()), new Vector3(-3, 2, -5), '旋转过程中更新偏移应立即生效')

const resetConfig = { modelScale: 1, modelPosition: { x: 0, y: 0, z: 0 } }
for (let i = 0; i < 10; i++) updateModelTransform(transform, resetConfig)
vectorNear(transform.container.scale, new Vector3(1, 1, 1), '重置应恢复用户单位缩放')
vectorNear(bounds(transform.container).getCenter(new Vector3()), new Vector3(), '重置偏移后中心应回到原点')
transform.rotationGroup.rotation.y += 0.5
vectorNear(bounds(transform.container).getCenter(new Vector3()), new Vector3(), '重置后继续旋转不应漂移')
assert(root.matrix.equals(originalMatrix), '更新、重置与自动旋转不应修改原根矩阵')

// 小模型与最大边恰好为 2 的模型不放大，空模型保持有限变换。
for (const edge of [0.5, 2]) {
  const smallGeometry = new BoxGeometry(edge, edge, edge)
  const small = new Mesh(smallGeometry, material)
  small.position.set(5, 8, -3)
  const smallTransform = createModelTransform(small)
  near(smallTransform.fitGroup.scale.x, 1, '最大边不超过 2 时不应缩放')
  vectorNear(bounds(smallTransform.container).getCenter(new Vector3()), new Vector3(), '小模型应居中')
  near(bounds(smallTransform.container).getSize(new Vector3()).x, edge, '小模型应保留尺寸')
  smallGeometry.dispose()
}
const empty = createModelTransform(new Group())
vectorNear(empty.fitGroup.position, new Vector3(), '空模型应保持有限位置')
near(empty.fitGroup.scale.x, 1, '空模型应保持单位缩放')

// 手动矩阵模式也不能被自动适配覆盖。
const manual = new Mesh(geometry, material)
manual.matrixAutoUpdate = false
manual.matrix.makeScale(2, 3, 4).setPosition(7, -8, 9)
const manualMatrix = manual.matrix.clone()
const manualTransform = createModelTransform(manual)
vectorNear(bounds(manualTransform.container).getCenter(new Vector3()), new Vector3(), '手动矩阵模型应居中')
assert(manual.matrix.equals(manualMatrix), '原始手动矩阵应保留')
assert(!manual.matrixAutoUpdate, '手动矩阵模式应保留')

const scene = new Scene()
scene.add(transform.container)
scene.remove(transform.container)
scene.add(manualTransform.container)
assert(scene.children.length === 1, '换模型应移除整个旧容器')
assert(transform.container.parent === null, '旧容器应脱离场景')
assert(scene.getObjectById(root.id) === undefined, '旧模型不应遗留在场景内')

// 配置规范化、素材复制、JSON 保存重开保持独立快照。
for (const value of [undefined, null, NaN, Infinity, '2', true]) {
  near(normalizeModelTransformConfig({ modelScale: value }).modelScale, 1, '非法倍率恢复默认')
}
near(normalizeModelTransformConfig({ modelScale: -1 }).modelScale, 0.1, '倍率下限')
near(normalizeModelTransformConfig({ modelScale: 20 }).modelScale, 10, '倍率上限')
const invalidPosition = normalizeModelTransformConfig({ modelPosition: { x: Infinity, y: null, z: -2 } })
assert(JSON.stringify(invalidPosition.modelPosition) === '{"x":0,"y":0,"z":-2}', '偏移规范化')
const savedConfig = JSON.stringify({ modelScale: 2, modelPosition: { x: 1.2, y: -0.3, z: 0.5 }, format: 'glb' })
const resource = { name: '变换模型', resourceType: 'model', url: '/resource/proxy/id', config: savedConfig }
assert(getResourceChartType(resource) === 'DrModel3D', '模型类型分流')
const first = getInstance()
const second = getInstance()
applyResourceToChart(first, resource)
applyResourceToChart(second, resource)
near(first.props.modelScale, 2, '复制缩放配置')
near(first.props.modelPosition.y, -0.3, '复制偏移配置')
first.props.modelPosition.x = 8
near(second.props.modelPosition.x, 1.2, '不同组件偏移对象独立')
near(parseModelAppearanceConfig(resource.config).modelPosition.x, 1.2, '不回写素材配置')
const reopened = JSON.parse(JSON.stringify(second))
near(reopened.props.modelPosition.z, 0.5, '页面JSON保存重开保留偏移')
near(reopened.props.modelScale, 2, '页面JSON保存重开保留缩放')
Object.assign(first.props, normalizeModelTransformConfig(null))
near(first.props.modelScale, 1, '面板重置倍率')
near(first.props.modelPosition.x, 0, '面板重置偏移')
near(first.props.material.roughness, second.props.material.roughness, '重置变换不修改材质')
for (const raw of [undefined, '{invalid', '{}']) {
  const config = parseModelAppearanceConfig(raw)
  near(config.modelScale, 1, '空配置默认倍率')
  near(config.modelPosition.x, 0, '空配置默认位置')
}
// 静态接线契约：两端透传、素材保存、渲染深度监听均存在。
const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')
const previewSource = source('./ModelPreview.vue')
assert(previewSource.includes('...normalizeModelTransformConfig(localTransform.value)'), '素材保存含变换配置')
for (const path of ['./ModelPreview.vue', '../components/DrModel3D/index.vue']) {
  const text = source(path)
  assert(text.includes(':model-scale=') && text.includes(':model-position='), '两端透传变换配置')
}
const viewerSource = source('./ThreeModelViewer.vue')
assert(viewerSource.includes('[() => props.modelScale, () => props.modelPosition]'), '变换独立监听')
assert((viewerSource.match(/centerAndScaleModel\(\)/g) || []).length === 3, '三种加载器统一适配')
geometry.dispose()
material.dispose()
console.log('modelTransform 契约测试通过：居中与原变换、大小模型适配、重复更新、重置与旋转、手动矩阵、容器替换')
