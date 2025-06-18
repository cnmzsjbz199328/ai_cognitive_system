// ===========================================
// 缩放系统模块
// ===========================================

import { 
    getCurrentZoom, 
    getAutoResponsiveZoom, 
    zoomConfig,
    setCurrentZoom, 
    setAutoResponsiveZoom 
} from './config.js';
import { drawConnections } from './connections.js';

// 初始化缩放系统
export function initializeZoomSystem() {
    console.log('🔍 初始化缩放系统...');
    
    initZoomControls();
    createOrientationHint();
    addControlHint();
    setupResizeListener();
    setupOrientationListener();
    
    // 初始化响应式布局
    setTimeout(() => {
        handleResponsiveLayout();
        syncSVGScale();
        checkOrientation();
    }, 100);
    
    console.log('✅ 缩放系统初始化完成');
}

// 初始化缩放控制器
export function initZoomControls() {
    // 检查是否已存在缩放控制器
    if (document.getElementById('zoom-controls')) {
        return;
    }
    
    // 创建缩放控制器
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.id = 'zoom-controls';
    
    // 放大按钮
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'zoom-btn';
    zoomInBtn.innerHTML = '+';
    zoomInBtn.title = 'Zoom In';
    zoomInBtn.onclick = () => zoomIn();
    
    // 缩放指示器
    const zoomIndicator = document.createElement('div');
    zoomIndicator.className = 'zoom-indicator';
    zoomIndicator.id = 'zoom-indicator';
    zoomIndicator.textContent = '100%';
    
    // 缩小按钮
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'zoom-btn';
    zoomOutBtn.innerHTML = '−';
    zoomOutBtn.title = 'Zoom Out';
    zoomOutBtn.onclick = () => zoomOut();
    
    // 重置按钮
    const zoomResetBtn = document.createElement('button');
    zoomResetBtn.className = 'zoom-btn';
    zoomResetBtn.innerHTML = '⌂';
    zoomResetBtn.title = 'Reset Zoom';
    zoomResetBtn.onclick = () => resetZoom();
    
    zoomControls.appendChild(zoomInBtn);
    zoomControls.appendChild(zoomIndicator);
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomResetBtn);
    
    document.body.appendChild(zoomControls);
}

// 放大
export function zoomIn() {
    const currentZoom = getCurrentZoom();
    if (currentZoom < zoomConfig.max) {
        setCurrentZoom(currentZoom + zoomConfig.step);
        applyZoom();
    }
}

// 缩小
export function zoomOut() {
    const currentZoom = getCurrentZoom();
    if (currentZoom > zoomConfig.min) {
        setCurrentZoom(currentZoom - zoomConfig.step);
        applyZoom();
    }
}

// 重置缩放
export function resetZoom() {
    console.log('🔄 执行缩放重置...');
    resetZoomState();
}

// 重置缩放状态（修复累积错误）
export function resetZoomState() {
    const container = document.querySelector('.container');
    const svg = document.getElementById('connections-svg');
    
    if (container && svg) {
        // 清除所有变换
        container.style.transform = '';
        svg.style.transform = '';
        
        // 重置缩放变量
        setCurrentZoom(zoomConfig.default);
        setAutoResponsiveZoom(true);
        
        // 更新显示
        const indicator = document.getElementById('zoom-indicator');
        if (indicator) {
            indicator.textContent = '100%';
        }
        
        // 重新应用当前应该的缩放
        setTimeout(() => {
            handleResponsiveLayout();
            drawConnections();
        }, 100);
        
        console.log('✅ 缩放状态已重置');
    }
}

// SVG同步缩放函数（不缩放SVG，保持原始坐标系统）
export function syncSVGScale() {
    const container = document.querySelector('.container');
    const svg = document.getElementById('connections-svg');
    
    if (!container || !svg) {
        console.warn('容器或SVG元素未找到');
        return;
    }
    
    // 确保SVG不被缩放，保持原始坐标系统
    svg.style.transform = '';
    svg.style.transformOrigin = '';
    
    console.log('SVG保持原始大小，使用坐标补偿系统');
}

// 应用缩放
export function applyZoom() {
    const container = document.querySelector('.container');
    if (container) {
        const currentZoom = getCurrentZoom();
        
        // 禁用自动响应式缩放
        setAutoResponsiveZoom(false);
        
        // 添加缩放动画类
        container.classList.add('zooming');
        
        // 应用缩放
        container.style.transform = `scale(${currentZoom / 100})`;
        
        // 同步SVG缩放
        syncSVGScale();
        
        // 更新缩放指示器
        const indicator = document.getElementById('zoom-indicator');
        if (indicator) {
            indicator.textContent = `${currentZoom}%`;
        }
        
        // 移除动画类
        setTimeout(() => {
            container.classList.remove('zooming');
        }, 500);
        
        // 重新绘制连接线
        setTimeout(() => {
            drawConnections();
        }, 100);
    }
}

// 响应式检测和处理
export function handleResponsiveLayout() {
    if (!getAutoResponsiveZoom()) return;
    
    const width = window.innerWidth;
    const container = document.querySelector('.container');
    
    if (container) {
        // 移除所有缩放类
        container.className = container.className.replace(/zoom-\d+/g, '');
        
        // 根据屏幕宽度应用不同缩放
        const breakpoint = zoomConfig.responsive.breakpoints.find(bp => width <= bp.width);
        if (breakpoint) {
            container.style.transform = `scale(${breakpoint.zoom / 100})`;
            setCurrentZoom(breakpoint.zoom);
        }
        
        // 同步SVG缩放
        syncSVGScale();
        
        // 更新缩放指示器
        const indicator = document.getElementById('zoom-indicator');
        if (indicator) {
            indicator.textContent = `${getCurrentZoom()}%`;
        }
    }
}

// 创建屏幕方向提示
export function createOrientationHint() {
    // 检查是否已存在
    if (document.getElementById('orientation-hint')) {
        return;
    }
    
    const hint = document.createElement('div');
    hint.className = 'orientation-hint';
    hint.id = 'orientation-hint';
    hint.innerHTML = `
        <h3>📱 建议横屏查看</h3>
        <p>为了最佳体验，请将设备旋转至横屏模式</p>
    `;
    document.body.appendChild(hint);
}

// 检查屏幕方向
export function checkOrientation() {
    const hint = document.getElementById('orientation-hint');
    if (window.innerWidth < 900 && window.innerHeight > window.innerWidth) {
        if (hint) {
            hint.classList.add('show');
        }
    } else {
        if (hint) {
            hint.classList.remove('show');
        }
    }
}

// 添加控制提示
export function addControlHint() {
    // 检查是否已存在
    if (document.getElementById('zoom-control-hint')) {
        return;
    }
    
    const hint = document.createElement('div');
    hint.id = 'zoom-control-hint';
    hint.style.cssText = `
        position: fixed; bottom: 80px; right: 20px; 
        font-size: 12px; color: #7f8c8d; opacity: 0.8;
        text-align: center; max-width: 80px; z-index: 140;
    `;
    hint.textContent = '缩放控制';
    document.body.appendChild(hint);
}

// 调试缩放状态
export function debugZoomState() {
    const state = {
        currentZoom: getCurrentZoom(),
        autoResponsiveZoom: getAutoResponsiveZoom(),
        windowSize: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        containerTransform: document.querySelector('.container')?.style.transform || 'none',
        svgTransform: document.getElementById('connections-svg')?.style.transform || 'none'
    };
    
    console.log('🔍 缩放系统状态调试:', state);
    return state;
}

// 设置窗口大小变化监听器
export function setupResizeListener() {
    window.addEventListener('resize', () => {
        setTimeout(() => {
            handleResponsiveLayout();
            syncSVGScale();
            checkOrientation();
            drawConnections();
        }, 100);
    });
}

// 设置方向变化监听器
export function setupOrientationListener() {
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            handleResponsiveLayout();
            syncSVGScale();
            checkOrientation();
            drawConnections();
        }, 300);
    });
} 