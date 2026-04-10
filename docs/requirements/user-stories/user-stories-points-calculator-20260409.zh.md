# 用户故事

**项目名称**: 点数换算小工具
**Epic**: 核心计费功能
**创建日期**: 2026-04-09

> **NOTE**: 验收标准以 EARS 格式编写。

---

## US-01: 快速选择并获取模型单价

**As a** 内部运营人员或外部客户
**I want** 从下拉列表中快速选择一个 LLM 模型，或者输入关键字模糊搜索
**So that** 系统能自动为我填入该模型的输入和输出单价，节省我手动查找和输入的时间。

### 验收标准（EARS 格式）

#### AC-1: 下拉列表与模糊搜索
**Pattern**: Event-Driven (WHEN)
```text
WHEN I type in the model selection box, the System SHALL filter the available models and display only those matching my input.
```
**Given-When-Then** (for BDD testing):
- **Given**: 系统已加载包含多个模型的列表（如 Model A, Model B, Model C）。
- **When**: 我在输入框中输入 "Model A"。
- **Then**: 下拉列表中只显示 "Model A"。

#### AC-2: 自动填充单价
**Pattern**: Event-Driven (WHEN)
```text
WHEN I select a specific model from the list, the System SHALL automatically update the 'Input Price' and 'Output Price' fields with the predefined values for that model.
```
**Given-When-Then** (for BDD testing):
- **Given**: 我已选择了 "Model X"，其预设输入单价为 0.01，输出单价为 0.02。
- **When**: 选择动作完成。
- **Then**: "输入单价"输入框显示 0.01，"输出单价"输入框显示 0.02。

### 优先级: 高

---

## US-02: 设置并修改计算参数

**As a** 内部运营人员或外部客户
**I want** 能够查看并修改所有计算所需的参数（包括输入/输出 Tokens、损耗率、利润率、点数系数）
**So that** 我可以根据不同的客户需求或业务场景，灵活地调整这些变量以计算出准确的点数。

### 验收标准（EARS 格式）

#### AC-1: 默认参数加载
**Pattern**: State-Driven (WHILE)
```text
WHILE the application first loads, the System SHALL display default values in the 'Loss Rate' (20%), 'Profit Margin' (50%), and 'Point Coefficient' (0.02) fields.
```
**Given-When-Then** (for BDD testing):
- **Given**: 我首次打开该工具页面。
- **When**: 页面加载完成。
- **Then**: 损耗率框显示 20%，利润率框显示 50%，系数框显示 0.02。

#### AC-2: 参数修改
**Pattern**: Event-Driven (WHEN)
```text
WHEN I enter a valid number into any parameter field, the System SHALL accept the input and use it for subsequent calculations.
```
**Given-When-Then** (for BDD testing):
- **Given**: "损耗率"默认值为 20%。
- **When**: 我将其修改为 15%。
- **Then**: 系统保存此修改值并用于下一步的实时计算。

### 优先级: 高

---

## US-03: 实时获取点数计算结果

**As a** 内部运营人员或外部客户
**I want** 在我输入或修改任何一个参数时，系统能立即显示根据特定公式计算出的最终点数
**So that** 我无需点击任何按钮，就能实时、快速地得到计算结果，提高工作效率。

### 验收标准（EARS 格式）

#### AC-1: 实时自动计算
**Pattern**: Event-Driven (WHEN)
```text
WHEN any parameter field is updated, the System SHALL instantly recalculate the total points using the formula: (((Input Tokens / 1000) * Input Price + (Output Tokens / 1000) * Output Price) * Loss Rate * Profit Margin) / Point Coefficient.
```
**Given-When-Then** (for BDD testing):
- **Given**: 当前所有参数已填写完整，显示了一个初始计算结果。
- **When**: 我将"输入 Tokens"的值从 1000 修改为 2000。
- **Then**: 系统立刻根据新值重新计算，并更新显示的最终点数结果。

#### AC-2: 清晰展示结果与明细
**Pattern**: Event-Driven (WHEN)
```text
WHEN the calculation finishes, the System SHALL prominently display the final 'Points' and optionally provide a breakdown of the intermediate calculation steps.
```
**Given-When-Then** (for BDD testing):
- **Given**: 系统刚完成一次重新计算。
- **When**: 计算结果生成。
- **Then**: 页面上有一个明显突出的区域展示最终点数数值，并且我可以选择查看具体的计算过程（中间值）。

### 优先级: 高
