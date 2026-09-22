// ⚠️ element-plus@2.14 的 package.json exports 把深层子路径收紧了，
//    `element-plus/es/locale/lang/zh-cn` 这种路径在 Vite/Rolldown 下解析失败。
//    这里把真正可被 bundled 的 dist 文件声明成模块，省掉 TS7016。
declare module 'element-plus/dist/locale/*.mjs' {
  import type { Language } from 'element-plus/es/locale'
  const locale: Language
  export default locale
}

declare module 'element-plus/dist/locale/*.js' {
  import type { Language } from 'element-plus/es/locale'
  const locale: Language
  export default locale
}
