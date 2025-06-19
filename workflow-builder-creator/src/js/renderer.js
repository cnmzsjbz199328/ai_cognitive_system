import { config } from './config.js';

export class Renderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.svg.innerHTML = ''; // Clear previous content

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
    }

    render(state) {
        this.worldGroup.setAttribute('transform', `translate(${state.transform.x}, ${state.transform.y}) scale(${state.transform.k})`);
        this.renderConnections(state.connections, state.nodes);
        this.renderNodes(state.nodes);
    }

    renderNodes(nodes) {
        this.nodesLayer.innerHTML = ''; // Clear previous nodes
        nodes.forEach(node => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('id', node.id);
            group.setAttribute('class', 'node-group');
            group.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
            
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
            this.nodesLayer.appendChild(group);
        });
    }

    renderConnections(connections, nodes) {
        this.connectionsLayer.innerHTML = ''; // Clear previous connections
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        connections.forEach(conn => {
            const sourceNode = nodeMap.get(conn.source);
            const targetNode = nodeMap.get(conn.target);

            if (!sourceNode || !targetNode) return;

            const x1 = sourceNode.position.x + config.node.width / 2;
            const y1 = sourceNode.position.y + config.node.height / 2;
            const x2 = targetNode.position.x + config.node.width / 2;
            const y2 = targetNode.position.y + config.node.height / 2;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', 'var(--connection-color)');
            line.setAttribute('stroke-width', config.connection.width);
            line.setAttribute('marker-end', 'url(#arrowhead)');

            this.connectionsLayer.appendChild(line);
        });
    }
} 