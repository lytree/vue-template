// 改 updateRouter 插入逻辑：在匹配段前补换行
const fs = require('node:fs')
let s = fs.readFileSync('scripts/create-page.mjs', 'utf-8')

const old = "  const childrenMatch = src.match(/(\\\\n      \\\\{\\\\s*\\\\n\\\\s*path: 'settings')/)\n  if (childrenMatch) {\n    src = src.replace(childrenMatch[0], `${routeEntry}${childrenMatch[0]}`)\n  } else {"

const nw = "  const childrenMatch = src.match(/(\\\\n      \\\\{\\\\s*\\\\n\\\\s*path: 'settings')/)\n  if (childrenMatch) {\n    // 在 settings 路由前插入新路由（用换行隔开前一条 },）\n    src = src.replace(childrenMatch[0], `\\\\n${routeEntry}${childrenMatch[0]}`)\n  } else {"

if (!s.includes(old)) {
  console.error('OLD NOT FOUND')
  process.exit(1)
}
s = s.replace(old, nw)
fs.writeFileSync('scripts/create-page.mjs', s)
console.log('replaced')