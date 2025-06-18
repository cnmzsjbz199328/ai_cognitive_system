// ===========================================
// 连接线系统模块
// ===========================================

import { 
    connections, 
    getConnectionMode, 
    getShowConnections,
    setShowConnections,
    setConnectionMode,
    getCurrentZoom
} from './config.js';

// 获取模块中心点（坐标补偿方案）
export function getModuleCenter(moduleId) {
    const module = document.getElementById(moduleId);
    if (!module) {
        console.warn(`Module ${moduleId} not found`);
        return { x: 0, y: 0 };
    }
    
    const rect = module.getBoundingClientRect();
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    
    // 计算相对于容器的中心点位置
    let centerX = rect.left - containerRect.left + rect.width / 2;
    let centerY = rect.top - containerRect.top + rect.height / 2;
    
    // 获取当前缩放比例并补偿坐标
    const containerStyle = window.getComputedStyle(container);
    const transform = containerStyle.transform;
    
    if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            const scaleX = values[0];
            const scaleY = values[3];
            
            // 将缩放后的坐标转换为SVG原始坐标系统
            centerX = centerX / scaleX;
            centerY = centerY / scaleY;
        }
    }
    
    return { x: centerX, y: centerY };
}

// 获取模块的4个锚点（智能连接系统）
export function getModuleAnchorPoints(moduleId) {
    const module = document.getElementById(moduleId);
    if (!module) {
        console.warn(`Module ${moduleId} not found`);
        return null;
    }
    
    const rect = module.getBoundingClientRect();
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    
    // 计算相对于容器的位置
    let moduleLeft = rect.left - containerRect.left;
    let moduleTop = rect.top - containerRect.top;
    let moduleWidth = rect.width;
    let moduleHeight = rect.height;
    
    // 获取当前缩放比例并补偿坐标
    const containerStyle = window.getComputedStyle(container);
    const transform = containerStyle.transform;
    
    if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            const scaleX = values[0];
            const scaleY = values[3];
            
            // 将缩放后的坐标转换为SVG原始坐标系统
            moduleLeft = moduleLeft / scaleX;
            moduleTop = moduleTop / scaleY;
            moduleWidth = moduleWidth / scaleX;
            moduleHeight = moduleHeight / scaleY;
        }
    }
    
    return {
        top: { 
            x: moduleLeft + moduleWidth / 2, 
            y: moduleTop, 
            direction: 'top' 
        },
        right: { 
            x: moduleLeft + moduleWidth, 
            y: moduleTop + moduleHeight / 2, 
            direction: 'right' 
        },
        bottom: { 
            x: moduleLeft + moduleWidth / 2, 
            y: moduleTop + moduleHeight, 
            direction: 'bottom' 
        },
        left: { 
            x: moduleLeft, 
            y: moduleTop + moduleHeight / 2, 
            direction: 'left' 
        }
    };
}

// 选择最佳连接锚点对 - 优化版本
export function selectBestAnchorPair(fromAnchors, toAnchors) {
    let bestPair = null;
    let bestScore = -1;
    
    // 计算两个模块的相对位置关系
    const fromCenter = { 
        x: (fromAnchors.left.x + fromAnchors.right.x) / 2,
        y: (fromAnchors.top.y + fromAnchors.bottom.y) / 2
    };
    const toCenter = { 
        x: (toAnchors.left.x + toAnchors.right.x) / 2,
        y: (toAnchors.top.y + toAnchors.bottom.y) / 2
    };
    
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 计算角度，确定主要方向
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    Object.entries(fromAnchors).forEach(([fromDir, fromAnchor]) => {
        Object.entries(toAnchors).forEach(([toDir, toAnchor]) => {
            const score = calculateConnectionScore(
                fromAnchor, toAnchor, fromDir, toDir, 
                dx, dy, angle, distance
            );
            
            if (score > bestScore) {
                bestScore = score;
                bestPair = { from: fromAnchor, to: toAnchor };
            }
        });
    });
    
    return bestPair || { 
        from: fromAnchors.right, 
        to: toAnchors.left 
    };
}

// 计算连接评分（分数越高越好）
function calculateConnectionScore(fromAnchor, toAnchor, fromDir, toDir, dx, dy, angle, totalDistance) {
    let score = 100; // 基础分数
    
    // 1. 几何方向匹配度（最重要的因素）
    const directionScore = calculateDirectionScore(fromDir, toDir, dx, dy, angle);
    score += directionScore * 50; // 权重最高
    
    // 2. 距离因素（距离越短越好，但不是唯一因素）
    const anchorDistance = Math.sqrt(
        Math.pow(toAnchor.x - fromAnchor.x, 2) + 
        Math.pow(toAnchor.y - fromAnchor.y, 2)
    );
    const distanceScore = Math.max(0, 100 - (anchorDistance / totalDistance) * 100);
    score += distanceScore * 20;
    
    // 3. 避免极端角度的连接
    const angleScore = calculateAngleScore(fromDir, toDir);
    score += angleScore * 15;
    
    // 4. 连接的自然性（相对位置匹配）
    const naturalScore = calculateNaturalScore(fromDir, toDir, dx, dy);
    score += naturalScore * 15;
    
    return score;
}

// 计算方向匹配评分
function calculateDirectionScore(fromDir, toDir, dx, dy, angle) {
    // 根据实际的几何位置关系给出评分
    const absAngle = Math.abs(angle);
    
    // 主要是水平关系
    if (Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx > 0) { // 目标在右边
            if (fromDir === 'right' && toDir === 'left') return 100; // 完美匹配
            if (fromDir === 'right' && (toDir === 'top' || toDir === 'bottom')) return 80;
            if ((fromDir === 'top' || fromDir === 'bottom') && toDir === 'left') return 80;
            if (fromDir === 'left' || toDir === 'right') return 0; // 不合理的方向
        } else { // 目标在左边
            if (fromDir === 'left' && toDir === 'right') return 100; // 完美匹配
            if (fromDir === 'left' && (toDir === 'top' || toDir === 'bottom')) return 80;
            if ((fromDir === 'top' || fromDir === 'bottom') && toDir === 'right') return 80;
            if (fromDir === 'right' || toDir === 'left') return 0; // 不合理的方向
        }
    }
    
    // 主要是垂直关系
    if (Math.abs(dy) > Math.abs(dx) * 1.5) {
        if (dy > 0) { // 目标在下方
            if (fromDir === 'bottom' && toDir === 'top') return 100; // 完美匹配
            if (fromDir === 'bottom' && (toDir === 'left' || toDir === 'right')) return 80;
            if ((fromDir === 'left' || fromDir === 'right') && toDir === 'top') return 80;
            if (fromDir === 'top' || toDir === 'bottom') return 0; // 不合理的方向
        } else { // 目标在上方
            if (fromDir === 'top' && toDir === 'bottom') return 100; // 完美匹配
            if (fromDir === 'top' && (toDir === 'left' || toDir === 'right')) return 80;
            if ((fromDir === 'left' || fromDir === 'right') && toDir === 'bottom') return 80;
            if (fromDir === 'bottom' || toDir === 'top') return 0; // 不合理的方向
        }
    }
    
    // 对角线关系
    if (dx > 0 && dy > 0) { // 右下方
        if ((fromDir === 'right' || fromDir === 'bottom') && 
            (toDir === 'left' || toDir === 'top')) return 90;
    } else if (dx > 0 && dy < 0) { // 右上方
        if ((fromDir === 'right' || fromDir === 'top') && 
            (toDir === 'left' || toDir === 'bottom')) return 90;
    } else if (dx < 0 && dy > 0) { // 左下方
        if ((fromDir === 'left' || fromDir === 'bottom') && 
            (toDir === 'right' || toDir === 'top')) return 90;
    } else if (dx < 0 && dy < 0) { // 左上方
        if ((fromDir === 'left' || fromDir === 'top') && 
            (toDir === 'right' || toDir === 'bottom')) return 90;
    }
    
    return 50; // 默认分数
}

// 计算角度合理性评分
function calculateAngleScore(fromDir, toDir) {
    // 避免180度对向连接（除非是合理的情况）
    const opposites = {
        'top': 'bottom',
        'bottom': 'top',
        'left': 'right',
        'right': 'left'
    };
    
    if (opposites[fromDir] === toDir) {
        return 30; // 降低对向连接的分数，但不完全禁止
    }
    
    // 同方向连接通常不太自然
    if (fromDir === toDir) {
        return 40;
    }
    
    return 70; // 其他角度连接
}

// 计算连接自然性评分
function calculateNaturalScore(fromDir, toDir, dx, dy) {
    // 检查连接方向是否与实际位置关系一致
    const directionMap = {
        'right': dx > 0,
        'left': dx < 0,
        'bottom': dy > 0,
        'top': dy < 0
    };
    
    let score = 50;
    
    // 起始方向与实际方向一致
    if (directionMap[fromDir]) {
        score += 25;
    }
    
    // 结束方向与实际方向相反（这是合理的）
    const oppositeMap = {
        'right': dx < 0,
        'left': dx > 0,
        'bottom': dy < 0,
        'top': dy > 0
    };
    
    if (oppositeMap[toDir]) {
        score += 25;
    }
    
    return score;
}

// 创建曲线路径
export function createCurvedPath(fromAnchor, toAnchor) {
    const dx = toAnchor.x - fromAnchor.x;
    const dy = toAnchor.y - fromAnchor.y;
    
    // 根据锚点方向计算控制点
    const controlDistance = Math.min(Math.abs(dx), Math.abs(dy)) * 0.6;
    
    let cp1x = fromAnchor.x;
    let cp1y = fromAnchor.y;
    let cp2x = toAnchor.x;
    let cp2y = toAnchor.y;
    
    // 根据起始锚点方向设置第一个控制点
    switch (fromAnchor.direction) {
        case 'top': cp1y -= controlDistance; break;
        case 'bottom': cp1y += controlDistance; break;
        case 'left': cp1x -= controlDistance; break;
        case 'right': cp1x += controlDistance; break;
    }
    
    // 根据结束锚点方向设置第二个控制点
    switch (toAnchor.direction) {
        case 'top': cp2y -= controlDistance; break;
        case 'bottom': cp2y += controlDistance; break;
        case 'left': cp2x -= controlDistance; break;
        case 'right': cp2x += controlDistance; break;
    }
    
    return `M ${fromAnchor.x} ${fromAnchor.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toAnchor.x} ${toAnchor.y}`;
}

// 创建直角路径
export function createOrthogonalPath(fromAnchor, toAnchor) {
    const midX = (fromAnchor.x + toAnchor.x) / 2;
    const midY = (fromAnchor.y + toAnchor.y) / 2;
    
    let path = `M ${fromAnchor.x} ${fromAnchor.y}`;
    
    // 根据锚点方向创建直角路径
    if (fromAnchor.direction === 'right' || fromAnchor.direction === 'left') {
        if (toAnchor.direction === 'top' || toAnchor.direction === 'bottom') {
            path += ` L ${toAnchor.x} ${fromAnchor.y} L ${toAnchor.x} ${toAnchor.y}`;
        } else {
            path += ` L ${midX} ${fromAnchor.y} L ${midX} ${toAnchor.y} L ${toAnchor.x} ${toAnchor.y}`;
        }
    } else {
        if (toAnchor.direction === 'left' || toAnchor.direction === 'right') {
            path += ` L ${fromAnchor.x} ${toAnchor.y} L ${toAnchor.x} ${toAnchor.y}`;
        } else {
            path += ` L ${fromAnchor.x} ${midY} L ${toAnchor.x} ${midY} L ${toAnchor.x} ${toAnchor.y}`;
        }
    }
    
    return path;
}

// 绘制连接线
export function drawConnections() {
    const svg = document.getElementById('connections-svg');
    if (!svg) return;
    
    svg.innerHTML = '';
    
    if (!getShowConnections()) return;
    
    const currentMode = getConnectionMode();
    
    connections.forEach(([from, to], index) => {
        try {
            let pathData;
            
            if (currentMode === 'curved') {
                // 智能连接模式：使用锚点
                const fromAnchors = getModuleAnchorPoints(from);
                const toAnchors = getModuleAnchorPoints(to);
                
                if (fromAnchors && toAnchors) {
                    const bestPair = selectBestAnchorPair(fromAnchors, toAnchors);
                    pathData = createCurvedPath(bestPair.from, bestPair.to);
                } else {
                    // 降级到中心点连接
                    const fromCenter = getModuleCenter(from);
                    const toCenter = getModuleCenter(to);
                    pathData = `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`;
                }
            } else {
                // 直角连接模式
                const fromAnchors = getModuleAnchorPoints(from);
                const toAnchors = getModuleAnchorPoints(to);
                
                if (fromAnchors && toAnchors) {
                    const bestPair = selectBestAnchorPair(fromAnchors, toAnchors);
                    pathData = createOrthogonalPath(bestPair.from, bestPair.to);
                } else {
                    // 降级到中心点连接
                    const fromCenter = getModuleCenter(from);
                    const toCenter = getModuleCenter(to);
                    pathData = `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`;
                }
            }
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('class', 'connection-line');
            path.setAttribute('id', `connection-${from}-${to}`);
            
            svg.appendChild(path);
        } catch (error) {
            console.error(`Error drawing connection ${from}-${to}:`, error);
        }
    });
}

// 强制重绘连接线
export function forceDrawConnections() {
    setTimeout(() => {
        drawConnections();
    }, 10);
}

// 添加锚点可视化调试
export function addAnchorPointVisualization(svg, anchor, color = '#ff0000') {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', anchor.x);
    circle.setAttribute('cy', anchor.y);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', color);
    circle.setAttribute('opacity', '0.8');
    circle.setAttribute('class', 'anchor-point');
    svg.appendChild(circle);
}

// 切换连接模式
export function toggleConnectionMode() {
    const currentMode = getConnectionMode();
    const newMode = currentMode === 'curved' ? 'orthogonal' : 'curved';
    setConnectionMode(newMode);
    drawConnections();
    
    const button = document.getElementById('mode-toggle');
    if (button) {
        button.textContent = newMode === 'curved' ? '切换为直角' : '切换为曲线';
    }
    
    console.log(`连接模式已切换为: ${newMode}`);
}

// 切换锚点显示
export function toggleAnchorPoints() {
    const svg = document.getElementById('connections-svg');
    const anchors = svg.querySelectorAll('.anchor-point');
    
    if (anchors.length > 0) {
        // 隐藏锚点
        anchors.forEach(anchor => anchor.remove());
    } else {
        // 显示锚点
        connections.forEach(([from, to]) => {
            const fromAnchors = getModuleAnchorPoints(from);
            const toAnchors = getModuleAnchorPoints(to);
            
            if (fromAnchors) {
                Object.values(fromAnchors).forEach(anchor => {
                    addAnchorPointVisualization(svg, anchor, '#00ff00');
                });
            }
            
            if (toAnchors) {
                Object.values(toAnchors).forEach(anchor => {
                    addAnchorPointVisualization(svg, anchor, '#0099ff');
                });
            }
        });
    }
}

// 切换连接线显示
export function toggleConnections() {
    const currentState = getShowConnections();
    const newState = !currentState;
    setShowConnections(newState);
    
    const button = document.getElementById('connections-toggle');
    
    if (newState) {
        button.textContent = '隐藏连接线';
        button.classList.remove('active');
        drawConnections();
    } else {
        button.textContent = '显示连接线';
        button.classList.add('active');
        document.getElementById('connections-svg').innerHTML = '';
    }
} 