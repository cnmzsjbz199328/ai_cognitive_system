// ===========================================
// 简化的AI认知系统 - 单文件版本
// ===========================================

// 全局变量
let isRunning = false;
let currentTimeout;
let speed = 1500;
let showConnections = true;
let isDragging = false;
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };
let connectionMode = 'curved';
let flowSpeed = 2000;
let activeFlowAnimations = [];
let currentLanguage = 'zh-CN';
let currentZoom = 100;
let autoResponsiveZoom = true;

// 连接配置
const connections = [
    ['external-stimuli', 'perception'],
    ['perception', 'ai-cognitive'],
    ['ai-cognitive', 'thinking-core'],
    ['thinking-core', 'personality'],
    ['thinking-core', 'skills'],
    ['thinking-core', 'needs'],
    ['thinking-core', 'planning'],
    ['thinking-core', 'relationship'],
    ['personality', 'action-output'],
    ['skills', 'action-output'],
    ['needs', 'action-output'],
    ['planning', 'action-output'],
    ['relationship', 'action-output'],
    ['action-output', 'environment'],
    ['environment', 'memory'],
    ['memory', 'ai-cognitive'],
    ['global-time', 'ai-cognitive'],
    ['ai-cognitive', 'memory']
];

const flowSequence = [
    'external-stimuli',
    'perception',
    'ai-cognitive',
    'thinking-core',
    'personality',
    'skills',
    'needs',
    'planning',
    'relationship',
    'action-output',
    'environment',
    'memory'
];

// 模块描述
const modules = {
    'external-stimuli': '外部刺激：接收来自环境的信息输入',
    'perception': '感知模块：处理和解析输入信息',
    'ai-cognitive': 'AI认知核心：整合信息并进行认知处理',
    'thinking-core': '思维核心：进行深层思考和决策',
    'personality': '个性模块：根据个性特征调整响应',
    'skills': '技能模块：运用相关技能处理信息',
    'needs': '需求模块：评估需求和动机',
    'planning': '规划模块：制定行动计划',
    'relationship': '关系模块：考虑社交关系因素',
    'action-output': '输出模块：生成最终响应',
    'environment': '环境交互：与外界环境交互',
    'memory': '记忆系统：存储和提取记忆信息',
    'global-time': '时间系统：协调系统时序'
};

// 获取模块中心点
function getModuleCenter(moduleId) {
    const module = document.getElementById(moduleId);
    if (!module) return { x: 0, y: 0 };
    
    const rect = module.getBoundingClientRect();
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    
    let centerX = rect.left - containerRect.left + rect.width / 2;
    let centerY = rect.top - containerRect.top + rect.height / 2;
    
    // 缩放补偿
    const containerStyle = window.getComputedStyle(container);
    const transform = containerStyle.transform;
    
    if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            const scaleX = values[0];
            const scaleY = values[3];
            centerX = centerX / scaleX;
            centerY = centerY / scaleY;
        }
    }
    
    return { x: centerX, y: centerY };
}

// 绘制连接线
function drawConnections() {
    const svg = document.getElementById('connections-svg');
    if (!svg) return;
    
    svg.innerHTML = '';
    
    if (!showConnections) return;
    
    connections.forEach(([from, to]) => {
        const fromCenter = getModuleCenter(from);
        const toCenter = getModuleCenter(to);
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`;
        path.setAttribute('d', pathData);
        path.className = 'connection-line';
        path.id = `connection-${from}-${to}`;
        
        svg.appendChild(path);
    });
}

// 模拟控制
function startSimulation() {
    if (isRunning) return;
    
    isRunning = true;
    let currentIndex = 0;
    
    function nextStep() {
        if (!isRunning) return;
        
        const currentModuleId = flowSequence[currentIndex];
        activateModule(currentModuleId);
        
        currentIndex = (currentIndex + 1) % flowSequence.length;
        currentTimeout = setTimeout(nextStep, speed);
    }
    
    nextStep();
}

function stopSimulation() {
    isRunning = false;
    if (currentTimeout) {
        clearTimeout(currentTimeout);
    }
}

function resetSimulation() {
    stopSimulation();
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.remove('active');
    });
    document.getElementById('current-info').textContent = '点击"开始模拟"按钮开始信息传导演示';
}

function activateModule(moduleId) {
    // 清除所有活动状态
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    
    // 激活当前模块
    const module = document.getElementById(moduleId);
    if (module) {
        module.classList.add('active');
        updateInfo(moduleId);
    }
}

function updateInfo(moduleId) {
    const infoElement = document.getElementById('current-info');
    if (infoElement) {
        infoElement.textContent = modules[moduleId] || '未知模块';
    }
}

// 连接线控制
function toggleConnections() {
    showConnections = !showConnections;
    const button = document.getElementById('connections-toggle');
    
    if (showConnections) {
        button.textContent = '隐藏连接线';
        button.classList.remove('active');
        drawConnections();
    } else {
        button.textContent = '显示连接线';
        button.classList.add('active');
        document.getElementById('connections-svg').innerHTML = '';
    }
}

// 拖拽功能
function setupDragAndDrop() {
    const modules = document.querySelectorAll('.module');
    
    modules.forEach(module => {
        module.addEventListener('mousedown', startDrag);
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
}

function startDrag(e) {
    if (isRunning) return;
    
    isDragging = true;
    dragTarget = e.target.closest('.module');
    dragTarget.classList.add('dragging');
    
    const rect = dragTarget.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    e.preventDefault();
}

function drag(e) {
    if (!isDragging || !dragTarget) return;
    
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    
    dragTarget.style.left = Math.max(0, x) + 'px';
    dragTarget.style.top = Math.max(0, y) + 'px';
    dragTarget.style.right = 'auto';
    dragTarget.style.bottom = 'auto';
    
    drawConnections();
}

function endDrag() {
    if (dragTarget) {
        dragTarget.classList.remove('dragging');
        dragTarget = null;
    }
    isDragging = false;
}

// 初始化系统
function initializeSystem() {
    console.log('🚀 简化系统初始化中...');
    
    // 初始化拖拽
    setupDragAndDrop();
    
    // 绘制连接线
    setTimeout(() => {
        drawConnections();
    }, 100);
    
    // 设置事件监听
    document.getElementById('speed-slider').addEventListener('input', function(e) {
        speed = parseInt(e.target.value);
    });
    
    document.getElementById('flow-speed-slider').addEventListener('input', function(e) {
        flowSpeed = parseInt(e.target.value);
    });
    
    // 模块点击事件
    document.querySelectorAll('.module').forEach(module => {
        module.addEventListener('click', function(e) {
            if (!isRunning && !isDragging) {
                activateModule(this.id);
            }
        });
    });
    
    // 窗口大小变化时重新绘制
    window.addEventListener('resize', () => {
        setTimeout(drawConnections, 100);
    });
    
    console.log('✅ 简化系统初始化完成！');
}

// 暴露全局函数
window.AICognitiveSystem = {
    startSimulation,
    stopSimulation,
    resetSimulation,
    toggleConnections,
    drawConnections
};

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else {
    initializeSystem();
}

export { initializeSystem }; 