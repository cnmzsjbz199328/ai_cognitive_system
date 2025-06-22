import { config } from '../config.js';
import { getConnectionPath } from '../utils.js';

export class ConnectionHandler {
    constructor(state, renderer) {
        this.state = state;
        this.renderer = renderer;
        this.isConnecting = false;
        this.startNodeId = null;
        this.previewGroup = null;
    }

    start(e) {
        e.stopPropagation();
        this.isConnecting = true;
        this.startNodeId = e.target.closest('.node-group').id;
        
        const sourceNode = this.state.nodes.find(n => n.id === this.startNodeId);
        if (!sourceNode) return;

        this.createPreview(sourceNode);
        this.updatePreview(e);
    }

    move(e) {
        if (!this.isConnecting) return;
        this.updatePreview(e);
    }

    end(e) {
        if (!this.isConnecting) return;
        
        const targetNodeEl = e.target.closest('.node-group');
        if (targetNodeEl) {
            const targetNodeId = targetNodeEl.id;
            if (targetNodeId !== this.startNodeId && !this.connectionExists(this.startNodeId, targetNodeId)) {
                this.state.connections.push({
                    id: `conn_${Date.now()}`,
                    source: this.startNodeId,
                    target: targetNodeId
                });
            }
        }

        this.cleanup();
    }

    isActive() {
        return this.isConnecting;
    }

    createPreview(sourceNode) {
        this.previewGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.previewGroup.style.pointerEvents = 'none';

        const previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        previewLine.setAttribute('stroke', 'var(--accent-color)');
        previewLine.setAttribute('stroke-width', config.connection.width + 1);
        previewLine.setAttribute('fill', 'none');
        previewLine.setAttribute('stroke-dasharray', '8,4');
        
        this.previewGroup.appendChild(previewLine);
        this.renderer.worldGroup.appendChild(this.previewGroup);
    }

    updatePreview(e) {
        const sourceNode = this.state.nodes.find(n => n.id === this.startNodeId);
        if (!sourceNode || !this.previewGroup) return;

        const point = this.getTransformedPoint(e);
        const dummyTarget = { position: { x: point.x - config.node.width / 2, y: point.y - config.node.height / 2 } };
        const pathData = getConnectionPath(sourceNode, dummyTarget);
        
        const path = this.previewGroup.querySelector('path');
        path.setAttribute('d', pathData);
    }

    cleanup() {
        if (this.previewGroup) {
            this.renderer.worldGroup.removeChild(this.previewGroup);
        }
        this.isConnecting = false;
        this.startNodeId = null;
        this.previewGroup = null;
    }
    
    connectionExists(sourceId, targetId) {
        return this.state.connections.some(c => c.source === sourceId && c.target === targetId);
    }

    getTransformedPoint(e) {
        const pt = this.renderer.svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPoint = pt.matrixTransform(this.renderer.svg.getScreenCTM().inverse());
        const { x, y, k } = this.state.transform;
        return {
            x: (svgPoint.x - x) / k,
            y: (svgPoint.y - y) / k,
        };
    }
} 