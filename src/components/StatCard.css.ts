/**
 * StatCard 私有样式 —— 调色板（图标底色 + 文字色）
 *
 * 用 vanilla-extract 替换原 Linaria css\`\` 的内联声明。
 * 注意：dark mode 是用 `.dark &` 选择器实现的（在 tokens.css / store 里切 html.dark 即可）。
 */
import { style, styleVariants } from '@vanilla-extract/css'

// 单色基础（亮色）
const baseTone = style({
  borderRadius: 'var(--ant-border-radius)',
  fontSize: 18,
})

export const toneBg = styleVariants({
  primary: [baseTone, {
    backgroundColor: 'var(--ant-color-primary-bg)',
    color: 'var(--ant-color-primary)',
  }],
  success: [baseTone, {
    backgroundColor: '#f6ffed',
    color: 'var(--ant-color-success)',
    selectors: {
      '.dark &': { backgroundColor: '#162312' },
    },
  }],
  warning: [baseTone, {
    backgroundColor: '#fffbe6',
    color: 'var(--ant-color-warning)',
    selectors: {
      '.dark &': { backgroundColor: '#2b2111' },
    },
  }],
  error: [baseTone, {
    backgroundColor: '#fff2f0',
    color: 'var(--ant-color-error)',
    selectors: {
      '.dark &': { backgroundColor: '#2c1618' },
    },
  }],
})
