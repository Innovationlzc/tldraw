# Tool Chain Editor Example

本示例演示如何根据 LLM 返回的工具链数据自动生成交互式流程图，并支持用户拖拽、编辑。

- 使用 [react-flow-renderer](https://reactflow.dev/) 实现节点链式 UI。
- 只需调用 `setToolChain(toolChain)`，即可渲染 LLM 返回的工具链。
- 目前仅为 UI 结构，未实现具体工具功能。
- 适合用作 AI agent 工具链自动生成与交互编辑的前端原型。 