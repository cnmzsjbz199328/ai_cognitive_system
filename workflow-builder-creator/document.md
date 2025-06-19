好的，作为架构师，我将结合您的用户故事、`phases.md` 文件以及之前对项目的分析，为您生成一份详细的项目开发文档。

首先，我需要阅读 `phases.md` 以全面理解您对项目阶段的规划。
Read file: phases.md
好的，感谢您提供如此清晰的用户故事和阶段规划。`phases.md` 文件为我提供了宝贵的项目全景视角，让我能够将当前的 MVP (Minimum Viable Product, 最小可行产品) 放在一个更宏大的技术蓝图中来规划。

基于所有信息，我为您整理了这份详细的项目开发文档。

---

### **项目开发文档：流程可视化与编辑基础 (MVP)**

#### **1. 项目愿景与 MVP 目标**

*   **项目愿景**: 构建一个高性能、交互流畅、视觉效果出色的 Web 流程图引擎。该引擎专注于动态展示信息在节点间的“流动”，而非复杂的业务流程管理 (BPMN) 功能。
*   **MVP 目标**: 交付一个核心功能完备的基础版本。该版本需实现流程图的加载、展示、基础导航与交互，并为后续的高级功能（如动态连线创建、信息流动画）打下坚实的架构基础。本次 MVP 的范围由您提供的 5 个核心用户故事和 1 个新增用户故事共同定义。

#### **2. 核心架构设计 (Architecture & Design)**

我们将采用**模块化、状态驱动**的现代 Web 应用架构。这与您在 `phases.md` 中定义的项目基础阶段完全一致，也延续了现有代码库中的优秀实践。

*   **技术栈**:
    *   **渲染**: **SVG**。它提供了出色的伸缩性、性能和通过 DOM API 操作的便利性，是实现交互式图形和复杂动画的不二之_二选_。
    *   **核心逻辑**: **原生 JavaScript (ES6+ Modules)**。MVP 阶段不引入任何外部框架，以保持其轻量和高性能。
    *   **样式**: **CSS3**，使用 CSS 变量（Custom Properties）实现主题化和动态样式。

*   **设计原则**:
    *   **单一职责原则 (SRP)**: 将应用拆分为多个高内聚、低耦合的模块（例如：`Renderer`, `StateManager`, `InteractionManager`）。这与我之前建议的重构方向一致。
    *   **状态驱动视图**: UI 的任何变化都应由状态 (State) 的变更驱动。交互操作（如拖拽）会更新状态，状态的更新则自动触发渲染器重绘界面。这是构建可预测、可维护应用的关键。

#### **3. 核心数据结构 (Data Structures)**

为保证数据的一致性，我们定义以下核心数据结构：

*   **`Node` (节点)**
    ```typescript
    interface Node {
        id: string;          // 唯一标识符, e.g., "node_1"
        label: string;       // 节点上显示的文本
        position: {
            x: number;       // 节点的 x 坐标
            y: number;       // 节点的 y 坐标
        };
        // 更多属性可在未来阶段添加 (e.g., type, properties)
    }
    ```

*   **`Connection` (连接线)**
    ```typescript
    interface Connection {
        id: string;          // 唯一标识符, e.g., "conn_1"
        source: string;      // 源节点 ID
        target: string;      // 目标节点 ID
    }
    ```

#### **4. 模块拆解与职责 (Module Breakdown)**

我们将把现有 `main.js` 的逻辑重构并拆分到以下模块中：

1.  **`StateManager (state.js)`**
    *   **职责**: 作为应用的“单一事实来源 (Single Source of Truth)”。它负责存储和管理所有的 `nodes` 和 `connections`。
    *   **提供方法**: `getState()`, `addNode()`, `updateNodePosition(id, newPosition)`, `addConnection(sourceId, targetId)` 等。所有对应用数据的修改都必须通过此模块。

2.  **`Renderer (renderer.js)`**
    *   **职责**: 将 `StateManager` 中的状态可视化到 SVG 画布上。
    *   **核心功能**:
        *   接收状态数据，并渲染出节点 (`<g class="node-group">`) 和连接线 (`<line>`)。
        *   为节点添加用于创建连接的“锚点” (Anchor Points)。
        *   实现增量渲染（未来优化方向），而非每次都清空重绘，以提升性能。

3.  **`InteractionManager (interaction.js)`**
    *   **职责**: 处理所有用户与 SVG 画布的交互事件。
    *   **核心功能**:
        *   **视图导航**: 实现画布的平移和缩放。
        *   **节点拖拽**: 处理节点的拖拽事件，并调用 `StateManager` 更新节点位置。
        *   **连接创建**: (新增) 处理从一个节点的锚点拖拽到另一个节点以创建连接的完整交互流程。

4.  **`AnimationManager (animation.js)`**
    *   **职责**: 负责实现用户故事 4 中定义的信息流动画。
    *   **核心功能**:
        *   提供 `play()` 和 `pause()` 控制。
        *   在播放时，根据连接线的路径，创建并驱动动画元素（如小圆点），模拟数据流动的效果。可以使用 SVG 的 `<animateMotion>` 或 `requestAnimationFrame` 循环来实现。

5.  **`App (main.js)`**
    *   **职责**: 作为应用的入口和协调器。
    *   **核心功能**:
        *   初始化所有模块。
        *   调用 `fetch()` 从 `flow.json` 加载初始数据，并送入 `StateManager`。
        *   设置主渲染循环 (`requestAnimationFrame`)。
        *   监听窗口大小变化事件，实现响应式布局。

#### **5. 用户故事实施方案 (User Story Implementation Plan)**

| 用户故事 | 涉及模块 | 实施要点 |
| :--- | :--- | :--- |
| **1. 加载和展示** | `App`, `StateManager`, `Renderer` | 1. `App` 模块使用 `fetch API` 异步加载 `src/data/flow.json`。<br>2. 加载成功后，将数据传递给 `StateManager` 进行存储。<br>3. `Renderer` 监听状态变化（或被主动调用），将节点和连接线渲染到 SVG 画布上。 |
| **2. 视图导航** | `InteractionManager` | 1. 在 `InteractionManager` 中监听鼠标 `wheel` 事件以实现缩放。<br>2. 监听 `mousedown`, `mousemove`, `mouseup` 事件（在画布空白处）以实现平移。<br>3. **关键**: 所有坐标计算必须考虑当前的 `transform` (scale, translate) 状态。 |
| **3. 节点交互** | `InteractionManager`, `StateManager`, `Renderer` | 1. `InteractionManager` 监听节点元素上的 `mousedown` 事件，启动拖拽模式。<br>2. 在 `mousemove` 事件中，计算新位置并调用 `StateManager.updateNodePosition()`。<br>3. `Renderer` 根据更新后的状态实时重绘节点和相关连接线，实现平滑跟随。 |
| **4. 信息流模拟** | `AnimationManager`, `App` | 1. 在 `index.html` 中添加一个“播放”按钮。<br>2. `App` 模块监听按钮点击，调用 `AnimationManager.play()`。<br>3. `AnimationManager` 获取所有连接线，为每条线创建一个动画元素（如 `<circle>`），并使用 `<animateMotion>` 让其沿着连接线的路径移动。 |
| **5. 响应式布局** | `App`, `Renderer` | 1. `App` 模块使用 `ResizeObserver` 或 `window.addEventListener('resize', ...)` 监听容器或窗口的大小变化。<br>2. 当尺寸变化时，更新 SVG 元素的 `width`, `height` 和 `viewBox` 属性，确保画布内容能正确、优雅地缩放以适应新空间。 |
| **6. 定向连接创建** | `InteractionManager`, `Renderer`, `StateManager` | 1. `Renderer` 在渲染每个节点时，在其边缘额外渲染几个可见的 `<circle>` 作为“锚点”。<br>2. `InteractionManager` 监听锚点上的 `mousedown` 事件，记录源节点 ID，并开始绘制一条临时的预览线。<br>3. 在 `mousemove` 中，更新预览线的终点到鼠标当前位置。<br>4. 在 `mouseup` 时，检测鼠标下方是否为另一个节点的目标锚点。如果是，则调用 `StateManager.addConnection()` 创建新连接；否则，取消创建。 |

#### **6. MVP 开发路线图 (Development Roadmap)**

建议采用以下分步实施策略：

1.  **第 1 步：架构重构 (Foundation)**
    *   **任务**: 将 `main.js` 中的逻辑严格按照上述模块划分，拆分到 `state.js`, `renderer.js`, `interaction.js`, `main.js` 文件中。清理掉项目中不再使用的旧文件 (`dragDropManager.js` 等)。
    *   **目标**: 建立一个清晰、可维护、可扩展的代码基础。这是最高优先级。

2.  **第 2 步：实现核心展示与布局 (US1, US5)**
    *   **任务**: 实现从 `flow.json` 加载数据的功能，并完成响应式布局的逻辑。
    *   **目标**: 应用能够正确加载并以响应式的方式展示静态流程图。

3.  **第 3 步：实现核心交互功能 (US2, US3, US6)**
    *   **任务**: 在重构后的架构上，重新实现并验证平移、缩放、节点拖拽功能。然后，集中开发最核心的新功能——**拖拽创建连接线**。
    *   **目标**: 用户可以与流程图进行完整的查看和基础编辑操作。

4.  **第 4 步：实现视觉反馈 (US4)**
    *   **任务**: 创建 `AnimationManager` 模块并实现信息流动画。
    *   **目标**: 为流程图增加动态的、吸引人的视觉元素，完成 MVP 的所有功能需求。

5.  **第 5 步：审查与文档**
    *   **任务**: 全面审查代码质量，添加必要的注释，更新 `README.md` 以反映 MVP 的功能和使用方法。
    *   **目标**: 交付一个高质量、文档完善的 MVP 版本。

---

这份文档为您提供了一个从架构到实施的完整路线图。我们可以立即开始第一步：**架构重构**。您准备好开始了吗？