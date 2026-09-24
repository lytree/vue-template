import { createApp } from 'vue'

import App from './App'
import router from './router'
import pinia from './stores'

// 样式引入顺序（SCSS + CSS Modules 版）：
//   1. Element Plus 基础样式 —— 已由 unplugin-vue-components 按需注入，无需手写
//   2. Element Plus 暗色变量 —— 同样按需注入（html.dark 模式自动激活）
//   3. 设计令牌（CSS 变量集中定义）
//   4. 全局样式（reset / scrollbar / body / 主题过渡）
//   5. 主题子树作用域 CSS（4 套主题颜色）
//   6. 主题切换整页动画 keyframes + className
//   7. 原子 utility（u.xxx 兼容垫片）
//
// 业务级样式按需 `import s from './xxx.module.scss'` 走 SCSS Modules（scoped）。
import './styles/tokens.scss'
import './styles/globals.scss'
import './styles/themes.scss'
import './styles/animations.scss'
import './styles/utility.scss'

createApp(App).use(pinia).use(router).mount('#app')
