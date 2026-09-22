import { createApp } from 'vue'

import App from './App'
import router from './router'
import pinia from './stores'

// ⚠️ 样式引入顺序（vanilla-extract 版）：
//    1. Element Plus 基础样式（最底层，普通 CSS 走 Vite 处理）
//    2. Element Plus 暗色变量（html.dark）
//    3. 设计令牌（CSS 变量集中定义，普通 CSS）
//    4. vanilla-extract 全局样式（globalStyle 注入到这里的 head）
//    5. utility 命名样式（供业务组件按需 import）
//
// 📌 vanilla-extract 不需要 import './globals.css.ts' 这种事——
//    globalStyle() 会在编译时把规则直接打包到对应的 .css 文件，
//    该 .css 文件会在 import './globals.css.ts' 这条语句触发的副作用里自动注入。
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/tokens.css'
import './styles/globals.css'
import './styles/utility.css'

createApp(App).use(pinia).use(router).mount('#app')
