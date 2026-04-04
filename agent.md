# Bescuit CostTracker — Agent 上下文

> 西班牙酒吧-餐馆进货成本追踪与供应商比价平台。  
> 通过粘贴 / OCR 导入发票 JSON，自动归一化商品名，跟踪价格趋势，辅助采购决策。

---

## 1. 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | **TanStack Start** + **TanStack Router** (React 19, file-based routing) |
| 样式 | **Tailwind CSS v4** + 自定义 CSS 设计系统 (`src/styles.css`)，字体: Manrope & Fraunces |
| 后端运行时 | **Cloudflare Workers** (通过 `@cloudflare/vite-plugin`) |
| 数据库 | **Cloudflare D1** (SQLite)，通过 `wrangler.jsonc` 绑定为 `DB` |
| ORM | **Drizzle ORM** (schema: `src/db/schema.ts`，migrations: `drizzle/migrations/`) |
| 校验 | **Zod v4** |
| 图标 | **lucide-react** |
| 构建 | **Vite 7** |
| 测试 | **Vitest** + **@testing-library/react** (jsdom) |
| 包管理器 | **pnpm** |
| 代码规范 | ESLint + Prettier |

---

## 2. 项目结构

```
├── src/
│   ├── components/        # 全局共享 UI 组件 (AppHeader, BottomNav, AppRuntime, AppStates)
│   ├── db/
│   │   ├── schema.ts      # Drizzle 数据库模型定义 (suppliers, categories, invoices, invoice_items)
│   │   ├── index.ts       # DB 工具导出
│   │   ├── seed.ts        # 初始化种子数据
│   │   └── seed.test.ts
│   ├── features/
│   │   ├── invoices/      # 发票上传、编辑、服务端逻辑、商品名归一化
│   │   │   ├── invoice.server.ts    # 服务端函数 (CRUD)
│   │   │   ├── invoice.functions.ts # TanStack 服务端函数入口
│   │   │   ├── InvoiceEditor.tsx    # 发票行项编辑器
│   │   │   ├── UploadWorkflow.tsx   # JSON 上传工作流
│   │   │   ├── normalize.ts        # 商品名归一化引擎
│   │   │   └── schema.ts           # Zod 输入验证
│   │   └── analytics/     # 趋势分析、供应商比价
│   │       ├── analytics.server.ts  # 聚合查询逻辑
│   │       ├── analytics.functions.ts
│   │       ├── AnalyticsViews.tsx   # 分析视图组件
│   │       └── schema.ts           # 分析相关 Zod schema
│   ├── lib/               # 工具函数 (observability, utils)
│   ├── routes/            # TanStack file-based 路由
│   │   ├── __root.tsx     # 根布局 (AppHeader + BottomNav)
│   │   ├── index.tsx      # / 仪表盘
│   │   ├── upload.tsx     # /upload 发票上传
│   │   ├── analytics.tsx  # /analytics 价格趋势
│   │   ├── compare.tsx    # /compare 供应商比价
│   │   ├── invoices/      # /invoices/ 列表 + /invoices/$invoiceId 详情
│   │   └── suppliers/     # /suppliers/ 供应商管理
│   ├── styles.css         # 全局设计系统 (CSS 变量 + 组件类)
│   ├── router.tsx         # Router 配置
│   └── routeTree.gen.ts   # 自动生成的路由树 (勿手动修改)
├── scripts/               # 运维脚本
│   ├── deploy-cloudflare.mjs  # 生产/暂存部署流程
│   ├── export-d1.mjs         # D1 备份导出
│   └── smoke-release.mjs     # 发布后冒烟测试
├── drizzle/
│   └── migrations/        # SQL 迁移文件
├── public/                # 静态资源 (PWA manifest, service worker, offline.html)
├── doc/                   # 项目文档 (Phase 1-4 计划 & 验收清单)
├── backups/               # D1 SQL 备份
├── wrangler.jsonc         # Cloudflare Worker + D1 配置
├── drizzle.config.ts      # Drizzle Kit 配置
├── vite.config.ts         # Vite + 插件配置
├── tsconfig.json          # TypeScript 配置 (strict, bundler mode)
└── package.json           # 脚本 & 依赖
```

---

## 3. 数据库模型

四张核心表，存储在 Cloudflare D1 (SQLite)：

- **suppliers** — 供应商 (id, name, contact, notes)
- **categories** — 商品分类 (id, name, icon, sortOrder)
- **invoices** — 发票头 (id, supplierId → suppliers, invoiceNumber, invoiceDate, totalAmount, status, rawJson)
- **invoice_items** — 发票行项 (id, invoiceId → invoices, supplierId → suppliers, categoryId → categories, productName, productNameNormalized, quantity, unit, unitPrice, taxRate, totalPrice, itemDate)

关键索引：按供应商、日期、商品名 (归一化)、分类建立组合索引，支撑趋势分析与比价查询。

---

## 4. 设计系统

### 色彩
- Primary: `#d67a3f` (暖橙)，Light: `#ebb58e`，Dark: `#b7612d`
- Secondary: `#6e8fb2` (蓝灰)，Soft: `#abc2d7`
- Success: `#739777`，Warning: `#c79a57`，Danger: `#c56b5f`
- 背景: `#f6f1e8` (暖白)，卡片: `rgba(255,249,241,0.86)`

### 排版
- 正文字体: Manrope (sans-serif)
- 标题字体: Fraunces (serif display)

### 圆角
- `--radius-lg: 28px` / `--radius-md: 20px` / `--radius-sm: 14px`

### 组件类
使用 **自定义 CSS 类** 而非 Tailwind 工具类作为主要样式方案。关键组件类：
`surface-panel`, `hero-panel`, `section-card`, `metric-card`, `button`, `button-secondary`, `badge-*`, `data-table`, `pill`, `nav-chip`, `loading-inline` 等。

> ⚠️ 新增组件时优先复用 `src/styles.css` 中已有的设计令牌和组件类，保持视觉一致性。

---

## 5. 开发规范

### 路径别名
- `#/*` 和 `@/*` → `./src/*`

### 常用命令

```bash
pnpm install             # 安装依赖
pnpm dev                 # 启动开发服务器 (port 3000)
pnpm build               # 生产构建
pnpm test                # 运行测试 (vitest)
pnpm lint                # ESLint 检查
pnpm check               # Prettier + ESLint 自动修复
pnpm cf:typegen           # 从 wrangler.jsonc 生成 Worker 类型
pnpm db:generate          # Drizzle 生成迁移
pnpm db:migrate:local     # 应用本地 D1 迁移
pnpm db:migrate:remote    # 应用远程 D1 迁移
pnpm deploy:production    # 生产部署 (备份 → 迁移 → 部署)
pnpm deploy:staging       # 暂存部署
pnpm smoke:release -- --base-url=<URL>  # 发布冒烟测试
```

### 服务端函数模式
- 服务端逻辑放在 `*.server.ts`，通过 `*.functions.ts` 用 `createServerFn()` 暴露给路由
- 数据库实例通过 `getWebRequest().cloudflare.env.DB` 获取

### 测试
- 测试文件与源码同目录，命名 `*.test.ts(x)`
- 使用 Vitest + @testing-library/react + jsdom

### 代码风格
- TypeScript strict 模式
- 无未使用的变量/参数
- ESModule (`"type": "module"`)

---

## 6. PWA 支持

- `public/manifest.json` — 可安装独立启动
- `public/sw.js` — 离线缓存 + `offline.html` 降级
- 运行时横幅提示安装、离线状态、缓存更新

---

## 7. 部署架构

```
本地开发 (Vite + Wrangler local D1)
    ↓ pnpm deploy:staging
暂存环境 (Cloudflare Worker + D1 staging)
    ↓ pnpm deploy:production
生产环境 (Cloudflare Worker + D1 production)
```

部署脚本 (`scripts/deploy-cloudflare.mjs`) 自动执行：
1. 验证 Wrangler 认证
2. 构建应用
3. 远程 D1 SQL 备份 → `backups/`
4. 应用远程迁移
5. 部署 Worker (`--keep-vars`)

---

## 8. Agent 指引

### 语言
- **始终使用中文**回复、注释和解释。

### 修改代码时
1. 修改 DB schema 后必须运行 `pnpm db:generate` 创建迁移
2. 新路由会被 TanStack Router 自动发现，`routeTree.gen.ts` 由框架生成，**不要手动修改**
3. 新组件优先使用 `src/styles.css` 已有的设计令牌和组件类
4. 服务端函数遵循 `*.server.ts` + `*.functions.ts` 分层模式
5. Zod schema 放在对应 feature 的 `schema.ts` 中
6. 修改 `wrangler.jsonc` 后运行 `pnpm cf:typegen` 刷新类型

### 验证变更
```bash
pnpm build && pnpm test && pnpm lint
```

### 文档参考
- 项目各阶段计划与验收: `doc/` 目录
- 数据库模型: `src/db/schema.ts`
- 设计系统: `src/styles.css`
