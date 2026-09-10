import { createApp } from 'vue'

import App from './App'
import router from './router'
import pinia from './stores'

// ⚠️ 样式引入顺序不可随意调整：
//    1. Element Plus 基础样式
//    2. Element Plus 暗色变量（html.dark）
//    3. Tailwind + antd 设计令牌
//    4. Element Plus → antd 主题覆盖（必须最后，才能压过上面的变量）
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/index.css'
import './styles/element-theme.css'

createApp(App).use(pinia).use(router).mount('#app')
