import { state } from './state.js';

export class DataHandler {
    constructor() {
        this.localStorageKey = 'flow-builder-data';
    }

    // --- Data Persistence ---

    saveToLocalStorage() {
        try {
            const dataToSave = {
                nodes: state.nodes,
                connections: state.connections,
                transform: state.transform,
                theme: state.theme,
                animationSpeed: state.animationSpeed,
            };
            localStorage.setItem(this.localStorageKey, JSON.stringify(dataToSave));
            console.log('Flow data saved to local storage.');
        } catch (error) {
            console.error('Failed to save data to local storage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem(this.localStorageKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (this.isValidData(parsedData)) {
                    state.nodes = parsedData.nodes || [];
                    state.connections = parsedData.connections || [];
                    state.transform = parsedData.transform || { x: 0, y: 0, k: 1 };
                    state.theme = parsedData.theme || 'dark';
                    state.animationSpeed = parsedData.animationSpeed || 1;
                    console.log('Flow data loaded from local storage.');
                    return true;
                }
            }
        } catch (error) {
            console.error('Failed to load data from local storage:', error);
        }
        return false;
    }

    // --- File Operations ---

    saveToFile() {
        const dataToSave = {
            nodes: state.nodes,
            connections: state.connections,
            transform: state.transform,
            theme: state.theme,
            animationSpeed: state.animationSpeed,
        };
        const dataStr = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workflow.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error('No file selected.'));
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (this.isValidData(data)) {
                        state.nodes = data.nodes || [];
                        state.connections = data.connections || [];
                        state.transform = data.transform || { x: 0, y: 0, k: 1 };
                        state.theme = data.theme || 'dark';
                        state.animationSpeed = data.animationSpeed || 1;
                        resolve();
                    } else {
                        reject(new Error('Invalid or corrupted data file.'));
                    }
                } catch (error) {
                    reject(new Error('Failed to parse file. Ensure it is a valid JSON.'));
                }
            };
            reader.onerror = (e) => reject(new Error('Error reading file.'));
            reader.readAsText(file);
        });
    }
    
    // --- Data Validation ---

    isValidData(data) {
        return data && typeof data === 'object' && Array.isArray(data.nodes) && Array.isArray(data.connections);
    }
    
    // --- Image Export ---

    exportToPNG(svgElement, fileName = 'workflow.png') {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const svgSize = svgElement.getBoundingClientRect();
        
        canvas.width = svgSize.width;
        canvas.height = svgSize.height;
        
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = fileName;
            a.click();
        };

        img.src = url;
    }
} 