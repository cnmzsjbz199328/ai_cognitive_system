import { config } from './config.js';

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
        `;
        
        this.connectionsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.connectionsLayer.id = 'connections-layer';

        this.nodesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.nodesLayer.id = 'nodes-layer';
        
        this.worldGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.worldGroup.id = 'world-group';

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
        this.renderNodes(state.nodes, state.selectedNodeId);
        this.renderParticles(particles, state);
    }

    renderNodes(nodes, selectedNodeId) {
        this.nodesLayer.innerHTML = '';
        nodes.forEach(node => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('id', node.id);
            group.setAttribute('class', 'node-group');
            group.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
            
            if (node.id === selectedNodeId) {
                group.classList.add('selected');
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
            
            const pathData = this.getConnectionPath(sourceNode, targetNode);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('stroke', 'var(--connection-color)');
            path.setAttribute('stroke-width', config.connection.width);
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', 'url(#arrowhead)');
            this.connectionsLayer.appendChild(path);
        });
    }

    // Helper to calculate path data for a cubic Bézier curve
    getConnectionPath(sourceNode, targetNode) {
        const startX = sourceNode.position.x + config.node.width / 2;
        const startY = sourceNode.position.y + config.node.height / 2;
        const endX = targetNode.position.x + config.node.width / 2;
        const endY = targetNode.position.y + config.node.height / 2;

        // Control points for a smooth curve. Adjust these values for different curve shapes.
        // Here, we create horizontal control points for a smooth S-curve or straight line.
        const controlPointOffset = 100; // Adjust this value to change the curve intensity

        const cp1x = startX + controlPointOffset;
        const cp1y = startY;
        const cp2x = endX - controlPointOffset;
        const cp2y = endY;

        return `M${startX},${startY} C${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
    }

    renderParticles(particles, state) {
        this.animationLayer.innerHTML = '';
        if (!particles || particles.length === 0) return;

        const connectionMap = new Map(state.connections.map(c => [c.id, c]));

        particles.forEach(p => {
            const conn = connectionMap.get(p.connectionId);
            if (!conn) return;

            const pathElement = this.connectionsLayer.querySelector(`path[d="${this.getConnectionPath(state.nodes.find(n => n.id === conn.source), state.nodes.find(n => n.id === conn.target))}"]`);
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