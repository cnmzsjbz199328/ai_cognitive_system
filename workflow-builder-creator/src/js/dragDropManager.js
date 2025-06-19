export class DragDropManager {
    constructor(state, renderer) {
        this.state = state;
        this.renderer = renderer;
        this.isDraggingNode = false;
        this.isPanning = false;
        this.draggedNode = null;
        this.offset = { x: 0, y: 0 };
        this.panStart = { x: 0, y: 0 };
        console.log('DragDropManager initialized.');
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
            const nodeId = this.findNodeIdFromElement(targetElement);
            if (!nodeId) return;

            this.draggedNode = this.state.nodes.find(n => n.id === nodeId);
            
            // Adjust point for current transform
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

    findNodeIdFromElement(element) {
        // This workaround is brittle. We must try to fix the renderer again later.
        const transform = element.getAttribute('transform');
        const match = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        if (match) {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);
            const foundNode = this.state.nodes.find(n => Math.abs(n.position.x - x) < 0.1 && Math.abs(n.position.y - y) < 0.1);
            return foundNode ? foundNode.id : null;
        }
        return null;
    }
} 