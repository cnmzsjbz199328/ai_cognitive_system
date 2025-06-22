import { config } from '../config.js';

export class ZoomHandler {
    constructor(state, renderer) {
        this.state = state;
        this.renderer = renderer;
    }

    handleWheel(e) {
        e.preventDefault();
        const point = this.getSVGPoint(e);
        
        const oldScale = this.state.transform.k;
        const newScale = e.deltaY > 0 
            ? Math.max(config.zoom.min, oldScale / config.zoom.step)
            : Math.min(config.zoom.max, oldScale * config.zoom.step);

        this.state.transform.x = point.x - (point.x - this.state.transform.x) * (newScale / oldScale);
        this.state.transform.y = point.y - (point.y - this.state.transform.y) * (newScale / oldScale);
        this.state.transform.k = newScale;
    }

    getSVGPoint(e) {
        const pt = this.renderer.svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        return pt.matrixTransform(this.renderer.svg.getScreenCTM().inverse());
    }
} 