/* --- CONFIG --- */
const config = {
    node: {
        width: 150,
        height: 60,
    },
    connection: {
        color: 'var(--connection-color)',
        width: 2,
    },
};

/* --- STATE --- */
const state = {
    nodes: [],
    connections: [],
    transform: {
        x: 0,
        y: 0,
        k: 1,
    },
};

/* --- RENDERER --- */
class Renderer {
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
    }

    render(state) {
        this.worldGroup.setAttribute('transform', `translate(${state.transform.x}, ${state.transform.y}) scale(${state.transform.k})`);
        this.renderConnections(state.connections, state.nodes);
        this.renderNodes(state.nodes);
    }

    renderNodes(nodes) {
        this.nodesLayer.innerHTML = '';
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
        this.connectionsLayer.innerHTML = '';
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        connections.forEach(conn => {
            const sourceNode = nodeMap.get(conn.source);
            const targetNode = nodeMap.get(conn.target);
            if (!sourceNode || !targetNode) return;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', sourceNode.position.x + config.node.width / 2);
            line.setAttribute('y1', sourceNode.position.y + config.node.height / 2);
            line.setAttribute('x2', targetNode.position.x + config.node.width / 2);
            line.setAttribute('y2', targetNode.position.y + config.node.height / 2);
            line.setAttribute('stroke', 'var(--connection-color)');
            line.setAttribute('stroke-width', config.connection.width);
            line.setAttribute('marker-end', 'url(#arrowhead)');
            this.connectionsLayer.appendChild(line);
        });
    }
}

/* --- DRAG DROP MANAGER --- */
class DragDropManager {
    constructor(state, renderer) {
        this.state = state;
        this.renderer = renderer;
        this.isDraggingNode = false;
        this.isPanning = false;
        this.draggedNode = null;
        this.offset = { x: 0, y: 0 };
        this.panStart = { x: 0, y: 0 };
    }

    initialize() {
        this.renderer.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.renderer.svg.style.cursor = 'grab';
    }

    onMouseDown(e) {
        const targetElement = e.target.closest('.node-group');
        if (targetElement) {
            this.isDraggingNode = true;
            this.draggedNode = this.state.nodes.find(n => n.id === targetElement.id);
            if (!this.draggedNode) return;
            
            const point = this.getTransformedPoint(e);
            this.offset.x = point.x - this.draggedNode.position.x;
            this.offset.y = point.y - this.draggedNode.position.y;

        } else if (e.target === this.renderer.svg || e.target === this.renderer.worldGroup) {
            this.isPanning = true;
            this.panStart.x = e.clientX - this.state.transform.x;
            this.panStart.y = e.clientY - this.state.transform.y;
            this.renderer.svg.style.cursor = 'grabbing';
        }
    }

    onMouseMove(e) {
        if (this.isDraggingNode && this.draggedNode) {
            const point = this.getTransformedPoint(e);
            this.draggedNode.position.x = point.x - this.offset.x;
            this.draggedNode.position.y = point.y - this.offset.y;
        } else if (this.isPanning) {
            this.state.transform.x = e.clientX - this.panStart.x;
            this.state.transform.y = e.clientY - this.panStart.y;
        }
    }

    onMouseUp(e) {
        this.isDraggingNode = false;
        this.isPanning = false;
        this.draggedNode = null;
        this.renderer.svg.style.cursor = 'grab';
    }

    getTransformedPoint(e) {
        const point = this.getSVGPoint(e);
        const { x, y, k } = this.state.transform;
        return {
            x: (point.x - x) / k,
            y: (point.y - y) / k,
        };
    }

    getSVGPoint(e) {
        const pt = this.renderer.svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        return pt.matrixTransform(this.renderer.svg.getScreenCTM().inverse());
    }
}

/* --- APP --- */
class App {
    constructor() {
        this.svg = document.getElementById('main-svg');
        this.renderer = new Renderer(this.svg);
        this.dragDropManager = new DragDropManager(state, this.renderer);
    }

    async init() {
        await this.loadData();
        this.dragDropManager.initialize();
        this.startRenderLoop();
    }

    startRenderLoop() {
        const loop = () => {
            this.renderer.render(state);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    async loadData() {
        try {
            const response = await fetch('src/data/flow.json');
            const data = await response.json();
            state.nodes = data.nodes;
            state.connections = data.connections;
        } catch (error) {
            console.error("Could not load flow data:", error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
}); 