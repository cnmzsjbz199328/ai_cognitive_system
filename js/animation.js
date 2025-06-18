// ===========================================
// 动画系统模块
// ===========================================

import { 
    getFlowSpeed, 
    getActiveFlowAnimations,
    setFlowSpeed,
    setActiveFlowAnimations
} from './config.js';

// 初始化动画系统
export function initializeAnimations() {
    // 创建背景效果
    setInterval(createBackgroundEffect, 2000);
    
    // 添加CSS动画样式
    addAnimationStyles();
    
    console.log('✨ 动画系统已初始化');
}

// 创建流动动画
export function createFlowAnimation(pathElement, duration = null) {
    const svg = document.getElementById('connections-svg');
    if (!svg || !pathElement) return null;
    
    const actualDuration = duration || getFlowSpeed();
    
    // 创建光点元素
    const flowDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    flowDot.setAttribute('r', '4');
    flowDot.setAttribute('fill', '#00ff88');
    flowDot.setAttribute('opacity', '0.9');
    flowDot.setAttribute('filter', 'drop-shadow(0 0 8px #00ff88)');
    flowDot.setAttribute('class', 'flow-dot');
    
    // 创建动画路径
    const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    animateMotion.setAttribute('dur', actualDuration + 'ms');
    animateMotion.setAttribute('repeatCount', '1');
    
    // 如果路径没有ID，创建一个
    if (!pathElement.id) {
        pathElement.id = 'path-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    // 创建mpath元素
    const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
    mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + pathElement.id);
    animateMotion.appendChild(mpath);
    
    flowDot.appendChild(animateMotion);
    
    // 添加到SVG
    svg.appendChild(flowDot);
    
    // 开始动画
    try {
        animateMotion.beginElement();
    } catch (error) {
        console.warn('动画启动失败:', error);
    }
    
    // 动画结束后清理
    setTimeout(() => {
        if (flowDot.parentNode) {
            flowDot.parentNode.removeChild(flowDot);
        }
    }, actualDuration + 100);
    
    return { dot: flowDot, animation: animateMotion };
}

// 在连接线上创建流动效果
export function animateConnectionFlow(fromModuleId, toModuleId) {
    const connectionId = `connection-${fromModuleId}-${toModuleId}`;
    const pathElement = document.getElementById(connectionId);
    
    if (pathElement) {
        const currentFlowSpeed = getFlowSpeed();
        
        // 高亮连接线
        pathElement.classList.add('active');
        
        // 创建多个光点以形成流动效果
        const numDots = 3; // 同时显示的光点数量
        const delay = currentFlowSpeed / numDots; // 光点之间的延迟
        
        for (let i = 0; i < numDots; i++) {
            setTimeout(() => {
                const flowAnimation = createFlowAnimation(pathElement, currentFlowSpeed);
                if (flowAnimation) {
                    const currentAnimations = getActiveFlowAnimations();
                    const newAnimations = [...currentAnimations, flowAnimation];
                    setActiveFlowAnimations(newAnimations);
                }
            }, i * delay);
        }
        
        // 一定时间后移除高亮
        setTimeout(() => {
            pathElement.classList.remove('active');
        }, currentFlowSpeed);
    }
}

// 停止所有流动动画
export function stopAllFlowAnimations() {
    const currentAnimations = getActiveFlowAnimations();
    
    currentAnimations.forEach(({ dot, animation }) => {
        try {
            if (dot && dot.parentNode) {
                dot.parentNode.removeChild(dot);
            }
            if (animation && animation.endElement) {
                animation.endElement();
            }
        } catch (error) {
            console.warn('停止动画时出错:', error);
        }
    });
    
    setActiveFlowAnimations([]);
}

// 设置流动速度
export function setFlowSpeedValue(newSpeed) {
    setFlowSpeed(newSpeed);
    console.log('流动速度已设置为:', newSpeed + 'ms');
}

// 创建信号粒子效果
export function createSignalParticle(module) {
    if (!module) return;
    
    const signal = document.createElement('div');
    signal.className = 'signal';
    
    const rect = module.getBoundingClientRect();
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    
    // 计算相对于容器的位置
    const x = rect.left - containerRect.left + rect.width / 2 - 6;
    const y = rect.top - containerRect.top + rect.height / 2 - 6;
    
    signal.style.left = x + 'px';
    signal.style.top = y + 'px';
    
    // 动画移动信号
    signal.style.animation = 'signal-move 0.8s linear';
    
    container.appendChild(signal);
    
    setTimeout(() => {
        if (signal.parentNode) {
            signal.parentNode.removeChild(signal);
        }
    }, 800);
}

// 背景粒子效果
export function createBackgroundEffect() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        animation: float 6s linear infinite;
        z-index: -10;
        pointer-events: none;
    `;
    
    container.appendChild(effect);
    
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 6000);
}

// 模块激活动画
export function animateModuleActivation(moduleId) {
    const module = document.getElementById(moduleId);
    if (!module) return;
    
    // 添加激活类
    module.classList.add('active');
    
    // 创建脉冲效果
    const pulseRing = document.createElement('div');
    pulseRing.className = 'pulse-ring';
    pulseRing.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        border: 2px solid #e74c3c;
        border-radius: 15px;
        animation: pulse-ring 1s ease-out;
        pointer-events: none;
    `;
    
    module.appendChild(pulseRing);
    
    // 创建信号粒子
    createSignalParticle(module);
    
    // 清理动画元素
    setTimeout(() => {
        if (pulseRing.parentNode) {
            pulseRing.parentNode.removeChild(pulseRing);
        }
    }, 1000);
}

// 添加动画样式
function addAnimationStyles() {
    // 检查是否已经添加过样式
    if (document.getElementById('animation-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
        @keyframes signal-move {
            0% { opacity: 0; transform: scale(0); }
            20% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.5); }
        }
        
        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes pulse-ring {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        
        @keyframes flow-glow {
            0% { 
                filter: drop-shadow(0 0 6px #00ff88);
                opacity: 0.8;
            }
            100% { 
                filter: drop-shadow(0 0 12px #00ff88);
                opacity: 1;
            }
        }
        
        .flow-dot {
            animation: flow-glow 0.5s ease-in-out infinite alternate;
        }
        
        .pulse-connection {
            stroke-dasharray: 10, 5;
            animation: dash 1s linear infinite;
        }
        
        @keyframes dash {
            to {
                stroke-dashoffset: -15;
            }
        }
        
        /* 连接线动画 */
        .connection-line {
            stroke: #3498db;
            stroke-width: 3;
            opacity: 0.4;
            transition: all 0.3s ease;
            filter: drop-shadow(0 0 4px rgba(52, 152, 219, 0.3));
            fill: none;
        }

        .connection-line.active {
            stroke: #e74c3c;
            stroke-width: 5;
            opacity: 1;
            animation: pulse-line 2s ease-in-out;
            filter: drop-shadow(0 0 12px rgba(231, 76, 60, 0.8));
        }

        @keyframes pulse-line {
            0%, 100% { 
                stroke-dasharray: 0, 1000; 
                opacity: 1;
            }
            50% { 
                stroke-dasharray: 1000, 0; 
                opacity: 0.8;
            }
        }
    `;
    document.head.appendChild(style);
} 