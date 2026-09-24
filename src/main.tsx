import { createApp } from 'vue'

import App from './App'
import router from './router'
import pinia from './stores'

// 样式引入顺序（SCSS + CSS Modules 版）：
//   1. Element Plus 基础样式
//   2. Element Plus 暗色变量（html.dark）
//   3. 设计令牌（CSS 变量集中定义）
//   4. 全局样式（reset / scrollbar / body / 主题过渡）
//   5. 主题子树作用域 CSS（4 套主题颜色）
//   6. 主题切换整页动画 keyframes + className
//
// 业务级样式按需 `import s from './xxx.module.scss'` 走 SCSS Modules（scoped）。
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/tokens.scss'
import './styles/globals.scss'
import './styles/themes.scss'
import './styles/animations.scss'
import './styles/utility.scss'

createApp(App).use(pinia).use(router).mount('#app')
