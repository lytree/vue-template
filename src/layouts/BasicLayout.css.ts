/** BasicLayout 私有样式 */
import { style } from '@vanilla-extract/css'

// 侧边栏宽度（响应 collapsed）
export const asideWide = style({ width: 224 })
export const asideNarrow = style({ width: 64 })

// logo 块（独立一份避免循环依赖）
export const logoBlock = style({
  display: 'flex',
  width: 32,
  height: 32,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ant-border-radius)',
  backgroundColor: 'var(--ant-color-primary)',
  fontSize: 16,
  fontWeight: 700,
  color: '#fff',
})

// header 中头像下拉箭头
export const headerArrow = style({
  fontSize: 12,
  color: 'var(--ant-color-text-tertiary)',
})

// 下拉项内图标
export const dropdownIcon = style({
  marginRight: 4,
})

// footer 副标题
export const footerText = style({
  borderTop: '1px solid var(--ant-color-border-secondary)',
  backgroundColor: 'var(--ant-color-bg-container)',
  padding: '12px 24px',
  textAlign: 'center',
  fontSize: 14,
  color: 'var(--ant-color-text-tertiary)',
})
