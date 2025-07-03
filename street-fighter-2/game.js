class StreetFighter2 {
    constructor() {
        this.gameContainer = document.getElementById('gameContainer');
        this.characterSelect = document.getElementById('characterSelect');
        this.gameArea = document.getElementById('gameArea');
        this.startButton = document.getElementById('startGame');
        
        // Game state
        this.gameRunning = false;
        this.gameTime = 99;
        this.gameTimer = null;
        this.roundNumber = 1;
        this.maxRounds = 3;
        this.player1Wins = 0;
        this.player2Wins = 0;
        this.roundStarted = false;
        
        // Character data
        this.characters = {
            'ryu': {
                name: 'Ryu',
                sprite: '流',
                color: '#ff6b6b',
                health: 100,
                speed: 12,
                attackPower: 15,
                specialMove: 'hadoken',
                specialDamage: 25
            },
            'ken': {
                name: 'Ken',
                sprite: '拳',
                color: '#ffd93d',
                health: 95,
                speed: 14,
                attackPower: 16,
                specialMove: 'shoryuken',
                specialDamage: 30
            },
            'chun-li': {
                name: 'Chun-Li',
                sprite: '春',
                color: '#74b9ff',
                health: 90,
                speed: 16,
                attackPower: 12,
                specialMove: 'kikoken',
                specialDamage: 20
            },
            'blanka': {
                name: 'Blanka',
                sprite: '雷',
                color: '#00b894',
                health: 110,
                speed: 8,
                attackPower: 18,
                specialMove: 'electric',
                specialDamage: 28
            },
            'e-honda': {
                name: 'E. Honda',
                sprite: '本',
                color: '#6c5ce7',
                health: 120,
                speed: 8,
                attackPower: 20,
                specialMove: 'sumo',
                specialDamage: 35
            },
            'zangief': {
                name: 'Zangief',
                sprite: '力',
                color: '#e17055',
                health: 130,
                speed: 6,
                attackPower: 25,
                specialMove: 'screw',
                specialDamage: 40
            },
            'guile': {
                name: 'Guile',
                sprite: '軍',
                color: '#55a3ff',
                health: 100,
                speed: 12,
                attackPower: 14,
                specialMove: 'sonicboom',
                specialDamage: 22
            },
            'dhalsim': {
                name: 'Dhalsim',
                sprite: '瞑',
                color: '#fd79a8',
                health: 85,
                speed: 12,
                attackPower: 13,
                specialMove: 'yoga',
                specialDamage: 24
            }
        };
        
        // Player selections
        this.selectedCharacters = [];
        this.currentPlayer = 1;
        
        // Player objects
        this.player1 = null;
        this.player2 = null;
        
        // Game mechanics
        this.projectiles = [];
        this.effects = [];
        this.comboCount = 0;
        this.comboTimer = 0;
        
        // Input handling
        this.keys = {};
        this.inputBuffers = {
            player1: [],
            player2: []
        };
        
        // Game elements
        this.player1Element = document.getElementById('player1');
        this.player2Element = document.getElementById('player2');
        this.player1Sprite = document.getElementById('player1Sprite');
        this.player2Sprite = document.getElementById('player2Sprite');
        this.player1Health = document.getElementById('player1Health');
        this.player2Health = document.getElementById('player2Health');
        this.player1Name = document.getElementById('player1Name');
        this.player2Name = document.getElementById('player2Name');
        this.gameTimerElement = document.getElementById('gameTimer');
        this.comboCounter = document.getElementById('comboCounter');
        this.victoryScreen = document.getElementById('victoryScreen');
        this.controlsOverlay = document.getElementById('controlsOverlay');
        this.quickControls = document.getElementById('quickControls');
        this.player1SuperBar = document.getElementById('player1Super');
        this.player2SuperBar = document.getElementById('player2Super');
        
        this.setupEventListeners();
        this.setupCharacterSelection();
        this.setupControlsDisplay();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleInput(e.code, true);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.handleInput(e.code, false);
        });
        
        // Prevent default for game keys
        document.addEventListener('keydown', (e) => {
            const gameKeys = [
                'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyK', 'KeyL', 'KeyU',
                'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Digit1', 'Digit2', 'Digit3', 'Digit4'
            ];
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    setupCharacterSelection() {
        const characterCards = document.querySelectorAll('.character-card');
        
        characterCards.forEach(card => {
            card.addEventListener('click', () => {
                this.selectCharacter(card.dataset.character);
            });
        });
        
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });
    }
    
    setupControlsDisplay() {
        const controlsBtn = document.getElementById('controlsBtn');
        const closeControls = document.getElementById('closeControls');
        
        // Show controls overlay
        controlsBtn.addEventListener('click', () => {
            this.controlsOverlay.classList.add('show');
        });
        
        // Hide controls overlay
        closeControls.addEventListener('click', () => {
            this.controlsOverlay.classList.remove('show');
        });
        
        // Close controls with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.controlsOverlay.classList.contains('show')) {
                this.controlsOverlay.classList.remove('show');
            }
        });
        
        // Close controls when clicking outside
        this.controlsOverlay.addEventListener('click', (e) => {
            if (e.target === this.controlsOverlay) {
                this.controlsOverlay.classList.remove('show');
            }
        });
    }
    
    selectCharacter(characterId) {
        if (this.selectedCharacters.length >= 2) return;
        
        // Remove previous selection for current player
        const prevSelected = document.querySelector('.character-card.selected');
        if (prevSelected && this.selectedCharacters.length < 2) {
            prevSelected.classList.remove('selected');
        }
        
        // Select new character
        const card = document.querySelector(`[data-character="${characterId}"]`);
        card.classList.add('selected');
        
        if (this.selectedCharacters.length === 0) {
            this.selectedCharacters[0] = characterId;
            this.currentPlayer = 2;
        } else {
            this.selectedCharacters[1] = characterId;
            this.currentPlayer = 1;
        }
        
        // Enable start button when both players selected
        if (this.selectedCharacters.length === 2) {
            this.startButton.disabled = false;
        }
    }
    
    startGame() {
        // Hide character selection
        this.characterSelect.style.display = 'none';
        this.gameArea.classList.add('active');
        
        // Initialize players
        this.initializePlayers();
        
        // Start game loop
        this.gameRunning = true;
        this.startGameTimer();
        this.showQuickControls();
        this.showRoundStart();
        
        // Delay game start for round announcement
        setTimeout(() => {
            this.gameLoop();
        }, 2000);
    }
    
    initializePlayers() {
        const char1 = this.characters[this.selectedCharacters[0]];
        const char2 = this.characters[this.selectedCharacters[1]];
        
        this.player1 = {
            character: char1,
            x: 200,
            y: 100,
            health: char1.health,
            maxHealth: char1.health,
            facing: 1,
            state: 'idle',
            stateTimer: 0,
            attackCooldown: 0,
            blockCooldown: 0,
            specialCooldown: 0,
            isBlocking: false,
            isAttacking: false,
            isJumping: false,
            isCrouching: false,
            velocityY: 0,
            hitStun: 0,
            invulnerable: false,
            superMeter: 0,
            maxSuper: 100,
            stunned: false,
            dizzyTime: 0
        };
        
        this.player2 = {
            character: char2,
            x: window.innerWidth - 260,
            y: 100,
            health: char2.health,
            maxHealth: char2.health,
            facing: -1,
            state: 'idle',
            stateTimer: 0,
            attackCooldown: 0,
            blockCooldown: 0,
            specialCooldown: 0,
            isBlocking: false,
            isAttacking: false,
            isJumping: false,
            isCrouching: false,
            velocityY: 0,
            hitStun: 0,
            invulnerable: false,
            superMeter: 0,
            maxSuper: 100,
            stunned: false,
            dizzyTime: 0
        };
        
        // Update UI
        this.player1Name.textContent = char1.name;
        this.player2Name.textContent = char2.name;
        this.player1Sprite.textContent = char1.sprite;
        this.player2Sprite.textContent = char2.sprite;
        this.player1Sprite.style.background = char1.color;
        this.player2Sprite.style.background = char2.color;
        
        this.updateHealthBars();
        this.updatePlayerPositions();
    }
    
    handleInput(keyCode, isPressed) {
        if (!this.gameRunning) return;
        
        // Player 1 controls (WASD + JKL)
        if (isPressed) {
            switch (keyCode) {
                case 'KeyW':
                    this.jump(this.player1);
                    break;
                case 'KeyS':
                    this.crouch(this.player1, true);
                    break;
                case 'KeyA':
                    this.move(this.player1, -1);
                    break;
                case 'KeyD':
                    this.move(this.player1, 1);
                    break;
                case 'KeyJ':
                    this.punch(this.player1);
                    break;
                case 'KeyK':
                    this.kick(this.player1);
                    break;
                case 'KeyL':
                    this.block(this.player1, true);
                    break;
                case 'KeyU':
                    this.specialMove(this.player1);
                    break;
                    
                // Player 2 controls (Arrow keys + 1234)
                case 'ArrowUp':
                    this.jump(this.player2);
                    break;
                case 'ArrowDown':
                    this.crouch(this.player2, true);
                    break;
                case 'ArrowLeft':
                    this.move(this.player2, -1);
                    break;
                case 'ArrowRight':
                    this.move(this.player2, 1);
                    break;
                case 'Digit1':
                    this.punch(this.player2);
                    break;
                case 'Digit2':
                    this.kick(this.player2);
                    break;
                case 'Digit3':
                    this.block(this.player2, true);
                    break;
                case 'Digit4':
                    this.specialMove(this.player2);
                    break;
            }
        } else {
            // Handle key release
            switch (keyCode) {
                case 'KeyS':
                    this.crouch(this.player1, false);
                    break;
                case 'KeyL':
                    this.block(this.player1, false);
                    break;
                case 'ArrowDown':
                    this.crouch(this.player2, false);
                    break;
                case 'Digit3':
                    this.block(this.player2, false);
                    break;
            }
        }
    }
    
    move(player, direction) {
        if (player.hitStun > 0 || player.isAttacking || player.isJumping) return;
        
        const speed = player.character.speed;
        player.x += direction * speed;
        
        // Keep players on screen
        player.x = Math.max(50, Math.min(window.innerWidth - 110, player.x));
        
        // Update facing direction
        if (direction !== 0) {
            const opponent = player === this.player1 ? this.player2 : this.player1;
            if (player.x < opponent.x) {
                player.facing = 1;
            } else {
                player.facing = -1;
            }
        }
    }
    
    jump(player) {
        if (player.hitStun > 0 || player.isJumping) return;
        
        player.isJumping = true;
        player.velocityY = -15;
        player.state = 'jumping';
        this.addStateClass(player, 'jumping');
    }
    
    crouch(player, isCrouching) {
        if (player.hitStun > 0 || player.isJumping) return;
        
        player.isCrouching = isCrouching;
        if (isCrouching) {
            player.state = 'crouching';
            this.addStateClass(player, 'crouching');
        } else {
            player.state = 'idle';
            this.removeStateClass(player, 'crouching');
        }
    }
    
    block(player, isBlocking) {
        if (player.hitStun > 0 || player.isJumping || player.isAttacking) return;
        
        player.isBlocking = isBlocking;
        if (isBlocking) {
            player.state = 'blocking';
            this.addStateClass(player, 'blocking');
        } else {
            player.state = 'idle';
            this.removeStateClass(player, 'blocking');
        }
    }
    
    punch(player) {
        if (player.hitStun > 0 || player.isAttacking || player.attackCooldown > 0) return;
        
        player.isAttacking = true;
        player.attackCooldown = 30;
        player.state = 'attacking';
        this.addStateClass(player, 'attacking');
        
        // Check for hit
        const opponent = player === this.player1 ? this.player2 : this.player1;
        if (this.checkAttackHit(player, opponent, 80)) {
            this.dealDamage(opponent, player.character.attackPower, 'punch');
        }
        
        setTimeout(() => {
            player.isAttacking = false;
            this.removeStateClass(player, 'attacking');
            if (player.state === 'attacking') {
                player.state = 'idle';
            }
        }, 300);
    }
    
    kick(player) {
        if (player.hitStun > 0 || player.isAttacking || player.attackCooldown > 0) return;
        
        player.isAttacking = true;
        player.attackCooldown = 40;
        player.state = 'attacking';
        this.addStateClass(player, 'attacking');
        
        // Check for hit
        const opponent = player === this.player1 ? this.player2 : this.player1;
        if (this.checkAttackHit(player, opponent, 100)) {
            this.dealDamage(opponent, player.character.attackPower + 5, 'kick');
        }
        
        setTimeout(() => {
            player.isAttacking = false;
            this.removeStateClass(player, 'attacking');
            if (player.state === 'attacking') {
                player.state = 'idle';
            }
        }, 400);
    }
    
    specialMove(player) {
        if (player.hitStun > 0 || player.isAttacking || player.specialCooldown > 0) return;
        
        player.specialCooldown = 180; // 3 seconds
        player.isAttacking = true;
        player.state = 'special';
        
        const specialType = player.character.specialMove;
        
        switch (specialType) {
            case 'hadoken':
            case 'kikoken':
            case 'sonicboom':
                this.createProjectile(player, specialType);
                break;
            case 'shoryuken':
                this.performShoryuken(player);
                break;
            case 'electric':
                this.performElectric(player);
                break;
            case 'sumo':
                this.performSumo(player);
                break;
            case 'screw':
                this.performScrew(player);
                break;
            case 'yoga':
                this.performYoga(player);
                break;
        }
        
        setTimeout(() => {
            player.isAttacking = false;
            if (player.state === 'special') {
                player.state = 'idle';
            }
        }, 600);
    }
    
    createProjectile(player, type) {
        const projectile = {
            x: player.x + (player.facing > 0 ? 60 : -20),
            y: player.y + 40,
            vx: player.facing * 8,
            vy: 0,
            type: type,
            owner: player,
            damage: player.character.specialDamage,
            lifetime: 120
        };
        
        this.projectiles.push(projectile);
        
        // Create DOM element
        const projectileElement = document.createElement('div');
        projectileElement.className = 'projectile';
        projectileElement.style.left = projectile.x + 'px';
        projectileElement.style.top = projectile.y + 'px';
        projectileElement.id = `projectile_${this.projectiles.length}`;
        
        // Different styles for different projectiles
        switch (type) {
            case 'hadoken':
                projectileElement.classList.add('hadoken');
                break;
            case 'kikoken':
                projectileElement.classList.add('kikoken');
                break;
            case 'sonicboom':
                projectileElement.classList.add('sonicboom');
                break;
        }
        
        this.gameArea.appendChild(projectileElement);
    }
    
    performShoryuken(player) {
        // Uppercut attack
        const opponent = player === this.player1 ? this.player2 : this.player1;
        if (this.checkAttackHit(player, opponent, 120)) {
            this.dealDamage(opponent, player.character.specialDamage, 'special');
            opponent.velocityY = -10; // Launch opponent
        }
        
        // Player jumps during shoryuken
        player.velocityY = -12;
        player.isJumping = true;
    }
    
    performElectric(player) {
        // Electric attack hits nearby enemies
        const opponent = player === this.player1 ? this.player2 : this.player1;
        if (this.checkAttackHit(player, opponent, 150)) {
            this.dealDamage(opponent, player.character.specialDamage, 'special');
            // Add electric effect
            this.createEffect(opponent.x, opponent.y, 'electric');
        }
    }
    
    performSumo(player) {
        // Sumo slam - high damage, short range
        const opponent = player === this.player1 ? this.player2 : this.player1;
        if (this.checkAttackHit(player, opponent, 90)) {
            this.dealDamage(opponent, player.character.specialDamage, 'special');
            // Push opponent back
            opponent.x += player.facing * 50;
            opponent.x = Math.max(50, Math.min(window.innerWidth - 110, opponent.x));
        }
    }
    
    performScrew(player) {
        // Screw Piledriver - grab attack
        const opponent = player === this.player1 ? this.player2 : this.player1;
        if (this.checkAttackHit(player, opponent, 100)) {
            this.dealDamage(opponent, player.character.specialDamage, 'special');
            // Spin effect
            this.createEffect(player.x, player.y, 'spin');
        }
    }
    
    performYoga(player) {
        // Yoga fire - stretchy attack
        const opponent = player === this.player1 ? this.player2 : this.player1;
        if (this.checkAttackHit(player, opponent, 200)) {
            this.dealDamage(opponent, player.character.specialDamage, 'special');
        }
    }
    
    checkAttackHit(attacker, defender, range) {
        const distance = Math.abs(attacker.x - defender.x);
        const verticalDistance = Math.abs(attacker.y - defender.y);
        
        return distance <= range && verticalDistance <= 50 && !defender.invulnerable;
    }
    
    dealDamage(player, damage, attackType) {
        if (player.invulnerable) return;
        
        // Block reduces damage
        if (player.isBlocking) {
            damage = Math.floor(damage * 0.3);
        }
        
        player.health -= damage;
        player.health = Math.max(0, player.health);
        
        // Hit stun and super meter gain
        player.hitStun = 20;
        player.invulnerable = true;
        
        // Gain super meter when taking damage
        player.superMeter = Math.min(player.maxSuper, player.superMeter + damage * 0.5);
        
        // Attacker gains super meter
        const attacker = player === this.player1 ? this.player2 : this.player1;
        attacker.superMeter = Math.min(attacker.maxSuper, attacker.superMeter + damage * 0.3);
        
        // Visual feedback
        this.addStateClass(player, 'hit');
        this.showDamageText(player.x, player.y, damage);
        
        // Combo system
        if (attackType !== 'special') {
            this.comboCount++;
            this.comboTimer = 60;
            this.showCombo();
        }
        
        setTimeout(() => {
            player.invulnerable = false;
            this.removeStateClass(player, 'hit');
        }, 500);
        
        // Check for KO
        if (player.health <= 0) {
            this.showKO();
            setTimeout(() => {
                this.endRound(player === this.player1 ? 2 : 1);
            }, 2000);
        }
        
        this.updateHealthBars();
    }
    
    showDamageText(x, y, damage) {
        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = `-${damage}`;
        damageText.style.left = x + 'px';
        damageText.style.top = y + 'px';
        
        this.gameArea.appendChild(damageText);
        
        setTimeout(() => {
            if (damageText.parentNode) {
                damageText.remove();
            }
        }, 1000);
    }
    
    showCombo() {
        if (this.comboCount > 1) {
            this.comboCounter.textContent = `${this.comboCount} HIT COMBO!`;
            this.comboCounter.classList.add('show');
            
            setTimeout(() => {
                this.comboCounter.classList.remove('show');
            }, 1000);
        }
    }
    
    createEffect(x, y, type) {
        const effect = document.createElement('div');
        effect.className = 'special-effect';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.width = '50px';
        effect.style.height = '50px';
        effect.style.borderRadius = '50%';
        
        switch (type) {
            case 'electric':
                effect.style.background = '#ffff00';
                effect.style.boxShadow = '0 0 20px #ffff00';
                break;
            case 'spin':
                effect.style.background = '#ff0000';
                effect.style.animation = 'spin 0.5s linear infinite';
                break;
        }
        
        this.gameArea.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.remove();
            }
        }, 1000);
    }
    
    addStateClass(player, className) {
        const element = player === this.player1 ? this.player1Element : this.player2Element;
        element.classList.add(className);
    }
    
    removeStateClass(player, className) {
        const element = player === this.player1 ? this.player1Element : this.player2Element;
        element.classList.remove(className);
    }
    
    updateProjectiles() {
        this.projectiles.forEach((projectile, index) => {
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
            projectile.lifetime--;
            
            const projectileElement = document.getElementById(`projectile_${index + 1}`);
            if (projectileElement) {
                projectileElement.style.left = projectile.x + 'px';
                projectileElement.style.top = projectile.y + 'px';
            }
            
            // Check collision with opponents
            const opponent = projectile.owner === this.player1 ? this.player2 : this.player1;
            if (this.checkProjectileHit(projectile, opponent)) {
                this.dealDamage(opponent, projectile.damage, 'projectile');
                if (projectileElement) projectileElement.remove();
                this.projectiles.splice(index, 1);
                return;
            }
            
            // Remove if off screen or lifetime expired
            if (projectile.x < -50 || projectile.x > window.innerWidth + 50 || projectile.lifetime <= 0) {
                if (projectileElement) projectileElement.remove();
                this.projectiles.splice(index, 1);
            }
        });
    }
    
    checkProjectileHit(projectile, player) {
        const distance = Math.abs(projectile.x - player.x);
        const verticalDistance = Math.abs(projectile.y - player.y);
        
        return distance <= 40 && verticalDistance <= 40 && !player.invulnerable;
    }
    
    updatePhysics() {
        [this.player1, this.player2].forEach(player => {
            // Gravity
            if (player.isJumping) {
                player.velocityY += 0.8;
                player.y += player.velocityY;
                
                // Landing
                if (player.y >= 100) {
                    player.y = 100;
                    player.velocityY = 0;
                    player.isJumping = false;
                    this.removeStateClass(player, 'jumping');
                    player.state = 'idle';
                }
            }
            
            // Reduce cooldowns
            if (player.attackCooldown > 0) player.attackCooldown--;
            if (player.blockCooldown > 0) player.blockCooldown--;
            if (player.specialCooldown > 0) player.specialCooldown--;
            if (player.hitStun > 0) player.hitStun--;
        });
        
        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer === 0) {
                this.comboCount = 0;
            }
        }
    }
    
    updatePlayerPositions() {
        this.player1Element.style.left = this.player1.x + 'px';
        this.player1Element.style.bottom = (100 - this.player1.y) + 'px';
        
        this.player2Element.style.left = this.player2.x + 'px';
        this.player2Element.style.bottom = (100 - this.player2.y) + 'px';
        
        // Update facing direction
        if (this.player1.facing > 0) {
            this.player1Element.style.transform = 'scaleX(1)';
        } else {
            this.player1Element.style.transform = 'scaleX(-1)';
        }
        
        if (this.player2.facing > 0) {
            this.player2Element.style.transform = 'scaleX(1)';
        } else {
            this.player2Element.style.transform = 'scaleX(-1)';
        }
    }
    
    updateHealthBars() {
        const player1Percentage = (this.player1.health / this.player1.maxHealth) * 100;
        const player2Percentage = (this.player2.health / this.player2.maxHealth) * 100;
        
        this.player1Health.style.width = player1Percentage + '%';
        this.player2Health.style.width = player2Percentage + '%';
        
        // Update super bars
        const player1SuperPercentage = (this.player1.superMeter / this.player1.maxSuper) * 100;
        const player2SuperPercentage = (this.player2.superMeter / this.player2.maxSuper) * 100;
        
        this.player1SuperBar.style.width = player1SuperPercentage + '%';
        this.player2SuperBar.style.width = player2SuperPercentage + '%';
    }
    
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.gameTime--;
            this.gameTimerElement.textContent = this.gameTime;
            
            if (this.gameTime <= 0) {
                this.endRound('time');
            }
        }, 1000);
    }
    
    endRound(winner) {
        this.gameRunning = false;
        clearInterval(this.gameTimer);
        
        if (winner === 1) {
            this.player1Wins++;
        } else if (winner === 2) {
            this.player2Wins++;
        }
        
        // Check if someone won the match
        if (this.player1Wins >= 2 || this.player2Wins >= 2) {
            this.endMatch();
        } else {
            // Start next round
            setTimeout(() => {
                this.nextRound();
            }, 3000);
        }
    }
    
    endMatch() {
        let victoryText = '';
        let victorySubtext = '';
        
        if (this.player1Wins >= 2) {
            victoryText = `${this.player1.character.name} WINS!`;
            victorySubtext = 'Player 1 Victory!';
            if (this.player2.health === this.player2.maxHealth) {
                this.showPerfect();
            }
        } else {
            victoryText = `${this.player2.character.name} WINS!`;
            victorySubtext = 'Player 2 Victory!';
            if (this.player1.health === this.player1.maxHealth) {
                this.showPerfect();
            }
        }
        
        document.getElementById('victoryText').textContent = victoryText;
        document.getElementById('victorySubtext').textContent = victorySubtext;
        this.victoryScreen.classList.add('show');
    }
    
    nextRound() {
        this.roundNumber++;
        
        // Reset players
        this.player1.health = this.player1.maxHealth;
        this.player2.health = this.player2.maxHealth;
        this.player1.x = 200;
        this.player2.x = window.innerWidth - 260;
        this.player1.y = 100;
        this.player2.y = 100;
        
        // Reset states
        this.player1.state = 'idle';
        this.player2.state = 'idle';
        this.player1.hitStun = 0;
        this.player2.hitStun = 0;
        this.player1.invulnerable = false;
        this.player2.invulnerable = false;
        
        this.gameTime = 99;
        this.updateHealthBars();
        
        this.showRoundStart();
        
        setTimeout(() => {
            this.gameRunning = true;
            this.startGameTimer();
        }, 2000);
    }
    
    showRoundStart() {
        const roundText = document.createElement('div');
        roundText.className = 'round-announcement';
        roundText.textContent = `ROUND ${this.roundNumber}`;
        this.gameArea.appendChild(roundText);
        
        setTimeout(() => {
            if (roundText.parentNode) {
                roundText.remove();
            }
        }, 3000);
    }
    
    showKO() {
        const koText = document.createElement('div');
        koText.className = 'ko-text';
        koText.textContent = 'K.O.!';
        this.gameArea.appendChild(koText);
        
        setTimeout(() => {
            if (koText.parentNode) {
                koText.remove();
            }
        }, 3000);
    }
    
    showPerfect() {
        const perfectText = document.createElement('div');
        perfectText.className = 'perfect-text';
        perfectText.textContent = 'PERFECT!';
        this.gameArea.appendChild(perfectText);
        
        setTimeout(() => {
            if (perfectText.parentNode) {
                perfectText.remove();
            }
        }, 3000);
    }
    
    showQuickControls() {
        this.quickControls.classList.add('show');
        this.quickControls.classList.add('hide-timer');
        
        // Hide after 3 seconds
        setTimeout(() => {
            this.quickControls.classList.remove('show');
        }, 3300);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updatePhysics();
        this.updateProjectiles();
        this.updatePlayerPositions();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
    const game = new StreetFighter2();
});