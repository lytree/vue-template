/**
 * composition 工具函数 —— 让业务代码在运行时合并多个 style class
 *
 * ⚠️ 这个文件是普通 .ts（不是 .css.ts），可以导出函数 / 类型。
 * vanilla-extract 编译器对 .css.ts 的 export 做了白名单（只允许 plain
 * object/array/string/number 等），所以运行时工具函数必须拆出来。
 *
 * 用法对照：
 *   import { compose, cx, mergeProps, responsive } from '@/styles/compose'
 *   import { sprinkles } from '@/styles/utility.css'
 *
 *   const wrapper = compose(
 *     sprinkles({ p: '4', rounded: 'lg' }),     // ← vanilla-extract class
 *     localStyle,                                // ← 业务 style() 输出
 *   )
 */
import { style } from '@vanilla-extract/css'

/**
 * `compose(...args)` —— 把多个 style class 拼接成一个 class 字符串。
 *
 * 用法：
 *   const card = compose(
 *     sprinkles({ p: '4', rounded: 'lg' }),
 *     myLocalStyle,
 *   )
 *
 * 接受：
 *   • string —— 任何 vanilla-extract 产出的 className 字符串
 *   • 嵌套数组（自动 flatten）
 *   • false / null / undefined —— 跳过
 */
export function compose(
  ...args: Array<string | false | null | undefined | readonly (string | false | null | undefined)[]>
): string {
  const out: string[] = []
  const visit = (v: typeof args[number]) => {
    if (v === false || v === null || v === undefined) return
    if (Array.isArray(v)) v.forEach(visit)
    else if (typeof v === 'string') {
      if (v) out.push(v)
    }
  }
  args.forEach(visit)
  return out.join(' ')
}

/** alias: cx = compose（类 clsx 库命名） */
export const cx = compose

/**
 * `mergeProps(...)` —— 把多个 style() 输出 + inline style 对象合并。
 *
 * 与 compose 的区别：mergeProps 透传给 vanilla-extract 的 `style()`，
 * 会为每个合并产物生成一个独立的 hash class（在 vanilla-extract 看来是合法的）。
 *
 * 用法：
 *   const wrapper = mergeProps(
 *     sprinkles({ p: '4' }),
 *     { maxWidth: '600px', opacity: 0.9 },
 *     myLocalStyle,
 *   )
 */
export function mergeProps<
  P extends ReadonlyArray<string | Record<string, unknown> | false | null | undefined>,
>(...parts: P): string {
  const valid = parts.filter(
    (p): p is string | Record<string, unknown> => Boolean(p) && typeof p === 'object',
  ) as Array<string | Record<string, unknown>>
  // style() 是 vanilla-extract 编译期 API，
  // 接受 (base: object | string, ...styles: Array<object | string>) → string
  // 这里把它当泛型函数调用，绕过 TS 重载的精确类型校验
  return (style as unknown as (...a: unknown[]) => string)(...valid)
}

/**
 * `responsive(values)` —— 在手工 style() 对象里表达响应式变体。
 *
 * 用法（与 sprinkles 的 inline 条件变体不同；这条用于**手工 style 对象**）：
 *   mergeProps(responsive({
 *     mobile: { flexDirection: 'column' },
 *     md:     { flexDirection: 'row' },
 *   }))
 *   // ↑ 编译为：
 *   //   .cls { flex-direction: column }
 *   //   @media screen and (min-width: 768px) { .cls { flex-direction: row } }
 */
export function responsive(
  values: Partial<Record<'mobile' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', Record<string, unknown>>>,
): { '@media': Record<string, Record<string, unknown>> } {
  const queries: Record<string, Record<string, unknown>> = {}
  const breakpoints: Record<string, string> = {
    sm: 'screen and (min-width: 640px)',
    md: 'screen and (min-width: 768px)',
    lg: 'screen and (min-width: 1024px)',
    xl: 'screen and (min-width: 1280px)',
    '2xl': 'screen and (min-width: 1536px)',
  }
  for (const [k, v] of Object.entries(values)) {
    if (!v) continue
    if (k === 'mobile') Object.assign(queries, v)
    else if (breakpoints[k]) queries[breakpoints[k]] = v
  }
  return { '@media': queries } as { '@media': Record<string, Record<string, unknown>> }
}

/**
 * 动态 CSS 变量 key —— 从 utility.css.ts 导入（同源同构）。
 */
import { dynamicVarNames } from './utility.css'

/**
 * `applyDynamic(values)` —— 运行时注入 CSS 变量。
 *
 * 用法：
 *   import { dynColorPrimary, dynBgPrimary } from '@/styles/utility.css'
 *   import { applyDynamic } from '@/styles/compose'
 *
 *   <div
 *     style={applyDynamic({ color: '#ff4d4f', bg: '#fff5f5' })}
 *     class={dynColorPrimary}
 *   />
 *
 * 返回值是 React inline style 对象（key 是 CSS 变量名）。未传的字段不输出。
 */
export function applyDynamic(
  values: Partial<{
    color: string
    bg: string
    ringColor: string
    ringWidth: string
    ringOpacity: string
    borderColor: string
    textColor: string
    gradientFrom: string
    gradientVia: string
    gradientTo: string
  }>,
): { [k: string]: string } {
  const out: { [k: string]: string } = {}
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined || v === null) continue
    const cssVarName = dynamicVarNames[k as keyof typeof dynamicVarNames]
    if (cssVarName) out[cssVarName] = String(v)
  }
  return out
}

/**
 * `responsiveValue(values)` —— 在 vanilla-extract 的 scoped var 注入中用。
 *
 * 用法：
 *   const myStyle = style([responsiveValue({ gap: '12px', md: { gap: '24px' } })])
 *
 * 等价于原生 vanilla-extract：
 *   style([{ '@media': { 'screen and (min-width: 768px)': { gap: '24px' } }, gap: '12px' }])
 */
export type ResponsiveInput<T> = T & {
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}
export function responsiveValue<T extends Record<string, unknown>>(
  values: ResponsiveInput<T>,
): T & { '@media': Record<string, T> } {
  const { sm, md, lg, xl, '2xl': xxl, ...base } = values
  const media: Record<string, T> = {}
  if (sm) media['screen and (min-width: 640px)'] = sm as T
  if (md) media['screen and (min-width: 768px)'] = md as T
  if (lg) media['screen and (min-width: 1024px)'] = lg as T
  if (xl) media['screen and (min-width: 1280px)'] = xl as T
  if (xxl) media['screen and (min-width: 1536px)'] = xxl as T
  return { ...(base as T), '@media': media }
}