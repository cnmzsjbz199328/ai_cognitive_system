import { config } from './config.js';

export class InteractionManager {
    constructor(state, renderer) {
        this.state = state;
        this.renderer = renderer;
        this.isDraggingNode = false;
        this.isPanning = false;
        this.draggedNode = null;
        this.offset = { x: 0, y: 0 };
        this.panStart = { x: 0, y: 0 };

        // For creating connections
        this.isConnecting = false;
        this.connectionStartNodeId = null;
        this.previewLine = null;
    }

    initialize() {
        this.renderer.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        this.renderer.svg.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        this.renderer.svg.style.cursor = 'grab';
    }

    onMouseDown(e) {
        if (e.target.classList.contains('anchor-point')) {
            e.stopPropagation();
            this.isConnecting = true;
            this.connectionStartNodeId = e.target.closest('.node-group').id;
            
            const startPoint = this.getTransformedPoint(e);
            
            this.previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            this.previewLine.setAttribute('x1', startPoint.x);
            this.previewLine.setAttribute('y1', startPoint.y);
            this.previewLine.setAttribute('x2', startPoint.x);
            this.previewLine.setAttribute('y2', startPoint.y);
            this.previewLine.setAttribute('stroke', 'var(--connection-color)');
            this.previewLine.setAttribute('stroke-width', config.connection.width);
            this.previewLine.setAttribute('stroke-dasharray', '5,5');
            this.renderer.worldGroup.appendChild(this.previewLine);
            return;
        }

        const targetElement = e.target.closest('.node-group');
        if (e.button === 0 && targetElement) { // Left-click on node
            this.state.selectedNodeId = targetElement.id;
            this.isDraggingNode = true;
            this.draggedNode = this.state.nodes.find(n => n.id === targetElement.id);
            if (!this.draggedNode) return;
            
            const point = this.getTransformedPoint(e);
            this.offset.x = point.x - this.draggedNode.position.x;
            this.offset.y = point.y - this.draggedNode.position.y;

        } else if (e.button === 0) { // Left-click on background
            this.state.selectedNodeId = null;
            this.isPanning = true;
            this.panStart.x = e.clientX - this.state.transform.x;
            this.panStart.y = e.clientY - this.state.transform.y;
            this.renderer.svg.style.cursor = 'grabbing';
        }
    }

    onMouseMove(e) {
        if (this.isConnecting) {
            const point = this.getTransformedPoint(e);
            this.previewLine.setAttribute('x2', point.x);
            this.previewLine.setAttribute('y2', point.y);
            return;
        }

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
        if (this.isConnecting) {
            const targetNodeEl = e.target.closest('.node-group');

            if (targetNodeEl) {
                const targetNodeId = targetNodeEl.id;
                const sourceNodeId = this.connectionStartNodeId;

                if (targetNodeId !== sourceNodeId && !this.connectionExists(sourceNodeId, targetNodeId)) {
                    const newConnection = {
                        id: `conn_${Date.now()}`,
                        source: sourceNodeId,
                        target: targetNodeId
                    };
                    this.state.connections.push(newConnection);
                }
            }

            this.isConnecting = false;
            this.connectionStartNodeId = null;
            this.renderer.worldGroup.removeChild(this.previewLine);
            this.previewLine = null;
            return;
        }

        this.isDraggingNode = false;
        this.isPanning = false;
        this.draggedNode = null;
        this.renderer.svg.style.cursor = 'grab';
    }

    onKeyDown(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.state.selectedNodeId) {
                this.deleteNode(this.state.selectedNodeId);
            }
        }
    }

    deleteNode(nodeId) {
        this.state.nodes = this.state.nodes.filter(node => node.id !== nodeId);
        this.state.connections = this.state.connections.filter(conn => conn.source !== nodeId && conn.target !== nodeId);
        this.state.selectedNodeId = null;
    }

    onWheel(e) {
        e.preventDefault();
        const { clientX, clientY, deltaY } = e;
        const point = this.getSVGPoint(e);
        
        const oldScale = this.state.transform.k;
        const newScale = deltaY > 0 
            ? Math.max(config.zoom.min, oldScale / config.zoom.step)
            : Math.min(config.zoom.max, oldScale * config.zoom.step);

        // Pan to keep the mouse pointer stationary relative to the content
        this.state.transform.x = point.x - (point.x - this.state.transform.x) * (newScale / oldScale);
        this.state.transform.y = point.y - (point.y - this.state.transform.y) * (newScale / oldScale);
        this.state.transform.k = newScale;
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

    connectionExists(sourceId, targetId) {
        return this.state.connections.some(conn => conn.source === sourceId && conn.target === targetId);
    }
} 