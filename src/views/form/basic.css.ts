/** Form Basic 私有样式 */
import { globalStyle, style } from '@vanilla-extract/css'

// ElSelect 全宽（压过 Element Plus 默认宽度）
export const selectFull = style({})

globalStyle(`${selectFull} .el-select`, {
  width: '100% !important',
})

export const buttonRow = style({
  display: 'flex',
  gap: 8,
})

export const priorityHint = style({
  marginLeft: 8,
  fontSize: 14,
  color: 'var(--ant-color-text-tertiary)',
})
