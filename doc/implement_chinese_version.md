# 全站中文汉化 + UI 清理实施计划

> 目标：将 Bescuit CostTracker 所有面向用户的英文界面文案翻译为中文，同时移除 "Phase 4 ready" 状态标识和右下角 TanStack DevTools 图标。

---

## 1. 变更范围总览

| 类别 | 涉及文件数 | 说明 |
|------|-----------|------|
| 全局组件 | 4 | AppHeader、BottomNav、AppRuntime、AppStates |
| 路由页面 | 6 | 首页、上传、发票列表、发票详情、分析、比价 |
| 功能组件 | 3 | InvoiceEditor、UploadWorkflow、AnalyticsViews |
| 业务逻辑 | 1 | normalize.ts（用户可见的错误/警告消息） |
| 根布局 | 1 | `__root.tsx`（meta 信息、lang 属性、TanStack DevTools） |
| 静态资源 | 2 | manifest.json、offline.html |
| **合计** | **~17 个文件** | |

---

## 2. UI 清理任务

### 2.1 移除 "Phase 4 ready" 标识

**文件**: `src/components/AppHeader.tsx` (L49-52)

```diff
       </nav>
-
-        <div className="status-pill">
-          <span className="status-dot" />
-          Phase 4 ready
-        </div>
       </div>
```

### 2.2 移除右下角 TanStack DevTools

**文件**: `src/routes/__root.tsx` (L3-4, L73-83)

```diff
- import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
- import { TanStackDevtools } from '@tanstack/react-devtools'
```

```diff
         <BottomNav />
-        <TanStackDevtools
-          config={{
-            position: 'bottom-right',
-          }}
-          plugins={[
-            {
-              name: 'Tanstack Router',
-              render: <TanStackRouterDevtoolsPanel />,
-            },
-          ]}
-        />
         <Scripts />
```

---

## 3. 汉化清单（逐文件）

### 3.1 `src/routes/__root.tsx` — 根布局

| 行号 | 原文 | 中文 |
|------|------|------|
| 26 | `title: 'Bescuit CostTracker'` | `title: 'Bescuit 成本追踪'` |
| 30-31 | `content: 'Cloudflare-native purchasing tracker...'` | `content: '基于 Cloudflare 的酒吧餐厅采购成本追踪、趋势分析与供应商比价平台'` |
| 64 | `<html lang="es">` | `<html lang="zh-CN">` |

---

### 3.2 `src/components/AppHeader.tsx` — 顶部导航

| 原文 | 中文 |
|------|------|
| `'Dashboard'` | `'仪表盘'` |
| `'Upload'` | `'上传'` |
| `'Invoices'` | `'发票'` |
| `'Analytics'` | `'分析'` |
| `'Compare'` | `'比价'` |
| `'Suppliers'` | `'供应商'` |
| `'Bescuit CostTracker'` (eyebrow) | `'Bescuit 成本追踪'` |
| `'Bar purchasing control from invoice to insight'` | `'从发票到洞察的酒吧采购成本管控'` |

---

### 3.3 `src/components/BottomNav.tsx` — 底部导航

| 原文 | 中文 |
|------|------|
| `'Home'` | `'首页'` |
| `'Upload'` | `'上传'` |
| `'Invoices'` | `'发票'` |
| `'Analytics'` | `'分析'` |
| `'Compare'` | `'比价'` |
| `'Suppliers'` | `'供应商'` |
| `aria-label="Bottom navigation"` | `aria-label="底部导航"` |

---

### 3.4 `src/components/AppRuntime.tsx` — 运行时状态横幅

| 原文 | 中文 |
|------|------|
| `'Offline mode is active.'` | `'当前处于离线模式'` |
| `'Cached pages remain available...'` | `'已缓存的页面仍可访问。恢复网络连接后将自动同步新数据。'` |
| `'Install Bescuit CostTracker.'` | `'安装 Bescuit 成本追踪'` |
| `'Add the app to the home screen...'` | `'将应用添加到主屏幕，加快启动速度并支持离线使用。'` |
| `'Install app'` | `'安装应用'` |
| `'An updated release is ready.'` | `'新版本已就绪'` |
| `'Refresh to activate the latest...'` | `'刷新以启用最新的缓存资源和运行时修复。'` |
| `'Refresh now'` | `'立即刷新'` |

---

### 3.5 `src/components/AppStates.tsx` — 状态提示组件

| 原文 | 中文 |
|------|------|
| `'The last request did not complete...'` | `'上次请求未完成。请重试操作或查看发布日志。'` |
| `'Loading workspace'` | `'正在加载'` |
| `'Syncing the latest invoice data.'` | `'正在同步最新的发票数据'` |
| `'Bescuit CostTracker is fetching D1-backed data...'` | `'Bescuit 成本追踪正在从 D1 获取本路由所需的数据，加载完成后即显示当前视图。'` |
| `'Refreshing page state…'` | `'正在刷新页面状态…'` |
| `'Request failed'` | `'请求失败'` |
| `'This screen could not be loaded.'` | `'无法加载此页面'` |
| `'Retry request'` | `'重试请求'` |
| `'Open dashboard'` | `'打开仪表盘'` |
| `'Open invoices'` | `'打开发票列表'` |
| `'Not found'` | `'未找到'` |
| `'The requested page does not exist.'` | `'请求的页面不存在'` |
| `'The link may be stale...'` | `'链接可能已过期，或该路由已不在当前发布版本中。'` |
| `'Review invoices'` | `'查看发票'` |

---

### 3.6 `src/routes/index.tsx` — 仪表盘首页

| 原文 | 中文 |
|------|------|
| `'Mediterranean cost control'` | `'地中海成本管控'` |
| `'Live purchasing metrics for a bar-restaurante cost tracker.'` | `'酒吧餐厅成本追踪实时采购指标'` |
| `'The dashboard now reads...'` (page-copy) | `'仪表盘现在读取 D1 中发票、行项、供应商、分析和比价流程的真实状态，展示当前支出、供应商覆盖、最近导入活动和商品分类变动，而非固定的占位指标。'` |
| `'Immediate actions'` | `'快捷操作'` |
| `'Open upload flow'` | `'打开上传流程'` |
| `'Review invoice shell'` | `'查看发票列表'` |
| `'Phase 3 analytics'` (pill) | `'趋势分析'` |

---

### 3.7 `src/routes/upload.tsx` — 上传页

| 原文 | 中文 |
|------|------|
| `'Upload blocked'` | `'上传受阻'` |
| `'No category catalog is available.'` | `'分类目录不可用'` |
| `'Run the seeded migrations first...'` | `'请先运行种子数据迁移，以便导入的发票行项能映射到稳定的分类列表。'` |

---

### 3.8 `src/routes/invoices/index.tsx` — 发票列表

| 原文 | 中文 |
|------|------|
| `'Invoice registry'` | `'发票登记簿'` |
| `'List, filter, and inspect every saved invoice.'` | `'列出、筛选和检查每一张已保存的发票'` |
| `'The registry now reads directly from D1...'` | `'登记簿现在直接从 D1 读取数据，支持按供应商、编号和商品关键词搜索，并保持草稿发票可见直到审核通过。'` |
| `'Search invoice'` | `'搜索发票'` |
| `'Status'` | `'状态'` |
| `'All'` / `'Verified'` / `'Draft'` | `'全部'` / `'已审核'` / `'草稿'` |
| `'Invoice'` / `'Supplier'` / `'Date'` / `'Items'` / `'Total'` / `'Status'` (表头) | `'发票'` / `'供应商'` / `'日期'` / `'行项'` / `'金额'` / `'状态'` |
| `'Sin numero'` | `'无编号'` |
| `'No invoices match the current filter'` | `'没有发票匹配当前筛选条件'` |
| `'Adjust the search...'` | `'请调整搜索关键词、清除状态筛选，或导入新发票以填充登记簿。'` |
| `'Import invoice'` | `'导入发票'` |
| `'Live summary'` | `'实时汇总'` |
| `'Current registry window'` | `'当前登记窗口'` |
| `'Visible invoices'` | `'可见发票数'` |
| `'Draft count'` | `'草稿数'` |
| `'Window total'` | `'窗口总额'` |

---

### 3.9 `src/routes/invoices/$invoiceId.tsx` — 发票详情

| 原文 | 中文 |
|------|------|
| `'Invoice detail'` | `'发票详情'` |
| `'Invoice not found.'` | `'发票未找到'` |
| `'The record may have been deleted...'` | `'该记录可能已被删除，或链接已失效。'` |
| `'Back to invoices'` | `'返回发票列表'` |
| `'Update the invoice header...'` (page-copy) | `'更新发票表头、供应商信息或行项。删除操作会级联清除 invoice_items，保持登记簿和供应商汇总数据整洁。'` |
| `'Working…'` / `'Save changes'` | `'处理中…'` / `'保存更改'` |
| `'Delete invoice'` | `'删除发票'` |
| `'Delete this invoice? Invoice items will be removed as well.'` | `'确定删除此发票？发票行项也将一并删除。'` |
| `'Invoice update failed.'` | `'发票更新失败'` |
| `'Invoice deletion failed.'` | `'发票删除失败'` |
| `'Validation errors'` | `'验证错误'` |
| `'Draft warnings'` | `'草稿警告'` |
| `'Audit trail'` | `'审计追踪'` |
| `'Stored source payload'` | `'存储的原始数据'` |
| `'The original JSON is preserved...'` | `'原始 JSON 保存在发票记录中，用于溯源追踪。'` |
| `'Created at'` / `'Updated at'` | `'创建时间'` / `'更新时间'` |
| `'No raw JSON stored for this invoice.'` | `'本发票无原始 JSON 存储。'` |

---

### 3.10 `src/routes/suppliers/index.tsx` — 供应商管理

| 原文 | 中文 |
|------|------|
| `'Supplier directory'` | `'供应商目录'` |
| `'Maintain live supplier records and spend context.'` | `'维护实时供应商记录与支出情况'` |
| `'Imported invoices now bootstrap...'` | `'导入的发票现在自动建立供应商档案。联系方式、运营备注、发票计数和总支出均由 D1 驱动。'` |
| `'Create supplier'` | `'创建供应商'` |
| `'Add a manual supplier record'` | `'手动添加供应商记录'` |
| `'Supplier name'` | `'供应商名称'` |
| `'Contact'` | `'联系方式'` |
| `'Notes'` | `'备注'` |
| `'Saving…'` / `'Add supplier'` | `'保存中…'` / `'添加供应商'` |
| `'Supplier name is required.'` | `'供应商名称不能为空。'` |
| `'Supplier save failed.'` / `'Supplier creation failed.'` | `'供应商保存失败。'` / `'供应商创建失败。'` |
| `'Registry totals'` | `'登记汇总'` |
| `'Current supplier coverage'` | `'当前供应商覆盖'` |
| `'Suppliers'` | `'供应商数'` |
| `'Total spend'` | `'总支出'` |
| `'Suppliers with invoices'` | `'有发票的供应商'` |
| `'Supplier'` (卡片 label) | `'供应商'` |
| `'Invoices'` | `'发票数'` |
| `'Last purchase'` | `'最近采购'` |
| `'Saving…'` / `'Save supplier'` | `'保存中…'` / `'保存供应商'` |
| `'No suppliers are stored yet'` | `'暂无供应商数据'` |
| `'Create a supplier manually...'` | `'手动创建供应商或导入第一张发票，以自动建立供应商目录及支出汇总。'` |
| `'Review invoices'` | `'查看发票'` |

---

### 3.11 `src/features/invoices/UploadWorkflow.tsx` — 上传工作流

| 原文 | 中文 |
|------|------|
| `'Phase 2 importer'` | `'发票导入器'` |
| `'Paste, validate, correct, and save invoices.'` | `'粘贴、验证、修正并保存发票'` |
| `'The preview uses the same normalized...'` | `'预览使用与保存流程相同的归一化发票格式写入 D1。分类不匹配时自动回退，提交前警告保持可见。'` |
| `'Invoice JSON'` | `'发票 JSON'` |
| `'Load sample'` | `'加载示例'` |
| `'Parse preview'` | `'解析预览'` |
| `'Validation errors'` | `'验证错误'` |
| `'Parse and review the invoice before saving.'` | `'请先解析并检查发票后再保存。'` |
| `'Invoice could not be saved.'` | `'发票保存失败。'` |
| `'Preview status'` | `'预览状态'` |
| `'Review the normalized payload...'` | `'检查归一化后的数据，逐字段修正，然后保存为草稿发票。'` |
| `'Waiting for a valid parse'` | `'等待有效的解析结果'` |
| `'Paste the Gemini JSON and run the preview...'` | `'粘贴 Gemini JSON 并运行预览，以解锁逐行修正功能。'` |
| `'Normalization warnings'` | `'归一化警告'` |
| `'X categories ready'` | `'X 个分类就绪'` |
| `'Auto-create supplier'` | `'自动创建供应商'` |
| `'Saves as draft'` | `'保存为草稿'` |
| `'Editable preview'` | `'可编辑预览'` |
| `'Finalize invoice fields'` | `'完善发票字段'` |
| `'Saving…'` / `'Save invoice'` | `'保存中…'` / `'保存发票'` |
| `'Open registry'` | `'打开登记簿'` |
| `'Invoice preview will appear here'` | `'发票预览将在此处显示'` |
| `'Load the sample payload or paste...'` | `'加载示例数据或粘贴供应商 JSON 文档，然后点击"解析预览"查看归一化后的草稿。'` |

---

### 3.12 `src/features/invoices/InvoiceEditor.tsx` — 发票编辑器

| 原文 | 中文 |
|------|------|
| `'Supplier'` (label) | `'供应商'` |
| `'Invoice date'` | `'发票日期'` |
| `'Invoice number'` | `'发票编号'` |
| `'Optional'` (placeholder) | `'选填'` |
| `'Status'` | `'状态'` |
| `'draft'` / `'verified'` (option) | `'草稿'` / `'已审核'` |
| `'Supplier contact'` | `'供应商联系方式'` |
| `'Declared total'` | `'申报总额'` |
| `'Sync lines'` | `'同步行总计'` |
| `'Supplier notes'` | `'供应商备注'` |
| `'Negotiation notes, delivery caveats...'` (placeholder) | `'谈判备注、配送注意事项、付款表现…'` |
| `'Invoice notes'` | `'发票备注'` |
| `'Internal notes for this invoice'` (placeholder) | `'本发票内部备注'` |
| `'Lines'` | `'行数'` |
| `'Computed lines'` | `'行项合计'` |
| `'Declared total'` (metric) | `'申报总额'` |
| `'Remove'` | `'移除'` |
| `'Add line'` | `'添加行'` |

> 注意：表头 Producto / Categoria / Cantidad 等已是西班牙语，但为求统一可改为中文：产品 / 分类 / 数量 / 单位 / 单价 / 增值税 / 合计 / 日期

---

### 3.13 `src/features/analytics/AnalyticsViews.tsx` — 分析与比价视图

#### DashboardOverview 部分

| 原文 | 中文 |
|------|------|
| `'Total spend'` | `'总支出'` |
| `'X invoices stored in D1.'` | `'D1 中已存储 X 张发票。'` |
| `'No invoices imported yet.'` | `'尚未导入发票。'` |
| `'Active suppliers'` | `'活跃供应商'` |
| `'Suppliers with at least one imported invoice.'` | `'至少导入过一张发票的供应商。'` |
| `'Supplier count will appear...'` | `'第一次导入后将显示供应商数量。'` |
| `'Invoices in X days'` | `'近 X 天发票'` |
| `'Latest import dated X.'` | `'最近导入时间为 X。'` |
| `'No recent activity yet.'` | `'尚无最近活动。'` |
| `'Categories in X days'` | `'近 X 天分类'` |
| `'Distinct purchased categories...'` | `'当前运营窗口已购买的不同分类数。'` |
| `'Categories will populate...'` | `'导入发票行项后将显示分类数据。'` |
| `'Live operating view'` | `'实时运营视图'` |
| `'What the dashboard now tracks'` | `'仪表盘当前追踪内容'` |
| `'Imported invoices'` | `'已导入发票'` |
| `'Suppliers with activity'` | `'有活动的供应商'` |
| `'Recent category coverage'` | `'近期分类覆盖'` |
| `'Phase 3'` | `'分析层'` |
| `'Analysis layer is live'` | `'分析功能已上线'` |
| `'Dashboard, product trends...'` | `'仪表盘、商品趋势和供应商比价现在读取相同的 D1 发票行数据。空数据库将显示中性文案而非占位指标。'` |

#### AnalyticsPageContent 部分

| 原文 | 中文 |
|------|------|
| `'Price intelligence'` | `'价格情报'` |
| `'Search a product and read its monthly...'` | `'搜索商品并从 D1 读取其月度采购趋势'` |
| `'Product search uses normalized...'` | `'商品搜索使用归一化的发票行项名，月度聚合计算平均、最低、最高价、采购量和样本数，混合单位时需用户明确选择一个单位。'` |
| `'Product search'` | `'商品搜索'` |
| `'Window'` | `'时间窗口'` |
| `'Last 3 months'` / `'Last 6 months'` / `'Last 12 months'` | `'近 3 个月'` / `'近 6 个月'` / `'近 12 个月'` |
| `'X samples'` | `'X 个样本'` |
| `'X name variants'` | `'X 个名称变体'` |
| `'No date'` | `'无日期'` |
| `'Selected product'` | `'已选商品'` |
| `'X samples · last purchased X'` | `'X 个样本 · 最近采购于 X'` |
| `'without a dated sample'` | `'无日期样本'` |
| `'Unit: X'` | `'单位：X'` |
| `'Pick a unit'` | `'选择单位'` |
| `'No samples in the selected window'` | `'所选窗口无样本'` |
| `'Keep the product selected and widen...'` | `'保持选中商品并扩大窗口范围，或导入更多该商品的发票。'` |
| `'Choose a product to start'` | `'选择一个商品开始'` |
| `'Type at least two characters...'` | `'输入至少两个字符以获取已索引的商品建议。'` |
| `'Trend outputs'` | `'趋势输出'` |
| `'Monthly aggregates'` | `'月度汇总'` |
| `'Average, minimum, maximum...'` | `'选择商品和兼容单位后，将显示平均、最低、最高价、总采购量和观测次数。'` |
| `'Tracked unit'` | `'追踪单位'` |
| `'Total samples'` | `'总样本数'` |
| `'Total quantity'` | `'总采购量'` |

#### ComparePageContent 部分

| 原文 | 中文 |
|------|------|
| `'Supplier benchmark'` | `'供应商基准比较'` |
| `'Rank each supplier by its latest...'` | `'按各供应商对同一商品的最新报价进行排名'` |
| `'The comparison matrix keeps only...'` | `'比价矩阵仅保留各供应商每个商品/单位的最新样本，然后按报价从低到高排列。'` |
| `'Search product'` | `'搜索商品'` |
| `'Sort rows'` | `'排序方式'` |
| `'Best price'` / `'Supplier count'` / `'Most recent'` | `'最优价格'` / `'供应商数'` / `'最近更新'` |
| `'Latest known prices in X'` | `'X 单位的最新已知价格'` |
| `'last sample X'` | `'最新样本 X'` |
| `'Best X'` | `'最优 X'` |
| `'X suppliers'` | `'X 家供应商'` |
| `'Latest sample X'` | `'最近样本 X'` |
| `'No comparison rows match the filter'` | `'没有比价行匹配当前筛选'` |
| `'Search for a product with at least...'` | `'搜索至少有两家供应商样本的商品，或导入更多发票以建立基准。'` |
| `'Current window'` | `'当前窗口'` |
| `'Comparison summary'` | `'比价汇总'` |
| `'Visible products'` | `'可见商品数'` |
| `'Total ranked rows'` | `'总排名行数'` |
| `'Page'` | `'页'` |
| `'Previous'` / `'Next'` | `'上一页'` / `'下一页'` |

---

### 3.14 `src/features/invoices/normalize.ts` — 用户可见消息

| 行号 | 原文 | 中文 |
|------|------|------|
| 143 | `'Use YYYY-MM-DD format'` | `'请使用 YYYY-MM-DD 格式'` |
| 181 | `'Invoice must include at least one line'` | `'发票至少须包含一行'` |
| 261 | `'Paste the Gemini JSON first.'` | `'请先粘贴 Gemini JSON。'` |
| 275 | `'JSON is invalid. Fix the syntax and parse again.'` | `'JSON 格式无效，请修正语法后重新解析。'` |
| 364 | `'Declared total (X) does not match line total (Y).'` | `'申报总额 (X) 与行项合计 (Y) 不一致。'` |
| 397 | `` `Line ${Number(index) + 1} · ${field}` `` | `` `第 ${Number(index) + 1} 行 · ${field}` `` |
| 420 | `'Line "X" total was normalized from Y to Z.'` | `'行 "X" 的合计已从 Y 归一化为 Z。'` |
| 426 | `'Line "X" was mapped to "Y" automatically.'` | `'行 "X" 已自动映射到 "Y" 分类。'` |
| 451 | `'Invoice total was normalized from X to Y.'` | `'发票总额已从 X 归一化为 Y。'` |

---

### 3.15 `public/manifest.json` — PWA 清单

| 原文 | 中文 |
|------|------|
| `"lang": "es"` | `"lang": "zh-CN"` |
| `"description": "Cloudflare-native purchasing tracker..."` | `"description": "基于 Cloudflare 的酒吧餐厅采购成本追踪、趋势分析与供应商比价平台"` |

---

### 3.16 `public/offline.html` — 离线降级页面

| 原文 | 中文 |
|------|------|
| `<html lang="es">` | `<html lang="zh-CN">` |
| `<title>Bescuit CostTracker offline</title>` | `<title>Bescuit 成本追踪 - 离线</title>` |
| `'Offline fallback'` | `'离线降级'` |
| `'Bescuit CostTracker is temporarily offline.'` | `'Bescuit 成本追踪暂时处于离线状态'` |
| `'Cached pages can still open...'` | `'已缓存的页面仍可打开。发票同步、分析刷新和 Cloudflare 写入等依赖网络的操作将在恢复连接后继续。'` |
| `'Try dashboard again'` | `'重新打开仪表盘'` |

---

## 4. 不汉化的内容

以下内容**保持原样**，不做翻译：

- 品牌名 **Bescuit**、**BC**（品牌标识）
- 技术术语：D1、Cloudflare Workers、Drizzle、JSON、Zod 等
- 西班牙语商品分类名（Aceite、Carne、Pescado 等）——这些是业务数据，非 UI 文案
- 数据库字段名和 CSS 类名
- 服务端日志中的英文消息（`console.error` 等）
- 测试文件中的英文描述

---

## 5. 实施顺序

建议按照以下顺序执行，最大限度减少合并冲突风险：

1. **根布局 `__root.tsx`** — 移除 TanStack DevTools + 更新 meta + lang
2. **全局组件**（AppHeader → BottomNav → AppRuntime → AppStates）— 移除 "Phase 4 ready" + 汉化
3. **路由页面**（index → upload → invoices/index → invoices/$invoiceId → analytics → compare）
4. **功能组件**（UploadWorkflow → InvoiceEditor → AnalyticsViews）
5. **业务逻辑** `normalize.ts`（用户可见消息）
6. **静态资源**（manifest.json → offline.html）
7. **验证**：`pnpm build && pnpm test && pnpm lint`

---

## 6. 验证方案

### 自动化检查
```bash
pnpm build && pnpm test && pnpm lint
```

### 手动验证
- 浏览器打开各路由页面，确认所有可见文案均为中文
- 确认 "Phase 4 ready" 状态标识已移除
- 确认右下角 TanStack DevTools 图标已移除
- 检查 PWA 安装提示是否显示中文
- 触发离线模式，检查离线页面是否显示中文
- 检查发票上传、解析、编辑流程中的错误/警告消息是否显示中文

### 回归确认
- 发票上传 → 解析 → 编辑 → 保存完整流程
- 分析页面搜索商品 → 查看趋势
- 比价页面搜索 → 翻页
- 供应商创建 → 编辑 → 保存
