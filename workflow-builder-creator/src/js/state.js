export const state = {
    nodes: [],
    connections: [],
    transform: {
        x: 0,
        y: 0,
        k: 1,
    },
    selectedNodeId: null,
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
} 