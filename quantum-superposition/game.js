class QuantumSuperpositionGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.quantumParticles = [];
        this.obstacles = [];
        this.entangledPairs = [];
        this.waveFunction = null;
        this.observationCount = 0;
        this.isObserving = false;
        this.tunnelEffect = false;
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        
        this.particles = [];
        this.interferencePattern = [];
        this.quantumStates = ['superposition', 'collapsed', 'entangled', 'tunneling'];
        this.currentState = 'superposition';
        
        this.setupPhysics();
        this.setupEventListeners();
        this.initializeQuantumSystem();
        this.gameLoop();
    }
    
    setupPhysics() {
        // 量子力学定数（簡略化）
        this.hbar = 1.0545718e-34; // プランク定数/2π（ゲーム用に調整）
        this.electronMass = 9.10938356e-31; // 電子質量（ゲーム用に調整）
        this.lightSpeed = 299792458; // 光速
        
        // ゲーム内物理定数
        this.quantumScale = 1000;
        this.probabilityThreshold = 0.1;
        this.coherenceTime = 2000; // ms
        this.tunnelProbability = 0.3;
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', (e) => {
            this.observeQuantumSystem();
        });
        
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.resetToSuperposition();
                    break;
                case 'KeyQ':
                    this.activateQuantumTunnel();
                    break;
                case 'KeyE':
                    this.createEntanglement();
                    break;
            }
        });
    }
    
    initializeQuantumSystem() {
        // 量子粒子の初期化
        for (let i = 0; i < 3; i++) {
            this.quantumParticles.push({
                id: i,
                superpositionStates: [
                    {x: 200 + i * 200, y: 200, probability: 0.4},
                    {x: 200 + i * 200, y: 400, probability: 0.3},
                    {x: 400 + i * 200, y: 300, probability: 0.3}
                ],
                collapsedState: null,
                isObserved: false,
                coherenceTime: this.coherenceTime,
                phase: Math.random() * Math.PI * 2,
                spin: Math.random() > 0.5 ? 0.5 : -0.5,
                energy: Math.random() * 10 + 5,
                entangled: false,
                entangledWith: null
            });
        }
        
        // 障壁の設置
        this.obstacles.push({
            x: 300,
            y: 250,
            width: 20,
            height: 100,
            transparency: 0.7,
            tunnelProbability: 0.2
        });
        
        this.obstacles.push({
            x: 500,
            y: 150,
            width: 20,
            height: 150,
            transparency: 0.9,
            tunnelProbability: 0.05
        });
        
        // 波動関数の初期化
        this.waveFunction = this.calculateWaveFunction();
    }
    
    calculateWaveFunction() {
        const waveFunction = [];
        const resolution = 50;
        
        for (let x = 0; x < this.canvas.width; x += resolution) {
            for (let y = 0; y < this.canvas.height; y += resolution) {
                let totalProbability = 0;
                let phase = 0;
                
                for (const particle of this.quantumParticles) {
                    if (!particle.isObserved) {
                        for (const state of particle.superpositionStates) {
                            const distance = Math.sqrt(Math.pow(x - state.x, 2) + Math.pow(y - state.y, 2));
                            const gaussianWidth = 80;
                            const probability = state.probability * Math.exp(-distance * distance / (2 * gaussianWidth * gaussianWidth));
                            totalProbability += probability;
                            phase += particle.phase;
                        }
                    }
                }
                
                waveFunction.push({
                    x: x,
                    y: y,
                    probability: totalProbability,
                    phase: phase,
                    amplitude: Math.sqrt(totalProbability)
                });
            }
        }
        
        return waveFunction;
    }
    
    observeQuantumSystem() {
        this.isObserving = true;
        this.observationCount++;
        
        // 波動関数の収束
        for (const particle of this.quantumParticles) {
            if (!particle.isObserved) {
                this.collapseWaveFunction(particle);
                this.showQuantumEffect('波動関数収束！');
                
                // もつれ粒子の瞬間的収束
                if (particle.entangled && particle.entangledWith) {
                    const entangledParticle = this.quantumParticles.find(p => p.id === particle.entangledWith);
                    if (entangledParticle && !entangledParticle.isObserved) {
                        this.collapseWaveFunction(entangledParticle);
                        this.showQuantumEffect('量子もつれ効果！');
                    }
                }
            }
        }
        
        this.currentState = 'collapsed';
        this.createCollapseParticles();
        this.updateUI();
        
        setTimeout(() => {
            this.isObserving = false;
        }, 500);
    }
    
    collapseWaveFunction(particle) {
        // 確率に基づいて状態を選択
        const random = Math.random();
        let cumulativeProbability = 0;
        
        for (const state of particle.superpositionStates) {
            cumulativeProbability += state.probability;
            if (random < cumulativeProbability) {
                particle.collapsedState = {x: state.x, y: state.y};
                particle.isObserved = true;
                break;
            }
        }
        
        // 量子トンネル効果の判定
        if (this.tunnelEffect) {
            for (const obstacle of this.obstacles) {
                if (this.isParticleInObstacle(particle.collapsedState, obstacle)) {
                    if (Math.random() < obstacle.tunnelProbability) {
                        particle.collapsedState.x += obstacle.width + 10;
                        this.showQuantumEffect('量子トンネル成功！');
                    }
                }
            }
        }
    }
    
    isParticleInObstacle(position, obstacle) {
        return position.x >= obstacle.x && 
               position.x <= obstacle.x + obstacle.width &&
               position.y >= obstacle.y && 
               position.y <= obstacle.y + obstacle.height;
    }
    
    resetToSuperposition() {
        for (const particle of this.quantumParticles) {
            particle.isObserved = false;
            particle.collapsedState = null;
            particle.coherenceTime = this.coherenceTime;
            particle.phase = Math.random() * Math.PI * 2;
            
            // 確率分布の再計算
            const total = particle.superpositionStates.reduce((sum, state) => sum + state.probability, 0);
            particle.superpositionStates.forEach(state => {
                state.probability = state.probability / total;
                state.x += (Math.random() - 0.5) * 20;
                state.y += (Math.random() - 0.5) * 20;
            });
        }
        
        this.currentState = 'superposition';
        this.waveFunction = this.calculateWaveFunction();
        this.tunnelEffect = false;
        this.showQuantumEffect('重ね合わせ状態復帰');
        this.updateUI();
    }
    
    activateQuantumTunnel() {
        this.tunnelEffect = true;
        this.showQuantumEffect('量子トンネル効果活性化');
        
        setTimeout(() => {
            this.tunnelEffect = false;
        }, 3000);
    }
    
    createEntanglement() {
        const unentangledParticles = this.quantumParticles.filter(p => !p.entangled);
        
        if (unentangledParticles.length >= 2) {
            const particle1 = unentangledParticles[0];
            const particle2 = unentangledParticles[1];
            
            particle1.entangled = true;
            particle1.entangledWith = particle2.id;
            particle2.entangled = true;
            particle2.entangledWith = particle1.id;
            
            // もつれ状態の同期
            if (particle1.spin === particle2.spin) {
                particle2.spin = -particle1.spin;
            }
            
            this.entangledPairs.push({
                particle1: particle1.id,
                particle2: particle2.id,
                createdAt: this.time
            });
            
            this.currentState = 'entangled';
            this.showQuantumEffect('量子もつれ生成！');
            this.createEntanglementEffect(particle1, particle2);
            this.updateUI();
        }
    }
    
    createEntanglementEffect(particle1, particle2) {
        const state1 = particle1.superpositionStates[0];
        const state2 = particle2.superpositionStates[0];
        
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: state1.x + (Math.random() - 0.5) * 40,
                y: state1.y + (Math.random() - 0.5) * 40,
                targetX: state2.x,
                targetY: state2.y,
                life: 60,
                maxLife: 60,
                color: '#ff6b6b',
                type: 'entanglement'
            });
        }
    }
    
    createCollapseParticles() {
        for (const particle of this.quantumParticles) {
            if (particle.collapsedState) {
                for (let i = 0; i < 15; i++) {
                    this.particles.push({
                        x: particle.collapsedState.x + (Math.random() - 0.5) * 30,
                        y: particle.collapsedState.y + (Math.random() - 0.5) * 30,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        life: 40,
                        maxLife: 40,
                        color: '#00ffff',
                        type: 'collapse'
                    });
                }
            }
        }
    }
    
    showQuantumEffect(message) {
        const effect = document.getElementById('quantumEffect');
        effect.textContent = message;
        effect.style.opacity = '1';
        effect.classList.add('collapse-animation');
        
        setTimeout(() => {
            effect.style.opacity = '0';
            effect.classList.remove('collapse-animation');
        }, 1000);
    }
    
    updateUI() {
        document.getElementById('quantumState').textContent = this.currentState;
        document.getElementById('observations').textContent = this.observationCount;
        
        const totalProbability = this.waveFunction ? 
            this.waveFunction.reduce((sum, point) => sum + point.probability, 0) : 0;
        const collapseProb = Math.min(100, totalProbability * 10);
        document.getElementById('collapseProb').textContent = Math.round(collapseProb) + '%';
        
        document.getElementById('entangled').textContent = this.entangledPairs.length;
        
        const probabilityText = totalProbability > 0 ? 
            `P(x) = ${totalProbability.toFixed(4)}` : '未計算';
        document.getElementById('probability').textContent = probabilityText;
    }
    
    update() {
        this.time += 16;
        
        // 粒子の更新
        this.particles = this.particles.filter(particle => {
            if (particle.type === 'entanglement') {
                const dx = particle.targetX - particle.x;
                const dy = particle.targetY - particle.y;
                particle.x += dx * 0.1;
                particle.y += dy * 0.1;
            } else {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1;
            }
            
            particle.life--;
            return particle.life > 0;
        });
        
        // コヒーレンス時間の減少
        for (const particle of this.quantumParticles) {
            if (!particle.isObserved) {
                particle.coherenceTime -= 16;
                if (particle.coherenceTime <= 0) {
                    particle.phase += Math.random() * 0.1;
                    particle.coherenceTime = this.coherenceTime;
                }
            }
        }
        
        // 波動関数の更新
        if (this.currentState === 'superposition') {
            this.waveFunction = this.calculateWaveFunction();
        }
        
        // 干渉パターンの計算
        this.calculateInterferencePattern();
        
        this.updateUI();
    }
    
    calculateInterferencePattern() {
        this.interferencePattern = [];
        
        for (let x = 0; x < this.canvas.width; x += 20) {
            for (let y = 0; y < this.canvas.height; y += 20) {
                let totalAmplitude = 0;
                let totalPhase = 0;
                
                for (const particle of this.quantumParticles) {
                    if (!particle.isObserved) {
                        for (const state of particle.superpositionStates) {
                            const distance = Math.sqrt(Math.pow(x - state.x, 2) + Math.pow(y - state.y, 2));
                            const wavelength = 50;
                            const amplitude = state.probability * Math.exp(-distance / 100);
                            const phase = (2 * Math.PI * distance / wavelength) + particle.phase;
                            
                            totalAmplitude += amplitude * Math.cos(phase);
                            totalPhase += phase;
                        }
                    }
                }
                
                const intensity = totalAmplitude * totalAmplitude;
                if (intensity > 0.01) {
                    this.interferencePattern.push({
                        x: x,
                        y: y,
                        intensity: intensity,
                        phase: totalPhase
                    });
                }
            }
        }
    }
    
    draw() {
        // 背景のクリア
        this.ctx.fillStyle = 'rgba(12, 12, 12, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawQuantumField();
        this.drawObstacles();
        this.drawQuantumParticles();
        this.drawWaveFunction();
        this.drawInterferencePattern();
        this.drawEntanglementConnections();
        this.drawParticles();
        this.drawQuantumTunnelEffect();
    }
    
    drawQuantumField() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(16, 21, 62, 0.3)');
        gradient.addColorStop(1, 'rgba(12, 12, 12, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawObstacles() {
        for (const obstacle of this.obstacles) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${obstacle.transparency})`;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // トンネル確率の表示
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.font = '12px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `T=${(obstacle.tunnelProbability * 100).toFixed(0)}%`,
                obstacle.x + obstacle.width / 2,
                obstacle.y - 10
            );
        }
    }
    
    drawQuantumParticles() {
        for (const particle of this.quantumParticles) {
            if (particle.isObserved && particle.collapsedState) {
                // 収束した状態
                this.ctx.fillStyle = '#00ffff';
                this.ctx.beginPath();
                this.ctx.arc(particle.collapsedState.x, particle.collapsedState.y, 8, 0, Math.PI * 2);
                this.ctx.fill();
                
                // スピンの表示
                this.ctx.strokeStyle = particle.spin > 0 ? '#ff6b6b' : '#4ecdc4';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(particle.collapsedState.x, particle.collapsedState.y, 15, 0, Math.PI * 2);
                this.ctx.stroke();
            } else {
                // 重ね合わせ状態
                for (const state of particle.superpositionStates) {
                    const alpha = state.probability;
                    this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(state.x, state.y, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // 確率の表示
                    this.ctx.fillStyle = '#feca57';
                    this.ctx.font = '10px Courier New';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(
                        `${(state.probability * 100).toFixed(0)}%`,
                        state.x, state.y - 15
                    );
                }
            }
        }
    }
    
    drawWaveFunction() {
        if (!this.waveFunction || this.currentState !== 'superposition') return;
        
        for (const point of this.waveFunction) {
            if (point.probability > 0.01) {
                const alpha = Math.min(1, point.probability * 2);
                this.ctx.fillStyle = `rgba(255, 0, 255, ${alpha * 0.3})`;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawInterferencePattern() {
        if (this.currentState !== 'superposition') return;
        
        for (const point of this.interferencePattern) {
            const alpha = Math.min(1, point.intensity * 0.5);
            this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawEntanglementConnections() {
        for (const pair of this.entangledPairs) {
            const particle1 = this.quantumParticles.find(p => p.id === pair.particle1);
            const particle2 = this.quantumParticles.find(p => p.id === pair.particle2);
            
            if (particle1 && particle2) {
                const pos1 = particle1.collapsedState || particle1.superpositionStates[0];
                const pos2 = particle2.collapsedState || particle2.superpositionStates[0];
                
                this.ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.moveTo(pos1.x, pos1.y);
                this.ctx.lineTo(pos2.x, pos2.y);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawQuantumTunnelEffect() {
        if (!this.tunnelEffect) return;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new QuantumSuperpositionGame();
});