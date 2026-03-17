# Phase 1 Plan

基于 2026-03-17 当前仓库状态整理。

## 当前状态

- 已有 TanStack Start 应用骨架、Cloudflare Worker + D1 绑定、Drizzle schema 与首个 migration。
- 已有基础分类 seed、全局布局、顶部导航、底部导航，以及首页 / 上传 / 发票 / 分析 / 比价 / 供应商页面骨架。
- `pnpm build` 通过，`pnpm exec eslint .` 通过。
- `pnpm test` 当前无法启动，报错为 `ReferenceError: module is not defined`，说明测试基线还没有真正打通。

## 本阶段目标

把“基础搭建完成”推进到“基础可验证、可交接、可继续迭代”，避免 Phase 2 在不稳定地基上叠功能。

## 剩余任务

### 1. 修复测试运行基线

- 明确 Vitest 的运行环境，处理当前 CJS 依赖在 worker runner 下的兼容问题。
- 如有必要，补充独立的 Vitest 配置，避免默认环境误用 Cloudflare worker 执行链。
- 完成标准：`pnpm test` 可以稳定启动并执行测试。

### 2. 建立最小自动化测试

- 为基础工具函数补最小单元测试，例如金额和日期格式化。
- 为根布局或关键 route shell 补最小渲染测试，确保导航骨架不会在后续迭代中被破坏。
- 为数据库 seed 或 schema 相关逻辑补最小校验，保证分类初始化不回退。
- 完成标准：至少覆盖“工具函数 + 页面骨架 + 数据初始化”三类最小路径。

### 3. 校验本地数据库基础能力

- 执行本地 D1 migration，确认 `suppliers`、`categories`、`invoices`、`invoice_items` 四张表可正常建立。
- 验证默认 11 个分类可正确写入，避免 Phase 2 落库时才暴露基础数据问题。
- 整理本地初始化顺序：安装依赖、类型生成、migration、启动开发环境。
- 完成标准：新开发者按文档可在本地完成数据库初始化。

### 4. 收口 Phase 1 交付定义

- 统一 `README`、首页文案与实际完成度，避免“文档写已完成，但测试没打通”的状态继续存在。
- 固化进入 Phase 2 的前置条件：测试基线可用、数据库初始化可复现、基础导航与布局稳定。
- 完成标准：Phase 1 的完成判定有明确 checklist，而不是只靠页面视觉判断。

## 推荐执行顺序

1. 先修复测试运行基线，再补最小测试。
2. 然后验证本地数据库初始化与 seed。
3. 最后再更新交付定义和阶段状态，正式关闭 Phase 1。

## 完成标准

- `pnpm build`、`pnpm exec eslint .`、`pnpm test` 全部通过。
- 本地 D1 migration 与分类 seed 可复现。
- Phase 1 的完成条件被文档化，并作为进入 Phase 2 的准入门槛。
