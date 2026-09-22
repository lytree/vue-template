/** Settings 私有样式 */
import { style } from '@vanilla-extract/css'

// 颜色色块
export const swatchBlock = style({
  height: 40,
  width: '100%',
  borderRadius: 'var(--ant-border-radius-sm)',
  border: '1px solid var(--ant-color-border-secondary)',
})

// 设置项行
export const settingRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '12px 0',
})
