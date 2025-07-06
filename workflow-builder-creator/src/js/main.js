import { state, addNode } from './state.js';
import { Renderer } from './renderer.js';
import { InteractionManager } from './interactions/InteractionManager.js';
import { AnimationManager } from './animation.js';
import { DataHandler } from './DataHandler.js';
import { config } from './config.js';

const ANIMATION_MODES = ['minimal', 'classic'];

class App {
    constructor() {
        this.svg = document.getElementById('main-svg');
        this.canvasContainer = document.getElementById('canvas-container');
        this.nodeEditorContainer = document.getElementById('node-editor-container');
        this.renderer = new Renderer(this.svg);
        this.interactionManager = new InteractionManager(state, this.renderer);
        this.animationManager = new AnimationManager(state);
        this.dataHandler = new DataHandler();
        this.lastFrameTime = 0;
        this.htmlEl = document.documentElement;
        this.autosaveTimer = null;
    }

    async init() {
        if (!this.dataHandler.loadFromLocalStorage()) {
            await this.loadData();
        }
        this.interactionManager.initialize();
        this.setupUIControls();
        this.setupResizeObserver();
        this.startRenderLoop();
    }

    setupUIControls() {
        // Edit Controls
        document.getElementById('add-node-btn').addEventListener('click', () => this.addNodeAtCenter());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearCanvas());

        // File Controls
        document.getElementById('save-json-btn').addEventListener('click', () => this.dataHandler.saveToFile());
        document.getElementById('load-json-btn').addEventListener('click', () => document.getElementById('file-input').click());
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileLoad(e));
        document.getElementById('export-png-btn').addEventListener('click', () => this.dataHandler.exportToPNG(this.svg));

        // Animation Controls
        document.getElementById('play-btn').addEventListener('click', () => this.animationManager.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.animationManager.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.animationManager.reset());
        document.getElementById('speed-slider').addEventListener('input', (e) => this.setAnimationSpeed(e.target.value));
        document.getElementById('mode-btn').addEventListener('click', () => this.switchAnimationMode());

        // View Controls
        document.getElementById('zoom-reset-btn').addEventListener('click', () => this.resetView());
        document.getElementById('fit-to-view-btn').addEventListener('click', () => this.fitToView());
        document.getElementById('theme-btn').addEventListener('click', () => this.toggleTheme());

        // Set initial UI state from state object
        document.getElementById('speed-slider').value = state.animationSpeed;
        this.htmlEl.classList.toggle('light-theme', state.theme === 'light');
    }

    addNodeAtCenter() {
        const nodeLabel = prompt("Enter a name for the new node:");
        if (nodeLabel !== null && nodeLabel.trim() !== '') {
            const svgRect = this.svg.getBoundingClientRect();
            const centerX = (svgRect.width / 2 - state.transform.x) / state.transform.k;
            const centerY = (svgRect.height / 2 - state.transform.y) / state.transform.k;
            addNode(centerX - config.node.width / 2, centerY - config.node.height / 2, nodeLabel.trim());
            this.scheduleAutosave();
        }
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
            state.nodes = [];
            state.connections = [];
            state.selectedNodeId = null;
            state.selectedNodes.clear();
            this.animationManager.reset();
            this.scheduleAutosave();
        }
    }

    async handleFileLoad(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await this.dataHandler.loadFromFile(file);
            this.animationManager.reset();
            // Force a re-render and UI update
            this.updateUIFromState();
            console.log('File loaded successfully.');
        } catch (error) {
            alert(error.message);
        }
        // Reset file input so the same file can be loaded again
        e.target.value = null;
    }

    setAnimationSpeed(speed) {
        state.animationSpeed = parseFloat(speed);
        this.scheduleAutosave();
    }

    resetView() {
        state.transform.x = 0;
        state.transform.y = 0;
        state.transform.k = 1;
    }

    fitToView() {
        if (state.nodes.length === 0) {
            this.resetView();
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        state.nodes.forEach(node => {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + config.node.width);
            maxY = Math.max(maxY, node.position.y + config.node.height);
        });

        const boundsWidth = maxX - minX;
        const boundsHeight = maxY - minY;
        const { width: viewportWidth, height: viewportHeight } = this.canvasContainer.getBoundingClientRect();

        const padding = 50;
        const scaleX = (viewportWidth - padding * 2) / boundsWidth;
        const scaleY = (viewportHeight - padding * 2) / boundsHeight;
        const scale = Math.min(scaleX, scaleY, 2);

        const newX = (viewportWidth / 2) - ((minX + boundsWidth / 2) * scale);
        const newY = (viewportHeight / 2) - ((minY + boundsHeight / 2) * scale);
        
        state.transform.k = scale;
        state.transform.x = newX;
        state.transform.y = newY;
    }

    switchAnimationMode() {
        const currentIndex = ANIMATION_MODES.indexOf(state.animationMode);
        const nextIndex = (currentIndex + 1) % ANIMATION_MODES.length;
        state.animationMode = ANIMATION_MODES[nextIndex];
        
        const modeBtn = document.getElementById('mode-btn');
        const newModeName = state.animationMode.charAt(0).toUpperCase() + state.animationMode.slice(1);
        modeBtn.textContent = `${newModeName} Mode`;
        modeBtn.title = `Switch to ${ANIMATION_MODES[(nextIndex + 1) % ANIMATION_MODES.length]} mode`;
        
        // When switching away from particle mode, reset to hide particles
        if (state.animationMode !== 'particle' && state.animationMode !== 'minimal') {
            this.animationManager.reset();
        }
    }

    toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        this.htmlEl.classList.toggle('light-theme', state.theme === 'light');
        this.scheduleAutosave();
    }

    scheduleAutosave() {
        clearTimeout(this.autosaveTimer);
        this.autosaveTimer = setTimeout(() => {
            this.dataHandler.saveToLocalStorage();
        }, 1000); // Autosave after 1 second of inactivity
    }
    
    updateUIFromState() {
        this.htmlEl.classList.toggle('light-theme', state.theme === 'light');
        document.getElementById('speed-slider').value = state.animationSpeed;
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
            
            // A simple check to see if any user-driven state has changed
            // This is a naive way to trigger autosave. A more robust solution might use a state management library.
            const currentState = JSON.stringify({nodes: state.nodes, connections: state.connections, transform: state.transform});
            if (this.lastSavedState !== currentState) {
                this.lastSavedState = currentState;
                this.scheduleAutosave();
            }

            this.lastFrameTime = currentTime;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    async loadData() {
        // This is now only for the initial template data if local storage is empty
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
            // Fallback to empty state if loading fails
            state.nodes = [];
            state.connections = [];
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
}); 