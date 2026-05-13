<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Loading, Box } from '@element-plus/icons-vue'

interface MaterialConfig {
  color: string
  roughness: number
  metalness: number
  opacity: number
  transparent: boolean
  wireframe: boolean
}

interface LightingConfig {
  ambient: { enabled: boolean; color: string; intensity: number }
  directional: { enabled: boolean; color: string; intensity: number }
  point: { enabled: boolean; color: string; intensity: number }
}

interface BackgroundConfig {
  type: 'color'
  value: string
}

const props = withDefaults(defineProps<{
  modelUrl?: string
  coverImage?: string
  autoRotate?: boolean
  backgroundColor?: string
  materialConfig?: MaterialConfig
  lightingConfig?: LightingConfig
  backgroundConfig?: BackgroundConfig
  interactionEnabled?: boolean
}>(), {
  autoRotate: false,
  backgroundColor: '#1a1a2e',
  interactionEnabled: true
})

const emit = defineEmits<{
  captureCover: [data: string]
  loadSuccess: []
  loadError: [error: any]
  configChange: [config: any]
}>()

const containerRef = ref<HTMLDivElement>()
const isLoading = ref(false)
const showCover = ref(true)

// Three.js objects - use shallowRef to avoid deep reactivity
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let currentModel: THREE.Object3D | null = null
let animationId: number

// Lights
let ambientLight: THREE.AmbientLight
let directionalLight: THREE.DirectionalLight
let pointLight: THREE.PointLight

const defaultMaterialConfig: MaterialConfig = {
  color: '#4a90e2',
  roughness: 0.5,
  metalness: 0.3,
  opacity: 1.0,
  transparent: false,
  wireframe: false
}

const defaultLightingConfig: LightingConfig = {
  ambient: { enabled: true, color: '#ffffff', intensity: 0.6 },
  directional: { enabled: true, color: '#ffffff', intensity: 0.8 },
  point: { enabled: false, color: '#ff9900', intensity: 1.0 }
}

const defaultBackgroundConfig: BackgroundConfig = {
  type: 'color',
  value: '#1a1a2e'
}

const getEffectiveMaterialConfig = (): MaterialConfig => {
  return props.materialConfig || defaultMaterialConfig
}

const getEffectiveLightingConfig = (): LightingConfig => {
  return props.lightingConfig || defaultLightingConfig
}

const getEffectiveBackgroundConfig = (): BackgroundConfig => {
  return props.backgroundConfig || defaultBackgroundConfig
}

const initScene = () => {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  // Scene
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 0, 5)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  containerRef.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enabled = props.interactionEnabled

  // Initialize lights
  initLights()
  console.log('[initScene] After initLights, scene children:', scene.children.map(c => c.type))

  // Initialize background
  updateBackground()

  // Animation loop
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    if (props.autoRotate && currentModel) {
      currentModel.rotation.y += 0.005
    }
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
}

const initLights = () => {
  const lightingConfig = getEffectiveLightingConfig()

  // Ambient light
  ambientLight = new THREE.AmbientLight(
    new THREE.Color(lightingConfig.ambient.color),
    lightingConfig.ambient.intensity
  )
  ambientLight.visible = lightingConfig.ambient.enabled
  scene.add(ambientLight)

  // Directional light
  directionalLight = new THREE.DirectionalLight(
    new THREE.Color(lightingConfig.directional.color),
    lightingConfig.directional.intensity
  )
  directionalLight.position.set(5, 10, 5)
  directionalLight.visible = lightingConfig.directional.enabled
  scene.add(directionalLight)

  // Point light
  pointLight = new THREE.PointLight(
    new THREE.Color(lightingConfig.point.color),
    lightingConfig.point.intensity
  )
  pointLight.position.set(0, 5, 0)
  pointLight.visible = lightingConfig.point.enabled
  scene.add(pointLight)
}

const updateBackground = () => {
  const bgConfig = getEffectiveBackgroundConfig()
  if (bgConfig.type === 'color') {
    scene.background = new THREE.Color(bgConfig.value)
  }
}

const updateMaterial = (config: MaterialConfig) => {
  if (!currentModel) return

  currentModel.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.color),
        roughness: config.roughness,
        metalness: config.metalness,
        opacity: config.opacity,
        transparent: config.transparent,
        wireframe: config.wireframe
      })
      child.material = material
    }
  })
}

const updateLighting = (config: LightingConfig) => {
  if (!ambientLight || !directionalLight || !pointLight) return

  ambientLight.color.set(config.ambient.color)
  ambientLight.intensity = config.ambient.intensity
  ambientLight.visible = config.ambient.enabled

  directionalLight.color.set(config.directional.color)
  directionalLight.intensity = config.directional.intensity
  directionalLight.visible = config.directional.enabled

  pointLight.color.set(config.point.color)
  pointLight.intensity = config.point.intensity
  pointLight.visible = config.point.enabled
}

const loadModel = (url: string) => {
  if (!url) return

  console.log('[loadModel] URL:', url)
  isLoading.value = true
  showCover.value = false

  // Remove existing model
  if (currentModel) {
    scene.remove(currentModel)
    currentModel = null
  }

  const extension = url.split('.').pop()?.toLowerCase()
  console.log('[loadModel] Extension:', extension)

  if (extension === 'glb' || extension === 'gltf') {
    loadGLTF(url)
  } else if (extension === 'obj') {
    loadOBJ(url)
  } else if (extension === 'stl') {
    loadSTL(url)
  } else {
    isLoading.value = false
    emit('loadError', new Error('Unsupported model format: ' + extension))
  }
}

const loadGLTF = (url: string) => {
  console.log('[GLTFLoader] Loading:', url)
  const loader = new GLTFLoader()
  loader.load(
    url,
    (gltf) => {
      console.log('[GLTFLoader] Loaded successfully, scene:', gltf.scene)
      currentModel = gltf.scene
      console.log('[GLTFLoader] Before applyDefaultMaterial - children:', gltf.scene.children.length)

      // Debug: count meshes before applyDefaultMaterial
      let meshCount = 0
      gltf.scene.traverse(c => { if (c instanceof THREE.Mesh) meshCount++ })
      console.log('[GLTFLoader] Mesh count before material:', meshCount)

      applyDefaultMaterial()

      // Debug: count meshes after applyDefaultMaterial and check materials
      let meshWithMaterial = 0
      let blackMaterialCount = 0
      gltf.scene.traverse(c => {
        if (c instanceof THREE.Mesh) {
          meshWithMaterial++
          if (c.material) {
            const mat = c.material as THREE.MeshStandardMaterial
            if (mat.color && mat.color.r === 0 && mat.color.g === 0 && mat.color.b === 0) {
              blackMaterialCount++
            }
            console.log('[GLTFLoader] Mesh material color:', mat.color)
          }
        }
      })
      console.log('[GLTFLoader] After applyDefaultMaterial - meshes:', meshWithMaterial, 'black materials:', blackMaterialCount)

      centerAndScaleModel()
      console.log('[GLTFLoader] After centerAndScaleModel')
      scene.add(currentModel)
      console.log('[GLTFLoader] Scene now has', scene.children.length, 'children')
      console.log('[GLTFLoader] Lights:', scene.children.filter(c => c.type.includes('Light')).map(l => ({ type: l.type, visible: l.visible })))
      console.log('[GLTFLoader] Camera:', camera.position, 'looking at:', controls.target)
      isLoading.value = false
      emit('loadSuccess')
    },
    undefined,
    (error) => {
      console.error('[GLTFLoader] Error:', error)
      isLoading.value = false
      emit('loadError', error)
    }
  )
}

const loadOBJ = (url: string) => {
  console.log('[OBJLoader] Loading:', url)
  const loader = new OBJLoader()
  loader.load(
    url,
    (obj) => {
      console.log('[OBJLoader] Loaded successfully:', obj)
      currentModel = obj
      console.log('[OBJLoader] Children count:', obj.children.length)
      applyDefaultMaterial()
      centerAndScaleModel()
      console.log('[OBJLoader] After centerAndScaleModel')
      scene.add(currentModel)
      console.log('[OBJLoader] Scene now has', scene.children.length, 'children')
      isLoading.value = false
      emit('loadSuccess')
    },
    (progress) => {
      console.log('[OBJLoader] Progress:', progress)
    },
    (error) => {
      console.error('[OBJLoader] Error:', error)
      isLoading.value = false
      emit('loadError', error)
    }
  )
}

const loadSTL = (url: string) => {
  const loader = new STLLoader()
  loader.load(
    url,
    (geometry) => {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(getEffectiveMaterialConfig().color),
        roughness: getEffectiveMaterialConfig().roughness,
        metalness: getEffectiveMaterialConfig().metalness
      })
      currentModel = new THREE.Mesh(geometry, material)
      centerAndScaleModel()
      scene.add(currentModel)
      isLoading.value = false
      emit('loadSuccess')
    },
    undefined,
    (error) => {
      isLoading.value = false
      emit('loadError', error)
    }
  )
}

const applyDefaultMaterial = () => {
  if (!currentModel) return
  const materialConfig = getEffectiveMaterialConfig()

  currentModel.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(materialConfig.color),
        roughness: materialConfig.roughness,
        metalness: materialConfig.metalness,
        opacity: materialConfig.opacity,
        transparent: materialConfig.transparent,
        wireframe: materialConfig.wireframe
      })
      child.material = material
    }
  })
}

const centerAndScaleModel = () => {
  if (!currentModel) return

  // Compute bounding box
  const box = new THREE.Box3().setFromObject(currentModel)
  console.log('[centerAndScaleModel] Bounding box:', box)
  const center = box.getCenter(new THREE.Vector3())
  console.log('[centerAndScaleModel] Center:', center)
  const size = box.getSize(new THREE.Vector3())
  console.log('[centerAndScaleModel] Size:', size)

  // Center the model
  currentModel.position.sub(center)
  console.log('[centerAndScaleModel] After position.sub - position:', currentModel.position)

  // Scale to fit in view
  const maxDim = Math.max(size.x, size.y, size.z)
  console.log('[centerAndScaleModel] Max dimension:', maxDim)
  if (maxDim > 2) {
    const scale = 2 / maxDim
    console.log('[centerAndScaleModel] Applying scale:', scale)
    currentModel.scale.setScalar(scale)
  } else {
    console.log('[centerAndScaleModel] No scaling needed (maxDim <= 2)')
  }

  // Reset camera
  camera.position.set(0, 0, 5)
  console.log('[centerAndScaleModel] Camera reset to (0,0,5)')
  controls.target.set(0, 0, 0)
  controls.update()
  console.log('[centerAndScaleModel] Controls updated, camera looking at:', controls.target)

  // Force render
  renderer.render(scene, camera)
  console.log('[centerAndScaleModel] Scene children:', scene.children.map(c => c.type))
}

const handleResize = () => {
  if (!containerRef.value || !camera || !renderer) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// Expose methods
const captureImage = (): string => {
  if (!renderer) return ''
  renderer.render(scene, camera)
  return renderer.domElement.toDataURL('image/png')
}

const resetCamera = () => {
  camera.position.set(0, 0, 5)
  controls.reset()
}

const updateMaterialFromProps = (config: MaterialConfig) => {
  if (currentModel) {
    updateMaterial(config)
  }
}

const updateLightingFromProps = (config: LightingConfig) => {
  updateLighting(config)
}

const updateBackgroundFromProps = (config: BackgroundConfig) => {
  scene.background = new THREE.Color(config.value)
}

defineExpose({
  captureImage,
  resetCamera,
  updateMaterial: updateMaterialFromProps,
  updateLighting: updateLightingFromProps,
  updateBackground: updateBackgroundFromProps
})

// Watchers
watch(() => props.modelUrl, (newUrl) => {
  if (newUrl) {
    loadModel(newUrl)
  }
})

watch(() => props.materialConfig, (config) => {
  if (config) {
    updateMaterialFromProps(config)
  }
}, { deep: true })

watch(() => props.lightingConfig, (config) => {
  if (config) {
    updateLightingFromProps(config)
  }
}, { deep: true })

watch(() => props.backgroundConfig, (config) => {
  if (config) {
    updateBackgroundFromProps(config)
  }
}, { deep: true })

watch(() => props.interactionEnabled, (enabled) => {
  if (controls) {
    controls.enabled = enabled
  }
})

onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)

  if (props.modelUrl) {
    loadModel(props.modelUrl)
  } else if (props.coverImage) {
    showCover.value = true
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationId)

  if (renderer) {
    renderer.dispose()
    if (containerRef.value && renderer.domElement) {
      containerRef.value.removeChild(renderer.domElement)
    }
  }
})
</script>

<template>
  <div ref="containerRef" class="three-model-viewer">
    <div v-if="isLoading" class="loading-mask">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-if="showCover && coverImage && !currentModel" class="cover-image">
      <img :src="coverImage" alt="cover" />
    </div>
    <div v-if="!coverImage && !currentModel && !isLoading" class="placeholder">
      <el-icon :size="48"><Box /></el-icon>
      <span>暂无模型</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.three-model-viewer {
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;

  :deep(canvas) {
    display: block;
  }

  .loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    gap: 12px;

    .loading-icon {
      font-size: 32px;
      animation: rotate 1s linear infinite;
    }
  }

  .cover-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a2e;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
    gap: 12px;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
