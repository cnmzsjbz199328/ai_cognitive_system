export class AnimationManager {
    constructor(state) {
        this.state = state;
        this.particles = [];
        this.isPlaying = false;
        this.animationSpeed = 0.05; // Represents percentage of path per second
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        if (this.particles.length === 0) {
            this.initParticles();
        }
    }

    pause() {
        this.isPlaying = false;
    }

    reset() {
        this.isPlaying = false;
        this.particles = [];
    }

    initParticles() {
        this.particles = this.state.connections.map(conn => ({
            connectionId: conn.id,
            progress: 0, // 0 to 1
        }));
    }

    update(deltaTime) {
        if (!this.isPlaying) return;

        this.particles.forEach(p => {
            p.progress += this.animationSpeed * (deltaTime / 1000);
            if (p.progress >= 1) {
                p.progress = 0; // Loop the animation
            }
        });
    }
} 