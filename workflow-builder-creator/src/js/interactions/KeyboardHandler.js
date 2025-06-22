export class KeyboardHandler {
    constructor(state, interactionManager) {
        this.state = state;
        this.interactionManager = interactionManager;
    }

    handleKeyDown(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            this.interactionManager.deleteSelection();
        } else if (e.key === 'Escape') {
            this.interactionManager.clearSelection();
        } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.interactionManager.selectAllNodes();
        } else if (e.key === 'g') {
            this.interactionManager.toggleGridSnapping();
        }
    }
} 