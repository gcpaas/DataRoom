# 素材库3D模型支持设计方案

## 1. 概述

在素材库中新增3D模型支持，包含模型上传、封面管理、在线预览、材质/光照参数配置。3D渲染封装为可复用组件，同时服务于素材库预览和大屏设计器。

## 2. 技术架构

### 2.1 组件架构

```
three/
├── ThreeModelViewer.vue       # 核心3D渲染组件（可复用）
├── ModelPreview.vue           # 素材库预览弹窗
└── components/DrModel3D/     # 大屏设计器3D图表
    ├── index.vue
    ├── control-panel/index.vue
    └── install.ts
```

### 2.2 ThreeModelViewer 核心能力

| 能力 | 说明 |
|------|------|
| 模型加载 | GLB、GLTF、OBJ、STL |
| 材质配置 | color, roughness, metalness, opacity, transparent, wireframe |
| 光照配置 | ambient, directional, point |
| 背景配置 | color |
| 交互 | 旋转/缩放/平移（OrbitControls） |
| 自动旋转 | 可开关 |

### 2.3 组件Props/Events/Expose

**Props:**

| 属性 | 类型 | 说明 |
|------|------|------|
| modelUrl | string | 模型文件URL（GLB/GLTF/OBJ/STL） |
| coverImage | string | 封面图片URL |
| autoRotate | boolean | 是否自动旋转（默认false） |
| backgroundColor | string | 背景色（默认#1a1a2e） |
| materialConfig | MaterialConfig | 材质配置对象 |
| lightingConfig | LightingConfig | 光照配置对象 |
| interactionEnabled | boolean | 是否允许交互（默认true） |

**Events:**

| 事件 | 说明 | 返回值 |
|------|------|--------|
| capture-cover | 点击截取封面 | base64图片数据 |
| load-success | 模型加载成功 | - |
| load-error | 模型加载失败 | error |
| config-change | 配置变更时触发 | config对象 |

**Expose:**

| 方法 | 说明 |
|------|------|
| captureImage() | 截取当前视角图片，返回base64 |
| resetCamera() | 重置相机位置 |
| updateMaterial(config) | 动态更新材质 |
| updateLighting(config) | 动态更新光照 |
| updateBackground(config) | 动态更新背景 |

## 3. 素材库功能

### 3.1 3D模型上传

- 类型选择新增 "3D模型" 选项
- 上传时同时上传模型文件和封面图片
- 模型格式支持：GLB、GLTF、OBJ、STL

### 3.2 模型预览

点击卡片弹出预览 Dialog，包含三个 Tab：

**模型信息 Tab：**
- 文件名、格式、大小
- 下载模型按钮

**封面设置 Tab：**
- 截取封面：调用 viewer.captureImage() → 上传到服务器
- 上传封面：打开文件选择器 → 上传图片

**参数配置 Tab：**
- 材质设置：颜色、粗糙度、金属度、透明度、线框模式
- 光照设置：环境光、平行光、点光源的开关和强度
- 实时预览

### 3.3 个性化配置存储

素材库表新增字段：

```sql
ALTER TABLE dr_resource ADD COLUMN config JSON COMMENT '模型个性化配置';
ALTER TABLE dr_resource ADD COLUMN model_format VARCHAR(20) COMMENT '模型格式';
```

config JSON 结构：

```json
{
  "material": {
    "color": "#4a90e2",
    "roughness": 0.5,
    "metalness": 0.3,
    "opacity": 1.0,
    "transparent": false,
    "wireframe": false
  },
  "lighting": {
    "ambient": { "enabled": true, "color": "#ffffff", "intensity": 0.6 },
    "directional": { "enabled": true, "color": "#ffffff", "intensity": 0.8 },
    "point": { "enabled": false, "color": "#ff9900", "intensity": 1.0 }
  },
  "background": { "type": "color", "value": "#1a1a2e" }
}
```

## 4. 大屏设计器3D组件

### 4.1 组件路径

`dataRoomFront/src/dataroom-packages/components/DrModel3D/`

### 4.2 配置结构

与其他图表组件保持一致，配置放在 props 中：

```javascript
chartConfig: {
  id: 'xxx',
  type: 'DrModel3D',
  name: '3D模型',
  style: { width, height, left, top, ... },
  props: {
    modelUrl: '...',
    coverImage: '...',
    autoRotate: false,
    interactionEnabled: true,
    material: { color, roughness, metalness, opacity, transparent, wireframe },
    lighting: { ambient, directional, point },
    background: { type, value }
  }
}
```

### 4.3 控制面板

提供与素材库预览相同的配置项：材质、光照、背景、自动旋转、交互开关。

## 5. 数据库变更

### 5.1 dr_resource 表

```sql
ALTER TABLE dr_resource ADD COLUMN config JSON COMMENT '模型个性化配置';
ALTER TABLE dr_resource ADD COLUMN model_format VARCHAR(20) COMMENT '模型格式';
```

### 5.2 后端文件变更

| 文件 | 变更 |
|------|------|
| `ResourceType.java` | 新增 MODEL 类型 |
| `ResourceController.java` | upload支持model类型，config更新接口 |
| `ResourceEntity.java` | 新增 config、modelFormat 字段 |
| `application.yml` | 新增 model 类型上传路径配置 |

### 5.3 前端文件变更

| 文件 | 变更 |
|------|------|
| `ResourceType.ts` | 新增 MODEL 类型 |
| `resource/api.ts` | 更新类型定义 |
| `resource/index.vue` | 新增3D模型上传和预览 |
| `resource/components/ModelPreview.vue` | 预览弹窗组件 |
| `three/ThreeModelViewer.vue` | 核心3D渲染组件 |
| `components/DrModel3D/` | 大屏设计器3D组件 |

## 6. 依赖

```json
{
  "three": "^0.160.0"
}
```

Three.js 无需额外安装，由 ThreeModelViewer 组件按需加载 Loaders 和 Controls。

## 7. 验证步骤

1. 后端启动：`mvn spring-boot:run -pl dataRoomServer`
2. 前端启动：`cd dataRoomFront && npm run dev`
3. 素材库验证：
   - 上传3D模型及封面
   - 点击卡片预览
   - 截取封面、上传封面
   - 修改材质/光照配置并保存
4. 大屏设计器验证：
   - 从素材库选择3D模型添加到画布
   - 控制面板调整材质/光照
   - 预览大屏查看渲染效果
