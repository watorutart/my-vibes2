class SuperMarioBros {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameWidth = window.innerWidth;
        this.gameHeight = window.innerHeight;
        
        this.mario = {
            x: 100,
            y: this.gameHeight - 200,
            width: 32,
            height: 32,
            velocityX: 0,
            velocityY: 0,
            speed: 5,
            jumpPower: 15,
            onGround: false,
            facing: 'right',
            state: 'small', // small, big, fire
            invulnerable: false,
            invulnerableTime: 0,
            ducking: false,
            walking: false
        };
        
        this.camera = {
            x: 0,
            y: 0
        };
        
        this.gravity = 0.8;
        this.maxFallSpeed = 12;
        
        this.keys = {};
        this.gameRunning = true;
        
        this.blocks = [];
        this.enemies = [];
        this.powerups = [];
        this.coins = [];
        this.fireballs = [];
        this.flagpole = null;
        
        this.score = 0;
        this.lives = 3;
        this.gameCoins = 0;
        this.time = 400;
        this.world = '1-1';
        
        this.levelWidth = 3392; // 13 screens worth
        
        this.initGame();
        this.setupControls();
        this.createLevel();
        this.gameLoop();
    }
    
    initGame() {
        const mario = document.getElementById('mario');
        mario.style.left = this.mario.x + 'px';
        mario.style.bottom = (this.gameHeight - this.mario.y - this.mario.height) + 'px';
        
        this.updateUI();
        this.startTimer();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            // Prevent default for arrow keys and WASD
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'x'].includes(e.key)) {
                e.preventDefault();
            }
            
            // Fireball shooting
            if (e.key.toLowerCase() === 'x' && this.mario.state === 'fire') {
                this.shootFireball();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    createLevel() {
        // Ground blocks
        for (let i = 0; i < 100; i++) {
            this.createBlock(i * 32, this.gameHeight - 64, 'ground');
        }
        
        // Question blocks
        this.createBlock(256, this.gameHeight - 200, 'question');
        this.createBlock(320, this.gameHeight - 200, 'question');
        this.createBlock(352, this.gameHeight - 200, 'question');
        this.createBlock(384, this.gameHeight - 200, 'question');
        
        // Brick blocks
        this.createBlock(320, this.gameHeight - 264, 'brick');
        this.createBlock(352, this.gameHeight - 264, 'brick');
        this.createBlock(384, this.gameHeight - 264, 'brick');
        this.createBlock(416, this.gameHeight - 264, 'brick');
        this.createBlock(448, this.gameHeight - 264, 'brick');
        this.createBlock(480, this.gameHeight - 264, 'brick');
        this.createBlock(512, this.gameHeight - 264, 'brick');
        this.createBlock(544, this.gameHeight - 264, 'brick');
        
        // Platforms
        for (let i = 0; i < 4; i++) {
            this.createBlock(672 + i * 32, this.gameHeight - 200, 'brick');
        }
        
        // Pipe
        this.createPipe(896, this.gameHeight - 128, 64, 64);
        
        // More platforms
        for (let i = 0; i < 3; i++) {
            this.createBlock(1120 + i * 32, this.gameHeight - 200, 'brick');
        }
        
        // High platform
        for (let i = 0; i < 8; i++) {
            this.createBlock(1280 + i * 32, this.gameHeight - 330, 'brick');
        }
        
        // Enemies
        this.createEnemy(400, this.gameHeight - 96, 'goomba');
        this.createEnemy(600, this.gameHeight - 96, 'goomba');
        this.createEnemy(800, this.gameHeight - 96, 'goomba');
        this.createEnemy(1000, this.gameHeight - 96, 'koopa');
        this.createEnemy(1200, this.gameHeight - 96, 'goomba');
        
        // Powerups (hidden in question blocks)
        // We'll spawn these when blocks are hit
        
        // Coins scattered throughout level
        this.createCoin(200, this.gameHeight - 150);
        this.createCoin(450, this.gameHeight - 280);
        this.createCoin(500, this.gameHeight - 280);
        this.createCoin(550, this.gameHeight - 280);
        this.createCoin(700, this.gameHeight - 150);
        this.createCoin(950, this.gameHeight - 180);
        this.createCoin(1050, this.gameHeight - 150);
        this.createCoin(1300, this.gameHeight - 250);
        this.createCoin(1400, this.gameHeight - 400);
        this.createCoin(1500, this.gameHeight - 400);
        
        // Goal flagpole at end of level
        this.createFlagpole(3200, this.gameHeight - 300);
        
        this.createClouds();
        this.createHills();
    }
    
    createBlock(x, y, type) {
        const block = {
            x: x,
            y: y,
            width: 32,
            height: 32,
            type: type,
            active: true,
            hit: false
        };
        
        this.blocks.push(block);
        
        // Create DOM element
        const blockElement = document.createElement('div');
        if (type === 'ground') {
            blockElement.className = 'block';
            blockElement.style.background = '#8B4513';
        } else if (type === 'brick') {
            blockElement.className = 'brick';
        } else if (type === 'question') {
            blockElement.className = 'block';
            blockElement.style.background = '#FFD700';
            blockElement.innerHTML = '?';
            blockElement.style.textAlign = 'center';
            blockElement.style.lineHeight = '28px';
            blockElement.style.fontWeight = 'bold';
        }
        
        blockElement.style.left = x + 'px';
        blockElement.style.top = y + 'px';
        blockElement.id = `block_${this.blocks.length}`;
        
        document.getElementById('gameContainer').appendChild(blockElement);
    }
    
    createPipe(x, y, width, height) {
        const pipe = {
            x: x,
            y: y,
            width: width,
            height: height,
            type: 'pipe'
        };
        
        this.blocks.push(pipe);
        
        const pipeElement = document.createElement('div');
        pipeElement.className = 'pipe';
        pipeElement.style.left = x + 'px';
        pipeElement.style.top = y + 'px';
        pipeElement.style.width = width + 'px';
        pipeElement.style.height = height + 'px';
        
        document.getElementById('gameContainer').appendChild(pipeElement);
    }
    
    createEnemy(x, y, type) {
        const enemy = {
            x: x,
            y: y,
            width: 28,
            height: 28,
            velocityX: -1,
            velocityY: 0,
            type: type,
            active: true,
            onGround: false
        };
        
        this.enemies.push(enemy);
        
        const enemyElement = document.createElement('div');
        enemyElement.className = 'enemy';
        if (type === 'koopa') {
            enemyElement.style.background = '#228B22';
            enemyElement.style.borderRadius = '20%';
        }
        enemyElement.style.left = x + 'px';
        enemyElement.style.top = y + 'px';
        enemyElement.id = `enemy_${this.enemies.length}`;
        
        document.getElementById('gameContainer').appendChild(enemyElement);
    }
    
    createPowerup(x, y, type) {
        const powerup = {
            x: x,
            y: y,
            width: 28,
            height: 28,
            velocityX: 2,
            velocityY: 0,
            type: type,
            active: true
        };
        
        this.powerups.push(powerup);
        
        const powerupElement = document.createElement('div');
        powerupElement.className = 'powerup';
        if (type === 'mushroom') {
            powerupElement.style.background = '#FF6B6B';
        } else if (type === 'flower') {
            powerupElement.style.background = '#FFA500';
        }
        powerupElement.style.left = x + 'px';
        powerupElement.style.top = y + 'px';
        powerupElement.id = `powerup_${this.powerups.length}`;
        
        document.getElementById('gameContainer').appendChild(powerupElement);
    }
    
    createCoin(x, y) {
        const coin = {
            x: x,
            y: y,
            width: 20,
            height: 20,
            active: true
        };
        
        this.coins.push(coin);
        
        const coinElement = document.createElement('div');
        coinElement.className = 'coin';
        coinElement.style.left = x + 'px';
        coinElement.style.top = y + 'px';
        coinElement.id = `coin_${this.coins.length}`;
        
        document.getElementById('gameContainer').appendChild(coinElement);
    }
    
    createFlagpole(x, y) {
        this.flagpole = {
            x: x,
            y: y,
            width: 8,
            height: 300,
            flagY: y + 20
        };
        
        // Create flagpole
        const poleElement = document.createElement('div');
        poleElement.className = 'flagpole';
        poleElement.style.left = x + 'px';
        poleElement.style.top = y + 'px';
        poleElement.style.height = '300px';
        poleElement.id = 'flagpole';
        
        // Create flag
        const flagElement = document.createElement('div');
        flagElement.className = 'flag';
        flagElement.style.left = (x + 8) + 'px';
        flagElement.style.top = (y + 20) + 'px';
        flagElement.id = 'flag';
        
        document.getElementById('gameContainer').appendChild(poleElement);
        document.getElementById('gameContainer').appendChild(flagElement);
    }
    
    shootFireball() {
        if (this.fireballs.length >= 2) return; // Limit fireballs
        
        const fireball = {
            x: this.mario.x + (this.mario.facing === 'right' ? this.mario.width : -16),
            y: this.mario.y + this.mario.height / 2,
            width: 16,
            height: 16,
            velocityX: this.mario.facing === 'right' ? 8 : -8,
            velocityY: -3,
            bounces: 0,
            active: true
        };
        
        this.fireballs.push(fireball);
        
        const fireballElement = document.createElement('div');
        fireballElement.className = 'fireball';
        fireballElement.style.left = fireball.x + 'px';
        fireballElement.style.top = fireball.y + 'px';
        fireballElement.id = `fireball_${this.fireballs.length}`;
        
        document.getElementById('gameContainer').appendChild(fireballElement);
    }
    
    createClouds() {
        const clouds = [
            {x: 200, y: 100, width: 64, height: 32},
            {x: 500, y: 80, width: 96, height: 48},
            {x: 800, y: 120, width: 80, height: 40},
            {x: 1200, y: 90, width: 72, height: 36}
        ];
        
        clouds.forEach((cloud) => {
            const cloudElement = document.createElement('div');
            cloudElement.className = 'cloud';
            cloudElement.style.left = cloud.x + 'px';
            cloudElement.style.top = cloud.y + 'px';
            cloudElement.style.width = cloud.width + 'px';
            cloudElement.style.height = cloud.height + 'px';
            cloudElement.setAttribute('data-original-x', cloud.x);
            
            document.getElementById('gameContainer').appendChild(cloudElement);
        });
    }
    
    createHills() {
        const hills = [
            {x: 100, width: 128, height: 64},
            {x: 400, width: 96, height: 48},
            {x: 700, width: 144, height: 72},
            {x: 1100, width: 112, height: 56}
        ];
        
        hills.forEach((hill) => {
            const hillElement = document.createElement('div');
            hillElement.className = 'hill';
            hillElement.style.left = hill.x + 'px';
            hillElement.style.width = hill.width + 'px';
            hillElement.style.height = hill.height + 'px';
            hillElement.setAttribute('data-original-x', hill.x);
            
            document.getElementById('gameContainer').appendChild(hillElement);
        });
    }
    
    updateMario() {
        // Handle ducking
        this.mario.ducking = (this.keys['s'] || this.keys['arrowdown']) && this.mario.onGround;
        
        // Handle input
        if (!this.mario.ducking) {
            if (this.keys['a'] || this.keys['arrowleft']) {
                this.mario.velocityX = -this.mario.speed;
                this.mario.facing = 'left';
                this.mario.walking = true;
            } else if (this.keys['d'] || this.keys['arrowright']) {
                this.mario.velocityX = this.mario.speed;
                this.mario.facing = 'right';
                this.mario.walking = true;
            } else {
                this.mario.velocityX *= 0.8; // Friction
                this.mario.walking = false;
            }
        } else {
            this.mario.velocityX = 0;
            this.mario.walking = false;
        }
        
        // Jump
        if ((this.keys['w'] || this.keys['arrowup']) && this.mario.onGround && !this.mario.ducking) {
            this.mario.velocityY = -this.mario.jumpPower;
            this.mario.onGround = false;
            this.mario.walking = false;
        }
        
        // Apply gravity
        if (!this.mario.onGround) {
            this.mario.velocityY += this.gravity;
            if (this.mario.velocityY > this.maxFallSpeed) {
                this.mario.velocityY = this.maxFallSpeed;
            }
        }
        
        // Block collision detection with separate X and Y updates
        this.mario.onGround = false;
        
        // Check horizontal collisions first
        const nextX = this.mario.x + this.mario.velocityX;
        this.blocks.forEach(block => {
            if (!block.active) return;
            
            if (this.mario.y < block.y + block.height &&
                this.mario.y + this.mario.height > block.y &&
                nextX < block.x + block.width &&
                nextX + this.mario.width > block.x) {
                
                if (this.mario.velocityX > 0) {
                    this.mario.x = block.x - this.mario.width;
                } else if (this.mario.velocityX < 0) {
                    this.mario.x = block.x + block.width;
                }
                this.mario.velocityX = 0;
            }
        });
        
        // Update X position
        this.mario.x += this.mario.velocityX;
        
        // Check vertical collisions
        const nextY = this.mario.y + this.mario.velocityY;
        this.blocks.forEach(block => {
            if (!block.active) return;
            
            if (this.mario.x < block.x + block.width &&
                this.mario.x + this.mario.width > block.x &&
                nextY < block.y + block.height &&
                nextY + this.mario.height > block.y) {
                
                if (this.mario.velocityY > 0) {
                    // Landing on top
                    this.mario.y = block.y - this.mario.height;
                    this.mario.velocityY = 0;
                    this.mario.onGround = true;
                } else if (this.mario.velocityY < 0) {
                    // Hitting from below
                    this.mario.y = block.y + block.height;
                    this.mario.velocityY = 0;
                    
                    // Hit question block
                    if (block.type === 'question' && !block.hit) {
                        this.hitQuestionBlock(block);
                    }
                    // Break brick block if big/fire mario
                    else if (block.type === 'brick' && this.mario.state !== 'small') {
                        this.breakBrick(block);
                    }
                }
            }
        });
        
        // Update Y position
        this.mario.y += this.mario.velocityY;
        
        // Boundary checks
        if (this.mario.x < 0) this.mario.x = 0;
        if (this.mario.x > this.levelWidth - this.mario.width) {
            this.mario.x = this.levelWidth - this.mario.width;
        }
        
        // Update camera
        this.camera.x = this.mario.x - this.gameWidth / 3;
        if (this.camera.x < 0) this.camera.x = 0;
        if (this.camera.x > this.levelWidth - this.gameWidth) {
            this.camera.x = this.levelWidth - this.gameWidth;
        }
        
        // Handle invulnerability
        if (this.mario.invulnerable) {
            this.mario.invulnerableTime--;
            if (this.mario.invulnerableTime <= 0) {
                this.mario.invulnerable = false;
            }
        }
        
        this.updateMarioDOM();
    }
    
    hitQuestionBlock(block) {
        block.hit = true;
        const blockIndex = this.blocks.indexOf(block);
        const blockElement = document.getElementById(`block_${blockIndex + 1}`);
        if (blockElement) {
            blockElement.style.background = '#8B4513';
            blockElement.innerHTML = '';
        }
        
        // Spawn powerup
        if (this.mario.state === 'small') {
            this.createPowerup(block.x, block.y - 32, 'mushroom');
        } else {
            this.createPowerup(block.x, block.y - 32, 'flower');
        }
        
        this.addScore(200);
    }
    
    breakBrick(block) {
        block.active = false;
        const blockIndex = this.blocks.indexOf(block);
        const blockElement = document.getElementById(`block_${blockIndex + 1}`);
        if (blockElement) {
            blockElement.style.display = 'none';
        }
        
        this.addScore(50);
    }
    
    updateMarioDOM() {
        const marioElement = document.getElementById('mario');
        marioElement.style.left = (this.mario.x - this.camera.x) + 'px';
        marioElement.style.bottom = (this.gameHeight - this.mario.y - this.mario.height) + 'px';
        
        // Update mario appearance based on state
        marioElement.className = '';
        if (this.mario.state === 'small') {
            marioElement.classList.add('mario-small');
        } else if (this.mario.state === 'big') {
            marioElement.classList.add('mario-big');
        } else if (this.mario.state === 'fire') {
            marioElement.classList.add('mario-fire');
        }
        
        // Add animation classes
        if (this.mario.walking && this.mario.onGround) {
            marioElement.classList.add('mario-walking');
        }
        
        if (this.mario.ducking) {
            marioElement.classList.add('mario-ducking');
        }
        
        // Flip mario based on facing direction
        if (this.mario.facing === 'left') {
            marioElement.style.transform = 'scaleX(-1)';
        } else {
            marioElement.style.transform = 'scaleX(1)';
        }
        
        // Flashing effect when invulnerable
        if (this.mario.invulnerable && Math.floor(this.mario.invulnerableTime / 5) % 2) {
            marioElement.style.opacity = '0.3';
        } else {
            marioElement.style.opacity = '1';
        }
    }
    
    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            if (!enemy.active) return;
            
            // Simple AI - move back and forth
            enemy.x += enemy.velocityX;
            
            // Apply gravity
            enemy.velocityY += this.gravity;
            enemy.y += enemy.velocityY;
            
            // Block collision for enemies
            enemy.onGround = false;
            this.blocks.forEach(block => {
                if (!block.active) return;
                
                if (enemy.x < block.x + block.width &&
                    enemy.x + enemy.width > block.x &&
                    enemy.y + enemy.velocityY < block.y + block.height &&
                    enemy.y + enemy.velocityY + enemy.height > block.y) {
                    
                    if (enemy.velocityY > 0) {
                        enemy.y = block.y - enemy.height;
                        enemy.velocityY = 0;
                        enemy.onGround = true;
                    }
                }
                
                // Wall collision - turn around
                if (enemy.y < block.y + block.height &&
                    enemy.y + enemy.height > block.y &&
                    enemy.x + enemy.velocityX < block.x + block.width &&
                    enemy.x + enemy.velocityX + enemy.width > block.x) {
                    enemy.velocityX *= -1;
                }
            });
            
            // Turn around at level edges
            if (enemy.x < 0 || enemy.x > this.levelWidth) {
                enemy.velocityX *= -1;
            }
            
            // Update DOM element
            const enemyElement = document.getElementById(`enemy_${index + 1}`);
            if (enemyElement) {
                enemyElement.style.left = (enemy.x - this.camera.x) + 'px';
                enemyElement.style.top = enemy.y + 'px';
                
                // Hide if off screen
                if (enemy.x < this.camera.x - 100 || enemy.x > this.camera.x + this.gameWidth + 100) {
                    enemyElement.style.display = 'none';
                } else {
                    enemyElement.style.display = 'block';
                }
            }
        });
    }
    
    updatePowerups() {
        this.powerups.forEach((powerup, index) => {
            if (!powerup.active) return;
            
            powerup.x += powerup.velocityX;
            powerup.velocityY += this.gravity;
            powerup.y += powerup.velocityY;
            
            // Block collision for powerups
            this.blocks.forEach(block => {
                if (!block.active) return;
                
                if (powerup.x < block.x + block.width &&
                    powerup.x + powerup.width > block.x &&
                    powerup.y + powerup.velocityY < block.y + block.height &&
                    powerup.y + powerup.velocityY + powerup.height > block.y) {
                    
                    if (powerup.velocityY > 0) {
                        powerup.y = block.y - powerup.height;
                        powerup.velocityY = 0;
                    }
                }
                
                // Wall collision - turn around
                if (powerup.y < block.y + block.height &&
                    powerup.y + powerup.height > block.y &&
                    powerup.x + powerup.velocityX < block.x + block.width &&
                    powerup.x + powerup.velocityX + powerup.width > block.x) {
                    powerup.velocityX *= -1;
                }
            });
            
            // Update DOM element
            const powerupElement = document.getElementById(`powerup_${index + 1}`);
            if (powerupElement) {
                powerupElement.style.left = (powerup.x - this.camera.x) + 'px';
                powerupElement.style.top = powerup.y + 'px';
            }
        });
    }
    
    updateCamera() {
        // Update all block positions based on camera
        this.blocks.forEach((block, index) => {
            const blockElement = document.getElementById(`block_${index + 1}`);
            if (blockElement) {
                blockElement.style.left = (block.x - this.camera.x) + 'px';
                
                // Hide blocks that are off-screen for performance
                if (block.x < this.camera.x - 100 || block.x > this.camera.x + this.gameWidth + 100) {
                    blockElement.style.display = 'none';
                } else {
                    blockElement.style.display = 'block';
                }
            }
        });
        
        // Update clouds and hills with parallax effect
        const clouds = document.querySelectorAll('.cloud');
        clouds.forEach((cloud) => {
            const originalX = parseFloat(cloud.getAttribute('data-original-x'));
            cloud.style.left = (originalX - this.camera.x * 0.3) + 'px';
        });
        
        const hills = document.querySelectorAll('.hill');
        hills.forEach((hill) => {
            const originalX = parseFloat(hill.getAttribute('data-original-x'));
            hill.style.left = (originalX - this.camera.x * 0.5) + 'px';
        });
    }
    
    checkCollisions() {
        // Mario vs Enemies
        this.enemies.forEach((enemy, index) => {
            if (!enemy.active || this.mario.invulnerable) return;
            
            if (this.isColliding(this.mario, enemy)) {
                if (this.mario.velocityY > 0 && this.mario.y < enemy.y) {
                    // Mario jumps on enemy
                    this.destroyEnemy(index);
                    this.mario.velocityY = -8; // Bounce
                    this.addScore(100);
                } else {
                    // Mario hits enemy
                    this.hitMario();
                }
            }
        });
        
        // Mario vs Powerups
        this.powerups.forEach((powerup, index) => {
            if (!powerup.active) return;
            
            if (this.isColliding(this.mario, powerup)) {
                this.collectPowerup(index);
            }
        });
        
        // Mario vs Coins
        this.coins.forEach((coin, index) => {
            if (!coin.active) return;
            
            if (this.isColliding(this.mario, coin)) {
                this.collectCoin(index);
            }
        });
        
        // Mario vs Flagpole
        if (this.flagpole && this.isColliding(this.mario, this.flagpole)) {
            this.reachGoal();
        }
        
        // Fireball vs Enemies
        this.fireballs.forEach((fireball, fireballIndex) => {
            if (!fireball.active) return;
            
            this.enemies.forEach((enemy, enemyIndex) => {
                if (!enemy.active) return;
                
                if (this.isColliding(fireball, enemy)) {
                    this.destroyEnemy(enemyIndex);
                    this.destroyFireball(fireballIndex);
                    this.addScore(200);
                }
            });
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    destroyEnemy(index) {
        this.enemies[index].active = false;
        const enemyElement = document.getElementById(`enemy_${index + 1}`);
        if (enemyElement) {
            enemyElement.style.display = 'none';
        }
    }
    
    hitMario() {
        if (this.mario.invulnerable) return;
        
        if (this.mario.state === 'small') {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.respawnMario();
            }
        } else {
            // Power down
            this.mario.state = 'small';
            this.mario.height = 32;
            this.mario.invulnerable = true;
            this.mario.invulnerableTime = 120; // 2 seconds at 60fps
        }
    }
    
    collectPowerup(index) {
        const powerup = this.powerups[index];
        powerup.active = false;
        
        const powerupElement = document.getElementById(`powerup_${index + 1}`);
        if (powerupElement) {
            powerupElement.style.display = 'none';
        }
        
        if (powerup.type === 'mushroom') {
            if (this.mario.state === 'small') {
                this.mario.state = 'big';
                this.mario.height = 48;
                this.addScore(1000);
            }
        } else if (powerup.type === 'flower') {
            this.mario.state = 'fire';
            this.mario.height = 48;
            this.addScore(1000);
        }
    }
    
    collectCoin(index) {
        const coin = this.coins[index];
        coin.active = false;
        
        const coinElement = document.getElementById(`coin_${index + 1}`);
        if (coinElement) {
            coinElement.style.display = 'none';
        }
        
        this.gameCoins++;
        this.addScore(200);
        
        // Extra life every 100 coins
        if (this.gameCoins % 100 === 0) {
            this.lives++;
            this.addScore(500);
        }
    }
    
    reachGoal() {
        this.gameRunning = false;
        const timeBonus = this.time * 50;
        this.addScore(timeBonus);
        
        setTimeout(() => {
            alert(`Level Complete!\nTime Bonus: ${timeBonus}\nTotal Score: ${this.score}`);
            // In a real game, this would advance to the next level
            location.reload();
        }, 1000);
    }
    
    updateFireballs() {
        this.fireballs.forEach((fireball, index) => {
            if (!fireball.active) return;
            
            fireball.x += fireball.velocityX;
            fireball.y += fireball.velocityY;
            fireball.velocityY += this.gravity * 0.5; // Lighter gravity for fireballs
            
            // Bounce on ground
            if (fireball.y > this.gameHeight - 96) {
                fireball.y = this.gameHeight - 96;
                fireball.velocityY = -Math.abs(fireball.velocityY) * 0.7;
                fireball.bounces++;
                
                if (fireball.bounces > 3) {
                    this.destroyFireball(index);
                    return;
                }
            }
            
            // Remove if off screen
            if (fireball.x < this.camera.x - 100 || fireball.x > this.camera.x + this.gameWidth + 100) {
                this.destroyFireball(index);
                return;
            }
            
            // Update DOM element
            const fireballElement = document.getElementById(`fireball_${index + 1}`);
            if (fireballElement) {
                fireballElement.style.left = (fireball.x - this.camera.x) + 'px';
                fireballElement.style.top = fireball.y + 'px';
            }
        });
    }
    
    destroyFireball(index) {
        this.fireballs[index].active = false;
        const fireballElement = document.getElementById(`fireball_${index + 1}`);
        if (fireballElement) {
            fireballElement.style.display = 'none';
        }
    }
    
    updateCoins() {
        this.coins.forEach((coin, index) => {
            if (!coin.active) return;
            
            const coinElement = document.getElementById(`coin_${index + 1}`);
            if (coinElement) {
                coinElement.style.left = (coin.x - this.camera.x) + 'px';
                
                // Hide if off screen
                if (coin.x < this.camera.x - 100 || coin.x > this.camera.x + this.gameWidth + 100) {
                    coinElement.style.display = 'none';
                } else {
                    coinElement.style.display = 'block';
                }
            }
        });
        
        // Update flagpole position
        if (this.flagpole) {
            const poleElement = document.getElementById('flagpole');
            const flagElement = document.getElementById('flag');
            
            if (poleElement && flagElement) {
                poleElement.style.left = (this.flagpole.x - this.camera.x) + 'px';
                flagElement.style.left = (this.flagpole.x + 8 - this.camera.x) + 'px';
            }
        }
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    respawnMario() {
        this.mario.x = 100;
        this.mario.y = this.gameHeight - 200;
        this.mario.velocityX = 0;
        this.mario.velocityY = 0;
        this.mario.state = 'small';
        this.mario.invulnerable = true;
        this.mario.invulnerableTime = 180;
        this.camera.x = 0;
    }
    
    gameOver() {
        this.gameRunning = false;
        alert('Game Over!');
        location.reload();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score.toString().padStart(6, '0');
        document.getElementById('coins').textContent = this.gameCoins.toString().padStart(2, '0');
        document.getElementById('lives').textContent = this.lives.toString();
        document.getElementById('time').textContent = this.time.toString();
    }
    
    startTimer() {
        setInterval(() => {
            if (this.gameRunning && this.time > 0) {
                this.time--;
                this.updateUI();
                
                if (this.time <= 0) {
                    this.hitMario();
                }
            }
        }, 1000);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updateMario();
        this.updateEnemies();
        this.updatePowerups();
        this.updateFireballs();
        this.updateCoins();
        this.updateCamera();
        this.checkCollisions();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game
window.onload = () => {
    new SuperMarioBros();
};