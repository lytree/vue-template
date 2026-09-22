/** Components Basic 私有样式 */
import { style } from '@vanilla-extract/css'

// 单元格预览
export const cellDemo = style({
  display: 'flex',
  height: 48,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ant-border-radius)',
  backgroundColor: 'var(--ant-color-fill-tertiary)',
  fontSize: 14,
})

export const cellDemo40 = style({
  display: 'flex',
  height: 48,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ant-border-radius)',
  backgroundColor: 'var(--ant-color-fill-tertiary)',
  fontSize: 14,
  width: 160,
})

// ElContainer 容器
export const containerBox = style({
  height: 176,
  overflow: 'hidden',
  borderRadius: 'var(--ant-border-radius)',
  border: '1px solid var(--ant-color-border-secondary)',
})

export const containerHeader = style({
  backgroundColor: 'var(--ant-color-fill-tertiary)',
  textAlign: 'center',
  fontSize: 14,
  lineHeight: '60px',
})

export const containerAside = style({
  backgroundColor: 'var(--ant-color-fill-secondary)',
  textAlign: 'center',
  fontSize: 14,
  lineHeight: '116px',
})

export const containerMain = style({
  textAlign: 'center',
  fontSize: 14,
})

export const containerFooter = style({
  backgroundColor: 'var(--ant-color-fill-tertiary)',
  textAlign: 'center',
  fontSize: 14,
  lineHeight: '60px',
})

// ElSplitter 面板
export const splitterBox = style({
  height: 160,
  borderRadius: 'var(--ant-border-radius)',
  border: '1px solid var(--ant-color-border-secondary)',
})

export const splitterPanelA = style({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--ant-color-fill-tertiary)',
  fontSize: 14,
})

export const splitterPanelB = style({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--ant-color-fill-quaternary)',
  fontSize: 14,
})

// ElScrollbar 列表
export const scrollList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontSize: 14,
})

export const scrollItem = style({
  borderRadius: 'var(--ant-border-radius-sm)',
  backgroundColor: 'var(--ant-color-fill-quaternary)',
  padding: '6px 12px',
})

// ElWatermark 内容
export const watermarkBox = style({
  height: 128,
  borderRadius: 'var(--ant-border-radius)',
  border: '1px solid var(--ant-color-border-secondary)',
  padding: 16,
  fontSize: 14,
  color: 'var(--ant-color-text-secondary)',
})

// ElAffix 容器
export const affixContainer = style({
  height: 160,
  overflowY: 'auto',
  borderRadius: 'var(--ant-border-radius)',
  border: '1px solid var(--ant-color-border-secondary)',
})

export const affixBar = style({
  width: '100%',
  backgroundColor: 'var(--ant-color-primary)',
  padding: '8px 12px',
  textAlign: 'center',
  fontSize: 14,
  color: '#fff',
})

export const affixList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 12,
  fontSize: 14,
})

export const affixListItem = style({
  borderRadius: 'var(--ant-border-radius-sm)',
  backgroundColor: 'var(--ant-color-fill-quaternary)',
  padding: '6px 12px',
})

// ElConfigProvider 演示行
export const configRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
})

export const configLabel = style({
  width: 144,
  flexShrink: 0,
  fontSize: 14,
  color: 'var(--ant-color-text-tertiary)',
})

// 分组行
export const rowGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
})

export const dividerRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  fontSize: 14,
})

// 文本截断
export const truncatedText = style({
  width: 150,
  display: 'inline-block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
