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
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
            </pattern>
        `;
        
        this.connectionsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.connectionsLayer.id = 'connections-layer';

        this.nodesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.nodesLayer.id = 'nodes-layer';
        
        this.worldGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.worldGroup.id = 'world-group';

        // Add background grid
        this.backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.backgroundRect.setAttribute('width', '100%');
        this.backgroundRect.setAttribute('height', '100%');
        this.backgroundRect.setAttribute('fill', 'url(#grid)');
        this.worldGroup.appendChild(this.backgroundRect);

        this.worldGroup.appendChild(this.connectionsLayer);
        this.worldGroup.appendChild(this.nodesLayer);

        this.svg.appendChild(defs);
        this.svg.appendChild(this.worldGroup);

        this.animationLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.animationLayer.id = 'animation-layer';
        this.worldGroup.appendChild(this.animationLayer);
    }

    render(state, particles = []) {
        this.worldGroup.setAttribute('transform', `translate(${state.transform.x}, ${state.transform.y}) scale(${state.transform.k})`);
        this.renderConnections(state.connections, state.nodes);
        this.renderNodes(state.nodes, state.selectedNodeId, state.selectedNodes);
        this.renderParticles(particles, state);
    }

    renderNodes(nodes, selectedNodeId, selectedNodes = new Set()) {
        this.nodesLayer.innerHTML = '';
        nodes.forEach(node => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('id', node.id);
            group.setAttribute('class', 'node-group');
            group.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
            
            // Enhanced selection styling
            if (node.id === selectedNodeId) {
                group.classList.add('selected');
            }
            if (selectedNodes.has(node.id)) {
                group.classList.add('multi-selected');
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

    renderConnections(connections, nodes) {
        this.connectionsLayer.innerHTML = '';
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        connections.forEach(conn => {
            const sourceNode = nodeMap.get(conn.source);
            const targetNode = nodeMap.get(conn.target);
            if (!sourceNode || !targetNode) return;
            
            const pathData = getConnectionPath(sourceNode, targetNode);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('stroke', 'var(--connection-color)');
            path.setAttribute('stroke-width', config.connection.width);
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', 'url(#arrowhead)');
            this.connectionsLayer.appendChild(path);
        });
    }

    renderParticles(particles, state) {
        this.animationLayer.innerHTML = '';
        if (!particles || particles.length === 0) return;

        const connectionMap = new Map(state.connections.map(c => [c.id, c]));

        particles.forEach(p => {
            const conn = connectionMap.get(p.connectionId);
            if (!conn) return;

            const pathElement = this.connectionsLayer.querySelector(`path[d="${getConnectionPath(state.nodes.find(n => n.id === conn.source), state.nodes.find(n => n.id === conn.target))}"]`);
            if (!pathElement) return; // Path element not found, or not rendered yet

            const pathLength = pathElement.getTotalLength();
            const point = pathElement.getPointAtLength(p.progress * pathLength);

            const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            particle.setAttribute('cx', point.x);
            particle.setAttribute('cy', point.y);
            particle.setAttribute('r', 4);
            particle.setAttribute('fill', 'var(--accent-color)');
            this.animationLayer.appendChild(particle);
        });
    }
}