# 功能需求规格说明书

**项目名称**: 点数换算小工具
**创建日期**: 2026-04-09
**版本**: 1.0

> **NOTE**: 所有的验收标准都以 EARS（Easy Approach to Requirements Syntax）格式编写。

---

## FR-01: 模型选择与单价获取

**优先级**: Must Have
**类别**: 用户输入

### 描述
用户可以通过下拉列表或模糊搜索来选择 LLM 模型。选择后，系统将自动获取并填充该模型的默认输入和输出单价，并允许用户后续修改。

### 详细要求

1. **输入**
   - 用户点击下拉菜单或输入模型名称的关键字。
2. **处理**
   - 系统展示匹配的模型列表。
   - 系统根据用户选择的模型，查找预设的模型单价数据。
3. **输出**
   - 自动在界面上填充对应的“输入单价”和“输出单价”字段。

### 验收标准（EARS 格式）

#### AC-1: 模型列表展示
**Pattern**: Event-Driven (WHEN)
```text
WHEN the user clicks the model selection dropdown, the System SHALL display a list of all available LLM models.
```
**测试验证**:
- [ ] 单元测试: 测试模型列表数据加载。
- [ ] 集成测试: 模拟点击事件，验证下拉列表的渲染。

#### AC-2: 模糊搜索
**Pattern**: Event-Driven (WHEN)
```text
WHEN the user types in the model selection field, the System SHALL filter and display models that match the typed characters.
```
**测试验证**:
- [ ] 单元测试: 测试搜索过滤函数。
- [ ] E2E 测试: 模拟用户输入，验证过滤结果。

#### AC-3: 自动填充单价
**Pattern**: Event-Driven (WHEN)
```text
WHEN a model is selected, the System SHALL automatically populate the 'Input Price' and 'Output Price' input fields with the corresponding values for that model.
```
**测试验证**:
- [ ] 单元测试: 验证单价获取逻辑。
- [ ] 集成测试: 模拟选择操作，验证输入框的值更新。

### 约束条件
- 模型列表数据（名称、输入单价、输出单价）需在前端硬编码或通过本地配置文件读取。

### 依赖关系
- 无

---

## FR-02: 参数输入与默认值

**优先级**: Must Have
**类别**: 用户输入

### 描述
系统提供多个输入框供用户填写计算所需的各项参数。为了提高效率，部分参数在系统初始化时会被赋予默认值。

### 详细要求

1. **输入**
   - 用户在各个参数输入框（输入 Tokens、输出 Tokens、输入单价、输出单价、损耗率、利润率、点数系数）中输入数值。
2. **处理**
   - 系统在加载时设置特定字段的默认值（损耗率 20%，利润率 50%，点数系数 0.02）。
   - 验证输入的数据格式是否为有效数字。
3. **输出**
   - 输入框显示用户输入的数值。

### 验收标准（EARS 格式）

#### AC-1: 默认值初始化
**Pattern**: State-Driven (WHILE)
```text
WHILE the application is initializing, the System SHALL populate the 'Loss Rate' field with 20%, the 'Profit Margin' field with 50%, and the 'Point Coefficient' field with 0.02.
```
**测试验证**:
- [ ] 单元测试: 验证组件挂载时的初始状态。
- [ ] E2E 测试: 打开页面，检查默认值是否正确显示。

#### AC-2: 数值输入验证
**Pattern**: Unwanted Behavior (IF...THEN)
```text
IF the user enters a non-numeric character into any parameter field, THEN the System SHALL ignore the input or display an error indicator.
```
**测试验证**:
- [ ] 单元测试: 测试输入框的验证逻辑。

### 约束条件
- 所有参数输入必须支持小数点。

### 依赖关系
- 依赖于界面渲染的完成。

---

## FR-03: 实时点数计算

**优先级**: Must Have
**类别**: 核心计算

### 描述
当用户输入或修改任何参数时，系统会立即根据公式重新计算并显示最终的点数。公式为：`点数 = (((输入 tokens / 1000) * 输入单价 + (输出 tokens / 1000) * 输出单价) * 损耗率 * 利润率) / 点数系数`。

### 详细要求

1. **输入**
   - 任何参数输入框的值发生变化。
2. **处理**
   - 触发计算函数。
   - 提取所有输入框的当前值。
   - 应用公式进行计算。
3. **输出**
   - 更新界面上显示的“点数”结果。
   - 可选：更新计算过程的中间明细。

### 验收标准（EARS 格式）

#### AC-1: 实时触发计算
**Pattern**: Event-Driven (WHEN)
```text
WHEN any parameter input value changes, the System SHALL immediately execute the point calculation formula.
```
**测试验证**:
- [ ] 单元测试: 模拟输入变化事件，验证计算函数是否被调用。

#### AC-2: 公式正确性
**Pattern**: State-Driven (WHILE)
```text
WHILE executing the calculation, the System SHALL calculate the result strictly according to the formula: Points = (((Input Tokens / 1000) * Input Price + (Output Tokens / 1000) * Output Price) * Loss Rate * Profit Margin) / Point Coefficient.
```
**测试验证**:
- [ ] 单元测试: 使用多组边界值和正常值测试计算公式的准确性（例如：浮点数精度问题处理）。

#### AC-3: 结果展示
**Pattern**: Event-Driven (WHEN)
```text
WHEN the calculation is complete, the System SHALL display the resulting 'Points' value clearly on the user interface.
```
**测试验证**:
- [ ] 集成测试: 验证计算结果是否正确渲染到 DOM 元素中。

### 约束条件
- 遇到除数为零（点数系数为 0）的情况，需要进行安全处理，防止应用崩溃，并提示用户。

### 依赖关系
- 依赖于 FR-01 和 FR-02 收集的参数数据。
