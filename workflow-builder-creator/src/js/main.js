import { state, addNode } from './state.js';
import { Renderer } from './renderer.js';
import { InteractionManager } from './interaction.js';
import { AnimationManager } from './animation.js';
import { config } from './config.js';

class App {
    constructor() {
        this.svg = document.getElementById('main-svg');
        this.canvasContainer = document.getElementById('canvas-container');
        this.nodeEditorContainer = document.getElementById('node-editor-container');
        this.renderer = new Renderer(this.svg);
        this.interactionManager = new InteractionManager(state, this.renderer, this.nodeEditorContainer);
        this.animationManager = new AnimationManager(state);
        this.lastFrameTime = 0;
    }

    async init() {
        await this.loadData();
        this.interactionManager.initialize();
        this.setupUIControls();
        this.setupResizeObserver();
        this.startRenderLoop();
    }

    setupUIControls() {
        document.getElementById('play-btn').addEventListener('click', () => this.animationManager.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.animationManager.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.animationManager.reset());
        
        // Add Node Button
        document.getElementById('add-node-btn').addEventListener('click', () => {
            // Calculate a position for the new node in SVG world coordinates
            const svgRect = this.svg.getBoundingClientRect();
            const centerX = (svgRect.width / 2 - state.transform.x) / state.transform.k;
            const centerY = (svgRect.height / 2 - state.transform.y) / state.transform.k;

            addNode(centerX - config.node.width / 2, centerY - config.node.height / 2, 'New Node');
        });
    }

    setupResizeObserver() {
        const resizeObserver = new ResizeObserver(() => this.handleResize());
        resizeObserver.observe(this.canvasContainer);
        this.handleResize(); // Initial call
    }

    handleResize() {
        const { width, height } = this.canvasContainer.getBoundingClientRect();
        this.svg.setAttribute('width', width);
        this.svg.setAttribute('height', height);
    }

    startRenderLoop() {
        const loop = (currentTime) => {
            if (!this.lastFrameTime) {
                this.lastFrameTime = currentTime;
            }
            const deltaTime = currentTime - this.lastFrameTime;

            this.animationManager.update(deltaTime);
            this.renderer.render(state, this.animationManager.particles);
            
            this.lastFrameTime = currentTime;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    async loadData() {
        try {
            const response = await fetch('src/data/flow.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            state.nodes = data.nodes;
            state.connections = data.connections;
        } catch (error) {
            console.error("Failed to load flow data:", error);
            // Fallback to sample data if loading fails
            const data = {
                "nodes": [
                    { "id": "node_1", "label": "Input A", "position": { "x": 100, "y": 150 } },
                    { "id": "node_2", "label": "Processing Core", "position": { "x": 400, "y": 250 } },
                    { "id": "node_3", "label": "Output X", "position": { "x": 700, "y": 150 } },
                    { "id": "node_4", "label": "Output Y", "position": { "x": 700, "y": 350 } }
                ],
                "connections": [
                    { "id": "conn_1", "source": "node_1", "target": "node_2" },
                    { "id": "conn_2", "source": "node_2", "target": "node_3" },
                    { "id": "conn_3", "source": "node_2", "target": "node_4" }
                ]
            };
            state.nodes = data.nodes;
            state.connections = data.connections;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
}); 