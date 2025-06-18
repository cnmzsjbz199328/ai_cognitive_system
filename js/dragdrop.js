// ===========================================
// 拖拽系统模块 - 修复版本
// ===========================================

import { 
    isRunning, 
    isDragging, 
    getDragTarget, 
    getDragOffset,
    setIsDragging, 
    setDragTarget, 
    setDragOffset 
} from './config.js';
import { drawConnections } from './connections.js';

let dragUpdateTimeout = null; // 防抖更新连接线

// 设置拖拽功能
export function setupDragAndDrop() {
    console.log('🖱️ 初始化拖拽系统...');
    
    const modules = document.querySelectorAll('.module');
    
    modules.forEach(module => {
        module.addEventListener('mousedown', startDrag);
        module.addEventListener('touchstart', startDrag, { passive: false });
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    // 防止拖拽时选中文本
    document.addEventListener('selectstart', function(e) {
        if (isDragging()) {
            e.preventDefault();
        }
    });
    
    console.log('✅ 拖拽系统初始化完成');
}

// 获取容器缩放比例
function getContainerScale() {
    const container = document.querySelector('.container');
    if (!container) return { scaleX: 1, scaleY: 1 };
    
    const computedStyle = window.getComputedStyle(container);
    const transform = computedStyle.transform;
    
    if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            return {
                scaleX: values[0] || 1,
                scaleY: values[3] || 1
            };
        }
    }
    
    return { scaleX: 1, scaleY: 1 };
}

// 将鼠标坐标转换为容器内坐标
function convertToContainerCoords(clientX, clientY) {
    const container = document.querySelector('.container');
    if (!container) return { x: clientX, y: clientY };
    
    const containerRect = container.getBoundingClientRect();
    const scale = getContainerScale();
    
    // 计算相对于容器的坐标
    let x = clientX - containerRect.left;
    let y = clientY - containerRect.top;
    
    // 考虑缩放比例
    x = x / scale.scaleX;
    y = y / scale.scaleY;
    
    return { x, y };
}

// 开始拖拽
function startDrag(e) {
    if (isRunning()) return;
    
    setIsDragging(true);
    const target = e.target.closest('.module');
    setDragTarget(target);
    
    const dragTarget = getDragTarget();
    if (dragTarget) {
        dragTarget.classList.add('dragging');
        
        // 获取鼠标/触摸坐标
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        // 转换为容器坐标系
        const containerCoords = convertToContainerCoords(clientX, clientY);
        
        // 获取模块在容器内的位置
        const moduleRect = dragTarget.getBoundingClientRect();
        const container = document.querySelector('.container');
        const containerRect = container.getBoundingClientRect();
        const scale = getContainerScale();
        
        // 计算模块在容器坐标系中的位置
        const moduleX = (moduleRect.left - containerRect.left) / scale.scaleX;
        const moduleY = (moduleRect.top - containerRect.top) / scale.scaleY;
        
        // 计算偏移量
        setDragOffset({
            x: containerCoords.x - moduleX,
            y: containerCoords.y - moduleY
        });
        
        e.preventDefault();
    }
}

// 拖拽中
function drag(e) {
    if (!isDragging()) return;
    
    const dragTarget = getDragTarget();
    if (!dragTarget) return;
    
    // 获取鼠标/触摸坐标
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    // 转换为容器坐标系
    const containerCoords = convertToContainerCoords(clientX, clientY);
    const dragOffset = getDragOffset();
    
    // 计算新位置
    let newX = containerCoords.x - dragOffset.x;
    let newY = containerCoords.y - dragOffset.y;
    
    // 获取容器和模块尺寸
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    const moduleRect = dragTarget.getBoundingClientRect();
    const scale = getContainerScale();
    
    // 计算边界约束（在容器坐标系中）
    const containerWidth = containerRect.width / scale.scaleX;
    const containerHeight = containerRect.height / scale.scaleY;
    const moduleWidth = moduleRect.width / scale.scaleX;
    const moduleHeight = moduleRect.height / scale.scaleY;
    
    // 应用边界约束
    newX = Math.max(0, Math.min(newX, containerWidth - moduleWidth));
    newY = Math.max(0, Math.min(newY, containerHeight - moduleHeight));
    
    // 应用新位置
    dragTarget.style.left = newX + 'px';
    dragTarget.style.top = newY + 'px';
    dragTarget.style.right = 'auto';
    dragTarget.style.bottom = 'auto';
    dragTarget.style.transform = 'none';
    
    // 防抖更新连接线（避免过度重绘）
    if (dragUpdateTimeout) {
        clearTimeout(dragUpdateTimeout);
    }
    dragUpdateTimeout = setTimeout(() => {
        drawConnections();
    }, 10); // 10ms防抖
    
    e.preventDefault();
}

// 结束拖拽
function endDrag(e) {
    const dragTarget = getDragTarget();
    if (dragTarget) {
        dragTarget.classList.remove('dragging');
        setDragTarget(null);
        
        // 确保最终连接线更新
        if (dragUpdateTimeout) {
            clearTimeout(dragUpdateTimeout);
        }
        drawConnections();
    }
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
}

// 更新模块位置配置以匹配新布局
export function resetModulePositions() {
    console.log('🔄 重置模块位置...');
    
    const modules = document.querySelectorAll('.module');
    
    // 新的布局位置配置
    const defaultPositions = {
        'global-time': { top: '580px', left: '150px', transform: 'none' },
        'external-stimuli': { top: '180px', left: '150px', transform: 'none' },
        'perception': { top: '380px', left: '150px', transform: 'none' },
        'ai-cognitive': { top: '180px', left: '480px', transform: 'none' },
        'thinking-core': { top: '280px', left: '50%', transform: 'translateX(-50%)' },
        'personality': { top: '380px', left: '1180px', transform: 'none' },
        'skills': { top: '510px', left: '1180px', transform: 'none' },
        'needs': { top: '640px', left: '1180px', transform: 'none' },
        'planning': { top: '120px', left: '1180px', transform: 'none' },
        'relationship': { top: '250px', left: '1180px', transform: 'none' },
        'action-output': { top: '590px', left: '1580px', transform: 'translateX(-50%)' },
        'environment': { top: '580px', left: '480px', transform: 'none' },
        'memory': { top: '380px', left: '480px', transform: 'none' }
    };
    
    modules.forEach(module => {
        const position = defaultPositions[module.id];
        if (position) {
            module.style.top = position.top;
            module.style.left = position.left;
            module.style.transform = position.transform;
            module.style.right = 'auto';
            module.style.bottom = 'auto';
        }
    });
    
    // 重新绘制连接线
    setTimeout(() => {
        drawConnections();
    }, 100);
    
    console.log('✅ 模块位置重置完成');
}

// 检测模块碰撞
export function detectModuleCollision(movingModule) {
    const modules = document.querySelectorAll('.module');
    const movingRect = movingModule.getBoundingClientRect();
    
    for (let module of modules) {
        if (module === movingModule) continue;
        
        const rect = module.getBoundingClientRect();
        
        if (!(movingRect.right < rect.left || 
              movingRect.left > rect.right || 
              movingRect.bottom < rect.top || 
              movingRect.top > rect.bottom)) {
            return module; // 返回碰撞的模块
        }
    }
    
    return null; // 没有碰撞
}

// 自动排列模块（更新为新布局）
export function autoArrangeModules() {
    console.log('📐 自动排列模块...');
    
    const modules = document.querySelectorAll('.module');
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    
    // 新的分层排列配置
    const layers = [
        { modules: ['planning'], y: 120, x: 1180, centerAlign: false },
        { modules: ['external-stimuli', 'ai-cognitive'], y: 180, centerAlign: false },
        { modules: ['relationship'], y: 250, x: 1180, centerAlign: false },
        { modules: ['thinking-core'], y: 280, centerAlign: true },
        { modules: ['perception', 'memory', 'personality'], y: 380, centerAlign: false },
        { modules: ['skills'], y: 510, x: 1180, centerAlign: false },
        { modules: ['global-time', 'environment', 'action-output'], y: 580, centerAlign: false },
        { modules: ['needs'], y: 640, x: 1180, centerAlign: false }
    ];
    
    layers.forEach(layer => {
        const layerModules = layer.modules.map(id => document.getElementById(id)).filter(m => m);
        
        if (layer.centerAlign) {
            // 居中排列
            layerModules.forEach(module => {
                module.style.top = layer.y + 'px';
                module.style.left = '50%';
                module.style.transform = 'translateX(-50%)';
            });
        } else if (layer.x) {
            // 固定X位置
            layerModules.forEach(module => {
                module.style.top = layer.y + 'px';
                module.style.left = layer.x + 'px';
                module.style.transform = 'none';
            });
        } else {
            // 水平分布
            const positions = {
                'external-stimuli': 150,
                'ai-cognitive': 480,
                'perception': 150,
                'memory': 480,
                'personality': 1180,
                'global-time': 150,
                'environment': 480,
                'action-output': 1580
            };
            
            layerModules.forEach(module => {
                module.style.top = layer.y + 'px';
                const xPos = positions[module.id] || 150;
                if (module.id === 'action-output') {
                    module.style.left = xPos + 'px';
                    module.style.transform = 'translateX(-50%)';
                } else {
                    module.style.left = xPos + 'px';
                    module.style.transform = 'none';
                }
            });
        }
    });
    
    // 重新绘制连接线
    setTimeout(() => {
        drawConnections();
    }, 100);
    
    console.log('✅ 模块自动排列完成');
}

// 获取拖拽状态（调试用）
export function getDragState() {
    return {
        isDragging: isDragging(),
        dragTarget: getDragTarget(),
        dragOffset: getDragOffset(),
        containerScale: getContainerScale()
    };
} 