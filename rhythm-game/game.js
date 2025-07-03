class RhythmGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.score = 0;
        this.combo = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.paused = false;
        
        this.lanes = 4;
        this.laneWidth = this.canvas.width / this.lanes;
        this.hitLineY = this.canvas.height - 100;
        this.perfectZone = 30;
        this.goodZone = 60;
        
        this.notes = [];
        this.audioContext = null;
        this.currentTime = 0;
        this.bpm = 120;
        this.beatInterval = (60 / this.bpm) * 1000;
        
        this.keys = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
        this.keyPressed = [false, false, false, false];
        this.keyColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        
        this.particles = [];
        this.hitEffects = [];
        
        this.setupAudio();
        this.setupEventListeners();
        this.generateNotes();
        this.gameLoop();
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createMetronome();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    createMetronome() {
        this.metronomeGain = this.audioContext.createGain();
        this.metronomeGain.connect(this.audioContext.destination);
        this.metronomeGain.gain.value = 0.3;
    }
    
    playBeep(frequency = 800, duration = 100) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.metronomeGain);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.paused = !this.paused;
                return;
            }
            
            const laneIndex = this.keys.indexOf(e.code);
            if (laneIndex !== -1 && !this.keyPressed[laneIndex]) {
                this.keyPressed[laneIndex] = true;
                this.checkHit(laneIndex);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const laneIndex = this.keys.indexOf(e.code);
            if (laneIndex !== -1) {
                this.keyPressed[laneIndex] = false;
            }
        });
    }
    
    generateNotes() {
        const patterns = [
            [0, 2, 1, 3],
            [0, 1, 2, 3],
            [3, 1, 0, 2],
            [0, 0, 2, 2],
            [1, 3, 1, 3],
            [0, 2, 0, 2],
            [1, 1, 3, 3]
        ];
        
        let currentBeat = 0;
        const totalBeats = 64;
        
        while (currentBeat < totalBeats) {
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            
            for (let i = 0; i < pattern.length; i++) {
                if (currentBeat >= totalBeats) break;
                
                const noteTime = currentBeat * this.beatInterval;
                const lane = pattern[i];
                
                if (Math.random() > 0.3) {
                    this.notes.push({
                        lane: lane,
                        time: noteTime,
                        y: -50,
                        hit: false,
                        type: Math.random() > 0.8 ? 'long' : 'normal',
                        longDuration: Math.random() > 0.5 ? this.beatInterval : this.beatInterval * 2
                    });
                    this.totalNotes++;
                }
                
                currentBeat += 0.5;
            }
        }
        
        this.notes.sort((a, b) => a.time - b.time);
    }
    
    checkHit(lane) {
        if (this.paused) return;
        
        const notesInLane = this.notes.filter(note => 
            note.lane === lane && 
            !note.hit && 
            Math.abs(note.y - this.hitLineY) <= this.goodZone
        );
        
        if (notesInLane.length === 0) {
            this.combo = 0;
            this.createHitEffect(lane, 'MISS', '#ff4757');
            return;
        }
        
        const closestNote = notesInLane.reduce((closest, note) => 
            Math.abs(note.y - this.hitLineY) < Math.abs(closest.y - this.hitLineY) ? note : closest
        );
        
        const distance = Math.abs(closestNote.y - this.hitLineY);
        let judgment, points, color, frequency;
        
        if (distance <= this.perfectZone) {
            judgment = 'PERFECT';
            points = 300;
            color = '#2ed573';
            frequency = 1000;
        } else if (distance <= this.goodZone) {
            judgment = 'GOOD';
            points = 100;
            color = '#ffa502';
            frequency = 800;
        } else {
            judgment = 'MISS';
            points = 0;
            color = '#ff4757';
            frequency = 400;
        }
        
        if (points > 0) {
            this.combo++;
            this.hitNotes++;
            const comboBonus = Math.floor(this.combo / 10) * 50;
            this.score += points + comboBonus;
            closestNote.hit = true;
            
            this.playBeep(frequency, 150);
            this.createParticles(lane);
        } else {
            this.combo = 0;
        }
        
        this.createHitEffect(lane, judgment, color);
        this.updateUI();
    }
    
    createParticles(lane) {
        const x = lane * this.laneWidth + this.laneWidth / 2;
        const y = this.hitLineY;
        
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 30,
                maxLife: 30,
                color: this.keyColors[lane]
            });
        }
    }
    
    createHitEffect(lane, text, color) {
        this.hitEffects.push({
            x: lane * this.laneWidth + this.laneWidth / 2,
            y: this.hitLineY - 30,
            text: text,
            color: color,
            life: 60,
            maxLife: 60
        });
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = this.combo;
        
        const accuracy = this.totalNotes > 0 ? Math.round((this.hitNotes / this.totalNotes) * 100) : 100;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }
    
    update() {
        if (this.paused) return;
        
        this.currentTime += 16;
        
        for (const note of this.notes) {
            if (!note.hit) {
                note.y += 3;
                
                if (note.y > this.canvas.height + 50) {
                    note.hit = true;
                    this.combo = 0;
                }
            }
        }
        
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2;
            particle.life--;
            return particle.life > 0;
        });
        
        this.hitEffects = this.hitEffects.filter(effect => {
            effect.y -= 1;
            effect.life--;
            return effect.life > 0;
        });
        
        this.notes = this.notes.filter(note => !note.hit || note.y < this.canvas.height + 100);
    }
    
    draw() {
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawLanes();
        this.drawHitLine();
        this.drawNotes();
        this.drawParticles();
        this.drawHitEffects();
        
        if (this.paused) {
            this.drawPauseScreen();
        }
    }
    
    drawLanes() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        
        for (let i = 1; i < this.lanes; i++) {
            const x = i * this.laneWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i < this.lanes; i++) {
            const x = i * this.laneWidth;
            const alpha = this.keyPressed[i] ? 0.3 : 0.1;
            this.ctx.fillStyle = this.keyColors[i] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(x, 0, this.laneWidth, this.canvas.height);
        }
    }
    
    drawHitLine() {
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.hitLineY);
        this.ctx.lineTo(this.canvas.width, this.hitLineY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
        this.ctx.fillRect(0, this.hitLineY - this.perfectZone, this.canvas.width, this.perfectZone * 2);
        
        this.ctx.fillStyle = 'rgba(255, 165, 2, 0.1)';
        this.ctx.fillRect(0, this.hitLineY - this.goodZone, this.canvas.width, this.goodZone * 2);
    }
    
    drawNotes() {
        for (const note of this.notes) {
            if (note.hit) continue;
            
            const x = note.lane * this.laneWidth + this.laneWidth / 2;
            const radius = 25;
            
            const gradient = this.ctx.createRadialGradient(x, note.y, 0, x, note.y, radius);
            gradient.addColorStop(0, this.keyColors[note.lane]);
            gradient.addColorStop(1, this.keyColors[note.lane] + '40');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, note.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = this.keyColors[note.lane];
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(['D', 'F', 'J', 'K'][note.lane], x, note.y + 6);
            
            if (note.type === 'long') {
                this.ctx.fillStyle = this.keyColors[note.lane] + '80';
                this.ctx.fillRect(x - 10, note.y + radius, 20, note.longDuration / 10);
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
    
    drawHitEffects() {
        for (const effect of this.hitEffects) {
            const alpha = effect.life / effect.maxLife;
            this.ctx.fillStyle = effect.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(effect.text, effect.x, effect.y);
        }
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('一時停止', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('スペースキーで再開', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new RhythmGame();
});