# Phase 1-4 Acceptance Checklist

用于汇总 `Phase 1` 到 `Phase 4` 的最终验收项，便于在本地验收、预发验收和正式发布前逐项打勾。

## Basic Info

- [x] 验收环境已确认：`local`
- [x] 当前验收提交已记录：`4300298`
- [x] 验收执行人已记录：`Codex`
- [x] 验收时间已记录：`2026-03-25 16:14:44 CET`

## Global Automated Checks

先执行以下命令，任何一项失败都不应进入后续人工验收。

```bash
pnpm test
pnpm build
pnpm exec eslint .
```

- [x] `pnpm test` 通过
- [x] `pnpm build` 通过
- [x] `pnpm exec eslint .` 通过

## Phase 1 Checklist

目标：基础测试链、数据库初始化和文档状态可复现、可交接。

### 1. Test Baseline

- [x] `pnpm test` 可在非 worker runner 环境稳定运行
- [x] 测试实际执行 `smoke`、工具函数、组件、seed 等基础用例
- [x] `src/test/setup.ts` 生效，组件测试具备稳定 DOM 环境

### 2. Minimal Regression Coverage

- [x] `src/lib/utils.test.ts` 通过
- [x] `src/components/AppHeader.test.tsx` 通过
- [x] `src/components/BottomNav.test.tsx` 通过
- [x] `src/db/seed.test.ts` 通过

### 3. Local D1 Reproducibility

执行：

```bash
pnpm cf:typegen
pnpm db:migrate:local
pnpm exec wrangler d1 execute costtracker-db --local --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('suppliers', 'categories', 'invoices', 'invoice_items') ORDER BY name"
pnpm exec wrangler d1 execute costtracker-db --local --command "SELECT name, sort_order FROM categories ORDER BY sort_order, name"
```

- [x] 本地 migration 可执行
- [x] `suppliers`、`categories`、`invoices`、`invoice_items` 四张表都存在
- [x] 默认分类共 11 条
- [x] 默认分类排序稳定，关键项包含 `Aceite`、`Carne`、`Otros`

### 4. Documentation Alignment

- [x] [README.md](/Users/zhuyuxia/Documents/GitHub/Bescuit-CostTracker/README.md) 的初始化步骤与真实流程一致
- [x] 首页、全局状态文案与实际完成度一致
- [x] `Phase 2` 文档已将 `Phase 1` checklist 作为准入条件

## Phase 2 Checklist

目标：发票导入、保存、列表、详情、供应商目录形成完整 CRUD 闭环。

### 1. Import Contract

- [x] 粘贴的发票 JSON 有明确 schema 校验
- [x] 标准化逻辑可统一处理字段名、金额、单位、税率
- [x] 分类匹配存在兜底策略，不会因名称偏差直接中断
- [x] 同一份标准化结果同时用于预览和落库

### 2. Upload Workflow

- [x] `/upload` 支持粘贴原始 JSON
- [x] 页面可展示字段级校验错误
- [x] 页面可展示结构化预览结果
- [x] 用户可在页面内完成修正，而不是只能回改原文
- [x] 用户可完成“粘贴 -> 校验 -> 修正 -> 准备保存”全链路

### 3. Invoice Persistence

- [x] 保存动作按事务写入 `supplier`、`invoice`、`invoice_items`
- [x] 供应商不存在时可自动创建，已存在时可复用
- [x] `invoices.rawJson` 保存原始输入，便于追溯
- [x] 保存成功后可返回新的发票 ID

### 4. Invoice List And Detail

- [x] `/invoices` 使用真实 D1 数据
- [x] 列表支持日期排序、状态过滤或关键字搜索
- [x] `/invoices/$invoiceId` 可展示真实发票头部和明细
- [x] 详情页可编辑
- [x] 详情页可删除
- [x] 删除后相关 `invoice_items` 已被清理

### 5. Supplier Directory

- [x] `/suppliers` 使用真实 D1 数据
- [x] 可查看供应商基础资料
- [x] 可维护联系人或备注字段
- [x] 能看到至少一类汇总信息，如发票数、最近采购日期、累计金额

### 6. Phase 2 Regression

- [x] 导入 schema 有自动化测试覆盖
- [x] 标准化逻辑有自动化测试覆盖
- [x] 保存事务有自动化测试覆盖
- [x] 上传主路径覆盖合法输入、缺字段、数值异常等场景
- [x] 发票删除与供应商自动创建具备回归保护

## Phase 3 Checklist

目标：分析与比价页基于真实采购数据提供可解释的决策支持。

### 1. Dashboard Metrics

- [x] 首页指标使用真实 D1 数据
- [x] 指标至少包含总采购额、活跃供应商数、最近导入发票数、最近周期采购品类数
- [x] 空库场景有明确回退文案

### 2. Product Search

- [x] 分析页支持按商品名称搜索
- [x] 搜索建议来自真实发票明细
- [x] 同名商品命名漂移有最小标准化处理
- [x] 搜索结果有数量限制，避免明显拖慢交互

### 3. Trend Analytics

- [x] `/analytics` 可展示月度趋势
- [x] 趋势结果包含 `AVG`、`MIN`、`MAX`、`SUM(quantity)`、`COUNT(*)`
- [x] 支持近 3 / 6 / 12 个月过滤
- [x] 多单位冲突场景要求先选单位，不直接混算
- [x] 趋势结果对用户可解释

### 4. Supplier Comparison

- [x] `/compare` 使用“同商品各供应商最新价格”逻辑
- [x] 查询能筛出每个供应商的最新样本
- [x] 结果可按价格排名
- [x] 页面支持过滤、分页或排序
- [x] 用户能看出当前最优供应商及价格差异

### 5. Query Reliability

- [x] 搜索、趋势、最新价格查询所需索引已补齐
- [x] 空商品名、异常单价、无效数量等脏数据不会污染结果
- [ ] 核心查询在目标数据量下可稳定响应

### 6. Phase 3 Regression

- [x] SQL 聚合与排名逻辑有查询级测试
- [x] 空状态场景有 UI 测试
- [x] 多单位冲突场景有 UI 测试
- [x] 趋势和比价关键数值有断言保护

## Phase 4 Checklist

目标：应用达到可部署、可安装、可观测、可回退的生产交付状态。

### 1. Cross-Page UX

- [x] `/`、`/upload`、`/invoices`、`/analytics`、`/compare`、`/suppliers` 都具备一致的 loading / empty / error 处理
- [x] 桌面端关键布局可用
- [x] 移动端关键布局可用
- [x] 导航、表格、长文本在小屏上不会明显失效

### 2. PWA And Offline

- [x] `manifest.json` 名称、图标、主题色、启动入口正确
- [x] 应用可从受支持浏览器安装
- [x] 独立窗口启动正常
- [x] `service worker` 正常注册
- [x] 断网时可看到缓存路由或 `offline.html`
- [ ] 恢复网络后可重新加载最新数据

### 3. Cloudflare Release Flow

执行：

```bash
node scripts/deploy-cloudflare.mjs production --dry-run
node scripts/export-d1.mjs production --dry-run
```

- [x] 发布脚本 dry-run 通过
- [x] 备份脚本 dry-run 通过
- [x] 团队已确认本地 / staging / production 的配置约定
- [x] 远端 migration 顺序清晰且可执行
- [x] 发布脚本包含构建、备份、迁移、部署

### 4. Observability And Rollback

- [x] 关键服务端请求具备日志
- [x] 全局错误有可见反馈
- [x] 生产变更前具备数据库备份手段
- [x] 团队已明确 worker rollback 方案
- [x] 团队已明确 D1 rollback 或 export restore 方案
- [x] 已定义首周重点观察指标

### 5. Manual Release Acceptance

按发布环境逐项验证：

- [x] 桌面宽度打开 `/`、`/upload`、`/invoices`、`/analytics`、`/compare`、`/suppliers`
- [x] 移动宽度打开 `/`、`/upload`、`/invoices`、`/analytics`、`/compare`、`/suppliers`
- [x] 导入一张发票，并确认列表可见
- [x] 打开发票详情页，确认数据正确
- [x] 编辑发票后保存成功
- [x] `/analytics` 已反映更新后的数据
- [x] `/compare` 已反映更新后的数据
- [x] 安装 PWA 后图标、启动页、导航正常
- [x] 断网时缓存页面或 `offline.html` 行为可预期
- [ ] 恢复联网后可重新获取数据

### 6. Production Smoke

执行：

```bash
pnpm smoke:release -- --base-url=https://<deployment-url>
pnpm smoke:release -- --base-url=https://<deployment-url> --invoice-id=<known-id>
```

- [x] 基础 smoke check 通过
- [ ] 带已知发票 ID 的 smoke check 通过

## Final Sign-off

- [x] Phase 1 验收完成
- [ ] Phase 2 验收完成
- [ ] Phase 3 验收完成
- [ ] Phase 4 验收完成
- [ ] 已记录遗留问题和 follow-up
- [ ] 允许进入下一阶段或正式发布

## Notes

- 已知问题：Wrangler 本地 D1 在并发执行多个 `wrangler d1 execute --local` 时偶发 `SQLITE_BUSY`；串行重跑后结果正常。
- 回归风险：`Phase 2` 保存链路当前依赖 Cloudflare D1 `batch()` 的事务语义；若后续改成分散写入语句，需要重新验证 all-or-nothing 保证是否仍然成立。
- 后续跟进：已在本地 `vite preview` 上执行 `pnpm smoke:release -- --base-url=http://127.0.0.1:4173` 并通过；生产 `workers.dev` URL 的 smoke、PWA 安装、service worker / cache storage、离线应用内降级页、桌面/移动端人工验收已完成。仍待最终确认的是“恢复联网后重新获取动态数据”和“带已知 invoice ID 的 smoke”。
