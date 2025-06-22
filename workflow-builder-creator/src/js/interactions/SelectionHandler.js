import { config } from '../config.js';

export class SelectionHandler {
    constructor(state, renderer) {
        this.state = state;
        this.renderer = renderer;
        this.isSelecting = false;
        this.selectionStart = { x: 0, y: 0 };
        this.selectionBox = this.createSelectionBox();
    }

    createSelectionBox() {
        const selectionBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        selectionBox.setAttribute('fill', 'rgba(0, 170, 255, 0.1)');
        selectionBox.setAttribute('stroke', 'var(--accent-color)');
        selectionBox.setAttribute('stroke-width', '1');
        selectionBox.setAttribute('stroke-dasharray', '5,5');
        selectionBox.style.display = 'none';
        this.renderer.worldGroup.appendChild(selectionBox);
        return selectionBox;
    }

    start(e) {
        if (!e.ctrlKey && !e.metaKey) {
            this.state.selectedNodes.clear();
            this.state.selectedNodeId = null;
        }

        const point = this.getTransformedPoint(e);
        this.selectionStart = point;
        this.isSelecting = true;
        
        this.selectionBox.style.display = 'block';
        this.selectionBox.setAttribute('x', point.x);
        this.selectionBox.setAttribute('y', point.y);
        this.selectionBox.setAttribute('width', 0);
        this.selectionBox.setAttribute('height', 0);
    }

    move(e) {
        const currentPoint = this.getTransformedPoint(e);
        const startX = Math.min(this.selectionStart.x, currentPoint.x);
        const startY = Math.min(this.selectionStart.y, currentPoint.y);
        const width = Math.abs(currentPoint.x - this.selectionStart.x);
        const height = Math.abs(currentPoint.y - this.selectionStart.y);
        
        this.selectionBox.setAttribute('x', startX);
        this.selectionBox.setAttribute('y', startY);
        this.selectionBox.setAttribute('width', width);
        this.selectionBox.setAttribute('height', height);
    }

    end() {
        this.isSelecting = false;
        this.selectionBox.style.display = 'none';
        
        const selectionRect = this.selectionBox.getBBox();
        this.state.nodes.forEach(node => {
            const nodeRect = {
                x: node.position.x,
                y: node.position.y,
                width: config.node.width,
                height: config.node.height
            };
            
            if (this.rectsIntersect(selectionRect, nodeRect)) {
                this.state.selectedNodes.add(node.id);
            }
        });
        
        if (this.state.selectedNodes.size > 0) {
            this.state.selectedNodeId = Array.from(this.state.selectedNodes).pop();
        }
    }

    isActive() {
        return this.isSelecting;
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

    rectsIntersect(r1, r2) {
        return !(r2.x > r1.x + r1.width || 
                 r2.x + r2.width < r1.x || 
                 r2.y > r1.y + r1.height ||
                 r2.y + r2.height < r1.y);
    }
} 