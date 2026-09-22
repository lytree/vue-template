/** DemoBlock 的预览区容器，根据 block prop 切换行内/块级布局 */
import { style } from '@vanilla-extract/css'

export const previewInline = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
  padding: 20,
})

export const previewBlock = style({
  padding: 20,
})

export const headerBorder = style({
  borderBottom: '1px solid var(--ant-color-border-secondary)',
  padding: '12px 20px',
})

export const footerBorder = style({
  borderTop: '1px solid var(--ant-color-border-secondary)',
  backgroundColor: 'var(--ant-color-fill-quaternary)',
  padding: '12px 20px',
  fontSize: 14,
  color: 'var(--ant-color-text-tertiary)',
})
