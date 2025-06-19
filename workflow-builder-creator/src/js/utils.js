import { config } from './config.js';

// Helper to calculate path data for a cubic Bézier curve
export function getConnectionPath(sourceNode, targetNode) {
    const startX = sourceNode.position.x + config.node.width / 2;
    const startY = sourceNode.position.y + config.node.height / 2;
    const endX = targetNode.position.x + config.node.width / 2;
    const endY = targetNode.position.y + config.node.height / 2;

    // Control points for a smooth curve. Adjust these values for different curve shapes.
    // Here, we create horizontal control points for a smooth S-curve or straight line.
    const controlPointOffset = 100; // Adjust this value to change the curve intensity

    const cp1x = startX + controlPointOffset;
    const cp1y = startY;
    const cp2x = endX - controlPointOffset;
    const cp2y = endY;

    return `M${startX},${startY} C${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
} 