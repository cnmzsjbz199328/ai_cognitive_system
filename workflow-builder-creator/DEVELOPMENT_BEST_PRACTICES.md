# 开发最佳实践指南

## 📚 从Phase 1-4学到的经验

### ✅ 成功的做法

**1. 模块化架构设计**
```javascript
// ✅ 好的做法：清晰的模块职责分离
export class InteractionManager {
    constructor(state, renderer) {
        this.state = state;        // 只读取状态
        this.renderer = renderer;  // 不直接操作DOM
    }
}
```

**2. 状态驱动渲染**
```javascript
// ✅ 好的做法：基于状态渲染
render() {
    if (this.state.proximityNodeId === node.id) {
        nodeElement.classList.add('show-anchors');
    }
}
```

**3. 事件驱动架构**
```javascript
// ✅ 好的做法：松耦合的模块通信
this.state.addEventListener('nodeSelected', this.handleNodeSelection);
```

### ❌ 避免的陷阱

**1. 多个数据源**
```javascript
// ❌ 错误做法：本地状态与全局状态冲突
class InteractionManager {
    constructor() {
        this.selectedNodes = new Set(); // 与state.selectedNodes冲突
    }
}
```

**2. 直接DOM操作**
```javascript
// ❌ 错误做法：与渲染循环冲突
handleProximity() {
    element.classList.add('show-anchors'); // 会被渲染器覆盖
}
```

**3. 硬编码的像素值**
```javascript
// ❌ 错误做法：不考虑缩放
const padding = 30; // 在缩放时会失效

// ✅ 正确做法：缩放感知
const scaledPadding = padding / this.state.transform.k;
```

## 🏗️ 架构原则

### 1. Single Source of Truth (单一数据源)
- 所有状态集中在`state`对象中
- 模块只读取状态，不维护本地状态
- 状态变更通过专门的函数进行

### 2. Unidirectional Data Flow (单向数据流)
```
User Input → State Update → Re-render
```

### 3. Separation of Concerns (关注点分离)
- **Config**: 配置和常量
- **State**: 应用状态
- **Renderer**: 视觉渲染
- **Interactions**: 用户交互
- **Animation**: 动画逻辑

## 🔧 代码规范

### 命名约定
```javascript
// 类名：PascalCase
class InteractionManager {}

// 函数名：camelCase
function handleNodeClick() {}

// 常量：UPPER_SNAKE_CASE
const DEFAULT_NODE_SIZE = 150;

// 私有方法：下划线前缀
_updateInternalState() {}
```

### 文件组织
```
src/js/
├── main.js              # 应用入口
├── config.js            # 配置管理
├── state.js             # 状态管理
├── renderer.js          # 渲染引擎
├── animation.js         # 动画管理
└── interactions/        # 交互模块
    ├── InteractionManager.js
    ├── DragHandler.js
    ├── SelectionHandler.js
    └── ConnectionHandler.js
```

### 错误处理
```javascript
// ✅ 好的做法：优雅的错误处理
try {
    const data = await loadFlowData();
    this.state.nodes = data.nodes;
} catch (error) {
    console.error('Failed to load flow data:', error);
    this.state.nodes = this.getDefaultNodes();
}
```

## 🧪 测试策略

### 单元测试
```javascript
// 测试状态管理
describe('State Management', () => {
    test('should add node correctly', () => {
        addNode(100, 200, 'Test Node');
        expect(state.nodes).toHaveLength(1);
        expect(state.nodes[0].label).toBe('Test Node');
    });
});
```

### 集成测试
```javascript
// 测试交互流程
describe('Node Interaction', () => {
    test('should select node on click', () => {
        const mockEvent = { target: nodeElement };
        interactionManager.handleNodeClick(mockEvent);
        expect(state.selectedNodeId).toBe('node_1');
    });
});
```

## 📝 文档规范

### 代码注释
```javascript
/**
 * 处理节点的邻近检测
 * @param {MouseEvent} e - 鼠标事件
 * @description 检测鼠标是否靠近节点，用于显示锚点
 */
handleProximity(e) {
    // 关键备注：动态缩放检测范围以适应缩放级别
    const scaledPadding = this.proximityPadding / this.state.transform.k;
    // ...
}
```

### 变更日志
```markdown
## [Phase 4] - 2024-XX-XX
### Added
- 多节点选择功能
- 群组移动支持
- 缩放感知的锚点检测

### Fixed
- 状态同步冲突问题
- DOM操作竞态条件

### Changed
- 重构为状态驱动架构
```

## 🚀 性能优化

### 渲染优化
```javascript
// ✅ 好的做法：避免不必要的重绘
render() {
    if (this.lastRenderState === this.currentState) {
        return; // 跳过重绘
    }
    // 执行渲染...
}
```

### 事件处理优化
```javascript
// ✅ 好的做法：事件节流
const throttledMouseMove = throttle(this.handleMouseMove, 16); // 60fps
```

## 📋 Code Review Checklist

- [ ] 是否遵循单一数据源原则？
- [ ] 是否有直接的DOM操作？
- [ ] 是否考虑了缩放和坐标变换？
- [ ] 错误处理是否完善？
- [ ] 代码是否有适当的注释？
- [ ] 性能是否经过考虑？
- [ ] 是否符合现有的代码风格？

---

**文档版本**: v1.0  
**最后更新**: Phase 4完成后  
**适用范围**: Phase 5及后续所有开发