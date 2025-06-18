// ===========================================
// 配置模块 - 全局状态管理
// ===========================================

// 系统状态变量
let systemState = {
    isRunning: false,
    currentTimeout: null,
    speed: 1500,
    showConnections: true,
    isDragging: false,
    dragTarget: null,
    dragOffset: { x: 0, y: 0 },
    connectionMode: 'curved', // 'curved' 或 'orthogonal'
    flowSpeed: 2000,
    activeFlowAnimations: [],
    currentLanguage: 'zh-CN',
    currentZoom: 100,
    autoResponsiveZoom: true
};

// 状态获取函数
export const getState = () => systemState;
export const isRunning = () => systemState.isRunning;
export const getCurrentTimeout = () => systemState.currentTimeout;
export const getSpeed = () => systemState.speed;
export const getShowConnections = () => systemState.showConnections;
export const isDragging = () => systemState.isDragging;
export const getDragTarget = () => systemState.dragTarget;
export const getDragOffset = () => systemState.dragOffset;
export const getConnectionMode = () => systemState.connectionMode;
export const getFlowSpeed = () => systemState.flowSpeed;
export const getActiveFlowAnimations = () => systemState.activeFlowAnimations;
export const getCurrentLanguage = () => systemState.currentLanguage;
export const getCurrentZoom = () => systemState.currentZoom;
export const getAutoResponsiveZoom = () => systemState.autoResponsiveZoom;

// 状态更新函数
export const setIsRunning = (value) => { systemState.isRunning = value; };
export const setCurrentTimeout = (value) => { systemState.currentTimeout = value; };
export const setSpeed = (value) => { systemState.speed = value; };
export const setShowConnections = (value) => { systemState.showConnections = value; };
export const setIsDragging = (value) => { systemState.isDragging = value; };
export const setDragTarget = (value) => { systemState.dragTarget = value; };
export const setDragOffset = (value) => { systemState.dragOffset = value; };
export const setConnectionMode = (value) => { systemState.connectionMode = value; };
export const setFlowSpeed = (value) => { systemState.flowSpeed = value; };
export const setActiveFlowAnimations = (value) => { systemState.activeFlowAnimations = value; };
export const setCurrentLanguage = (value) => { systemState.currentLanguage = value; };
export const setCurrentZoom = (value) => { systemState.currentZoom = value; };
export const setAutoResponsiveZoom = (value) => { systemState.autoResponsiveZoom = value; };

// 模块连接配置
export const connections = [
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

// 流动序列配置
export const flowSequence = [
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

// 模块描述数据
export const moduleDescriptions = {
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

// 缩放配置
export const zoomConfig = {
    min: 50,
    max: 200,
    step: 25,
    default: 100,
    responsive: {
        breakpoints: [
            { width: 600, zoom: 40 },
            { width: 900, zoom: 55 },
            { width: 1200, zoom: 70 },
            { width: 1400, zoom: 85 },
            { width: Infinity, zoom: 100 }
        ]
    }
};

// 动画配置
export const animationConfig = {
    defaultDuration: 1500,
    flowSpeed: 2000,
    pulseAnimation: '2s ease-in-out',
    transitionDuration: '0.3s ease'
};

// 调试函数
export const debugState = () => {
    console.log('🔍 系统状态调试:', systemState);
    return systemState;
}; 