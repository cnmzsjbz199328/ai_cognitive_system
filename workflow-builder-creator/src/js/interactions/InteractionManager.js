import { config } from '../config.js';
import { ZoomHandler } from './ZoomHandler.js';
import { KeyboardHandler } from './KeyboardHandler.js';
import { DragHandler } from './DragHandler.js';
import { SelectionHandler } from './SelectionHandler.js';
import { ConnectionHandler } from './ConnectionHandler.js';

export class InteractionManager {
    constructor(state, renderer) {
        this.state = state;
        this.renderer = renderer;

        this.zoomHandler = new ZoomHandler(state, renderer);
        this.keyboardHandler = new KeyboardHandler(state, this);
        this.dragHandler = new DragHandler(state, this);
        this.selectionHandler = new SelectionHandler(state, renderer);
        this.connectionHandler = new ConnectionHandler(state, renderer);

        this.snapToGrid = true;
        this.gridSize = 20;

        this.proximityPadding = 30; // 30px range for showing anchors
    }

    initialize() {
        this.renderer.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('keydown', (e) => this.keyboardHandler.handleKeyDown(e));
        this.renderer.svg.addEventListener('wheel', (e) => this.zoomHandler.handleWheel(e), { passive: false });
        this.renderer.svg.style.cursor = 'grab';
        this.renderer.svg.addEventListener('touchstart', (e) => this.dragHandler.touchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.dragHandler.touchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.dragHandler.touchEnd(e), { passive: false });
    }

    onMouseDown(e) {
        const isAnchorPoint = e.target.classList.contains('anchor-point');
        const targetElement = e.target.closest('.node-group');

        if (e.button !== 0) return;

        if (isAnchorPoint) {
            this.connectionHandler.start(e);
        } else if (targetElement) {
            this.dragHandler.start(e);
        } else {
            this.selectionHandler.start(e);
        }
    }

    onMouseMove(e) {
        if (this.connectionHandler.isActive()) {
            this.connectionHandler.move(e);
        } else if (this.selectionHandler.isActive()) {
            this.selectionHandler.move(e);
        } else if (this.dragHandler.isActive()) {
            this.dragHandler.move(e);
        } else {
            this.handleProximity(e);
        }
    }

    onMouseUp(e) {
        if (this.connectionHandler.isActive()) {
            this.connectionHandler.end(e);
        } else if (this.selectionHandler.isActive()) {
            this.selectionHandler.end(e);
        } else if (this.dragHandler.isActive()) {
            this.dragHandler.end();
        }
    }

    handleProximity(e) {
        const point = this.getTransformedPoint(e);
        let newProximityNodeId = null;

        const scaledPadding = this.proximityPadding / this.state.transform.k;
    
        for (const node of this.state.nodes) {
            const nodeRect = {
                x: node.position.x - scaledPadding,
                y: node.position.y - scaledPadding,
                width: config.node.width + scaledPadding * 2,
                height: config.node.height + scaledPadding * 2,
            };
    
            if (point.x >= nodeRect.x && point.x <= nodeRect.x + nodeRect.width &&
                point.y >= nodeRect.y && point.y <= nodeRect.y + nodeRect.height) {
                newProximityNodeId = node.id;
                break; 
            }
        }
    
        if (newProximityNodeId !== this.state.proximityNodeId) {
            console.log(`[Proximity] Detected node: ${newProximityNodeId || 'none'}`);
            this.state.proximityNodeId = newProximityNodeId;
        }
    }

    // Methods called by handlers
    handleNodeClick(e, targetElement) {
        const nodeId = targetElement.id;
        if (e.ctrlKey || e.metaKey) {
            if (this.state.selectedNodes.has(nodeId)) {
                this.state.selectedNodes.delete(nodeId);
                this.state.selectedNodeId = null;
            } else {
                this.state.selectedNodes.add(nodeId);
                this.state.selectedNodeId = nodeId;
            }
        } else if (!this.state.selectedNodes.has(nodeId)) {
            this.state.selectedNodes.clear();
            this.state.selectedNodes.add(nodeId);
            this.state.selectedNodeId = nodeId;
        }
    }

    updateNodePosition(e, draggedNode, offset) {
        const point = this.getTransformedPoint(e);
        let newX = point.x - offset.x;
        let newY = point.y - offset.y;

        if (this.snapToGrid) {
            newX = Math.round(newX / this.gridSize) * this.gridSize;
            newY = Math.round(newY / this.gridSize) * this.gridSize;
        }

        const deltaX = newX - draggedNode.position.x;
        const deltaY = newY - draggedNode.position.y;

        if (this.state.selectedNodes.size > 1 && this.state.selectedNodes.has(draggedNode.id)) {
            this.state.selectedNodes.forEach(nodeId => {
                const node = this.state.nodes.find(n => n.id === nodeId);
                if (node) {
                    node.position.x += deltaX;
                    node.position.y += deltaY;
                }
            });
        } else {
            draggedNode.position.x = newX;
            draggedNode.position.y = newY;
        }
    }
    
    deleteSelection() {
        this.state.selectedNodes.forEach(nodeId => this.deleteNode(nodeId));
        this.state.selectedNodes.clear();
        this.state.selectedNodeId = null;
    }
    
    deleteNode(nodeId) {
        this.state.nodes = this.state.nodes.filter(n => n.id !== nodeId);
        this.state.connections = this.state.connections.filter(c => c.source !== nodeId && c.target !== nodeId);
    }
    
    clearSelection() {
        this.state.selectedNodes.clear();
        this.state.selectedNodeId = null;
    }

    selectAllNodes() {
        this.state.nodes.forEach(node => this.state.selectedNodes.add(node.id));
        if (this.state.nodes.length > 0) {
            this.state.selectedNodeId = this.state.nodes[this.state.nodes.length - 1].id;
        }
    }

    toggleGridSnapping() {
        this.snapToGrid = !this.snapToGrid;
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