class TouhouGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.gameRunning = false;
        this.gameStarted = false;
        
        // Game dimensions
        this.gameWidth = 384;
        this.gameHeight = 448;
        
        // Player
        this.player = {
            x: 192,
            y: 400,
            width: 16,
            height: 16,
            speed: 3,
            slowSpeed: 1.5,
            hitboxRadius: 2,
            character: 'reimu',
            invulnerable: false,
            invulnerableTime: 0
        };
        
        // Game state
        this.score = 0;
        this.hiScore = parseInt(localStorage.getItem('touhou-hiscore') || 0);
        this.lives = 3;
        this.bombs = 3;
        this.power = 0;
        this.graze = 0;
        this.pointValue = 10;
        this.stage = 1;
        
        // Arrays for game objects
        this.playerBullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.powerItems = [];
        this.pointItems = [];
        this.boss = null;
        this.explosions = [];
        
        // Input handling
        this.keys = {};
        this.shootCooldown = 0;
        this.bombCooldown = 0;
        
        // Game timing
        this.frameCount = 0;
        this.lastTime = 0;
        
        // Spell card system
        this.currentSpell = null;
        this.spellCards = [
            {
                name: "紅符「スカーレットシュート」",
                pattern: "scarletShoot",
                duration: 600,
                hp: 300
            },
            {
                name: "符の壱「紅弾幕」",
                pattern: "redBulletHell",
                duration: 900,
                hp: 500
            }
        ];
        
        this.setupControls();
        this.updateUI();
        
        // Initialize high score display
        document.getElementById('hiScore').textContent = this.hiScore;
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'KeyZ' && this.gameRunning) {
                // Shooting handled in game loop for continuous fire
            }
            
            if (e.code === 'KeyX' && this.gameRunning && this.bombCooldown <= 0) {
                this.useBomb();
            }
            
            // Prevent default for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyZ', 'KeyX', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    startGame(character) {
        this.player.character = character;
        document.getElementById('startScreen').style.display = 'none';
        this.gameRunning = true;
        this.gameStarted = true;
        
        // Set character-specific stats
        if (character === 'marisa') {
            this.player.speed = 2.5;
            this.player.slowSpeed = 1.2;
        }
        
        this.spawnBoss();
        this.gameLoop();
    }
    
    updatePlayer() {
        if (!this.gameRunning) return;
        
        const isSlowMode = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        const speed = isSlowMode ? this.player.slowSpeed : this.player.speed;
        
        // Movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.gameWidth - this.player.width) {
            this.player.x += speed;
        }
        if (this.keys['ArrowUp'] && this.player.y > 0) {
            this.player.y -= speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.gameHeight - this.player.height) {
            this.player.y += speed;
        }
        
        // Shooting
        if (this.keys['KeyZ'] && this.shootCooldown <= 0) {
            this.shootPlayerBullet();
            this.shootCooldown = this.player.character === 'marisa' ? 4 : 6;
        }
        
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.bombCooldown > 0) this.bombCooldown--;
        
        // Handle invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerableTime--;
            if (this.player.invulnerableTime <= 0) {
                this.player.invulnerable = false;
            }
        }
        
        // Update player DOM
        const playerElement = document.getElementById('player');
        playerElement.style.left = this.player.x + 'px';
        playerElement.style.top = this.player.y + 'px';
        
        // Add slow mode visual effect
        if (isSlowMode) {
            playerElement.style.boxShadow = '0 0 8px #ff6b9d';
            playerElement.style.border = '2px solid #fff';
        } else {
            playerElement.style.boxShadow = 'none';
            playerElement.style.border = '1px solid #fff';
        }
        
        // Invulnerability visual effect
        if (this.player.invulnerable && Math.floor(this.player.invulnerableTime / 5) % 2) {
            playerElement.style.opacity = '0.3';
        } else {
            playerElement.style.opacity = '1';
        }
    }
    
    shootPlayerBullet() {
        const bullet = {
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 12,
            speed: 8,
            damage: this.player.character === 'marisa' ? 2 : 1
        };
        
        this.playerBullets.push(bullet);
        
        // Create DOM element
        const bulletElement = document.createElement('div');
        bulletElement.className = 'player-bullet';
        bulletElement.style.left = bullet.x + 'px';
        bulletElement.style.top = bullet.y + 'px';
        bulletElement.id = `pbullet_${this.playerBullets.length}`;
        
        this.gameArea.appendChild(bulletElement);
        
        // Multi-shot for higher power levels
        if (this.power >= 32) {
            // Side shots
            const leftBullet = {...bullet, x: bullet.x - 12};
            const rightBullet = {...bullet, x: bullet.x + 12};
            
            this.playerBullets.push(leftBullet, rightBullet);
            
            [leftBullet, rightBullet].forEach((b, i) => {
                const el = document.createElement('div');
                el.className = 'player-bullet';
                el.style.left = b.x + 'px';
                el.style.top = b.y + 'px';
                el.id = `pbullet_${this.playerBullets.length - 1 + i}`;
                this.gameArea.appendChild(el);
            });
        }
        
        if (this.power >= 64) {
            // Diagonal shots
            const diagLeft = {...bullet, x: bullet.x - 6, speed: 7};
            const diagRight = {...bullet, x: bullet.x + 6, speed: 7};
            
            this.playerBullets.push(diagLeft, diagRight);
            
            [diagLeft, diagRight].forEach((b, i) => {
                const el = document.createElement('div');
                el.className = 'player-bullet';
                el.style.left = b.x + 'px';
                el.style.top = b.y + 'px';
                el.id = `pbullet_${this.playerBullets.length - 1 + i}`;
                this.gameArea.appendChild(el);
            });
        }
    }
    
    updatePlayerBullets() {
        this.playerBullets.forEach((bullet, index) => {
            bullet.y -= bullet.speed;
            
            const bulletElement = document.getElementById(`pbullet_${index + 1}`);
            if (bulletElement) {
                bulletElement.style.top = bullet.y + 'px';
                
                // Remove if off screen
                if (bullet.y < -bullet.height) {
                    bulletElement.remove();
                    this.playerBullets.splice(index, 1);
                }
            }
        });
    }
    
    spawnBoss() {
        this.boss = {
            x: this.gameWidth / 2 - 24,
            y: 50,
            width: 48,
            height: 48,
            hp: 500,
            maxHp: 500,
            movePattern: 'horizontal',
            moveSpeed: 1,
            moveDirection: 1,
            shootCooldown: 0,
            spellIndex: 0,
            spellActive: false,
            spellTimer: 0
        };
        
        const bossElement = document.createElement('div');
        bossElement.className = 'boss';
        bossElement.style.left = this.boss.x + 'px';
        bossElement.style.top = this.boss.y + 'px';
        bossElement.id = 'boss';
        
        this.gameArea.appendChild(bossElement);
        this.updateUI();
    }
    
    updateBoss() {
        if (!this.boss) return;
        
        // Movement patterns
        if (this.boss.movePattern === 'horizontal') {
            this.boss.x += this.boss.moveSpeed * this.boss.moveDirection;
            
            if (this.boss.x <= 0 || this.boss.x >= this.gameWidth - this.boss.width) {
                this.boss.moveDirection *= -1;
            }
        }
        
        // Spell card logic
        if (!this.boss.spellActive && this.frameCount % 300 === 0) {
            this.activateSpellCard();
        }
        
        if (this.boss.spellActive) {
            this.updateSpellCard();
        } else {
            // Normal attack patterns
            if (this.boss.shootCooldown <= 0) {
                this.bossNormalShot();
                this.boss.shootCooldown = 30;
            }
        }
        
        if (this.boss.shootCooldown > 0) this.boss.shootCooldown--;
        
        // Update boss DOM
        const bossElement = document.getElementById('boss');
        if (bossElement) {
            bossElement.style.left = this.boss.x + 'px';
            bossElement.style.top = this.boss.y + 'px';
            
            // Damage flash effect
            if (this.boss.hitFlash) {
                bossElement.style.background = '#fff';
                this.boss.hitFlash--;
            } else {
                bossElement.style.background = '#8b0000';
            }
        }
        
        // Check if boss is defeated
        if (this.boss.hp <= 0) {
            this.defeatBoss();
        }
    }
    
    activateSpellCard() {
        if (this.boss.spellIndex < this.spellCards.length) {
            this.currentSpell = this.spellCards[this.boss.spellIndex];
            this.boss.spellActive = true;
            this.boss.spellTimer = this.currentSpell.duration;
            this.boss.hp = this.currentSpell.hp;
            this.boss.maxHp = this.currentSpell.hp;
            
            // Show spell card announcement
            this.showSpellCard();
            
            // Clear existing enemy bullets
            this.clearEnemyBullets();
        }
    }
    
    showSpellCard() {
        const spellElement = document.createElement('div');
        spellElement.className = 'spell-card';
        spellElement.innerHTML = `
            <div style="font-size: 16px; margin-bottom: 10px;">スペルカード宣言</div>
            <div>${this.currentSpell.name}</div>
        `;
        
        this.gameArea.appendChild(spellElement);
        
        setTimeout(() => {
            if (spellElement.parentNode) {
                spellElement.remove();
            }
        }, 2000);
        
        document.getElementById('currentSpell').textContent = this.currentSpell.name;
    }
    
    updateSpellCard() {
        if (!this.currentSpell) return;
        
        this.boss.spellTimer--;
        
        // Execute spell pattern
        switch (this.currentSpell.pattern) {
            case 'scarletShoot':
                this.spellScarletShoot();
                break;
            case 'redBulletHell':
                this.spellRedBulletHell();
                break;
        }
        
        // End spell card
        if (this.boss.spellTimer <= 0 || this.boss.hp <= 0) {
            this.endSpellCard();
        }
    }
    
    spellScarletShoot() {
        if (this.frameCount % 20 === 0) {
            const centerX = this.boss.x + this.boss.width / 2;
            const centerY = this.boss.y + this.boss.height;
            
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2 / 8) + (this.frameCount * 0.05);
                this.createEnemyBullet(
                    centerX,
                    centerY,
                    Math.cos(angle) * 2,
                    Math.sin(angle) * 2
                );
            }
        }
    }
    
    spellRedBulletHell() {
        if (this.frameCount % 10 === 0) {
            const centerX = this.boss.x + this.boss.width / 2;
            const centerY = this.boss.y + this.boss.height;
            
            for (let i = 0; i < 16; i++) {
                const angle = (i * Math.PI * 2 / 16) + (this.frameCount * 0.1);
                const speed = 1.5 + Math.sin(this.frameCount * 0.1) * 0.5;
                this.createEnemyBullet(
                    centerX,
                    centerY,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        }
    }
    
    endSpellCard() {
        this.boss.spellActive = false;
        this.boss.spellIndex++;
        this.currentSpell = null;
        document.getElementById('currentSpell').textContent = '-';
        
        // Bonus score for surviving spell card
        if (this.boss.hp > 0) {
            this.addScore(100000);
        }
        
        this.clearEnemyBullets();
    }
    
    bossNormalShot() {
        const centerX = this.boss.x + this.boss.width / 2;
        const centerY = this.boss.y + this.boss.height;
        
        // Simple aimed shot
        const dx = this.player.x + this.player.width / 2 - centerX;
        const dy = this.player.y + this.player.height / 2 - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.createEnemyBullet(
            centerX,
            centerY,
            (dx / distance) * 3,
            (dy / distance) * 3
        );
    }
    
    createEnemyBullet(x, y, vx, vy) {
        const bullet = {
            x: x,
            y: y,
            width: 8,
            height: 8,
            vx: vx,
            vy: vy,
            grazed: false
        };
        
        this.enemyBullets.push(bullet);
        
        const bulletElement = document.createElement('div');
        bulletElement.className = 'enemy-bullet';
        bulletElement.style.left = bullet.x + 'px';
        bulletElement.style.top = bullet.y + 'px';
        bulletElement.id = `ebullet_${this.enemyBullets.length}`;
        
        this.gameArea.appendChild(bulletElement);
    }
    
    updateEnemyBullets() {
        this.enemyBullets.forEach((bullet, index) => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            const bulletElement = document.getElementById(`ebullet_${index + 1}`);
            if (bulletElement) {
                bulletElement.style.left = bullet.x + 'px';
                bulletElement.style.top = bullet.y + 'px';
                
                // Remove if off screen
                if (bullet.x < -20 || bullet.x > this.gameWidth + 20 || 
                    bullet.y < -20 || bullet.y > this.gameHeight + 20) {
                    bulletElement.remove();
                    this.enemyBullets.splice(index, 1);
                }
            }
        });
    }
    
    checkCollisions() {
        // Player bullets vs Boss
        if (this.boss) {
            this.playerBullets.forEach((bullet, bulletIndex) => {
                if (this.isColliding(bullet, this.boss)) {
                    // Damage boss
                    this.boss.hp -= bullet.damage;
                    this.boss.hitFlash = 3;
                    
                    // Remove bullet
                    const bulletElement = document.getElementById(`pbullet_${bulletIndex + 1}`);
                    if (bulletElement) bulletElement.remove();
                    this.playerBullets.splice(bulletIndex, 1);
                    
                    this.addScore(10);
                    this.updateUI();
                }
            });
        }
        
        // Enemy bullets vs Player
        if (!this.player.invulnerable) {
            this.enemyBullets.forEach((bullet, index) => {
                const distance = this.getDistance(
                    bullet.x + bullet.width / 2,
                    bullet.y + bullet.height / 2,
                    this.player.x + this.player.width / 2,
                    this.player.y + this.player.height / 2
                );
                
                // Graze check
                if (!bullet.grazed && distance < 16 && distance > this.player.hitboxRadius) {
                    bullet.grazed = true;
                    this.graze++;
                    this.addScore(10);
                    this.updateUI();
                }
                
                // Hit check
                if (distance < this.player.hitboxRadius + 4) {
                    this.hitPlayer();
                    return;
                }
            });
        }
    }
    
    hitPlayer() {
        if (this.player.invulnerable) return;
        
        this.lives--;
        this.player.invulnerable = true;
        this.player.invulnerableTime = 120;
        this.power = Math.max(0, this.power - 16);
        
        // Create explosion effect
        this.createExplosion(this.player.x, this.player.y);
        
        // Clear some enemy bullets
        this.clearSomeEnemyBullets();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
        
        this.updateUI();
    }
    
    useBomb() {
        if (this.bombs <= 0) return;
        
        this.bombs--;
        this.bombCooldown = 60;
        
        // Clear all enemy bullets
        this.clearEnemyBullets();
        
        // Damage boss
        if (this.boss) {
            this.boss.hp -= 50;
            this.boss.hitFlash = 10;
        }
        
        // Create screen-wide explosion effect
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createExplosion(
                    Math.random() * this.gameWidth,
                    Math.random() * this.gameHeight
                );
            }, i * 100);
        }
        
        this.addScore(1000);
        this.updateUI();
    }
    
    createExplosion(x, y) {
        const explosion = {
            x: x,
            y: y,
            timer: 18
        };
        
        this.explosions.push(explosion);
        
        const explosionElement = document.createElement('div');
        explosionElement.className = 'explosion';
        explosionElement.style.left = x + 'px';
        explosionElement.style.top = y + 'px';
        explosionElement.id = `explosion_${this.explosions.length}`;
        
        this.gameArea.appendChild(explosionElement);
        
        setTimeout(() => {
            if (explosionElement.parentNode) {
                explosionElement.remove();
            }
        }, 300);
    }
    
    clearEnemyBullets() {
        this.enemyBullets.forEach((bullet, index) => {
            const bulletElement = document.getElementById(`ebullet_${index + 1}`);
            if (bulletElement) bulletElement.remove();
        });
        this.enemyBullets = [];
    }
    
    clearSomeEnemyBullets() {
        // Clear bullets near player
        this.enemyBullets = this.enemyBullets.filter((bullet, index) => {
            const distance = this.getDistance(
                bullet.x,
                bullet.y,
                this.player.x,
                this.player.y
            );
            
            if (distance < 100) {
                const bulletElement = document.getElementById(`ebullet_${index + 1}`);
                if (bulletElement) bulletElement.remove();
                return false;
            }
            return true;
        });
    }
    
    defeatBoss() {
        if (this.boss) {
            const bossElement = document.getElementById('boss');
            if (bossElement) bossElement.remove();
            
            this.createExplosion(this.boss.x, this.boss.y);
            this.addScore(1000000);
            
            this.boss = null;
            this.clearEnemyBullets();
            
            setTimeout(() => {
                this.stageComplete();
            }, 2000);
        }
    }
    
    stageComplete() {
        alert(`Stage ${this.stage} Complete!\nScore: ${this.score}`);
        this.stage++;
        
        if (this.stage <= 6) {
            // Spawn next boss
            this.spawnBoss();
        } else {
            this.gameComplete();
        }
        
        this.updateUI();
    }
    
    gameComplete() {
        alert(`Game Complete!\nFinal Score: ${this.score}\nThank you for playing!`);
        this.gameOver();
    }
    
    gameOver() {
        this.gameRunning = false;
        
        if (this.score > this.hiScore) {
            this.hiScore = this.score;
            localStorage.setItem('touhou-hiscore', this.hiScore);
            alert(`New High Score: ${this.score}!`);
        }
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
    
    addScore(points) {
        this.score += points;
        if (this.score > 99999999) this.score = 99999999;
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('hiScore').textContent = this.hiScore.toLocaleString();
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('bombs').textContent = this.bombs;
        document.getElementById('power').textContent = this.power;
        document.getElementById('graze').textContent = this.graze;
        document.getElementById('stage').textContent = this.stage;
        document.getElementById('bossHp').textContent = this.boss ? 
            Math.max(0, Math.ceil((this.boss.hp / this.boss.maxHp) * 100)) + '%' : '-';
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.frameCount++;
        
        this.updatePlayer();
        this.updatePlayerBullets();
        this.updateBoss();
        this.updateEnemyBullets();
        this.checkCollisions();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global function for character selection
function startGame(character) {
    if (window.game) {
        window.game.startGame(character);
    }
}

// Initialize game
window.onload = () => {
    window.game = new TouhouGame();
};