/**
 * compose.ts 工具函数单测
 *
 * compose.ts 在运行时引入 `@/styles/utility.css`（用于 applyDynamic 的 var 名）。
 * 测试里 mock 掉 utility.css.ts 避免 vanilla-extract 编译期上下文问题。
 */
import { describe, expect, it, vi } from 'vitest'

// Mock utility.css.ts 暴露 dynamicVarNames
vi.mock('@/styles/utility.css', () => ({
  dynamicVarNames: {
    color: '--utility-color',
    bg: '--utility-background-color',
    ringColor: '--utility-ringColor',
    ringWidth: '--utility-ringWidth',
    ringOpacity: '--utility-ringOpacity',
    borderColor: '--utility-borderColor',
    textColor: '--utility-textColor',
    gradientFrom: '--utility-gradientFrom',
    gradientVia: '--utility-gradientVia',
    gradientTo: '--utility-gradientTo',
  },
}))

const { compose, cx, applyDynamic, responsiveValue } = await import('@/styles/compose')

describe('compose()', () => {
  it('拼接多个 className 字符串', () => {
    expect(compose('a', 'b', 'c')).toBe('a b c')
  })

  it('跳过 false / null / undefined', () => {
    expect(compose('a', false, 'b', null, 'c', undefined)).toBe('a b c')
  })

  it('处理空字符串（不产生多余空格）', () => {
    expect(compose('a', '', 'b')).toBe('a b')
  })

  it('展平嵌套数组', () => {
    // compose 签名只接单层 readonly 数组 —— 嵌套靠 spread 两次
    const arr1 = ['a', 'b'] as const
    const nested = ['d', 'e'] as const
    const arr2 = ['c', nested] as readonly (string | readonly string[])[]
    expect(compose(arr1, arr2 as unknown as readonly string[])).toBe('a b c d e')
  })

  it('空参数返回空字符串', () => {
    expect(compose()).toBe('')
  })

  it('全 falsy 返回空字符串', () => {
    expect(compose(false, null, undefined)).toBe('')
  })

  it('cx 是 compose 的别名（同一引用）', () => {
    expect(cx).toBe(compose)
  })

  it('业务场景：条件 class 拼接', () => {
    const isActive = true
    const isDisabled = false
    expect(
      compose(
        'btn',
        isActive && 'btn-active',
        isDisabled && 'btn-disabled',
      ),
    ).toBe('btn btn-active')
  })
})

describe('applyDynamic()', () => {
  it('返回 React inline style 对象的 key 是 CSS 变量名', () => {
    const out = applyDynamic({ color: '#ff4d4f' })
    expect(Object.keys(out)).toHaveLength(1)
    const key = Object.keys(out)[0]
    expect(key).toMatch(/^--/)
    expect(out[key as keyof typeof out]).toBe('#ff4d4f')
  })

  it('未传字段不出现在输出中', () => {
    const out = applyDynamic({ color: '#1677ff' })
    const bgKey = Object.keys(out).find((k) => k.includes('background'))
    expect(bgKey).toBeUndefined()
  })

  it('undefined 字段被跳过', () => {
    const out = applyDynamic({ color: '#abc', bg: undefined as unknown as string })
    const bgKey = Object.keys(out).find((k) => k.includes('background'))
    expect(bgKey).toBeUndefined()
  })

  it('业务场景：同时设置 color / bg / ringColor', () => {
    const out = applyDynamic({
      color: '#3b82f6',
      bg: '#fff',
      ringColor: '#3b82f6',
    })
    expect(Object.keys(out).length).toBeGreaterThanOrEqual(3)
    for (const value of Object.values(out)) {
      expect(['#3b82f6', '#fff']).toContain(value)
    }
  })

  it('生成正确的 CSS 变量名（与 dynamicVarNames 对应）', () => {
    const out = applyDynamic({ color: '#000', bg: '#fff' })
    // dynamicVarNames.color = '--utility-color'
    expect(out['--utility-color']).toBe('#000')
    expect(out['--utility-background-color']).toBe('#fff')
  })
})

describe('responsiveValue()', () => {
  it('mobile 字段被作为 base 合并', () => {
    const result = responsiveValue({ gap: '12px' })
    expect(result).toMatchObject({ gap: '12px' })
    // 没有 md/sm/lg 等变体时，@media 是空对象
    expect(result['@media']).toEqual({})
  })

  it('md 字段被包装在 @media 下', () => {
    const result = responsiveValue({ gap: '12px', md: { gap: '24px' } })
    expect(result).toMatchObject({ gap: '12px' })
    expect(result['@media']).toBeDefined()
    const media = result['@media'] as Record<string, Record<string, string>>
    expect(media['screen and (min-width: 768px)']).toEqual({ gap: '24px' })
  })

  it('sm / md / lg / xl / 2xl 都生成对应 @media 断点', () => {
    const result = responsiveValue({
      gap: '12px',
      sm: { gap: '14px' },
      md: { gap: '16px' },
      lg: { gap: '20px' },
      xl: { gap: '24px' },
      '2xl': { gap: '32px' },
    })
    const media = result['@media'] as Record<string, Record<string, string>>
    expect(media['screen and (min-width: 640px)']).toEqual({ gap: '14px' })
    expect(media['screen and (min-width: 768px)']).toEqual({ gap: '16px' })
    expect(media['screen and (min-width: 1024px)']).toEqual({ gap: '20px' })
    expect(media['screen and (min-width: 1280px)']).toEqual({ gap: '24px' })
    expect(media['screen and (min-width: 1536px)']).toEqual({ gap: '32px' })
  })
})