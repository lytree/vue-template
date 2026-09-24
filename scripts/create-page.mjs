#!/usr/bin/env node
/**
 * 交互式 CLI —— 创建新视图（含 .tsx + .module.scss + 路由注册）
 *
 * 用法：
 *   node scripts/create-page.mjs                       # 交互式
 *   node scripts/create-page.mjs --name orders         # 指定名称
 *   node scripts/create-page.mjs --name orders --title "订单列表"
 *   node scripts/create-page.mjs --name orders --no-route   # 只生成文件
 *
 * 生成的文件：
 *   src/views/<name>/index.tsx           # TSX 模板（含 PageContainer 包装）
 *   src/views/<name>/style.module.scss   # SCSS Modules 模板
 *   src/views/<name>/config.ts           # 路由元数据（title / icon / order）
 *
 * 同时自动修改 src/router/index.tsx 加入路由记录（除非 --no-route）。
 *
 * 风格策略：
 *   • 全局主题令牌：var(--ant-color-*)、var(--theme-*)
 *   • 组件级：scoped className（CSS Modules）
 *   • 不再使用 vanilla-extract
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')
const VIEWS_DIR = join(ROOT, 'src', 'views')
const ROUTER_FILE = join(ROOT, 'src', 'router', 'index.tsx')

/** 解析命令行参数 —— 兼容 sh / PowerShell 两种风格 */
function parseArgs(argv) {
  const args = {}
  // 兼容 sh 风格（--name orders）和 PowerShell 风格（--name=orders / --name orders 合并）
  // 也兼容 PowerShell 把 `--name orders` 合并成一个 arg 的情况
  const tokens = []
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i]
    if (t.startsWith('--') && t.includes('=')) {
      const [k, ...rest] = t.split('=')
      tokens.push(k, rest.join('='))
    } else if (t.startsWith('--') && t.length > 2) {
      // 可能是 PowerShell 把 `--name orders` 合并为 `--name orders`
      // 切成 [--name, orders]
      const m = t.match(/^(--[a-z-]+)\s+(.+)$/)
      if (m) {
        tokens.push(m[1], m[2])
      } else {
        tokens.push(t)
      }
    } else {
      tokens.push(t)
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i]
    if (cur === '--name') args.name = tokens[++i]
    else if (cur === '--title') args.title = tokens[++i]
    else if (cur === '--icon') args.icon = tokens[++i]
    else if (cur === '--order') args.order = parseInt(tokens[++i], 10)
    else if (cur === '--no-route') args.noRoute = true
    else if (cur === '--help' || cur === '-h') {
      console.log(
        [
          'Usage: pnpm create:page [options]',
          '',
          'Options:',
          '  --name <name>     视图目录名（e.g. orders）',
          '  --title <title>   路由 title',
          '  --icon  <name>    Element Plus Icons 名字（e.g. List）',
          '  --order <num>     菜单顺序（数字）',
          '  --no-route        只生成文件，不修改 router',
          '  -h, --help        显示帮助',
          '',
          '示例：',
          '  pnpm create:page --name orders --title Orders --icon List --order 7',
          '  pnpm create:page --name=orders --title=Orders',
        ].join('\n'),
      )
      process.exit(0)
    } else if (cur.startsWith('--')) {
      console.error(`Unknown flag: ${cur}`)
      process.exit(2)
    }
  }
  return args
}

/** 交互式读一个值（带默认值） */
function ask(rl, question, defaultValue) {
  return new Promise((resolve) => {
    const hint = defaultValue ? ` [${defaultValue}]` : ''
    rl.question(`${question}${hint}: `, (answer) => {
      resolve(answer.trim() || defaultValue || '')
    })
  })
}

async function interactiveFill(initial) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const name = initial.name || (await ask(rl, '视图名（kebab-case，如 orders）', 'orders'))
    const title = initial.title || (await ask(rl, '路由 title', toTitle(name)))
    const icon = initial.icon || (await ask(rl, 'Element Plus Icons 名（可空）', 'Box'))
    const orderStr = await ask(rl, '菜单顺序', '99')
    const noRoute = initial.noRoute ?? false
    return {
      name: toKebab(name),
      title,
      icon,
      order: parseInt(orderStr, 10) || 99,
      noRoute,
    }
  } finally {
    rl.close()
  }
}

/* ===== 字符串工具 ===== */
function toKebab(s) {
  return s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}
function toTitle(s) {
  return s
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

/* ===== 模板生成 ===== */
function tsxTemplate({ name, title }) {
  return `/**
 * ${title} —— 由 \`pnpm create:page\` 生成
 * 创建时间：${new Date().toISOString().slice(0, 10)}
 *
 * 风格策略：
 *   • 全局主题令牌：var(--ant-color-*) / var(--theme-*)
 *   • 组件级：scoped className（SCSS Modules）
 */
import { defineComponent } from 'vue'
import PageContainer from '@/components/PageContainer'
import s from './style.module.scss'

export default defineComponent({
  name: '${toPascalCase(toTitle(name))}',
  setup() {
    return () => (
      <PageContainer title="${title}" subtitle="由 create:page 自动生成的占位页">
        <section class={s.root}>
          <h1 class={s.title}>${title}</h1>
          <p class={s.desc}>编辑 src/views/${name}/index.tsx 开始定制此页面。</p>
        </section>
      </PageContainer>
    )
  },
})
`
}

function toPascalCase(s) {
  return s
    .split(/[\s_-]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join('')
}

function scssTemplate({ name }) {
  return `/* ${name} 样式 —— SCSS Modules */

/* 顶层容器：占满 PageContainer 内容区 */
.root {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-unit) * 4);
  padding: calc(var(--space-unit) * 5);
  background-color: var(--ant-color-bg-container);
  border-radius: var(--ant-border-radius-lg);
  min-height: 400px;
}

/* 标题：主色大字号 */
.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--ant-color-text);
  margin: 0;
}

/* 描述：次要文字 */
.desc {
  font-size: 14px;
  color: var(--ant-color-text-secondary);
  margin: 0;
  line-height: 1.6;
}
`
}

/** config.ts —— 路由元数据集中管理（方便 menu.ts 等复用） */
function configTemplate({ name, title, icon, order }) {
  return `/**
 * ${title} 路由元数据
 * 由 pnpm create:page 自动生成。
 */
import type { RouteMeta } from 'vue-router'

export const routeMeta: RouteMeta = {
  title: '${title}',
  ${icon ? `icon: '${icon}',` : '// icon: undefined  （请在 src/router/index.tsx 中填入 Element Plus Icons 名）'}
  order: ${order},
}

export const routePath = '${name}'
`
}

/* ===== 路由文件更新 ===== */
function updateRouter({ name, title, icon, order }) {
  if (!existsSync(ROUTER_FILE)) {
    console.warn(`  ⚠️  ${ROUTER_FILE} 不存在，跳过路由注册（请手动加）`)
    return
  }
  let src = readFileSync(ROUTER_FILE, 'utf-8')

  // 1. 找 import 表，追加 icon（如果新）
  const iconLine = icon ? `, ${icon}` : ''
  const iconImportRegex = /import \{([^}]+)\} from '@element-plus\/icons-vue'/
  if (icon) {
    if (iconImportRegex.test(src)) {
      src = src.replace(iconImportRegex, (m, list) => {
        const names = list.split(',').map((s) => s.trim())
        if (!names.includes(icon)) names.push(icon)
        return `import { ${names.join(', ')} } from '@element-plus/icons-vue'`
      })
    } else {
      // 没有 import 块 → 加一个
      src = src.replace(
        /import \{[^}]+\} from '@element-plus\/icons-vue'/,
        (m) => `${m}\nimport { ${icon} } from '@element-plus/icons-vue'`,
      )
      if (!src.includes(icon)) {
        // 没有匹配任何 icon import 行，追加在最前面
        src = src.replace(
          /(import .+ from 'vue-router')/,
          `$1\nimport { ${icon} } from '@element-plus/icons-vue'`,
        )
      }
    }
  }

  // 2. 在 children 数组中加路由记录
  const routeEntry = `      {
        path: '${name}',
        name: '${toPascalCase(toTitle(name))}',
        component: () => import('@/views/${name}/index'),
        meta: {
          title: '${title}'${icon ? `, icon: ${icon}` : ''},
          order: ${order},
        },
      },`

  // 找一个明显的位置：在最后一条 children 记录之前插入
  // 简化策略：在 `],\n    ],` 之前的最后一个 }, 后面追加
  const childrenMatch = src.match(/(\n      \{\s*\n\s*path: 'settings')/)
  if (childrenMatch) {
    src = src.replace(childrenMatch[0], `${routeEntry}${childrenMatch[0]}`)
  } else {
    console.warn(
      `  ⚠️  无法在 router/index.tsx 找到 children 插入位置，请手动添加 ${name} 路由`,
    )
    return
  }

  writeFileSync(ROUTER_FILE, src, 'utf-8')
  console.log(`  ✓ src/router/index.tsx 已新增路由 ${name}`)
}

/* ===== 主流程 ===== */
async function main() {
  const argv = process.argv.slice(2)
  const initial = parseArgs(argv)
  console.error('[debug] initial:', JSON.stringify(initial))

  let params
  if (initial.name) {
    // 非交互：直接用 CLI 参数
    params = {
      name: toKebab(initial.name),
      title: initial.title || toTitle(initial.name),
      icon: initial.icon || '',
      order: initial.order ?? 99,
      noRoute: initial.noRoute ?? false,
    }
  } else {
    // 交互式
    params = await interactiveFill(initial)
  }

  const dir = join(VIEWS_DIR, params.name)
  const tsxFile = join(dir, 'index.tsx')
  const scssFile = join(dir, 'style.module.scss')
  const configFile = join(dir, 'config.ts')

  if (existsSync(tsxFile)) {
    console.error(`✗ ${tsxFile} 已存在，未覆盖。请用 --name 指定其他名称或先删除旧文件。`)
    process.exit(3)
  }

  mkdirSync(dir, { recursive: true })
  writeFileSync(tsxFile, tsxTemplate(params), 'utf-8')
  console.log(`  ✓ ${tsxFile}`)
  writeFileSync(scssFile, scssTemplate(params), 'utf-8')
  console.log(`  ✓ ${scssFile}`)
  writeFileSync(configFile, configTemplate(params), 'utf-8')
  console.log(`  ✓ ${configFile}`)

  if (!params.noRoute) {
    updateRouter(params)
  }

  console.log('')
  console.log(`🎉 已创建视图：src/views/${params.name}/`)
  console.log(`   访问: http://localhost:5173/${params.name}`)
  console.log('')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})