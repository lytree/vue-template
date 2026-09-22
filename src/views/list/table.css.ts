/** Table List 私有样式 */
import { globalStyle, style } from '@vanilla-extract/css'

// 搜索输入宽度（用于包一层原生 div）
export const inputWrap = style({ width: 224 })

// 操作列按钮间距
export const actionGroup = style({
  display: 'flex',
  alignItems: 'center',
})

export const iconMr = style({ marginRight: 4 })

// 分页脚
export const paginationBar = style({
  display: 'flex',
  justifyContent: 'flex-end',
  borderTop: '1px solid var(--ant-color-border-secondary)',
  padding: '12px 20px',
})

export const amountCell = style({ fontVariantNumeric: 'tabular-nums' })

// ElForm 行为用 !important 压过
export const formNoGapY = style({})

globalStyle(`${formNoGapY} .el-form-item`, {
  marginBottom: '0 !important',
})
