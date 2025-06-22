export class DragHandler {
    constructor(state, interactionManager) {
        this.state = state;
        this.interactionManager = interactionManager;
        this.isDraggingNode = false;
        this.isPanning = false;
        this.draggedNode = null;
        this.offset = { x: 0, y: 0 };
        this.panStart = { x: 0, y: 0 };
    }

    start(e) {
        const targetElement = e.target.closest('.node-group');

        if (targetElement) {
            // Node dragging
            this.isDraggingNode = true;
            this.interactionManager.handleNodeClick(e, targetElement);
            this.draggedNode = this.state.nodes.find(n => n.id === this.state.selectedNodeId);
            if (!this.draggedNode) return;
            
            const point = this.interactionManager.getTransformedPoint(e);
            this.offset.x = point.x - this.draggedNode.position.x;
            this.offset.y = point.y - this.draggedNode.position.y;
        } else {
            // Panning
            this.isPanning = true;
            this.panStart.x = e.clientX - this.state.transform.x;
            this.panStart.y = e.clientY - this.state.transform.y;
            this.interactionManager.renderer.svg.style.cursor = 'grabbing';
        }
    }

    move(e) {
        if (this.isDraggingNode && this.draggedNode) {
            this.interactionManager.updateNodePosition(e, this.draggedNode, this.offset);
        } else if (this.isPanning) {
            this.state.transform.x = e.clientX - this.panStart.x;
            this.state.transform.y = e.clientY - this.panStart.y;
        }
    }

    end() {
        this.isDraggingNode = false;
        this.isPanning = false;
        this.draggedNode = null;
        this.interactionManager.renderer.svg.style.cursor = 'grab';
    }

    isActive() {
        return this.isDraggingNode || this.isPanning;
    }
} 