class MemoryFluxGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.phase = 'memory'; // 'memory', 'transition', 'recall'
        this.score = 0;
        this.round = 1;
        this.answeredQuestions = 0;
        this.totalQuestions = 10;
        
        this.memoryTime = 3000; // 3秒で記憶
        this.recallTime = 5000;  // 5秒で回答
        this.memoryDecay = 0;    // 記憶の劣化度
        
        this.objects = [];
        this.originalObjects = [];
        this.playerAnswers = [];
        this.currentQuestion = 0;
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.clicked = false;
        
        this.particles = [];
        this.glitchEffect = 0;
        this.colorShift = 0;
        
        this.memoryDistortions = [];
        this.timeElapsed = 0;
        
        this.setupEventListeners();
        this.startNewRound();
        this.gameLoop();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (this.phase === 'recall') {
                this.handleClick();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.phase === 'memory') {
                    this.startRecallPhase();
                }
            }
        });
    }
    
    startNewRound() {
        this.objects = [];
        this.originalObjects = [];
        this.memoryDecay = 0;
        this.glitchEffect = 0;
        this.timeElapsed = 0;
        this.memoryDistortions = [];
        
        // ランダムなオブジェクトを生成
        const objectCount = Math.min(3 + Math.floor(this.round / 2), 8);
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        const shapes = ['circle', 'square', 'triangle', 'diamond'];
        
        for (let i = 0; i < objectCount; i++) {
            const obj = {
                x: 100 + Math.random() * (this.canvas.width - 200),
                y: 100 + Math.random() * (this.canvas.height - 200),
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                size: 30 + Math.random() * 20,
                id: i,
                originalX: 0,
                originalY: 0,
                memoryX: 0,
                memoryY: 0,
                distortionX: 0,
                distortionY: 0
            };
            
            obj.originalX = obj.x;
            obj.originalY = obj.y;
            obj.memoryX = obj.x;
            obj.memoryY = obj.y;
            
            this.objects.push(obj);
        }
        
        // 記憶用のコピーを作成
        this.originalObjects = JSON.parse(JSON.stringify(this.objects));
        
        this.phase = 'memory';
        this.showPhaseIndicator('記憶フェーズ - オブジェクトを覚えてください');
        
        // 記憶時間後に自動で回答フェーズに移行
        setTimeout(() => {
            if (this.phase === 'memory') {
                this.startRecallPhase();
            }
        }, this.memoryTime);
    }
    
    startRecallPhase() {
        this.phase = 'transition';
        this.showPhaseIndicator('記憶が変化しています...');
        
        // 記憶の歪み効果を開始
        this.startMemoryDistortion();
        
        setTimeout(() => {
            this.phase = 'recall';
            this.currentQuestion = 0;
            this.playerAnswers = [];
            this.showPhaseIndicator('回答フェーズ - 記憶した位置をクリック');
            
            // 回答時間制限
            setTimeout(() => {
                if (this.phase === 'recall') {
                    this.endRound();
                }
            }, this.recallTime);
        }, 1000);
    }
    
    startMemoryDistortion() {
        // 記憶の歪み効果
        for (const obj of this.objects) {
            // 位置の微妙な変化
            const distortionFactor = 0.3 + (this.round * 0.1);
            obj.distortionX = (Math.random() - 0.5) * 100 * distortionFactor;
            obj.distortionY = (Math.random() - 0.5) * 100 * distortionFactor;
            
            // 色の変化（微妙に）
            if (Math.random() < 0.3) {
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
                obj.color = colors[Math.floor(Math.random() * colors.length)];
            }
            
            // サイズの変化
            obj.size += (Math.random() - 0.5) * 10;
        }
        
        this.memoryDecay = 0.5;
        this.glitchEffect = 1;
    }
    
    handleClick() {
        if (this.currentQuestion >= this.objects.length) return;
        
        const targetObj = this.originalObjects[this.currentQuestion];
        const clickedPos = { x: this.mouseX, y: this.mouseY };
        
        // 正解位置との距離を計算
        const distance = Math.sqrt(
            Math.pow(clickedPos.x - targetObj.originalX, 2) + 
            Math.pow(clickedPos.y - targetObj.originalY, 2)
        );
        
        let points = 0;
        let accuracy = 'Miss';
        
        if (distance < 40) {
            points = 100;
            accuracy = 'Perfect';
        } else if (distance < 80) {
            points = 50;
            accuracy = 'Good';
        } else if (distance < 120) {
            points = 20;
            accuracy = 'Close';
        }
        
        this.score += points;
        this.playerAnswers.push({
            target: targetObj,
            answer: clickedPos,
            distance: distance,
            points: points,
            accuracy: accuracy
        });
        
        // ヒット効果
        this.createHitEffect(clickedPos.x, clickedPos.y, accuracy, points);
        
        this.currentQuestion++;
        this.answeredQuestions++;
        
        if (this.currentQuestion >= this.objects.length) {
            this.endRound();
        }
        
        this.updateUI();
    }
    
    createHitEffect(x, y, accuracy, points) {
        const colors = {
            'Perfect': '#2ed573',
            'Good': '#ffa502',
            'Close': '#ff6348',
            'Miss': '#ff4757'
        };
        
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 3,
                life: 60,
                maxLife: 60,
                color: colors[accuracy],
                text: accuracy,
                points: points
            });
        }
    }
    
    endRound() {
        this.round++;
        
        if (this.answeredQuestions >= this.totalQuestions) {
            this.showGameComplete();
        } else {
            setTimeout(() => {
                this.startNewRound();
            }, 2000);
        }
    }
    
    showGameComplete() {
        this.phase = 'complete';
        this.showPhaseIndicator(`ゲーム完了! 最終スコア: ${this.score}`);
    }
    
    showPhaseIndicator(text) {
        const indicator = document.getElementById('phaseIndicator');
        indicator.textContent = text;
        indicator.style.opacity = '1';
        
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }
    
    updateUI() {
        document.getElementById('phase').textContent = 
            this.phase === 'memory' ? '記憶' : 
            this.phase === 'recall' ? '回答' : '移行';
        document.getElementById('score').textContent = this.score;
        document.getElementById('answered').textContent = this.answeredQuestions;
        
        // メモリーバーの更新（記憶の劣化を表現）
        const memoryFill = document.getElementById('memoryFill');
        const memoryPercent = Math.max(0, 100 - (this.memoryDecay * 100));
        memoryFill.style.width = memoryPercent + '%';
    }
    
    update() {
        this.timeElapsed += 16;
        
        // 記憶の劣化効果
        if (this.phase === 'recall') {
            this.memoryDecay = Math.min(1, this.memoryDecay + 0.002);
            
            // オブジェクトの位置を徐々に変化
            for (const obj of this.objects) {
                obj.x = obj.memoryX + obj.distortionX * this.memoryDecay;
                obj.y = obj.memoryY + obj.distortionY * this.memoryDecay;
            }
        }
        
        // グリッチ効果の減衰
        this.glitchEffect = Math.max(0, this.glitchEffect - 0.02);
        
        // 色相シフト
        this.colorShift += 0.5;
        
        // パーティクルの更新
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2;
            particle.life--;
            return particle.life > 0;
        });
        
        this.updateUI();
    }
    
    draw() {
        // 背景のクリア（記憶劣化効果付き）
        if (this.memoryDecay > 0) {
            this.ctx.fillStyle = `rgba(10, 10, 10, ${0.8 - this.memoryDecay * 0.3})`;
        } else {
            this.ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // グリッチ効果
        if (this.glitchEffect > 0) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = `rgba(255, 0, 0, ${this.glitchEffect * 0.1})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
        
        this.drawObjects();
        this.drawAnswerTargets();
        this.drawParticles();
        this.drawMemoryDistortion();
    }
    
    drawObjects() {
        for (const obj of this.objects) {
            let alpha = 1;
            
            // 記憶フェーズでは完全に表示
            if (this.phase === 'memory') {
                alpha = 1;
            } 
            // 回答フェーズでは記憶劣化に応じて透明度変化
            else if (this.phase === 'recall') {
                alpha = Math.max(0.2, 1 - this.memoryDecay * 0.8);
            } 
            // 移行フェーズでは点滅
            else if (this.phase === 'transition') {
                alpha = 0.3 + 0.7 * Math.sin(this.timeElapsed * 0.01);
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            // 色の歪み効果
            let color = obj.color;
            if (this.memoryDecay > 0.5) {
                const hueShift = this.colorShift + this.memoryDecay * 180;
                color = this.shiftHue(obj.color, hueShift);
            }
            
            this.drawShape(obj.x, obj.y, obj.size, color, obj.shape);
            this.ctx.restore();
        }
    }
    
    drawAnswerTargets() {
        if (this.phase === 'recall' && this.currentQuestion < this.objects.length) {
            const target = this.originalObjects[this.currentQuestion];
            
            // ターゲットのハイライト
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.arc(target.originalX, target.originalY, 60, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // 質問番号
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${this.currentQuestion + 1}`, target.originalX, target.originalY - 80);
        }
    }
    
    drawShape(x, y, size, color, shape) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        
        switch (shape) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'square':
                this.ctx.fillRect(x - size/2, y - size/2, size, size);
                this.ctx.strokeRect(x - size/2, y - size/2, size, size);
                break;
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - size/2);
                this.ctx.lineTo(x - size/2, y + size/2);
                this.ctx.lineTo(x + size/2, y + size/2);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'diamond':
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - size/2);
                this.ctx.lineTo(x + size/2, y);
                this.ctx.lineTo(x, y + size/2);
                this.ctx.lineTo(x - size/2, y);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // テキスト表示
            if (particle.life > 30) {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(particle.text, particle.x, particle.y - 20);
                
                if (particle.points > 0) {
                    this.ctx.fillText(`+${particle.points}`, particle.x, particle.y - 35);
                }
            }
        }
    }
    
    drawMemoryDistortion() {
        if (this.memoryDecay > 0.3) {
            // 記憶の歪みを視覚的に表現
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = `rgba(100, 0, 255, ${(this.memoryDecay - 0.3) * 0.2})`;
            
            for (let i = 0; i < 5; i++) {
                const wave = Math.sin(this.timeElapsed * 0.01 + i) * 10;
                this.ctx.fillRect(0, i * this.canvas.height / 5 + wave, this.canvas.width, 2);
            }
            this.ctx.restore();
        }
    }
    
    shiftHue(color, degrees) {
        // 簡易的な色相シフト
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#4ecdc4', '#96ceb4'];
        const index = colors.indexOf(color);
        if (index === -1) return color;
        
        const shiftAmount = Math.floor(degrees / 45) % colors.length;
        const newIndex = (index + shiftAmount) % colors.length;
        return colors[newIndex];
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new MemoryFluxGame();
});