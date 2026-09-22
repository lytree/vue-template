/**
 * 全局样式（用 vanilla-extract globalStyle 替代旧 globals.css）
 *
 * 工作原理：
 * • globalStyle('selector', rules) —— 编译时把规则注入到 .css 里
 * • 等同于写在一个外层 .css 里，但通过 TypeScript 维护（有类型检查）
 * • van 是注入到 import 该 .css.ts 的模块的 head 里
 */
import { globalStyle } from '@vanilla-extract/css'

// ====== Reset ======
globalStyle('html, body, #app', {
  height: '100%',
  margin: 0,
  padding: 0,
})

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
})

globalStyle('html', {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  fontSize: 14,
  lineHeight: 1.5715,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textSizeAdjust: '100%',
})

globalStyle('body', {
  backgroundColor: 'var(--ant-color-bg-layout)',
  color: 'var(--ant-color-text)',
})

// ====== Scrollbar ======
globalStyle('::-webkit-scrollbar', {
  width: 6,
  height: 6,
})
globalStyle('::-webkit-scrollbar-thumb', {
  backgroundColor: 'rgba(0, 0, 0, 0.15)',
  borderRadius: 3,
})
globalStyle('::-webkit-scrollbar-thumb:hover', {
  backgroundColor: 'rgba(0, 0, 0, 0.25)',
})
globalStyle('::-webkit-scrollbar-track', {
  backgroundColor: 'transparent',
})

// ====== Element Plus 主题（覆盖默认 primary） ======
globalStyle(':root', {
  vars: {
    '--el-color-primary': '#1677ff',
    '--el-color-primary-light-3': '#69b1ff',
    '--el-color-primary-light-5': '#91caff',
    '--el-color-primary-light-7': '#b6dbff',
    '--el-color-primary-light-8': '#c6dafe',
    '--el-color-primary-light-9': '#e6f4ff',
    '--el-color-primary-dark-2': '#0958d9',
    '--el-color-success': '#52c41a',
    '--el-color-warning': '#faad14',
    '--el-color-danger': '#ff4d4f',
    '--el-color-error': '#ff4d4f',
    '--el-border-radius-base': '6px',
  },
})

// ====== 全局 Element Plus 暗色变量 ======
globalStyle('html.dark', {
  vars: {
    '--el-color-primary': '#177ddc',
    '--el-color-primary-light-3': '#3c9ae8',
    '--el-color-primary-light-5': '#5db1f3',
    '--el-color-primary-light-7': '#7cc5f7',
    '--el-color-primary-light-8': '#92d3fb',
    '--el-color-primary-light-9': '#a8e1fc',
    '--el-color-primary-dark-2': '#0858b2',
  },
})

// ====== Element Plus 在父容器内的常用覆盖 ======
globalStyle('.el-button--primary', {
  // 与 antd 设计风格统一：偏亮蓝
  backgroundColor: '#1677ff',
  borderColor: '#1677ff',
})
globalStyle('.el-button--primary:hover', {
  backgroundColor: '#4096ff',
  borderColor: '#4096ff',
})
