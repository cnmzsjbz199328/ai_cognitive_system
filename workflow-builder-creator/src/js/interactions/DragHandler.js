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
            // 实时渲染反馈
            if (typeof this.interactionManager.renderOnce === 'function') {
                this.interactionManager.renderOnce();
            } else if (this.interactionManager.renderer && typeof this.interactionManager.renderer.render === 'function') {
                this.interactionManager.renderer.render(this.state);
            }
        } else if (this.isPanning) {
            this.state.transform.x = e.clientX - this.panStart.x;
            this.state.transform.y = e.clientY - this.panStart.y;
            // 实时渲染反馈
            if (typeof this.interactionManager.renderOnce === 'function') {
                this.interactionManager.renderOnce();
            } else if (this.interactionManager.renderer && typeof this.interactionManager.renderer.render === 'function') {
                this.interactionManager.renderer.render(this.state);
            }
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

    // --- 触控支持 ---
    touchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.start({ ...e, clientX: touch.clientX, clientY: touch.clientY });
            e.preventDefault();
        }
    }
    touchMove(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.move({ ...e, clientX: touch.clientX, clientY: touch.clientY });
            e.preventDefault();
        }
    }
    touchEnd(e) {
        this.end();
        e.preventDefault();
    }
} 