export const state = {
    nodes: [],
    connections: [],
    transform: {
        x: 0,
        y: 0,
        k: 1,
    },
    selectedNodeId: null,
    selectedNodes: new Set(), // Phase 4: Multi-selection support
    proximityNodeId: null,   // The node ID that the mouse is currently close to
    theme: 'dark',           // 'dark' or 'light'
    animationSpeed: 1,       // Multiplier for animation speed
    animationMode: 'particle', // 'particle', 'pulse', or 'gradient'
};

// Function to add a new node to the state
export function addNode(positionX, positionY, label = 'New Node') {
    const newNode = {
        id: `node_${Date.now()}`,
        label: label,
        position: {
            x: positionX,
            y: positionY,
        },
    };
    state.nodes.push(newNode);
    state.selectedNodeId = newNode.id;
    state.selectedNodes.clear();
    state.selectedNodes.add(newNode.id);
}

// Phase 4: Enhanced node management functions
export function selectNode(nodeId) {
    state.selectedNodeId = nodeId;
    state.selectedNodes.add(nodeId);
}

export function deselectNode(nodeId) {
    state.selectedNodes.delete(nodeId);
    if (state.selectedNodeId === nodeId) {
        state.selectedNodeId = state.selectedNodes.size > 0 
            ? Array.from(state.selectedNodes)[0] 
            : null;
    }
}

export function clearSelection() {
    state.selectedNodes.clear();
    state.selectedNodeId = null;
}

export function selectAllNodes() {
    state.selectedNodes.clear();
    state.nodes.forEach(node => {
        state.selectedNodes.add(node.id);
    });
    if (state.nodes.length > 0) {
        state.selectedNodeId = state.nodes[state.nodes.length - 1].id;
    }
} 