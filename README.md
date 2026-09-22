# Vue Antd Template

一个 **Vue 3.6 + 纯 TSX（无 `.vue` 单文件组件）+ Vite** 的中后台模板，UI 走 **Ant Design 5 设计语言**。

## 技术栈

| 领域 | 选型 |
| --- | --- |
| 框架 | `vue@3.6.0-rc.7` |
| 语言 | TypeScript + **TSX only** |
| 构建 | Vite 8 |
| JSX 编译器 | **`vue-jsx`**（Oxc 驱动，虚拟 DOM 模式） |
| 路由 | `vue-router@5` |
| 状态 | `pinia@4`（Setup Store 写法） |
| UI 组件 | `element-plus@2.14` |
| 样式 | `@vanilla-extract/css` + `@vanilla-extract/sprinkles` + antd 设计令牌 |
| 包管理 | `pnpm@11`（锁文件 `pnpm-lock.yaml`，`packageManager` 字段已固定） |

## 快速开始

```bash
pnpm install
pnpm dev          # 开发
pnpm type-check   # 类型检查
pnpm build        # 类型检查 + 生产构建
pnpm preview      # 预览产物
```

> 本项目使用 **pnpm**。`node_modules` 是硬链接 + 符号链接结构，
> 请不要再用 `npm install` 或 `yarn` 重复安装，否则会破坏链接结构。
> 如果没有 pnpm：`corepack enable`（`packageManager` 字段会让 corepack 自动选用正确版本），
> 或 `npm i -g pnpm`。

## 目录结构

```
src/
├── main.tsx                     # 入口：挂载 + 样式引入顺序
├── App.tsx                      # 根组件（ElConfigProvider 中文语言包）
├── router/
│   └── index.tsx                # 路由表（meta.title / icon / order 驱动菜单）
├── stores/
│   ├── index.ts                 # createPinia
│   └── modules/
│       ├── app.ts               # 侧边栏折叠 / 明暗主题
│       └── user.ts              # 当前用户
├── layouts/
│   ├── BasicLayout.tsx          # 侧边栏 + 顶栏 + 内容区
│   └── menu.ts                  # 由路由表推导菜单
├── components/
│   ├── PageContainer.tsx        # 页面外壳（标题 / 描述 / 右上操作）
│   ├── DemoBlock.tsx            # 组件示例卡片（标题 / 说明 / 预览）
│   └── StatCard.tsx             # 指标卡
├── views/
│   ├── dashboard/index.tsx      # 工作台
│   ├── list/table.tsx           # 查询表格
│   ├── form/basic.tsx           # 表单 + 校验
│   ├── settings/index.tsx       # 系统设置
│   ├── components/              # 组件示例（按 Element Plus 官方分类）
│   │   ├── basic.tsx            #   基础组件
│   │   ├── form.tsx             #   表单组件
│   │   ├── data.tsx             #   数据展示
│   │   ├── feedback.tsx         #   反馈组件
│   │   └── navigation.tsx       #   导航组件
│   └── exception/404.tsx        # 404
├── styles/
│   ├── utility.css.ts           # sprinkles 工具类 + 复合快捷类
│   ├── tokens.css                # antd 设计令牌 + Element Plus 变量映射
│   └── element-theme.css        # Element Plus → antd 主题映射
└── types/router.d.ts            # RouteMeta 类型扩展
```

## 设计体系：一套令牌，两处消费

所有颜色 / 圆角 / 阴影只在 `src/styles/tokens.css` 的 `:root` 里定义一次（`--ant-*` 变量），
然后分两条路径复用：

1. **vanilla-extract 工具类**：通过 `@vanilla-extract/sprinkles` 的 `defineSprinkles()`
   注册到 `src/styles/utility.css.ts`，调用方式：

   ```tsx
   import { sprinkles } from '@/styles/utility.css'

   // 静态使用 —— 编译时合并为单个 hash class
   <div class={sprinkles({ display: 'flex', padding: '5', gap: '4' })} />

   // 响应式 —— 不同断点用不同值
   <div class={sprinkles({
     display: { mobile: 'none', sm: 'block' },
     gridTemplateColumns: { mobile: '1', sm: '2', xl: '4' },
   })} />
   ```

   sprinkles 的所有值都走 antd 设计令牌（`var(--ant-color-*)`），dark mode 跟随 `.dark` 自动切换。
   复杂语义类（`iconButton`、`appCard`、`trendBar` 等）和旧的 style()-式类名（`u.flex`、`u.p5`）
   也一并从同一文件导出，老代码可继续沿用。

2. **Element Plus**：在 `element-theme.css` 里把 `--el-*` 映射到同一批令牌，
   组件外观（主色 `#1677ff`、圆角 `6px`、控制高度 `32px`、灰阶文字、语义色）与 antd 保持一致。

> 样式引入顺序在 `src/main.tsx` 中**不可调换**：
> `element-plus/dist/index.css` → 暗色变量 → tokens.css → `element-theme.css`（覆盖必须最后）。

暗色模式通过在 `<html>` 上切换 `.dark` 实现，由 `useAppStore().toggleDark()` 驱动，并持久化到 localStorage。

## 覆盖组件库样式的三层手段

vanilla-extract 工具类编译期会生成**无层的普通 CSS 声明**（不输出 `@layer`）。
Element Plus 的样式同样没有包在 `@layer` 里，所以二者在层叠上完全平等。
如果 EP 自带样式压过你的工具类（常见于内置的 `!important` 或组件 root 选择器），按以下顺序处理：

1. **令牌重映射**（首选，覆盖约九成需求）：改 `--el-*` 变量，写在 `element-theme.css` 的 `:root`；
   暗色覆盖必须用 `html.dark`（比 EP 的 `html.dark` 声明更靠后，才能压住 `dark/css-vars.css`）。
2. **全局选择器覆盖**（改组件内部结构）：TSX 没有 scoped style，**不需要 `:deep()`**，
   直接写全局选择器并用父级容器限定作用域：
   ```css
   .my-table .el-table__header th.el-table__cell { background: var(--ant-color-fill-quaternary); }
   ```
3. **`!important` 逃生舱**：项目里直接用 `importantWFull / importantW72 / importantMr1 / importantMy5`
   等 vanilla-extract 类（已带 `!important`），它们都从 `@/styles/utility.css` 导入。
   用 `style({ width: '160px !important' })` 也能手写一个。

## 样式系统：sprinkles + recipes + 主题 + 动画

项目把 Tailwind 风格的 atomic utility、Tailwind v4 缺失能力、UnoCSS 风格主题切换与切换动画，全部用 **vanilla-extract 全家桶** 在 `src/styles/` 下实现。整体目录：

```
src/styles/
├── utility.css.ts        # 主入口：sprinkles / recipes / theme / 动画 / dynamic vars
├── compose.ts            # compose / cx / mergeProps / responsive / applyDynamic / responsiveValue
├── useTheme.ts           # useTheme() hook / setTheme / triggerThemeFlash / themeOptions
├── tokens.css            # antd 设计令牌 + Element Plus 变量映射
├── globals.css.ts        # reset + scrollbar + Element Plus 主色覆盖
└── element-theme.css     # Element Plus → antd 主题覆盖
```

> ⚠️ **重要限制**：`.css.ts` 文件的 `export` 走 vanilla-extract AST 白名单，
> 只允许 plain object / array / string / number。运行时函数（hook、DOM 操作、动态注入）
> 必须拆到普通 `.ts` 文件 —— 这就是 `compose.ts` / `useTheme.ts` 单独存在的原因。

### 1. 三个层 API

| 层 | 入口 | 用途 |
|---|---|---|
| **atomic utility** | `sprinkles({ display: 'flex', padding: '4', gap: '4' })` | 单个属性 → 原子类，编译期合并为单个 hash class |
| **语义化组件** | `card({ hoverable: true, size: 'lg' })` / `button({ size: 'lg' })` | 多 variant 类型安全的 recipe，覆盖弹窗 / 表单 / 按钮等通用 UI 模式 |
| **运行时工具** | `compose(...) / cx(...) / mergeProps(...) / applyDynamic({...}) / responsiveValue(...)` | 跨文件共享、动态 CSS 变量注入、响应式合并 |

```tsx
import { sprinkles, card, button } from '@/styles/utility.css'
import { compose, cx, mergeProps, applyDynamic } from '@/styles/compose'

// 1. atomic
<div class={sprinkles({ display: 'flex', p: '4', gap: '4', rounded: 'lg' })} />

// 2. recipe
<button class={button({ size: 'lg', block: true })}>提交</button>

// 3. compose + dynamic
<div class={cx(
  sprinkles({ p: '4', bg: 'container' }),
  card({ size: 'md' }),
)} />

// 4. 动态 CSS 变量注入（任意颜色）
<div
  style={applyDynamic({ color: '#ff4d4f', bg: '#fff5f5' })}
  class={sprinkles({ color: 'primary', bg: 'fill-secondary' })}
/>
```

### 2. atomic utility 覆盖范围（[utility.css.ts 第 78 行起](file:///f:/Code/Web/vue-template/src/styles/utility.css.ts#L78)）

| 类别 | 关键 properties |
|---|---|
| **display / 可见性** | `display` / `visibility` / `opacity`（13 阶） |
| **flex / grid** | `flexDirection`（含 row-reverse / col-reverse）/ `flexWrap`（含 wrap-reverse）/ `flex` / `flexShrink` / `flexGrow` / `order` / `alignItems` / `alignSelf` / `justifyContent`（含 evenly）/ `placeContent` / `placeItems` |
| **grid** | `gridTemplateColumns`（1-6/none）/ `gridTemplateRows` / `gridColumn` / `gridRow` / `gridAutoFlow` |
| **gap** | `gap`（0/px/0.5/1/1.5/2…12）/ `columnGap` / `rowGap` |
| **sizing** | `width` / `height`（含 fraction `1/2` `1/3` `2/3` `1/4` `3/4`）/ `minW` / `minH` / `maxW`（xs→7xl） / `maxH` / `aspectRatio`（square / video） |
| **spacing** | `padding` / `paddingLeft` / `paddingRight` / `paddingTop` / `paddingBottom`（0/px/0.5/1/1.5/2…12）/ `margin*`（含 auto / negative） |
| **typography** | `fontSize`（xs→6xl）/ `fontWeight`（thin→black 9 阶）/ `lineHeight` / `letterSpacing` / `fontFamily` / `fontStyle` / `textAlign`（含 justify）/ `textTransform` / `textDecoration` / `whiteSpace` / `wordBreak` / `overflowWrap` |
| **color** | `color`（含 current / transparent / inherit）/ `backgroundColor` |
| **border** | `borderRadius`（xs→3xl/full）/ 四角独立半径 / `borderWidth` / `borderStyle` / `borderColor` / 四向独立 |
| **outline** | `outlineStyle` / `outlineWidth` / `outlineColor` / `outlineOffset` |
| **shadow** | `boxShadow`（none/sm/base/md/lg/xl/2xl/inner/antd/antd-lg） |
| **transition / animation** | `transitionProperty`（none/all/colors/opacity/shadow/transform/width）/ `transitionDuration`（0-1000 9 阶）/ `transitionTimingFunction` / `transitionDelay` / `transition` / `animation`（spin/ping/pulse/bounce + keyframes） |
| **transform** | `scale` / `rotate`（含负值）/ `translateX` / `translateY`（含 1/2 / full）/ `skewX` / `skewY` / `transformOrigin` |
| **filter** | `blur` / `brightness` / `contrast` / `saturate` / `grayscale` / `hueRotate` / `invert` / `sepia` |
| **backdrop** | `backdropBlur` / `backdropBrightness` / `backdropSaturate` / `backdropGrayscale` |
| **overflow** | `overflow` / `overflowX` / `overflowY`（含 clip / visible / scroll） |
| **position** | `position`（含 static）/ `inset` / `top` / `right` / `bottom` / `left` / `insetInline` / `insetBlock` / `zIndex`（0→100/auto） |
| **interactivity** | `cursor` / `pointerEvents` / `userSelect` / `resize` / `appearance` / `accentColor` / `caretColor` / `scrollBehavior` / `scrollSnapType` / `scrollSnapAlign` / `touchAction` |
| **object** | `objectFit` / `objectPosition` |

**响应式断点**（默认条件变体）：

```ts
mobile / sm (≥640) / md (≥768) / lg (≥1024) / xl (≥1280) / 2xl (≥1536)
```

```tsx
sprinkles({ display: { mobile: 'block', md: 'flex' }, p: { mobile: '2', md: '4' } })
```

**Shorthands**（70+ 个）：

`px` / `py` / `p` / `mt` / `mb` / `ml` / `mr` / `w` / `h` / `size` / `minW` / `minH` / `maxW` / `maxH` / `rounded` / `roundedT/B/L/R` / `items` / `justify` / `flexCol` / `flexRow` / `gridCols` / `gridRows` / `colSpan` / `rowSpan` / `truncate` / `textXs/Sm/Base/Lg/Xl/2xl/3xl` / `textLeft/Center/Right` / `fontBold/Semibold/Medium/Normal` / `fontMono` / `leadingNone/Tight/Normal` / `trackingWidest` / `tabularNums` / `textPrimary/Text/TextSecondary/TextTertiary/TextQuaternary` / `bgLayout/Container/Elevated/Primary/...` / `borderB/T/R/L` / `duration` / `delay` / `ease` / `shadowAntd/Lg` / `overflowHidden/YAuto/XAuto` / `cursorPointer` / `insetX/Y` / `gapX/Y` / `borderB/T/R/L`

### 3. Recipe（语义化组件 + 多 variant）

位于 [utility.css.ts 第 540+ 行](file:///f:/Code/Web/vue-template/src/styles/utility.css.ts#L540)：

| recipe | variants |
|---|---|
| `card` | `size`（none/sm/md/lg）+ `hoverable`（true/false） |
| `button` | `size`（sm/md/lg）+ `block`（true/false） |
| `iconBtn` | `size`（sm/md/lg） |
| `userMenu` | `padded`（true/false） |
| `logoBox` | `tone`（primary/dark/light）+ `size`（sm/md/lg） |
| `shortcut` | `active`（true/false）+ `size`（sm/md） |
| `bar` | `tone`（primary/success/warning） |
| `dot` | `tone`（primary/success/warning/error/neutral）+ `size`（sm/md/lg） |
| `trend` | `direction`（up/down/flat） |
| `overlay` | `tone`（light/dark/primary）+ `elevation`（sm/md/lg）+ `size`（sm/md/lg/full）+ `padding`（none/sm/md/lg） |
| `actionBar` | `direction`（row/row-reverse/col/col-reverse）+ `justify`（5 种）+ `gap`（sm/md/lg），自带 `@media ≥ 640px` 响应式 |
| `inputGroup` | `size`（sm/md/lg）+ `required` + `invalid` + `fullWidth` |
| `stackCard` | `gap`（sm/md/lg）+ `tone`（container/transparent/layout） |
| `centerBox` | `direction`（row/col）+ `gap` + `bg` |
| `toolbarRow` | `gap` + `align`（4 种）+ `padded`，自带响应式 |

每个 recipe 配套导出 `XxxVariants` 类型（`RecipeVariants<typeof xxx>`），可直接作为 props 类型：

```tsx
import { button, type ButtonVariants } from '@/styles/utility.css'

defineProps<{ size?: ButtonVariants['size']; block?: boolean }>()
```

### 4. 主题系统（4 套主题 + 平滑切换动画）

位于 [utility.css.ts 第 1965+ 行](file:///f:/Code/Web/vue-template/src/styles/utility.css.ts#L1965) + [useTheme.ts](file:///f:/Code/Web/vue-template/src/styles/useTheme.ts)：

```ts
themeContract = createThemeContract({
  color / bg / text / text-secondary / border / success / warning / error
})

lightTheme / darkTheme / brandTheme / accentTheme  // 4 套主题
themes = { light, dark, brand, accent }
ThemeName = keyof typeof themes
```

**主题感知 utility class**（挂在主题子树内自动切换）：

```tsx
import { themePrimaryBtn, themeCard, themes } from '@/styles/utility.css'

<button class={themePrimaryBtn}>主题按钮</button>
<section class={themeCard + themes.dark}>暗色卡片</section>
```

**Vue 主题切换 hook + setTheme API**：

```tsx
import { useTheme, setTheme, triggerThemeFlash } from '@/styles/useTheme'

// 响应式：组件内用 useTheme
const { theme, themeName, isDark, toggleTheme, setTheme } = useTheme()
<button onClick={toggleTheme}>切换</button>

// 命令式：store / router 里用
setTheme('dark')
setTheme('brand', { duration: 800, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' })
setTheme('dark', { animate: false })         // 立即切换
setTheme('dark', { viewTransition: true })   // 浏览器原生 view-transition API
triggerThemeFlash()                          // 整页 200ms 闪烁指示
```

**主题切换动画能力**（[utility.css.ts 第 2167+ 行](file:///f:/Code/Web/vue-template/src/styles/utility.css.ts#L2167)）：

| capability | 实现 |
|---|---|
| **CSS 变量层过渡** | `--theme-transition-duration` 默认 0ms，setTheme 调用时临时改为 350ms，结束时清回 |
| **受主题影响的属性** | `background-color` / `color` / `border-color` / `fill` / `stroke` / `box-shadow` |
| **antd 令牌过渡绑定** | `.themeTransitioning *` 内联规则，让所有引用 `--ant-color-*` 的元素也走过渡 |
| **themeFadePulse** | body 切换瞬间 200ms 轻量淡入 |
| **themeSwitchExpand** | 圆形从点击位置扩展到 150% —— Material You reveal 600ms |
| **themeSwitchBlur** | 整页模糊8px → 0 + opacity 0.7 → 1，400ms |
| **themeSwitchScale** | scale 0.98 → 1 + opacity 0.85 → 1，350ms overshoot |
| **themeSwitchSlide** | translateY 12px → 0 + opacity 0 → 1，400ms |
| **themeShimmer** | 整页金色光带扫过，iOS 风格，700ms |
| **themeColorMatrix** | hue-rotate 0° → 30° → 0°，适合 brand / accent 主题，500ms |
| **themeFlash** | 全屏 200ms 半透明闪烁（`triggerThemeFlash()` 触发） |
| **themeRipple** | 从点击位置圆形扩散的 keyframes 预备能力 |
| **themeIconRotate** | Sun/Moon 切换按钮 500ms 360° 旋转 |
| **themeIconAppear** | 双图标切换 300ms 缩放 + 旋转淡入 |
| **@view-transition** | Chrome 111+ 整页淡入淡出（`document.startViewTransition()`） |
| **prefers-reduced-motion** | 系统级"减少动效"时自动归零 |

**预设动画集合**（`themeAnimations`）：

```ts
themeAnimations = {
  fade, blur, scale, slide, expand, flash, shimmer, matrix
}
type ThemeAnimationName = keyof typeof themeAnimations
```

**`setTheme` 接受的可选项**（升级版，返回 `Promise<ThemeName>`）：

```ts
export interface SetThemeOptions {
  animate?: boolean              // 是否启用过渡（默认 true）
  duration?: number              // 自定义过渡时长（ms，默认 350）
  easing?: string                // 自定义缓动函数
  viewTransition?: boolean       // 浏览器原生 view-transition API
  animation?: ThemeAnimationName | false  // 整页动画类型（默认 'fade'）
  bodyClass?: string             // 自定义过渡 class 覆盖默认
  originX?: number               // 点击位置 X（用于 ripple/expand 动画）
  originY?: number               // 点击位置 Y
}

setTheme('dark', { animation: 'expand', originX, originY })
setTheme('brand', { animation: 'shimmer' })
setTheme('accent', { animation: 'blur', duration: 500 })

await setTheme('dark')  // 返回 Promise<ThemeName>，等动画完成
```

**辅助 API**（[useTheme.ts](file:///f:/Code/Web/vue-template/src/styles/useTheme.ts)）：

```ts
setThemeSync(name)                 // fire-and-forget 同步版本
beginThemeTransition({ duration }) // 不切主题，只触发一次过渡（路由切换 / 弹窗打开）
triggerThemeFlash()                // 整页 200ms 闪烁（手动触发）
```

**Vue `useTheme()` hook 升级**：

```ts
const {
  theme, themeName, isDark,
  isTransitioning,  // 新增：响应式 ref，过渡期间为 true
  setTheme,          // async，返回 Promise<ThemeName>
  toggleTheme,       // async，返回 Promise<ThemeName>
} = useTheme()

<button :disabled="isTransitioning" onClick={toggleTheme}>切换</button>
```

### 4.2 完整动画示例

```tsx
import { useTheme, beginThemeTransition } from '@/styles/useTheme'
import { themeIconRotate } from '@/styles/utility.css'

// 1. 默认切换（fadePulse 200ms）
<button onClick={toggleTheme}>切换</button>

// 2. Material You 圆形扩散（带点击位置）
<button
  onClick={async (e) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    await setTheme('dark', {
      animation: 'expand',
      originX: rect.left + rect.width / 2,
      originY: rect.top + rect.height / 2,
    })
  }}
>
  切到暗色（圆形展开）
</button>

// 3. 模糊 / 缩放 / 滑动切换
<button onClick={() => setTheme('brand', { animation: 'blur' })}>blur 切换</button>
<button onClick={() => setTheme('accent', { animation: 'scale' })}>scale 切换</button>
<button onClick={() => setTheme('light', { animation: 'slide' })}>slide 切换</button>

// 4. iOS 风 shimmer 高光（适合品牌主题切换）
<button onClick={() => setTheme('brand', { animation: 'shimmer' })}>
  iOS shimmer
</button>

// 5. Sun/Moon 切换按钮（图标转一圈）
<button onClick={toggleTheme} class={themeIconRotate}>
  <Sun v-if={!isDark" /><Moon v-else />
</button>

// 6. 路由切换时也触发主题过渡（不实际切主题）
import { useRouter } from 'vue-router'
router.afterEach(() => beginThemeTransition({ duration: 200 }))

// 7. 浏览器原生 view-transition（Chrome 111+）
<button onClick={() => document.startViewTransition(() => setTheme('dark'))}>
  整页过渡
</button>

// 8. 立即切换（关闭动画）
<button onClick={() => setTheme('dark', { animate: false })}>立即切换</button>
```

### 5. 运行时工具函数（[compose.ts](file:///f:/Code/Web/vue-template/src/styles/compose.ts)）

```ts
compose('a', 'b', condition && 'c')  // 字符串拼接，自动跳过 falsy
cx(...)                                // alias
mergeProps(sprinkles({...}), { maxWidth: '600px' })  // 透传给 style()，编译为 hash class
responsive({ mobile: {...}, md: {...} })  // 生成 @media StyleRule 子对象
responsiveValue({ gap: '12px', md: { gap: '24px' } })  // 直传 style([...]) 用
applyDynamic({ color: '#1677ff' })  // → { '--utility-color': '#1677ff' }
```

### 6. 兼容垫片（`u.flex / u.px4 / u.appCard` 等）

老代码用 `import * as u from '@/styles/utility.css'` 拿预先 `style()` 出来的 className 字符串 —— 项目保留了 200+ 个旧名作为兼容垫片，**14 个 TSX 文件零改动**。新代码推荐用 `sprinkles({...})` / `card({...})` 函数式 API。

### 7. Tailwind v4 缺失能力补齐（[utility.css.ts 第 1700+ 行](file:///f:/Code/Web/vue-template/src/styles/utility.css.ts#L1700)）

| 类别 | utility |
|---|---|
| **gradient** | `bgGradientToT / Tr / R / B / Br / Bl` / `textGradientPrimary` |
| **mask** | `maskCircle` / `maskSquare` / `maskNone` |
| **ring（变量化）** | `ringNone` / `ring1` / `ring2` / `ring4` / `ring8` / `ringInner`（用 `dynamicVars.ringColor / ringWidth`） |
| **isolation / mix-blend** | `isolate` / `isolationAuto` + 15 种 blend mode（normal / multiply / screen / overlay / darken / lighten / color-dodge / color-burn / hard-light / soft-light / difference / exclusion / hue / saturation / color / luminosity） |
| **will-change / contain** | `willChangeAuto / Scroll / Contents / Transform` + `containNone / Strict / Content / Layout / Style / Paint / Size` |
| **columns** | `columns1-5 / Auto` + `columns3xs-7xl` |
| **scroll-margin / scroll-padding / scroll-snap-stop** | `scrollM0/2/4/8` / `scrollP0/2/4/8` / `scrollSnapNormal / Always` |
| **hyphens / writing-mode** | `hyphensNone / Manual / Auto` + `writingModeHorizontal / Vertical` |
| **field-sizing / content** | `fieldSizingFixed / Content` / `contentEmpty / None` |
| **line-clamp** | `lineClamp1-6 / None` |
| **list-style / table** | `listNone / Disc / Decimal` / `listInside / Outside` / `tableAuto / Fixed` / `borderCollapse / Separate` |
| **decoration** | `decorationUnderline / Overline / LineThrough / None` + style（solid/double/dotted/dashed/wavy） + `underlineOffset*` |
| **浮层 / 模态** | `backdrop` / `modalContainer` |
| **可访问性** | `srOnly` / `notSrOnly` |
| **条件变体（hover/focus/active/disabled/placeholder）** | 12 个 utility（hoverUnderline / hoverPrimary / hoverScale105 / focusOutlineNone / focusRing / activeScale95 / disabledOpacity50 / disabledPointerNone / placeholderTextTertiary 等） |

### 8. 动态 utility（UnoCSS 风格的任意值注入）

通过 CSS 变量实现 Tailwind 的 `bg-[#abc]` 等任意值：

```tsx
import { dynColorPrimary, dynBgPrimary } from '@/styles/utility.css'
import { applyDynamic } from '@/styles/compose'

// 业务态：任意颜色值通过 dynamicVars 注入
<div
  style={applyDynamic({ color: '#ff4d4f', bg: '#fff5f5', ringColor: '#3b82f6' })}
  class={dynColorPrimary}
/>

// 主题感知 utility：dynColorPrimary / dynBgPrimary / dynBorderPrimary
// / dynTextPrimary / dynGradientFromTo
```

`dynamicVars` 提供 10 个命名 token（color / bg / ringColor / ringWidth / ringOpacity / borderColor / textColor / gradientFrom / gradientVia / gradientTo），`:root` 与 `html.dark` 自动切换初始值。

### 用法对照 UnoCSS / Tailwind

```tsx
// UnoCSS: <div class="flex items-center gap-4 p-6 bg-primary text-white rounded-lg shadow-md
//                   hover:bg-primary-hover transition-all">
<div
  class={compose(
    sprinkles({ display: 'flex', items: 'center', gap: '4', p: '6',
                bg: 'primary', color: 'white', rounded: 'lg', shadow: 'md',
                transitionDuration: '200', transitionProperty: 'all' }),
    hoverBgFillTertiary,
  )}
/>

// Tailwind: <div class="bg-gradient-to-br from-blue-500 to-purple-600 backdrop-blur-md">
<div
  style={applyDynamic({ gradientFrom: '#3b82f6', gradientTo: '#9333ea' })}
  class={compose(bgGradientToBr, backdropBlur, dynGradientFromTo)}
/>

// Tailwind 主题切换: useTheme() + setTheme + 8 种动画预设
const { theme, toggleTheme, isTransitioning, setTheme } = useTheme()
<button :disabled="isTransitioning" onClick={toggleTheme} class={themeIconRotate}>
  切换
</button>

// Material You 圆形扩散 + 点击位置
<button
  onClick={async (e) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    await setTheme('dark', {
      animation: 'expand',
      originX: rect.left + rect.width / 2,
      originY: rect.top + rect.height / 2,
    })
  }}
>
  切到暗色
</button>

// 8 种动画：fade / blur / scale / slide / expand / flash / shimmer / matrix
<button onClick={() => setTheme('brand', { animation: 'shimmer' })}>iOS 风</button>
<button onClick={() => setTheme('accent', { animation: 'blur' })}>模糊切换</button>

<section class={theme}>
  <div class={themeCard}>主题感知卡片，自动跟随切换</div>
</section>
```

### 验证

- `pnpm type-check` ✅ exit0
- `pnpm build` ✅ 1647 modules，2.17s
- CSS bundle：`vdom-*.css` 196.67 kB（gzipped 28 kB），`index-*.css` 370 kB（gzipped 50 kB）

## JSX 编译器：`vue-jsx`（Oxc）

本项目不使用 Babel 版的 `@vitejs/plugin-vue-jsx`，而是官方的 **`vue-jsx`**（仓库 `vuejs/vue-jsx-vapor`）。
它用 Rust 写的 Oxc 编译器替换 Babel，官方基准称编译速度约为 Babel 的 30–50 倍。

- **本项目为纯虚拟 DOM 模式**：`vite.config.ts` 里显式设了 `vapor: false`，不产生任何 Vapor 输出。
- Vite 接入：`import vueJsx from 'vue-jsx/vite'`，插件数组 `[vueJsx({...}), vanillaExtractPlugin()]`。
  `vanillaExtractPlugin()` 把 `*.css.ts` 编译成静态 CSS 并按需注入到 import 该模块的位置。
  插件选项为 `vapor: false` / `optimize` / `mergeProps` / `sourceMap`，
  以及 **`hmr` 仅在 dev 打开**（`hmr: command === 'serve'`）——原因见下方易错点表。
- 运行时它按需注入 `vue-jsx-vapor/vdom` 的 `normalizeSlot`、`createVNodeCache` 等辅助函数
  （对象字面量插槽会用到），因此 `vue-jsx` 装在 **`dependencies`** 而非 `devDependencies`。
- `tsconfig.json` 的 `jsxImportSource` 为 **`"vue-jsx"`**（该生态的推荐值）。
  在 `jsx: "preserve"` 下它**只影响类型解析**，真正的代码转换由 `vue-jsx/vite` 完成。
  用它自带的 JSX 类型比 Vue 的严格：插槽回调按组件签名做逆变检查、`KeyboardEvent` 换成了
  它自己的泛型版 —— 因此有两处代码适配约定，见下方易错点表。
- `defineVaporComponent`（选择性 Vapor 的标记）当前**不生效**，因为它需要 `vapor: true`；
  且 Vapor 组件还需要 Vapor 应用根，详见易错点表最后一行。

> **当前为 `3.3.0-beta.1`**（npm 的 `latest` 标签即指向该 beta）。
> 若要回退到 Babel 版编译器：`pnpm add -D @vitejs/plugin-vue-jsx`，
> 并把 `vite.config.ts` 的导入改回 `@vitejs/plugin-vue-jsx`。

## 关于 TSX 的几个约定

- **具名插槽**用对象字面量子节点书写：

  ```tsx
  <ElDropdown onCommand={handleCommand}>
    {{
      default: () => <span>触发器</span>,
      dropdown: () => <ElDropdownMenu>…</ElDropdownMenu>,
    }}
  </ElDropdown>
  ```

  作用域插槽同理，回调参数需要显式标注类型：

  ```tsx
  <ElTableColumn label="状态">
    {{ default: ({ row }: { row: Row }) => <ElTag>{row.status}</ElTag> }}
  </ElTableColumn>
  ```

- **双向绑定**用 `modelValue` + `onUpdate:modelValue`（等价于 `v-model`）：

  ```tsx
  <ElInput
    modelValue={form.name}
    onUpdate:modelValue={(value: string) => (form.name = value)}
  />
  ```

- ⚠️ **`ElPagination` 必须用 `onUpdate:current-page` / `onUpdate:page-size`**，
  不要写成 `onCurrent-change` / `onSize-change`。Element Plus 运行时只在 vnode props 里查找
  `onUpdate:currentPage` / `onUpdate:current-page`（或驼峰的 `onCurrentChange`）：
  写成连字符的 `onCurrent-change` 会让这些判断全部落空，`assertValidUsage` 返回 false，
  组件**直接渲染成 `<!---->`（整块分页消失）并抛出「已被废弃的用法」告警**。

  ```tsx
  <ElPagination
    currentPage={page.value}
    pageSize={pageSize.value}
    total={filtered.value.length}
    pageSizes={[10, 20, 50]}
    layout="total, sizes, prev, pager, next, jumper"
    onUpdate:current-page={(value: number) => (page.value = value)}
    onUpdate:page-size={(value: number) => { pageSize.value = value; page.value = 1 }}
  />
  ```

- Element Plus 的 `ElInput` 等组件没有透出全部原生事件（如 `keyup`），
  需要时用原生元素包一层再挂事件。
- 动态图标统一用 `h(icon)` 渲染，避免在 JSX 里直接写 `<Icon />` 的类型问题。

## 新增一个页面

1. 在 `src/views/` 下新建 `xxx/index.tsx`，默认导出一个 `defineComponent`。
2. 在 `src/router/index.tsx` 的 `children` 中加一条记录，写上 `meta.title`、`meta.icon`、`meta.order`。
3. 侧边菜单会自动出现——`src/layouts/menu.ts` 是按路由表推导的，无需手动维护。

**要建二级菜单组**，加一条**没有 `component`、但有 `children` 和 `meta.title`** 的路由即可
（`src/views/components/*` 就是这么挂上去的）：

```tsx
{
  path: 'components',
  redirect: '/components/basic',
  meta: { title: '组件示例', icon: Collection, order: 5 },
  children: [
    {
      path: 'basic',
      component: () => import('@/views/components/basic'),
      meta: { title: '基础组件', order: 1 },
    },
  ],
}
```

`menu.ts` 会把带 `children` 且有 `title` 的路由渲染成 `<ElSubMenu>`；
没有 `title` 的容器路由（如根路由 `/`）则把子项上浮，保持原本的扁平结构。
分组下的子路由因为没有中间层组件，会直接渲染进 `BasicLayout` 的 `<RouterView>`。

## TSX 调用 Element Plus 的易错点

这些是实现组件示例时真实踩到的，按「症状 → 原因 → 正确写法」整理：

| 症状 | 原因 | 正确写法 |
| --- | --- | --- |
| 组件整块不渲染，控制台报「已被废弃的用法」 | `ElPagination` 运行时只认 `onUpdate:currentPage` / `onUpdate:current-page` / `onCurrentChange`；写成 `onCurrent-change` 时三个判断全落空，`assertValidUsage` 为 false 直接 `return null` | `onUpdate:current-page` / `onUpdate:page-size` |
| `ref` 的值改不动 | 漏写 `.value`（`const x = ref('')` 后用 `x = v`） | `modelValue={x.value}`、`onUpdate:modelValue={(v) => (x.value = v)}` |
| 报「意外的标记」之类的语法错误 | `:value={x}` 是 Vue 模板语法，JSX 里无效 | 直接写 `value={x}` |
| 回调参数逆变检查报错 | EP 的 `modelValue` 往往是复杂联合类型 | 回调参数统一标 `(value?: unknown)`，赋值处再显式收敛 |
| `ElCheckTag` 不生效 | 它的 props 是 `checked`，不是 `modelValue` | `checked={v}` + `onUpdate:checked` |
| `ElAvatarGroup` 的折叠数量无效 | `max` 是旧 API | `collapseAvatars` + `maxCollapseAvatars` |
| `ElTreeSelect` 报 `onUpdate:modelValue does not exist` | 上游类型声明漏了这个事件（运行时确实 emit 了） | 展开语法绕过：`{...{ 'onUpdate:modelValue': fn }}` |
| `ElTree` 报 `modelValue does not exist` | Tree 的勾选值不走 v-model | `defaultCheckedKeys` + `onCheck` |
| `v-loading` 没反应 | `main.tsx` 未注册 ElementPlus 插件，指令不存在 | 用 `ElLoading.service()`；或自行 `app.use(ElLoading)` |
| `ElInputOtp` 的 `type` 填 `text` 报错 | 它的 `type` 是外观变体，不是输入类型 | `outlined` / `filled` / `underlined` |
| `ElCountdown` 传 `Date` 报错 | `value` 只接受 `number \| Dayjs` | 传时间戳 |
| **生产构建白屏**，控制台报 `__VUE_HMR_RUNTIME__ is not defined` | `vue-jsx@3.3.0-beta.1` 在 `hmr: true` 时产出**无守卫**的 `__hmrId = "...", __VUE_HMR_RUNTIME__.createRecord(...)`；dev 下有该全局，生产产物里没有 → 入口 chunk 抛 ReferenceError | `hmr: command === 'serve'`，只在 dev 打开（见 `vite.config.ts`） |
| 改 `tsconfig.json` 的 `jsxImportSource` 后类型报错一堆 | `vue-jsx` 生态要求 `jsxImportSource: "vue-jsx"`，此时插槽回调按组件签名做**逆变检查**、`KeyboardEvent` 换成它自己的泛型版 | 插槽回调参数标 `{ row: unknown }` 再收敛；原生事件回调不写显式注解，交给推导 |
| `defineVaporComponent` 没有效果 | `vite.config.ts` 里 `vapor: false` 会**完全关闭** Vapor 编译 | 需 `vapor: true`；且 Vapor 组件还要 Vapor 应用根（`createVaporApp` 不在 `vue` 主入口） |

## 已知约定

- **包管理器为 pnpm 11**。`package.json` 里的 `packageManager: "pnpm@11.24.0"` 供 corepack 识别版本；
  依赖从全局 store 硬链接而来（本机位于 `F:\.pnpm-store\v11`），因此删除 `node_modules` 后重装非常快。
- `.npmrc` 里关闭了 peer 依赖的严格校验并开启自动补装：
  ```ini
  strict-peer-dependencies=false
  auto-install-peers=true
  ```
  `vue@3.6.0-rc.7` 是预发布版本，semver 上无法满足 element-plus / pinia / vue-router 声明的 `^3.5.x` peer 范围。
  （注意：npm 的 `legacy-peer-deps` 在 pnpm 下**无效**，本项目已改为上面的 pnpm 写法。）
  待 Vue 3.6 正式版发布后，可以固定为正式版并去掉这两行。
- `pnpm-workspace.yaml` 由 pnpm 11 自动生成，内容是把 `vite@8.3.0` 加入 `minimumReleaseAgeExclude`。
  pnpm 11 默认拒装"刚发布不久"的版本（供应链攻击防护），此处为放行 Vite 8 而显式豁免。
  若后续升级依赖遇到同类拦截，pnpm 会自动往这个文件里追加，无需手写。
- 菜单支持**二级分组**：`menu.ts` 返回带 `children` 的树，`BasicLayout` 用 `<ElSubMenu>` 渲染分组。
  分组的 `title` 是具名插槽，在 TSX 里必须用对象字面量写法
  （`{{ title: () => ..., default: () => ... }}`），不能直接塞子节点。
