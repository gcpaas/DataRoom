## 目录
```text
├── README.MD
├── baseDefinition.js
├── bigScreenDefinition.js
├── dashBoardDefinition.js
├── declaration.js
├── index.vue
├── interaction
│   └── index.js
├── theme
│   └── index.js
├── panel
│   └── index.vue
└── 组件名.png
```

## 说明
* **README.MD**: 仅案例组件存在，为了说明目录结构使用，其他组件不需要存在该文件
* **baseDefinition.js**：大屏、仪表板组件公共的个性化属性定义，返回属性对象
* **bigScreenDefinition.js**：大屏组件个性化属性定义，返回`getInstance`方法
* **dashBoardDefinition.js**：仪表板组件个性化属性定义，返回`getInstance`方法
* **declaration.js**：组件声明，用于组件插入时预览使用
* **index.vue**：组件本身
* **interaction/index.js**：组件交互定义，定义事件、动作
* **theme/index.js**：组件自定义主题定义
* **panel/index.vue**：设计态时组件配置页面
* **组件名.png**：组件名称（图片的名称被用作预览时组件显示的名称）、缩略图

