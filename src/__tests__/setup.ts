/**
 * vitest 测试全局 setup —— 在每个 spec 文件执行前运行。
 *
 * 当前只做 happy-dom 的环境准备。
 * 如果未来需要 mock 一些全局副作用（比如 matchMedia / IntersectionObserver），在这里加。
 */

// happy-dom 已经在 vitest.config.ts 配 environment 提供；
// 这个文件目前只作为预留入口。spec 文件通过 `import { ... } from 'vitest'` 拿 expect/vi/test。
export {}