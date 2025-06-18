# AI认知系统信息传导模拟器

## 项目结构

```
ai_cognitive_system/
├── index.html      # 主HTML文件
├── styles.css      # 样式文件
├── script.js       # JavaScript逻辑文件
├── test.html       # 连接线测试页面
└── README.md       # 项目说明文档
```

## 功能特性

- 🧠 AI认知系统的可视化展示
- 🔗 动态连接线显示模块间的信息流
- 🎯 交互式模拟：点击开始模拟可观看信息传导过程
- 🖱️ 拖拽功能：可以拖拽模块改变位置
- ⚡ 动态效果：包含信号粒子和背景动画
- 🎛️ 控制面板：调节模拟速度，切换连接线显示

## 连接线不可见问题及解决方案

### 问题分析

经过深入分析，发现连接线不可见的主要原因包括：

#### 1. **坐标计算问题**
- **问题**：原始代码使用`getBoundingClientRect()`获取相对于视窗的坐标，但SVG需要相对于容器的坐标
- **解决方案**：修正坐标计算方法
```javascript
function getModuleCenter(moduleId) {
    const module = document.getElementById(moduleId);
    const rect = module.getBoundingClientRect();
    const containerRect = document.querySelector('.container').getBoundingClientRect();
    
    return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2
    };
}
```

#### 2. **元素加载时机问题**
- **问题**：连接线在DOM元素完全加载前就尝试绘制
- **解决方案**：添加延迟加载
```javascript
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        drawConnections();
    }, 100);
});
```

#### 3. **z-index层级问题**
- **问题**：SVG的`z-index: 1`过低，被模块元素遮挡
- **解决方案**：将SVG的z-index提升至5
```css
.connections-svg {
    z-index: 5; /* 原来是1 */
}
```

#### 4. **错误处理缺失**
- **问题**：当模块不存在时缺少错误处理
- **解决方案**：添加完善的错误检查和日志
```javascript
if (!module) {
    console.warn(`Module with id '${moduleId}' not found`);
    return { x: 0, y: 0 };
}
```

### 修复后的改进

1. **调试信息**：添加了console.log输出，便于调试
2. **坐标验证**：验证坐标有效性，避免绘制无效的线条
3. **延迟渲染**：确保DOM完全加载后再绘制连接线
4. **层级优化**：调整z-index确保连接线在正确层级显示

## 如何测试连接线

1. **打开test.html**：这是一个简化的测试页面，专门用于验证连接线功能
2. **查看控制台**：打开浏览器开发者工具，查看console输出
3. **点击调试按钮**：使用测试页面的调试功能查看坐标信息

## 使用方法

1. 打开`index.html`文件
2. 点击"开始模拟"按钮开始信息传导演示
3. 使用控制面板调节速度或切换连接线显示
4. 拖拽模块可以改变其位置，连接线会自动更新

## 技术要点

### 模块系统
- 13个认知模块：外部刺激、感知输入、AI认知核心等
- 每个模块都有独特的功能描述和视觉反馈

### 连接关系
```javascript
const connections = [
    ['external-stimuli', 'perception'],
    ['perception', 'ai-cognitive'],
    ['ai-cognitive', 'thinking-core'],
    // ... 更多连接关系
];
```

### 信息流序列
```javascript
const flowSequence = [
    'external-stimuli', 'perception', 'ai-cognitive', 
    'thinking-core', 'personality', 'skills', 
    'needs', 'planning', 'relationship', 
    'action-output', 'environment', 'memory'
];
```

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## 故障排除

如果连接线仍然不可见：

1. **检查控制台**：查看是否有JavaScript错误
2. **验证元素存在**：确认所有模块元素都正确加载
3. **检查SVG元素**：在开发者工具中查看SVG是否包含line元素
4. **测试简化版本**：使用test.html进行基础功能测试

## 开发说明

这个项目采用现代Web技术：
- **ES6+语法**：使用箭头函数、const/let、模板字符串
- **CSS3特性**：渐变、阴影、动画、backdrop-filter
- **SVG图形**：用于绘制连接线
- **事件驱动**：响应式交互设计 