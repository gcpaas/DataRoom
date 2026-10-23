import { Box3, Group, Vector3 } from 'three'
import type { Object3D } from 'three'
import type { ModelTransformConfig } from './modelConfig'

export interface ModelTransform {
  container: Group
  rotationGroup: Group
  fitGroup: Group
}

export const createModelTransform = (model: Object3D): ModelTransform => {
  const container = new Group()
  const rotationGroup = new Group()
  const fitGroup = new Group()
  container.add(rotationGroup)
  rotationGroup.add(fitGroup)
  fitGroup.add(model)

  // 原根节点的平移、旋转和缩放均保留，只在父组中居中并适配。
  const box = new Box3().setFromObject(model)
  const center = box.getCenter(new Vector3())
  const size = box.getSize(new Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = maxDim > 2 ? 2 / maxDim : 1
  fitGroup.scale.setScalar(scale)
  fitGroup.position.copy(center).multiplyScalar(-scale)

  return { container, rotationGroup, fitGroup }
}

export const updateModelTransform = (
  transform: ModelTransform,
  config: ModelTransformConfig
): void => {
  // 绝对赋值避免累乘；用户偏移位于旋转组外，不随自动旋转绕原点运动。
  transform.container.scale.setScalar(config.modelScale)
  transform.container.position.set(
    config.modelPosition.x,
    config.modelPosition.y,
    config.modelPosition.z
  )
}
