import { config } from './config.js';
import { getConnectionPath } from './utils.js';

export class InteractionManager {
    constructor(state, renderer, nodeEditorContainer) {
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

        // Phase 4: Multi-selection and enhanced interactions
        this.selectionBox = null;
        this.isSelecting = false;
        this.selectionStart = { x: 0, y: 0 };
        this.isGroupDragging = false;
        this.groupDragOffset = { x: 0, y: 0 };
        
        // Touch support
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.isTouchPanning = false;
        
        // Grid snapping
        this.gridSize = 20;
        this.snapToGrid = true;
        
        // Enhanced connection preview
        this.connectionPreview = null;
        this.connectionPreviewAnimation = null;
    }

    initialize() {
        // Mouse events
        this.renderer.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        this.renderer.svg.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        
        // Touch events for mobile support
        this.renderer.svg.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.renderer.svg.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.renderer.svg.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        
        this.renderer.svg.style.cursor = 'grab';
        
        // Initialize selection box
        this.createSelectionBox();
    }

    createSelectionBox() {
        this.selectionBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.selectionBox.setAttribute('fill', 'rgba(0, 170, 255, 0.1)');
        this.selectionBox.setAttribute('stroke', 'var(--accent-color)');
        this.selectionBox.setAttribute('stroke-width', '1');
        this.selectionBox.setAttribute('stroke-dasharray', '5,5');
        this.selectionBox.style.display = 'none';
        this.renderer.worldGroup.appendChild(this.selectionBox);
    }

    onMouseDown(e) {
        if (this.isEditingNode) {
            this.finishEditing();
            return;
        }

        const targetElement = e.target.closest('.node-group');
        const isAnchorPoint = e.target.classList.contains('anchor-point');
        
        if (isAnchorPoint) {
            e.stopPropagation();
            this.startConnection(e);
            return;
        }

        if (e.button === 0 && targetElement) { // Left-click on node
            this.handleNodeClick(e, targetElement);
        } else if (e.button === 0) { // Left-click on background
            this.handleBackgroundClick(e);
        }
    }

    handleNodeClick(e, targetElement) {
        const nodeId = targetElement.id;
        
        // Handle multi-selection with Ctrl/Cmd key
        if (e.ctrlKey || e.metaKey) {
            if (this.state.selectedNodes.has(nodeId)) {
                this.state.selectedNodes.delete(nodeId);
                this.state.selectedNodeId = null;
            } else {
                this.state.selectedNodes.add(nodeId);
                this.state.selectedNodeId = nodeId;
            }
        } else {
            // Single selection
            if (!this.state.selectedNodes.has(nodeId)) {
                this.state.selectedNodes.clear();
                this.state.selectedNodes.add(nodeId);
                this.state.selectedNodeId = nodeId;
            }
        }

        // Start dragging
        this.isDraggingNode = true;
        this.draggedNode = this.state.nodes.find(n => n.id === nodeId);
        if (!this.draggedNode) return;
        
        const point = this.getTransformedPoint(e);
        this.offset.x = point.x - this.draggedNode.position.x;
        this.offset.y = point.y - this.draggedNode.position.y;
    }

    handleBackgroundClick(e) {
        // Clear selection if not holding Ctrl/Cmd
        if (!e.ctrlKey && !e.metaKey) {
            this.state.selectedNodes.clear();
            this.state.selectedNodeId = null;
        }
        
        // Start selection box or panning
        const point = this.getTransformedPoint(e);
        this.selectionStart = point;
        this.isSelecting = true;
        this.isPanning = false;
        
        this.selectionBox.style.display = 'block';
        this.selectionBox.setAttribute('x', point.x);
        this.selectionBox.setAttribute('y', point.y);
        this.selectionBox.setAttribute('width', 0);
        this.selectionBox.setAttribute('height', 0);
    }

    startConnection(e) {
        this.isConnecting = true;
        this.connectionStartNodeId = e.target.closest('.node-group').id;
        
        const sourceNode = this.state.nodes.find(n => n.id === this.connectionStartNodeId);
        if (!sourceNode) return;

        // Create enhanced connection preview
        this.createConnectionPreview(sourceNode);
    }

    createConnectionPreview(sourceNode) {
        this.connectionPreview = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Main preview line
        this.previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.previewLine.setAttribute('stroke', 'var(--accent-color)');
        this.previewLine.setAttribute('stroke-width', config.connection.width + 2);
        this.previewLine.setAttribute('fill', 'none');
        this.previewLine.setAttribute('stroke-dasharray', '8,4');
        this.previewLine.style.filter = 'drop-shadow(0 0 4px var(--accent-color))';
        
        // Animated flow effect
        this.connectionPreviewAnimation = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.connectionPreviewAnimation.setAttribute('stroke', 'var(--accent-color)');
        this.connectionPreviewAnimation.setAttribute('stroke-width', '1');
        this.connectionPreviewAnimation.setAttribute('fill', 'none');
        this.connectionPreviewAnimation.setAttribute('stroke-dasharray', '3,6');
        this.connectionPreviewAnimation.style.opacity = '0.6';
        
        this.connectionPreview.appendChild(this.previewLine);
        this.connectionPreview.appendChild(this.connectionPreviewAnimation);
        this.renderer.worldGroup.appendChild(this.connectionPreview);
        
        // Start animation
        this.animateConnectionPreview();
    }

    animateConnectionPreview() {
        if (!this.connectionPreviewAnimation) return;
        
        let offset = 0;
        const animate = () => {
            if (!this.isConnecting) return;
            offset = (offset + 0.5) % 9;
            this.connectionPreviewAnimation.style.strokeDashoffset = offset;
            requestAnimationFrame(animate);
        };
        animate();
    }

    onMouseMove(e) {
        if (this.isConnecting) {
            this.updateConnectionPreview(e);
            return;
        }

        if (this.isDraggingNode && this.draggedNode) {
            this.updateNodePosition(e);
        } else if (this.isSelecting) {
            this.updateSelectionBox(e);
        } else if (this.isPanning) {
            this.updatePanning(e);
        }
    }

    updateConnectionPreview(e) {
        const currentMousePoint = this.getTransformedPoint(e);
        const sourceNode = this.state.nodes.find(n => n.id === this.connectionStartNodeId);
        if (!sourceNode) return;

        const dummyTargetNode = { 
            position: { 
                x: currentMousePoint.x - config.node.width / 2, 
                y: currentMousePoint.y - config.node.height / 2 
            } 
        };
        
        const newPathData = getConnectionPath(sourceNode, dummyTargetNode);
        this.previewLine.setAttribute('d', newPathData);
        this.connectionPreviewAnimation.setAttribute('d', newPathData);
    }

    updateNodePosition(e) {
        const point = this.getTransformedPoint(e);
        let newX = point.x - this.offset.x;
        let newY = point.y - this.offset.y;
        
        // Snap to grid if enabled
        if (this.snapToGrid) {
            newX = Math.round(newX / this.gridSize) * this.gridSize;
            newY = Math.round(newY / this.gridSize) * this.gridSize;
        }
        
        // Move single node or group
        if (this.state.selectedNodes.size > 1 && this.state.selectedNodes.has(this.draggedNode.id)) {
            // Group movement
            const deltaX = newX - this.draggedNode.position.x;
            const deltaY = newY - this.draggedNode.position.y;
            
            this.state.selectedNodes.forEach(nodeId => {
                const node = this.state.nodes.find(n => n.id === nodeId);
                if (node && node.id !== this.draggedNode.id) {
                    node.position.x += deltaX;
                    node.position.y += deltaY;
                }
            });
            // Update the dragged node last
            this.draggedNode.position.x = newX;
            this.draggedNode.position.y = newY;
        } else {
            // Single node movement
            this.draggedNode.position.x = newX;
            this.draggedNode.position.y = newY;
        }
    }

    updateSelectionBox(e) {
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

    updatePanning(e) {
        this.state.transform.x = e.clientX - this.panStart.x;
        this.state.transform.y = e.clientY - this.panStart.y;
    }

    onMouseUp(e) {
        if (this.isConnecting) {
            this.finishConnection(e);
            return;
        }

        if (this.isSelecting) {
            this.finishSelection();
        }

        this.isDraggingNode = false;
        this.isPanning = false;
        this.draggedNode = null;
        this.renderer.svg.style.cursor = 'grab';
    }

    finishConnection(e) {
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

        this.cleanupConnectionPreview();
    }

    cleanupConnectionPreview() {
        this.isConnecting = false;
        this.connectionStartNodeId = null;
        
        if (this.connectionPreview) {
            this.renderer.worldGroup.removeChild(this.connectionPreview);
            this.connectionPreview = null;
            this.previewLine = null;
            this.connectionPreviewAnimation = null;
        }
    }

    finishSelection() {
        this.isSelecting = false;
        this.selectionBox.style.display = 'none';
        
        // Select nodes within selection box
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
        
        // Update selected node ID to the last selected
        if (this.state.selectedNodes.size > 0) {
            this.state.selectedNodeId = Array.from(this.state.selectedNodes).pop();
        }
    }

    rectsIntersect(rect1, rect2) {
        return !(rect2.x > rect1.x + rect1.width || 
                rect2.x + rect2.width < rect1.x || 
                rect2.y > rect1.y + rect1.height ||
                rect2.y + rect2.height < rect1.y);
    }

    // Touch event handlers for mobile support
    onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartTime = Date.now();
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        
        // Simulate mouse events for touch
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 0
        });
        this.onMouseDown(mouseEvent);
    }

    onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        
        // Check if this is a pan gesture (no node dragging)
        if (!this.isDraggingNode && !this.isConnecting) {
            const deltaX = touch.clientX - this.touchStartPos.x;
            const deltaY = touch.clientY - this.touchStartPos.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > 10) { // Threshold for pan gesture
                this.isTouchPanning = true;
                this.isPanning = true;
                this.panStart.x = touch.clientX - this.state.transform.x;
                this.panStart.y = touch.clientY - this.state.transform.y;
            }
        }
        
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.onMouseMove(mouseEvent);
    }

    onTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const touchDuration = Date.now() - this.touchStartTime;
        
        // Handle tap gesture (short touch without movement)
        if (touchDuration < 200 && !this.isTouchPanning) {
            const mouseEvent = new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            // Could add tap handling here
        }
        
        this.isTouchPanning = false;
        const mouseEvent = new MouseEvent('mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.onMouseUp(mouseEvent);
    }

    onKeyDown(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.state.selectedNodes.size > 0) {
                this.deleteSelectedNodes();
            } else if (this.state.selectedNodeId) {
                this.deleteNode(this.state.selectedNodeId);
            }
        } else if (e.key === 'Escape') {
            this.clearSelection();
        } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.selectAllNodes();
        } else if (e.key === 'g') {
            this.toggleGridSnapping();
        }
    }

    deleteSelectedNodes() {
        this.state.selectedNodes.forEach(nodeId => {
            this.deleteNode(nodeId);
        });
        this.state.selectedNodes.clear();
        this.state.selectedNodeId = null;
    }

    deleteNode(nodeId) {
        this.state.nodes = this.state.nodes.filter(node => node.id !== nodeId);
        this.state.connections = this.state.connections.filter(conn => 
            conn.source !== nodeId && conn.target !== nodeId
        );
        this.state.selectedNodes.delete(nodeId);
        if (this.state.selectedNodeId === nodeId) {
            this.state.selectedNodeId = null;
        }
    }

    clearSelection() {
        this.state.selectedNodes.clear();
        this.state.selectedNodeId = null;
    }

    selectAllNodes() {
        this.state.selectedNodes.clear();
        this.state.nodes.forEach(node => {
            this.state.selectedNodes.add(node.id);
        });
        if (this.state.nodes.length > 0) {
            this.state.selectedNodeId = this.state.nodes[this.state.nodes.length - 1].id;
        }
    }

    toggleGridSnapping() {
        this.snapToGrid = !this.snapToGrid;
        console.log(`Grid snapping: ${this.snapToGrid ? 'ON' : 'OFF'}`);
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