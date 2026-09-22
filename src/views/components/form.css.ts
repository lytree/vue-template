/** Components Form 私有样式 */
import { globalStyle, style } from '@vanilla-extract/css'

/** 表单 Select 全宽压过 Element Plus 默认 */
export const formSelectFull = style({})

globalStyle(`${formSelectFull} .el-select`, {
  width: '100%',
})

export const inputStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
})

export const colorDisplay = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  color: 'var(--ant-color-text-secondary)',
})

export const colorSwatch = style({
  display: 'inline-block',
  width: 16,
  height: 16,
  borderRadius: 'var(--ant-border-radius-sm)',
  border: '1px solid var(--ant-color-border-secondary)',
})

export const colorCode = style({
  fontFamily: "'SFMono-Regular', Consolas, monospace",
})

export const sliderStack = style({
  display: 'flex',
  width: '100%',
  maxWidth: 448,
  flexDirection: 'column',
  gap: 16,
})

export const checkRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
})

export const selectGroupRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
})

export const dateRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
})

export const radioStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
})

export const uploadDrop = style({
  display: 'flex',
  width: '100%',
  cursor: 'pointer',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  borderRadius: 'var(--ant-border-radius)',
  border: '1px dashed var(--ant-color-border)',
  padding: '24px 32px',
  fontSize: 14,
  color: 'var(--ant-color-text-secondary)',
  transition: 'border-color 0.15s',
  ':hover': {
    borderColor: 'var(--ant-color-primary)',
  },
})
