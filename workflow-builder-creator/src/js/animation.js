export class AnimationManager {
    constructor(state) {
        this.state = state;
        this.particles = [];
        this.isPlaying = false;
        this.baseSpeed = 0.05; // Base speed: percentage of path per second
        
        // 关键备注：定义粒子列车的参数。
        this.particleTrain = {
            count: 5,      // 每个列车中的粒子数量
            spacing: 0.08, // 粒子之间的间距 (进度的百分比)
        };

        // 关键备注：引入一个新的Map来管理需要同步的汇合点。
        // Key: 汇合点（目标节点）的ID
        // Value: 一个Set，包含所有已准备好并正在等待的输入连接的ID。
        this.waitingConnections = new Map();
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        if (this.particles.length === 0) {
            this.initFromSourceNodes();
        }
    }

    pause() {
        this.isPlaying = false;
    }

    reset() {
        this.isPlaying = false;
        this.particles = [];
    }

    initFromSourceNodes() {
        const allNodeIds = new Set(this.state.nodes.map(n => n.id));
        const targetNodeIds = new Set(this.state.connections.map(c => c.target));
        const sourceNodeIds = new Set([...allNodeIds].filter(id => !targetNodeIds.has(id)));

        sourceNodeIds.forEach(nodeId => {
            this.state.connections.forEach(conn => {
                if (conn.source === nodeId) {
                    // 关键备注：修复Bug，此处需要传递 this.particles作为目标数组。
                    this.tryToCreateTrain(conn.id, this.particles);
                }
            });
        });
    }

    // 关键备注：这个函数被重构，以同时处理"防重复"和"汇合点同步"两种逻辑。
    tryToCreateTrain(connectionId, targetArray) {
        // 关键备注：第一步，也是最重要的一步：检查这条连接上是否已经有粒子在运行。
        // 如果有，则立即返回，防止任何形式的粒子叠加。
        const alreadyHasTrain = this.particles.some(p => p.connectionId === connectionId);
        if (alreadyHasTrain) {
            return;
        }

        const connection = this.state.connections.find(c => c.id === connectionId);
        if (!connection) return;

        const targetNodeId = connection.target;
        const incomingConnections = this.state.connections.filter(c => c.target === targetNodeId);

        // 如果目标节点不是汇合点（只有一个输入），则直接创建列车。
        if (incomingConnections.length <= 1) {
            this.createParticleTrain(connectionId, targetArray);
            return;
        }

        // --- 汇合点同步逻辑 ---
        // 关键备注：如果目标是汇合点，则进入等待状态。
        if (!this.waitingConnections.has(targetNodeId)) {
            this.waitingConnections.set(targetNodeId, new Set());
        }
        const waitingSet = this.waitingConnections.get(targetNodeId);
        waitingSet.add(connectionId);

        // 关键备注：检查是否所有输入都已就绪。
        if (waitingSet.size === incomingConnections.length) {
            // 所有输入都已到达，同时为所有等待的连接创建粒子列车。
            waitingSet.forEach(connId => this.createParticleTrain(connId, targetArray));
            // 清理等待记录。
            this.waitingConnections.delete(targetNodeId);
        }
    }

    // 关键备注：这是一个新的辅助函数，用于在指定的连接上创建一组粒子（一个列车）。
    createParticleTrain(connectionId, targetArray) {
        for (let i = 0; i < this.particleTrain.count; i++) {
            targetArray.push({
                connectionId: connectionId,
                // 关键备注：通过设置负的初始进度，让粒子一个接一个地出现。
                progress: i * -this.particleTrain.spacing,
                // 关键备注：标记头车，未来可以用于实现特殊的视觉效果（例如，更大的光晕）。
                isHead: i === 0, 
            });
        }
    }

    update(deltaTime) {
        if (!this.isPlaying) return;

        const effectiveSpeed = this.baseSpeed * this.state.animationSpeed;
        const nextTrainsToCreate = new Set();
        const survivingParticles = [];
        const newlyCreatedParticles = [];

        // 关键备注：第一轮循环：更新现有粒子，找出幸存者和需要触发的下一批连接。
        for (const p of this.particles) {
            p.progress += effectiveSpeed * (deltaTime / 1000);

            if (p.isHead && p.progress >= 1) {
                const finishedConn = this.state.connections.find(c => c.id === p.connectionId);
                if (finishedConn) {
                    this.state.connections.forEach(nextConn => {
                        if (nextConn.source === finishedConn.target) {
                            nextTrainsToCreate.add(nextConn.id);
                        }
                    });
                }
            }

            if (p.progress < 1 + (this.particleTrain.count * this.particleTrain.spacing)) {
                survivingParticles.push(p);
            }
        }
        
        // 关键备注：第二轮循环：尝试为已触发的连接创建新的粒子列车。
        // 这些新粒子会被放入一个独立的临时数组中，避免竞态条件。
        nextTrainsToCreate.forEach(connId => {
            this.tryToCreateTrain(connId, newlyCreatedParticles);
        });

        // 关键备注：最后，合并幸存的粒子和新创建的粒子，作为下一帧的最终列表。
        this.particles = survivingParticles.concat(newlyCreatedParticles);

        // 新增：如果动画正在播放且没有粒子，自动重启
        if (this.isPlaying && this.particles.length === 0) {
            this.initFromSourceNodes();
        }
    }
} 