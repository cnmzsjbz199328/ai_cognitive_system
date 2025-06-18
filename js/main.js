// ===========================================
// 主入口文件 - 整合所有模块
// ===========================================

// 导入所有核心模块
import { debugState } from './config.js';
import { drawConnections, toggleConnections, toggleConnectionMode, toggleAnchorPoints } from './connections.js';
import { initializeAnimations, setFlowSpeedValue } from './animation.js';
import { startSimulation, stopSimulation, resetSimulation, setSimulationSpeed } from './simulation.js';
import { setupDragAndDrop } from './dragdrop.js';
import { initializeZoomSystem, zoomIn, zoomOut, resetZoom } from './zoom.js';
import { initializeLanguageSystem, switchLanguage } from './language.js';

// 全局API对象
const AICognitiveSystem = {
    // 模拟控制
    startSimulation,
    stopSimulation,
    resetSimulation,
    setSimulationSpeed,
    
    // 连接线控制
    drawConnections,
    toggleConnections,
    toggleConnectionMode,
    toggleAnchorPoints,
    
    // 缩放控制
    zoomIn,
    zoomOut,
    resetZoom,
    
    // 语言控制
    switchLanguage,
    
    // 动画控制
    setFlowSpeed: setFlowSpeedValue,
    
    // 调试功能
    debugState,
    
    // 版本信息
    version: '2.0.0',
    build: 'modular'
};

// 初始化系统
export function initializeSystem() {
    console.log('🚀 AI认知系统 v2.0 - 模块化版本启动');
    console.log('📦 开始初始化各个子系统...');
    
    try {
        // 1. 初始化语言系统
        console.log('1️⃣ 初始化语言系统...');
        initializeLanguageSystem();
        
        // 2. 初始化缩放系统
        console.log('2️⃣ 初始化缩放系统...');
        initializeZoomSystem();
        
        // 3. 初始化动画系统
        console.log('3️⃣ 初始化动画系统...');
        initializeAnimations();
        
        // 4. 初始化拖拽系统
        console.log('4️⃣ 初始化拖拽系统...');
        setupDragAndDrop();
        
        // 5. 延迟绘制连接线（确保DOM完全加载）
        setTimeout(() => {
            console.log('5️⃣ 绘制连接线...');
            drawConnections();
        }, 100);
        
        console.log('✅ 所有子系统初始化完成');
        
    } catch (error) {
        console.error('❌ 系统初始化失败:', error);
        // 降级到简单模式
        initializeFallbackMode();
    }
}

// 设置事件监听器
export function setupEventListeners() {
    console.log('🔗 设置全局事件监听器...');
    
    try {
        // 速度滑块事件
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            speedSlider.addEventListener('input', function(e) {
                const newSpeed = parseInt(e.target.value);
                setSimulationSpeed(newSpeed);
            });
        }

        // 流动速度滑块事件
        const flowSpeedSlider = document.getElementById('flow-speed-slider');
        if (flowSpeedSlider) {
            flowSpeedSlider.addEventListener('input', function(e) {
                const newSpeed = parseInt(e.target.value);
                setFlowSpeedValue(newSpeed);
            });
        }

        // 窗口大小变化事件
        window.addEventListener('resize', () => {
            setTimeout(() => {
                drawConnections();
            }, 100);
        });

        // 方向变化事件
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                drawConnections();
            }, 300);
        });

        // 模块点击事件
        document.querySelectorAll('.module').forEach(module => {
            module.addEventListener('click', function(e) {
                // 这个功能在拖拽模块中处理
                e.preventDefault();
            });
        });

        console.log('✅ 事件监听器设置完成');
        
    } catch (error) {
        console.error('❌ 事件监听器设置失败:', error);
    }
}

// 降级模式（当模块加载失败时）
function initializeFallbackMode() {
    console.warn('⚠️ 启动降级模式');
    
    // 基本的连接线绘制
    setTimeout(() => {
        try {
            drawConnections();
        } catch (error) {
            console.error('连接线绘制失败:', error);
        }
    }, 200);
    
    // 基本的事件处理
    const startBtn = document.querySelector('[onclick*="startSimulation"]');
    if (startBtn) {
        startBtn.onclick = () => {
            console.log('降级模式: 启动模拟');
        };
    }
}

// 暴露全局API
window.AICognitiveSystem = AICognitiveSystem;

// 暴露单独的函数到全局作用域（供HTML onclick使用）
window.startSimulation = startSimulation;
window.stopSimulation = stopSimulation;
window.resetSimulation = resetSimulation;
window.toggleConnections = toggleConnections;
window.toggleConnectionMode = toggleConnectionMode;
window.toggleAnchorPoints = toggleAnchorPoints;

// 暴露调试API
window.debugAI = {
    state: debugState,
    redraw: drawConnections,
    system: AICognitiveSystem
};

// 自动初始化（当DOM就绪时）
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM已加载，开始初始化系统...');
    
    setTimeout(() => {
        initializeSystem();
        setupEventListeners();
    }, 100);
});

// 导出API对象
export { AICognitiveSystem };

console.log('🎯 主模块加载完成，等待DOM就绪...'); 