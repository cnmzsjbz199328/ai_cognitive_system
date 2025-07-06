import { config } from './config.js';
import { getConnectionPath } from './utils.js';

export class Renderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.svg.innerHTML = '';

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5"
                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--connection-color)" />
            </marker>
            
            <!-- Grid pattern for visual alignment -->
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path class="grid-line" d="M 0 0 L 20 0 M 0 0 L 0 20" fill="none" stroke-width="0.5"/>
            </pattern>
        `;
        
        // Static background layer that does not move with the world
        this.backgroundLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.backgroundLayer.id = 'background-layer';
        this.backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.backgroundRect.setAttribute('width', '100%');
        this.backgroundRect.setAttribute('height', '100%');
        this.backgroundRect.setAttribute('fill', 'url(#grid)');
        this.backgroundLayer.appendChild(this.backgroundRect);

        this.connectionsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.connectionsLayer.id = 'connections-layer';

        this.nodesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.nodesLayer.id = 'nodes-layer';
        
        this.worldGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.worldGroup.id = 'world-group';

        // Add background grid
        this.svg.appendChild(this.backgroundLayer); // Add static background first

        this.worldGroup.appendChild(this.connectionsLayer);
        this.worldGroup.appendChild(this.nodesLayer);

        this.svg.appendChild(defs);
        this.svg.appendChild(this.worldGroup);

        this.animationLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.animationLayer.id = 'animation-layer';
        this.worldGroup.appendChild(this.animationLayer);

        // 关键备注：添加连接跟踪Map，用于高效管理连接元素
        this.renderedConnections = new Map();
    }

    render(state, particles = []) {
        this.worldGroup.setAttribute('transform', `translate(${state.transform.x}, ${state.transform.y}) scale(${state.transform.k})`);
        this.updateGridPattern(state.transform);
        this.renderConnections(state);
        this.renderNodes(state);
        this.renderParticles(particles, state);
    }

    updateGridPattern({ x, y, k }) {
        const gridPattern = this.svg.getElementById('grid');
        if (gridPattern) {
            const baseSize = 20;
            const scaledSize = baseSize * k;
            gridPattern.setAttribute('x', x % scaledSize);
            gridPattern.setAttribute('y', y % scaledSize);
            gridPattern.setAttribute('width', scaledSize);
            gridPattern.setAttribute('height', scaledSize);

            const path = gridPattern.querySelector('.grid-line');
            if (path) {
                path.setAttribute('d', `M ${scaledSize} 0 L 0 0 0 ${scaledSize}`);
                path.setAttribute('stroke-width', 0.5 * Math.max(1, k * 0.5)); // Keep line thin but visible
            }
        }
    }

    renderNodes(state) {
        this.nodesLayer.innerHTML = '';
        state.nodes.forEach(node => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('id', node.id);
            group.setAttribute('class', 'node-group');
            group.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
            
            // Apply selection and proximity classes based on state
            if (node.id === state.selectedNodeId) {
                group.classList.add('selected');
            }
            if (state.selectedNodes.has(node.id)) {
                group.classList.add('multi-selected');
            }
            if (node.id === state.proximityNodeId) {
                group.classList.add('show-anchors');
            }

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', config.node.width);
            rect.setAttribute('height', config.node.height);
            rect.setAttribute('rx', 8);
            rect.setAttribute('fill', 'var(--node-bg-color)');
            rect.setAttribute('stroke', 'var(--node-border-color)');
            rect.setAttribute('stroke-width', 2);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', config.node.width / 2);
            text.setAttribute('y', config.node.height / 2);
            text.setAttribute('dy', '0.35em');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--text-color)');
            text.style.pointerEvents = 'none';
            text.textContent = node.label;

            group.appendChild(rect);
            group.appendChild(text);

            // Enhanced anchor points with better visibility
            const anchorPositions = [
                { x: config.node.width / 2, y: 0 },
                { x: config.node.width, y: config.node.height / 2 },
                { x: config.node.width / 2, y: config.node.height },
                { x: 0, y: config.node.height / 2 }
            ];
    
            anchorPositions.forEach(pos => {
                const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                anchor.setAttribute('class', 'anchor-point');
                anchor.setAttribute('cx', pos.x);
                anchor.setAttribute('cy', pos.y);
                anchor.setAttribute('r', 5);
                group.appendChild(anchor);
            });

            this.nodesLayer.appendChild(group);
        });
    }

    renderConnections(state) {
        const { connections, nodes } = state;
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const currentConnectionIds = new Set();

        connections.forEach(conn => {
            currentConnectionIds.add(conn.id);
            const sourceNode = nodeMap.get(conn.source);
            const targetNode = nodeMap.get(conn.target);
            if (!sourceNode || !targetNode) return;

            const pathData = getConnectionPath(sourceNode, targetNode);

            if (this.renderedConnections.has(conn.id)) {
                // 关键备注：更新现有连接，不触发动画
                const path = this.renderedConnections.get(conn.id);
                path.setAttribute('d', pathData);
                this.updateConnectionAnimation(path, state.animationMode);
            } else {
                // 关键备注：创建新连接并添加动画
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('id', conn.id);
                path.setAttribute('d', pathData);
                path.setAttribute('class', 'connection');
                path.setAttribute('marker-end', 'url(#arrowhead)');
                
                this.connectionsLayer.appendChild(path);
                
                // Set animation class before triggering draw animation
                this.updateConnectionAnimation(path, state.animationMode);

                // 关键备注：计算路径长度并设置动画参数
                const pathLength = path.getTotalLength();
                path.style.strokeDasharray = pathLength;
                path.style.strokeDashoffset = pathLength;
                path.classList.add('connection-new');

                // 关键备注：动画结束后清理样式，防止重复动画
                setTimeout(() => {
                    path.classList.remove('connection-new');
                    path.style.strokeDasharray = '';
                    path.style.strokeDashoffset = '';
                }, 800); // 与CSS动画时长匹配

                this.renderedConnections.set(conn.id, path);
            }
        });

        // 关键备注：移除已删除的连接
        for (const [id, path] of this.renderedConnections.entries()) {
            if (!currentConnectionIds.has(id)) {
                this.connectionsLayer.removeChild(path);
                this.renderedConnections.delete(id);
            }
        }
    }

    updateConnectionAnimation(pathElement, mode) {
        // No-op for now, can be used for future CSS-based mode changes.
    }

    renderParticles(particles, state) {
        this.animationLayer.innerHTML = '';
        if (!particles || particles.length === 0) return;

        const connectionMap = new Map(state.connections.map(c => [c.id, c]));
        const nodeMap = new Map(state.nodes.map(n => [n.id, n]));

        particles.forEach(p => {
            // 关键备注：只渲染在可视范围内的粒子，提高性能。
            if (p.progress < 0 || p.progress > 1) return;

            const conn = connectionMap.get(p.connectionId);
            if (!conn) return;

            const pathElement = this.renderedConnections.get(conn.id);
            if (!pathElement) return;

            const pathLength = pathElement.getTotalLength();
            const point = pathElement.getPointAtLength(p.progress * pathLength);

            const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            
            // 关键备注：根据当前的动画模式选择不同的渲染逻辑。
            switch (state.animationMode) {
                case 'classic':
                    particle.setAttribute('r', p.isHead ? 6 : 3);
                    particle.setAttribute('fill', 'var(--accent-color)');
                    particle.setAttribute('filter', 'drop-shadow(0 0 4px var(--accent-color))');
                    particle.style.opacity = p.isHead ? 1 : 0.6;
                    break;
                
                case 'minimal':
                default:
                    particle.setAttribute('r', p.isHead ? 3 : 1.5);
                    particle.setAttribute('fill', 'var(--text-color)');
                    break;
            }
            
            particle.setAttribute('cx', point.x);
            particle.setAttribute('cy', point.y);
            this.animationLayer.appendChild(particle);

            // 经典模式下的节点脉冲效果
            if (state.animationMode === 'classic' && p.isHead) {
                const sourceNode = nodeMap.get(conn.source);
                if (sourceNode) {
                    // 关键备注：创建矩形脉冲以匹配节点形状。
                    const pulseRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    const expansion = 20;
                    
                    // 初始状态与节点相同
                    pulseRect.setAttribute('x', sourceNode.position.x);
                    pulseRect.setAttribute('y', sourceNode.position.y);
                    pulseRect.setAttribute('width', config.node.width);
                    pulseRect.setAttribute('height', config.node.height);
                    pulseRect.setAttribute('rx', 8); // 保持圆角
                    pulseRect.setAttribute('fill', 'none');
                    pulseRect.setAttribute('stroke', 'var(--accent-color)');
                    pulseRect.setAttribute('stroke-width', '2');

                    // 动画定义
                    const dur = '0.7s';
                    const animateX = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    animateX.setAttribute('attributeName', 'x');
                    animateX.setAttribute('from', sourceNode.position.x);
                    animateX.setAttribute('to', sourceNode.position.x - expansion);
                    animateX.setAttribute('dur', dur);

                    const animateY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    animateY.setAttribute('attributeName', 'y');
                    animateY.setAttribute('from', sourceNode.position.y);
                    animateY.setAttribute('to', sourceNode.position.y - expansion);
                    animateY.setAttribute('dur', dur);

                    const animateW = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    animateW.setAttribute('attributeName', 'width');
                    animateW.setAttribute('from', config.node.width);
                    animateW.setAttribute('to', config.node.width + expansion * 2);
                    animateW.setAttribute('dur', dur);

                    const animateH = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    animateH.setAttribute('attributeName', 'height');
                    animateH.setAttribute('from', config.node.height);
                    animateH.setAttribute('to', config.node.height + expansion * 2);
                    animateH.setAttribute('dur', dur);

                    const animateOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    animateOpacity.setAttribute('attributeName', 'opacity');
                    animateOpacity.setAttribute('from', '1');
                    animateOpacity.setAttribute('to', '0');
                    animateOpacity.setAttribute('dur', dur);

                    pulseRect.appendChild(animateX);
                    pulseRect.appendChild(animateY);
                    pulseRect.appendChild(animateW);
                    pulseRect.appendChild(animateH);
                    pulseRect.appendChild(animateOpacity);
                    this.animationLayer.appendChild(pulseRect);

                    // 动画结束后移除元素
                    setTimeout(() => {
                        if (pulseRect.parentNode) {
                            this.animationLayer.removeChild(pulseRect)
                        }
                    }, 700);
                 }
            }
        });
    }
}