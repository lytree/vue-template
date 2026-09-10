import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const THEME_KEY = 'vue-antd-template:theme'

function readTheme(): boolean {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark'
  } catch {
    return false
  }
}

/** 全局 UI 状态：侧边栏折叠、明暗主题 */
export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)
  const dark = ref(readTheme())

  watch(
    dark,
    (value) => {
      document.documentElement.classList.toggle('dark', value)
      try {
        localStorage.setItem(THEME_KEY, value ? 'dark' : 'light')
      } catch {
        /* 忽略隐私模式下的写入失败 */
      }
    },
    { immediate: true },
  )

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  function setCollapsed(value: boolean) {
    collapsed.value = value
  }

  function toggleDark() {
    dark.value = !dark.value
  }

  return { collapsed, dark, toggleCollapsed, setCollapsed, toggleDark }
})
