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
