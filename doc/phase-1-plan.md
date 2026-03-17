# Phase 1 Plan

基于 2026-03-17 当前仓库状态整理。

## 当前状态

- 已有 TanStack Start 应用骨架、Cloudflare Worker + D1 绑定、Drizzle schema 与首个 migration。
- 已有基础分类 seed、全局布局、顶部导航、底部导航，以及首页 / 上传 / 发票 / 分析 / 比价 / 供应商页面骨架。
- 已新增独立 `vitest.config.ts`、`src/test/setup.ts` 与最小 smoke test，`pnpm test` 已稳定通过，不再落入 Cloudflare worker runner。
- 已新增最小自动化回归：`src/lib/utils.test.ts`、`src/components/AppHeader.test.tsx`、`src/components/BottomNav.test.tsx`、`src/db/seed.test.ts`。
- 已执行 `pnpm cf:typegen` 生成 `worker-configuration.d.ts`，并移除旧的 `@cloudflare/workers-types` 依赖，类型基线改为 Wrangler 运行时生成结果。
- 已修复首个 migration 在 D1 上的时间默认值语法问题，`pnpm db:migrate:local` 已通过。
- 已通过 SQL 校验确认 `suppliers`、`categories`、`invoices`、`invoice_items` 四张表存在，且默认分类为 11 条。
- `pnpm build`、`pnpm exec eslint .`、`pnpm test` 全部通过，`README.md`、首页、全局状态文案与 `doc/phase-2-plan.md` 已同步到当前真实状态。

## 本阶段目标

把“基础搭建完成”推进到“基础可验证、可交接、可继续迭代”，避免 Phase 2 在不稳定地基上叠功能。

## Phase 1 验收要求

- `R1` WHEN 执行 `pnpm test` THEN 测试链路 SHALL 在稳定的非 worker runner 环境中启动，并实际执行测试文件。
- `R2` WHEN 执行最小回归 THEN 系统 SHALL 覆盖工具函数、页面骨架、数据初始化三类基础路径。
- `R3` IF 新开发者按文档完成本地初始化 THEN 系统 SHALL 建立 `suppliers`、`categories`、`invoices`、`invoice_items` 四张表，并得到 11 个默认分类。
- `R4` WHEN 团队查看 README、首页或全局状态文案 THEN 文案 SHALL 反映真实阶段状态，而不是提前宣告完成。
- `R5` WHEN 团队准备进入 Phase 2 THEN 文档 SHALL 提供明确的退出 checklist 和准入条件。

## 已完成任务

### 1. 打通测试运行基线

- [x] 1.1 隔离 Vitest 与 Cloudflare worker runner
  - 排查 `vite.config.ts` 中 `@cloudflare/vite-plugin` 与默认测试执行链的耦合，确认 `pnpm test` 为什么落入 worker runner。
  - 视结果新增 `vitest.config.ts`，或在现有配置中显式声明测试环境，避免继续加载 worker-only 执行路径。
  - 至少要保证 `jsdom` 渲染测试和普通 TypeScript 单元测试都能稳定运行。
  - 涉及文件：`vite.config.ts`、`package.json`、`vitest.config.ts`（如新增）。
  - 验证：`pnpm test` 已可直接执行 5 个测试文件、9 个测试用例。
  - _需求: R1_

- [x] 1.2 补齐测试基础设施
  - 增加测试 setup 文件，统一挂载 `@testing-library/react` 所需的 DOM 环境和公共清理逻辑。
  - 明确别名解析、CSS / `?url` 资源、React 组件测试入口在测试环境中的处理方式。
  - 补一个最小 smoke test，证明测试 runner 已经能真正执行并产出结果。
  - 涉及文件：`src/test/setup.ts`（建议新增）、`vitest.config.ts`、首个 `.test.ts(x)` 文件。
  - 验证：`src/test/setup.ts` 与 `src/test/smoke.test.ts` 已落地并通过。
  - _需求: R1, R2_

### 2. 建立最小自动化回归

- [x] 2.1 为基础工具函数补单元测试
  - 覆盖 `src/lib/utils.ts` 中 `formatCurrency` 与 `formatShortDate` 的基础输出。
  - 至少包含一个边界样例，避免金额格式或日期格式在后续国际化调整时悄悄回退。
  - 建议产物：`src/lib/utils.test.ts`。
  - 验证：`src/lib/utils.test.ts` 4 个断言通过。
  - _需求: R2_

- [x] 2.2 为应用骨架补最小渲染测试
  - 对 `src/routes/__root.tsx`、`src/components/AppHeader.tsx`、`src/components/BottomNav.tsx` 做最小渲染断言。
  - 重点不是快照数量，而是验证导航主入口、页面 shell 和品牌文案能成功挂载。
  - 如果 TanStack Router 测试装配复杂，优先退一步测试 header / bottom nav 两个纯组件，先把骨架保护起来。
  - 建议产物：`src/components/AppHeader.test.tsx`、`src/components/BottomNav.test.tsx` 或等价测试文件。
  - 验证：`src/components/AppHeader.test.tsx` 与 `src/components/BottomNav.test.tsx` 已通过。
  - _需求: R2_

- [x] 2.3 为分类初始化补最小校验
  - 校验 `src/db/seed.ts` 暴露的 `defaultCategories` 数量、排序和关键名称，确保基础数据不被误改。
  - 优先测试“数据契约”本身，不要求在 Phase 1 就把完整 D1 集成测试做深。
  - 建议产物：`src/db/seed.test.ts`。
  - 验证：`src/db/seed.test.ts` 已断言默认分类数为 11，且 `sortOrder` 顺序稳定。
  - _需求: R2, R3_

### 3. 校验本地数据库可复现性

- [x] 3.1 固化本地初始化顺序
  - 在文档中写清从零开始的最短路径：`pnpm install`、`pnpm cf:typegen`、`pnpm db:migrate:local`、`pnpm dev`。
  - 说明本地 migration 依赖 `wrangler.jsonc` 中的 `migrations_dir`，以及 remote 部署前才需要关注 `database_id`。
  - 涉及文件：`README.md`、本计划文档。
  - 验证：`README.md` 已写入 `pnpm install`、`pnpm cf:typegen`、`pnpm db:migrate:local`、`pnpm dev` 顺序。
  - _需求: R3_

- [x] 3.2 验证四张核心表已建立
  - 执行本地 migration 后，查询 `sqlite_master`，确认 `suppliers`、`categories`、`invoices`、`invoice_items` 均存在。
  - 推荐把验证命令直接写进文档，例如使用 `pnpm exec wrangler d1 execute costtracker-db --local --command "<SQL>"`。
  - 完成后记录验证结果示例，避免后续“迁移跑了但表没起来”的模糊状态。
  - 验证：`SELECT name FROM sqlite_master ...` 已返回 `categories`、`invoice_items`、`invoices`、`suppliers`。
  - _需求: R3_

- [x] 3.3 验证默认分类 seed 结果
  - 查询 `categories` 表数量和排序，确认 migration 内置 seed 产出 11 条记录。
  - 明确以 migration seed 为准，还是在应用启动时调用 `seedDefaultCategories` 为准，避免 Phase 2 出现重复初始化。
  - 建议额外核对 `Aceite`、`Carne`、`Otros` 等关键记录，避免只看数量不看内容。
  - 验证：`SELECT COUNT(*) FROM categories` 已返回 `11`，排序结果为 `Aceite` 到 `Otros`。
  - _需求: R3_

### 4. 收口 Phase 1 交付定义

- [x] 4.1 修正文案与实际完成度不一致的问题
  - 更新 `README.md` 中 “Phase 1 is implemented” 的表述，改成基于验收结果的真实状态描述。
  - 更新 `src/components/AppHeader.tsx` 中 `Phase 1 ready` 状态文案，以及 `src/routes/index.tsx` 中 “Foundation complete” 之类的描述。
  - 目标不是降级体验，而是避免团队误以为可以直接开始业务功能开发。
  - 验证：`README.md`、`src/components/AppHeader.tsx`、`src/routes/index.tsx` 已改为基于验收结果的描述。
  - _需求: R4_

- [x] 4.2 固化 Phase 1 退出 checklist
  - 在本文件末尾保留一份可勾选 checklist，作为进入 Phase 2 的唯一判定入口。
  - checklist 必须覆盖：构建、lint、测试、数据库 migration、seed 验证、文案同步。
  - 若某项未完成，Phase 1 不应标记为 closed。
  - 验证：本文件的退出 checklist 已全部具备对应交付物与验证结果。
  - _需求: R5_

- [x] 4.3 明确 Phase 2 准入条件
  - 在 `doc/phase-2-plan.md` 的上下文里补一句前置条件引用，明确导入闭环开发依赖 Phase 1 检查全部通过。
  - 避免 Phase 2 在“测试链未通、数据库初始化未验证”的情况下开始叠加功能和数据流。
  - 验证：`doc/phase-2-plan.md` 已显式引用 Phase 1 退出 checklist。
  - _需求: R5_

## 推荐执行顺序

1. 先完成 `1.1` 和 `1.2`，确保测试链真正可运行。
2. 然后完成 `2.1`、`2.2`、`2.3`，让最小回归开始提供保护。
3. 接着完成 `3.1`、`3.2`、`3.3`，把数据库初始化从“理论可用”变成“文档可复现”。
4. 最后完成 `4.1`、`4.2`、`4.3`，统一对外状态并正式关闭 Phase 1。

## Phase 1 退出 Checklist

- [x] `pnpm build` 通过。
- [x] `pnpm exec eslint .` 通过。
- [x] `pnpm test` 可稳定运行并至少覆盖工具函数、页面骨架、分类初始化三类基础路径。
- [x] 本地 D1 migration 已验证创建四张核心表。
- [x] 默认分类 seed 已验证写入 11 条记录。
- [x] `README.md`、首页、全局状态文案与真实完成度一致。
- [x] Phase 2 计划明确引用本 checklist 作为准入门槛。

## 完成标准

- 所有 `R1` 到 `R5` 均有对应交付物与验证结果。
- `pnpm build`、`pnpm exec eslint .`、`pnpm test` 全部通过。
- 本地 D1 migration 与分类 seed 可复现，并有文档化验证步骤。
- Phase 1 退出 checklist 被落实，且作为进入 Phase 2 的硬性准入门槛。
