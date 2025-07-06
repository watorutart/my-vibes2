class AINetworkPuzzle {
    constructor() {
        this.gridSize = 8;
        this.neurons = [];
        this.connections = [];
        this.level = 1;
        this.targetPattern = null;
        this.currentPattern = null;
        this.score = 0;
        this.efficiency = 0;
        this.patternRecognitionRate = 0;
        this.optimizationScore = 0;
        this.processingTime = 0;
        this.aiThoughts = [];
        
        this.init();
    }

    init() {
        this.createNeuralGrid();
        this.generateTargetPattern();
        this.updateDisplay();
        this.startAIAnalysis();
    }

    createNeuralGrid() {
        const grid = document.getElementById('neuralGrid');
        grid.innerHTML = '';
        this.neurons = [];

        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const neuron = document.createElement('div');
            neuron.className = 'neuron';
            neuron.id = `neuron-${i}`;
            neuron.textContent = i;
            neuron.onclick = () => this.toggleNeuron(i);
            
            grid.appendChild(neuron);
            
            this.neurons.push({
                id: i,
                active: false,
                connections: [],
                value: Math.random(),
                weight: Math.random() * 2 - 1,
                bias: Math.random() * 0.5 - 0.25
            });
        }
    }

    generateTargetPattern() {
        this.targetPattern = [];
        const patternTypes = ['spiral', 'wave', 'diagonal', 'cluster', 'fractal'];
        const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
        
        switch (patternType) {
            case 'spiral':
                this.generateSpiralPattern();
                break;
            case 'wave':
                this.generateWavePattern();
                break;
            case 'diagonal':
                this.generateDiagonalPattern();
                break;
            case 'cluster':
                this.generateClusterPattern();
                break;
            case 'fractal':
                this.generateFractalPattern();
                break;
        }
        
        this.updateAIThoughts(`目標パターン生成: ${patternType} パターンを分析中...`);
        this.displayPattern();
    }

    generateSpiralPattern() {
        const center = Math.floor(this.gridSize / 2);
        let x = center, y = center;
        let dx = 0, dy = -1;
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            if ((-this.gridSize/2 < x && x <= this.gridSize/2) && 
                (-this.gridSize/2 < y && y <= this.gridSize/2)) {
                const index = (y + center) * this.gridSize + (x + center);
                if (index >= 0 && index < this.gridSize * this.gridSize) {
                    this.targetPattern.push(index);
                }
            }
            
            if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1-y)) {
                [dx, dy] = [-dy, dx];
            }
            x += dx;
            y += dy;
        }
    }

    generateWavePattern() {
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const wave = Math.sin(x * 0.5) * Math.cos(y * 0.3);
                if (wave > 0.3) {
                    this.targetPattern.push(y * this.gridSize + x);
                }
            }
        }
    }

    generateDiagonalPattern() {
        for (let i = 0; i < this.gridSize; i++) {
            this.targetPattern.push(i * this.gridSize + i);
            if (i < this.gridSize - 1) {
                this.targetPattern.push(i * this.gridSize + (i + 1));
            }
        }
    }

    generateClusterPattern() {
        const clusters = Math.floor(Math.random() * 3) + 2;
        for (let c = 0; c < clusters; c++) {
            const centerX = Math.floor(Math.random() * this.gridSize);
            const centerY = Math.floor(Math.random() * this.gridSize);
            const radius = Math.floor(Math.random() * 2) + 1;
            
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    const x = centerX + dx;
                    const y = centerY + dy;
                    if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                        if (dx * dx + dy * dy <= radius * radius) {
                            this.targetPattern.push(y * this.gridSize + x);
                        }
                    }
                }
            }
        }
    }

    generateFractalPattern() {
        const drawLine = (x1, y1, x2, y2, depth) => {
            if (depth === 0) {
                const x = Math.floor(x1);
                const y = Math.floor(y1);
                if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                    this.targetPattern.push(y * this.gridSize + x);
                }
                return;
            }
            
            const dx = x2 - x1;
            const dy = y2 - y1;
            const x3 = x1 + dx / 3;
            const y3 = y1 + dy / 3;
            const x4 = x1 + 2 * dx / 3;
            const y4 = y1 + 2 * dy / 3;
            
            drawLine(x1, y1, x3, y3, depth - 1);
            drawLine(x3, y3, x4, y4, depth - 1);
            drawLine(x4, y4, x2, y2, depth - 1);
        };
        
        drawLine(0, 0, this.gridSize - 1, this.gridSize - 1, 2);
        drawLine(0, this.gridSize - 1, this.gridSize - 1, 0, 2);
    }

    toggleNeuron(index) {
        this.neurons[index].active = !this.neurons[index].active;
        this.updateNeuronDisplay(index);
        this.analyzeCurrentPattern();
    }

    updateNeuronDisplay(index) {
        const neuron = document.getElementById(`neuron-${index}`);
        neuron.className = 'neuron';
        
        if (this.neurons[index].active) {
            neuron.classList.add('active');
        }
        
        if (this.targetPattern.includes(index)) {
            neuron.classList.add('potential');
        }
        
        if (this.neurons[index].connections.length > 0) {
            neuron.classList.add('connected');
        }
    }

    analyzePattern() {
        const startTime = performance.now();
        this.updateAIThoughts('パターン解析を開始...');
        
        setTimeout(() => {
            this.currentPattern = this.neurons
                .map((neuron, index) => neuron.active ? index : null)
                .filter(index => index !== null);
            
            const similarity = this.calculatePatternSimilarity();
            this.patternRecognitionRate = Math.floor(similarity * 100);
            
            this.updateAIThoughts(`パターン認識完了: ${this.patternRecognitionRate}% の類似度を検出`);
            this.updateAIThoughts(`発見されたパターン: ${this.analyzePatternType(this.currentPattern)}`);
            
            this.processingTime = Math.floor(performance.now() - startTime);
            this.updateDisplay();
        }, 100);
    }

    calculatePatternSimilarity() {
        if (this.targetPattern.length === 0) return 0;
        
        const matches = this.currentPattern.filter(index => 
            this.targetPattern.includes(index)
        ).length;
        
        const totalTarget = this.targetPattern.length;
        const totalCurrent = this.currentPattern.length;
        
        if (totalCurrent === 0) return 0;
        
        const precision = matches / totalCurrent;
        const recall = matches / totalTarget;
        
        return (precision + recall) / 2;
    }

    analyzePatternType(pattern) {
        if (pattern.length === 0) return '空のパターン';
        
        const analysis = {
            linear: this.checkLinearPattern(pattern),
            clustered: this.checkClusteredPattern(pattern),
            symmetric: this.checkSymmetricPattern(pattern),
            fractal: this.checkFractalPattern(pattern)
        };
        
        const maxType = Object.keys(analysis).reduce((a, b) => 
            analysis[a] > analysis[b] ? a : b
        );
        
        return `${maxType} (信頼度: ${Math.floor(analysis[maxType] * 100)}%)`;
    }

    checkLinearPattern(pattern) {
        if (pattern.length < 2) return 0;
        
        let linearCount = 0;
        for (let i = 0; i < pattern.length - 1; i++) {
            const diff = pattern[i + 1] - pattern[i];
            if (Math.abs(diff) === 1 || Math.abs(diff) === this.gridSize) {
                linearCount++;
            }
        }
        
        return linearCount / (pattern.length - 1);
    }

    checkClusteredPattern(pattern) {
        let clusterScore = 0;
        for (let i = 0; i < pattern.length; i++) {
            let neighbors = 0;
            const x = pattern[i] % this.gridSize;
            const y = Math.floor(pattern[i] / this.gridSize);
            
            for (let j = 0; j < pattern.length; j++) {
                if (i === j) continue;
                const nx = pattern[j] % this.gridSize;
                const ny = Math.floor(pattern[j] / this.gridSize);
                
                if (Math.abs(x - nx) <= 1 && Math.abs(y - ny) <= 1) {
                    neighbors++;
                }
            }
            
            clusterScore += neighbors;
        }
        
        return clusterScore / (pattern.length * pattern.length);
    }

    checkSymmetricPattern(pattern) {
        let symmetryScore = 0;
        const center = this.gridSize / 2;
        
        for (let index of pattern) {
            const x = index % this.gridSize;
            const y = Math.floor(index / this.gridSize);
            
            const mirrorX = this.gridSize - 1 - x;
            const mirrorY = this.gridSize - 1 - y;
            const mirrorIndex = mirrorY * this.gridSize + mirrorX;
            
            if (pattern.includes(mirrorIndex)) {
                symmetryScore++;
            }
        }
        
        return symmetryScore / pattern.length;
    }

    checkFractalPattern(pattern) {
        return Math.random() * 0.5;
    }

    optimizeConnections() {
        const startTime = performance.now();
        this.updateAIThoughts('接続最適化アルゴリズムを実行中...');
        
        setTimeout(() => {
            this.connections = [];
            
            for (let i = 0; i < this.neurons.length; i++) {
                if (!this.neurons[i].active) continue;
                
                for (let j = i + 1; j < this.neurons.length; j++) {
                    if (!this.neurons[j].active) continue;
                    
                    const distance = this.calculateNeuronDistance(i, j);
                    const weight = 1 / (distance + 1);
                    
                    if (weight > 0.3) {
                        this.connections.push({
                            from: i,
                            to: j,
                            weight: weight,
                            active: true
                        });
                        
                        this.neurons[i].connections.push(j);
                        this.neurons[j].connections.push(i);
                    }
                }
            }
            
            this.optimizationScore = this.calculateOptimizationScore();
            this.efficiency = Math.floor(this.optimizationScore * 100);
            
            this.updateAIThoughts(`最適化完了: ${this.connections.length} 個の接続を生成`);
            this.updateAIThoughts(`効率スコア: ${this.efficiency}%`);
            
            this.processingTime = Math.floor(performance.now() - startTime);
            this.updateDisplay();
        }, 200);
    }

    calculateNeuronDistance(index1, index2) {
        const x1 = index1 % this.gridSize;
        const y1 = Math.floor(index1 / this.gridSize);
        const x2 = index2 % this.gridSize;
        const y2 = Math.floor(index2 / this.gridSize);
        
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    calculateOptimizationScore() {
        if (this.connections.length === 0) return 0;
        
        let totalWeight = 0;
        let redundancy = 0;
        
        for (let connection of this.connections) {
            totalWeight += connection.weight;
            
            if (this.neurons[connection.from].connections.length > 4) {
                redundancy += 0.1;
            }
        }
        
        const avgWeight = totalWeight / this.connections.length;
        const efficiency = avgWeight - redundancy;
        
        return Math.max(0, Math.min(1, efficiency));
    }

    simulateNetwork() {
        const startTime = performance.now();
        this.updateAIThoughts('ニューラルネットワークシミュレーションを開始...');
        
        setTimeout(() => {
            let activationWave = [];
            
            for (let step = 0; step < 10; step++) {
                const newActivations = [];
                
                for (let i = 0; i < this.neurons.length; i++) {
                    if (!this.neurons[i].active) continue;
                    
                    let totalInput = this.neurons[i].value;
                    
                    for (let connection of this.connections) {
                        if (connection.to === i && this.neurons[connection.from].active) {
                            totalInput += this.neurons[connection.from].value * connection.weight;
                        }
                    }
                    
                    const activation = this.sigmoid(totalInput + this.neurons[i].bias);
                    newActivations.push({ index: i, value: activation });
                }
                
                for (let activation of newActivations) {
                    this.neurons[activation.index].value = activation.value;
                }
                
                activationWave.push(newActivations.length);
            }
            
            const networkStability = this.calculateNetworkStability(activationWave);
            const convergence = this.calculateConvergence();
            
            this.updateAIThoughts(`ネットワーク安定性: ${Math.floor(networkStability * 100)}%`);
            this.updateAIThoughts(`収束率: ${Math.floor(convergence * 100)}%`);
            
            this.score += Math.floor((networkStability + convergence) * 50);
            this.processingTime = Math.floor(performance.now() - startTime);
            this.updateDisplay();
        }, 300);
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    calculateNetworkStability(activationWave) {
        if (activationWave.length < 2) return 0;
        
        let stability = 0;
        for (let i = 1; i < activationWave.length; i++) {
            const change = Math.abs(activationWave[i] - activationWave[i-1]);
            stability += 1 / (1 + change);
        }
        
        return stability / (activationWave.length - 1);
    }

    calculateConvergence() {
        const activeNeurons = this.neurons.filter(n => n.active);
        if (activeNeurons.length === 0) return 0;
        
        let convergence = 0;
        for (let neuron of activeNeurons) {
            if (neuron.value > 0.7) {
                convergence++;
            }
        }
        
        return convergence / activeNeurons.length;
    }

    nextLevel() {
        this.level++;
        this.gridSize = Math.min(12, 8 + Math.floor(this.level / 3));
        this.updateAIThoughts(`レベル ${this.level} に進化: グリッドサイズ ${this.gridSize}x${this.gridSize}`);
        this.init();
    }

    reset() {
        this.neurons.forEach(neuron => {
            neuron.active = false;
            neuron.connections = [];
            neuron.value = Math.random();
        });
        
        this.connections = [];
        this.efficiency = 0;
        this.patternRecognitionRate = 0;
        this.optimizationScore = 0;
        this.processingTime = 0;
        
        this.updateAIThoughts('ネットワークがリセットされました');
        this.updateDisplay();
    }

    updateAIThoughts(thought) {
        this.aiThoughts.unshift(`[${new Date().toLocaleTimeString()}] ${thought}`);
        if (this.aiThoughts.length > 5) {
            this.aiThoughts.pop();
        }
        
        const thoughtsDiv = document.getElementById('aiThoughts');
        thoughtsDiv.innerHTML = this.aiThoughts.join('<br>');
    }

    displayPattern() {
        const pattern = Array(this.gridSize * this.gridSize).fill('○');
        for (let index of this.targetPattern) {
            pattern[index] = '●';
        }
        
        let display = '';
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                display += pattern[i * this.gridSize + j] + ' ';
            }
            display += '\n';
        }
        
        document.getElementById('patternDisplay').textContent = 
            `目標パターン:\n${display}`;
    }

    updateDisplay() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('efficiency').textContent = `${this.efficiency}%`;
        document.getElementById('patternRate').textContent = `${this.patternRecognitionRate}%`;
        document.getElementById('optimizationScore').textContent = this.optimizationScore;
        document.getElementById('processingTime').textContent = `${this.processingTime}ms`;
        
        const progress = Math.min(100, (this.efficiency + this.patternRecognitionRate) / 2);
        document.getElementById('progress').style.width = `${progress}%`;
        
        for (let i = 0; i < this.neurons.length; i++) {
            this.updateNeuronDisplay(i);
        }
    }

    startAIAnalysis() {
        this.updateAIThoughts('AIシステム初期化完了');
        this.updateAIThoughts('パターン認識モジュール起動');
        this.updateAIThoughts('最適化エンジン準備完了');
        this.updateAIThoughts('ネットワーク解析を開始してください');
        
        this.startAutoAIMode();
    }

    startAutoAIMode() {
        setTimeout(() => {
            this.updateAIThoughts('自動AI解析モードを開始...');
            this.performAIAnalysis();
        }, 2000);
    }

    performAIAnalysis() {
        this.updateAIThoughts('深層学習アルゴリズムでパターンを予測中...');
        
        setTimeout(() => {
            const bestPattern = this.findOptimalPattern();
            this.applyAIPattern(bestPattern);
            this.updateAIThoughts(`AI推奨パターンを適用: ${bestPattern.length} ノード`);
            
            setTimeout(() => {
                this.analyzePattern();
                setTimeout(() => {
                    this.optimizeConnections();
                    setTimeout(() => {
                        this.simulateNetwork();
                        this.updateAIThoughts('AI分析サイクル完了。次のレベルに進む準備ができました。');
                    }, 500);
                }, 500);
            }, 500);
        }, 1000);
    }

    findOptimalPattern() {
        const candidates = [];
        
        for (let i = 0; i < 5; i++) {
            const pattern = this.generateRandomPattern();
            const score = this.evaluatePattern(pattern);
            candidates.push({ pattern, score });
        }
        
        candidates.sort((a, b) => b.score - a.score);
        return candidates[0].pattern;
    }

    generateRandomPattern() {
        const pattern = [];
        const numNodes = Math.floor(Math.random() * 15) + 5;
        
        for (let i = 0; i < numNodes; i++) {
            let node;
            do {
                node = Math.floor(Math.random() * this.gridSize * this.gridSize);
            } while (pattern.includes(node));
            pattern.push(node);
        }
        
        return pattern;
    }

    evaluatePattern(pattern) {
        let score = 0;
        
        score += this.calculatePatternComplexity(pattern) * 0.3;
        score += this.calculatePatternEfficiency(pattern) * 0.4;
        score += this.calculatePatternAesthetics(pattern) * 0.3;
        
        return score;
    }

    calculatePatternComplexity(pattern) {
        if (pattern.length === 0) return 0;
        
        let complexity = 0;
        for (let i = 0; i < pattern.length - 1; i++) {
            const distance = Math.abs(pattern[i+1] - pattern[i]);
            complexity += distance / (this.gridSize * this.gridSize);
        }
        
        return complexity / (pattern.length - 1);
    }

    calculatePatternEfficiency(pattern) {
        let efficiency = 0;
        const center = Math.floor(this.gridSize * this.gridSize / 2);
        
        for (let node of pattern) {
            const distance = Math.abs(node - center);
            efficiency += 1 / (1 + distance / (this.gridSize * this.gridSize));
        }
        
        return efficiency / pattern.length;
    }

    calculatePatternAesthetics(pattern) {
        let aesthetics = 0;
        
        for (let i = 0; i < pattern.length; i++) {
            const x = pattern[i] % this.gridSize;
            const y = Math.floor(pattern[i] / this.gridSize);
            
            const goldenRatio = 1.618;
            const goldenX = Math.abs(x - this.gridSize / goldenRatio);
            const goldenY = Math.abs(y - this.gridSize / goldenRatio);
            
            aesthetics += 1 / (1 + goldenX + goldenY);
        }
        
        return aesthetics / pattern.length;
    }

    applyAIPattern(pattern) {
        this.neurons.forEach(neuron => neuron.active = false);
        
        for (let index of pattern) {
            if (index < this.neurons.length) {
                this.neurons[index].active = true;
            }
        }
        
        this.updateDisplay();
    }

    addAICompetitiveMode() {
        const competitiveBtn = document.createElement('button');
        competitiveBtn.className = 'btn';
        competitiveBtn.textContent = 'AI対戦モード';
        competitiveBtn.onclick = () => this.startAIBattle();
        
        document.querySelector('.controls').appendChild(competitiveBtn);
    }

    startAIBattle() {
        this.updateAIThoughts('AI対戦モードを開始...');
        this.updateAIThoughts('対戦相手AI「ニューラルマスター」が参戦');
        
        setTimeout(() => {
            const opponentPattern = this.generateOpponentPattern();
            this.showOpponentPattern(opponentPattern);
            
            const playerScore = this.calculatePlayerScore();
            const opponentScore = this.calculateOpponentScore(opponentPattern);
            
            this.updateAIThoughts(`プレイヤースコア: ${playerScore}`);
            this.updateAIThoughts(`AI対戦相手スコア: ${opponentScore}`);
            
            if (playerScore > opponentScore) {
                this.updateAIThoughts('勝利！素晴らしいパターン認識能力です！');
                this.score += 100;
            } else {
                this.updateAIThoughts('敗北...AI対戦相手の方が効率的でした');
                this.updateAIThoughts('次回はより最適化されたパターンを目指しましょう');
            }
            
            this.updateDisplay();
        }, 2000);
    }

    generateOpponentPattern() {
        const strategies = ['aggressive', 'defensive', 'balanced', 'chaotic'];
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        
        this.updateAIThoughts(`対戦相手の戦略: ${strategy}`);
        
        return this.findOptimalPattern();
    }

    showOpponentPattern(pattern) {
        const display = Array(this.gridSize * this.gridSize).fill('○');
        for (let index of pattern) {
            display[index] = '▲';
        }
        
        let visualDisplay = '';
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                visualDisplay += display[i * this.gridSize + j] + ' ';
            }
            visualDisplay += '\n';
        }
        
        document.getElementById('patternDisplay').textContent = 
            `対戦相手のパターン:\n${visualDisplay}`;
    }

    calculatePlayerScore() {
        const efficiency = this.efficiency;
        const patternRate = this.patternRecognitionRate;
        const optimizationScore = this.optimizationScore * 100;
        
        return Math.floor((efficiency + patternRate + optimizationScore) / 3);
    }

    calculateOpponentScore(pattern) {
        const complexity = this.calculatePatternComplexity(pattern) * 100;
        const efficiency = this.calculatePatternEfficiency(pattern) * 100;
        const aesthetics = this.calculatePatternAesthetics(pattern) * 100;
        
        return Math.floor((complexity + efficiency + aesthetics) / 3);
    }

    toggleAIAssistant() {
        this.aiAssistantActive = !this.aiAssistantActive;
        
        if (this.aiAssistantActive) {
            this.updateAIThoughts('AIアシスタントが起動しました');
            this.updateAIThoughts('リアルタイム最適化提案を開始します');
            this.startAIAssistant();
        } else {
            this.updateAIThoughts('AIアシスタントが停止しました');
            this.stopAIAssistant();
        }
    }

    startAIAssistant() {
        this.aiAssistantInterval = setInterval(() => {
            const suggestion = this.generateAISuggestion();
            this.updateAIThoughts(`💡 提案: ${suggestion}`);
        }, 3000);
    }

    stopAIAssistant() {
        if (this.aiAssistantInterval) {
            clearInterval(this.aiAssistantInterval);
            this.aiAssistantInterval = null;
        }
    }

    generateAISuggestion() {
        const suggestions = [
            'パターンの中央集中を試してみてください',
            'より対称的な配置を検討してみましょう',
            'エッジ付近のノードを活用してみてください',
            'クラスター化を最適化してみましょう',
            'ランダムパターンで新しい発見があるかもしれません',
            'フラクタル的なアプローチを試してみてください',
            'ネットワーク密度を調整してみましょう',
            'パターン認識率を向上させるため、より複雑な形状を試してみてください'
        ];
        
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
}

const game = new AINetworkPuzzle();

window.onload = () => {
    game.addAICompetitiveMode();
    
    const advancedControls = document.createElement('div');
    advancedControls.innerHTML = `
        <button class="btn" onclick="game.startAIBattle()">AI対戦モード</button>
        <button class="btn" onclick="game.performAIAnalysis()">AI自動解析</button>
        <button class="btn" onclick="game.toggleAIAssistant()">AIアシスタント</button>
    `;
    
    document.querySelector('.controls').appendChild(advancedControls);
};