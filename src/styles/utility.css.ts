/**
 * utility.css.ts —— 向后兼容的 re-export shim
 *
 * 历史原因：vanilla-extract 时代业务文件统一 `import * as u from '@/styles/utility.css'`。
 * 现在 utility 主体已迁移到 utility.ts（纯字符串 className + utility.scss 全局样式）。
 * 这个文件保留是为了：
 *   1. 不动 14 个业务 .tsx 的 import 路径
 *   2. 测试用 vi.mock('@/styles/utility.css', ...) 继续生效
 */
export * from './utility'
export { default } from './utility'
