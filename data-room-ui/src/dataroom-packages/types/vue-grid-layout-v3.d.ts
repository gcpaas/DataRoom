declare module 'vue-grid-layout-v3' {
  import type { Component } from 'vue'
  
  export const GridLayout: Component
  export const GridItem: Component
  
  const VueGridLayout: {
    GridLayout: Component
    GridItem: Component
  }
  
  export default VueGridLayout
}
