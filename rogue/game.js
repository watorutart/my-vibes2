class Rogue {
    constructor() {
        this.dungeonWidth = 80;
        this.dungeonHeight = 24;
        this.dungeon = [];
        this.rooms = [];
        
        this.player = {
            x: 0,
            y: 0,
            level: 1,
            hp: 20,
            maxHp: 20,
            xp: 0,
            nextLevel: 20,
            strength: 10,
            defense: 10,
            gold: 0,
            food: 1000,
            weapon: null,
            armor: null,
            inventory: []
        };
        
        this.enemies = [];
        this.items = [];
        this.floor = 1;
        this.gameRunning = true;
        this.messages = [];
        
        this.enemyTypes = [
            { name: 'Rat', symbol: 'r', hp: 5, attack: 2, defense: 1, xp: 5, color: '#8B4513' },
            { name: 'Goblin', symbol: 'g', hp: 8, attack: 4, defense: 2, xp: 10, color: '#228B22' },
            { name: 'Orc', symbol: 'o', hp: 15, attack: 6, defense: 3, xp: 20, color: '#DC143C' },
            { name: 'Troll', symbol: 'T', hp: 25, attack: 8, defense: 4, xp: 35, color: '#8B008B' },
            { name: 'Dragon', symbol: 'D', hp: 50, attack: 15, defense: 8, xp: 100, color: '#FF0000' }
        ];
        
        this.itemTypes = {
            weapons: [
                { name: 'Dagger', symbol: ')', attack: 3, value: 10 },
                { name: 'Short Sword', symbol: ')', attack: 5, value: 25 },
                { name: 'Long Sword', symbol: ')', attack: 8, value: 50 },
                { name: 'Battle Axe', symbol: ')', attack: 12, value: 100 },
                { name: 'Magic Sword', symbol: ')', attack: 15, value: 200 }
            ],
            armor: [
                { name: 'Leather Armor', symbol: ']', defense: 2, value: 15 },
                { name: 'Chain Mail', symbol: ']', defense: 4, value: 40 },
                { name: 'Plate Mail', symbol: ']', defense: 6, value: 80 },
                { name: 'Magic Armor', symbol: ']', defense: 10, value: 150 }
            ],
            potions: [
                { name: 'Healing Potion', symbol: '!', effect: 'heal', power: 10, value: 20 },
                { name: 'Strength Potion', symbol: '!', effect: 'strength', power: 2, value: 50 },
                { name: 'Defense Potion', symbol: '!', effect: 'defense', power: 2, value: 50 }
            ],
            food: [
                { name: 'Ration', symbol: '%', nutrition: 200, value: 5 },
                { name: 'Bread', symbol: '%', nutrition: 100, value: 3 }
            ]
        };
        
        this.initGame();
        this.setupControls();
        this.generateDungeon();
        this.placePlayer();
        this.spawnEnemies();
        this.spawnItems();
        this.render();
        this.updateUI();
    }
    
    initGame() {
        // Initialize dungeon with walls
        for (let y = 0; y < this.dungeonHeight; y++) {
            this.dungeon[y] = [];
            for (let x = 0; x < this.dungeonWidth; x++) {
                this.dungeon[y][x] = '#'; // Wall
            }
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            let moved = false;
            
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    moved = this.movePlayer(0, -1);
                    break;
                case 's':
                case 'arrowdown':
                    moved = this.movePlayer(0, 1);
                    break;
                case 'a':
                case 'arrowleft':
                    moved = this.movePlayer(-1, 0);
                    break;
                case 'd':
                case 'arrowright':
                    moved = this.movePlayer(1, 0);
                    break;
                case 'e':
                    this.pickupItem();
                    moved = true;
                    break;
                case ' ':
                    // Wait
                    moved = true;
                    break;
                case 'r':
                    this.rest();
                    moved = true;
                    break;
                case 'i':
                    this.showInventory();
                    break;
            }
            
            if (moved) {
                this.enemyTurn();
                this.updateFood();
                this.render();
                this.updateUI();
            }
        });
    }
    
    generateDungeon() {
        // Generate rooms
        const numRooms = 6 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numRooms; i++) {
            let attempts = 0;
            while (attempts < 50) {
                const width = 4 + Math.floor(Math.random() * 8);
                const height = 3 + Math.floor(Math.random() * 6);
                const x = 1 + Math.floor(Math.random() * (this.dungeonWidth - width - 2));
                const y = 1 + Math.floor(Math.random() * (this.dungeonHeight - height - 2));
                
                const room = { x, y, width, height };
                
                if (!this.roomOverlaps(room)) {
                    this.createRoom(room);
                    this.rooms.push(room);
                    break;
                }
                attempts++;
            }
        }
        
        // Connect rooms with corridors
        for (let i = 0; i < this.rooms.length - 1; i++) {
            this.createCorridor(this.rooms[i], this.rooms[i + 1]);
        }
        
        // Place stairs
        if (this.rooms.length > 0) {
            const lastRoom = this.rooms[this.rooms.length - 1];
            const stairX = lastRoom.x + Math.floor(lastRoom.width / 2);
            const stairY = lastRoom.y + Math.floor(lastRoom.height / 2);
            this.dungeon[stairY][stairX] = '>';
        }
    }
    
    roomOverlaps(newRoom) {
        for (const room of this.rooms) {
            if (newRoom.x < room.x + room.width + 1 &&
                newRoom.x + newRoom.width + 1 > room.x &&
                newRoom.y < room.y + room.height + 1 &&
                newRoom.y + newRoom.height + 1 > room.y) {
                return true;
            }
        }
        return false;
    }
    
    createRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                this.dungeon[y][x] = '.';
            }
        }
    }
    
    createCorridor(room1, room2) {
        const x1 = room1.x + Math.floor(room1.width / 2);
        const y1 = room1.y + Math.floor(room1.height / 2);
        const x2 = room2.x + Math.floor(room2.width / 2);
        const y2 = room2.y + Math.floor(room2.height / 2);
        
        // Horizontal corridor
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        for (let x = startX; x <= endX; x++) {
            this.dungeon[y1][x] = '.';
        }
        
        // Vertical corridor
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        for (let y = startY; y <= endY; y++) {
            this.dungeon[y][x2] = '.';
        }
    }
    
    placePlayer() {
        if (this.rooms.length > 0) {
            const firstRoom = this.rooms[0];
            this.player.x = firstRoom.x + Math.floor(firstRoom.width / 2);
            this.player.y = firstRoom.y + Math.floor(firstRoom.height / 2);
        }
    }
    
    spawnEnemies() {
        const numEnemies = 3 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numEnemies; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const x = Math.floor(Math.random() * this.dungeonWidth);
                const y = Math.floor(Math.random() * this.dungeonHeight);
                
                if (this.dungeon[y][x] === '.' && 
                    (x !== this.player.x || y !== this.player.y) &&
                    !this.getEnemyAt(x, y)) {
                    
                    const enemyType = this.enemyTypes[Math.floor(Math.random() * Math.min(this.enemyTypes.length, this.floor + 1))];
                    const enemy = {
                        x: x,
                        y: y,
                        name: enemyType.name,
                        symbol: enemyType.symbol,
                        hp: enemyType.hp + Math.floor(this.floor / 2),
                        maxHp: enemyType.hp + Math.floor(this.floor / 2),
                        attack: enemyType.attack + Math.floor(this.floor / 3),
                        defense: enemyType.defense + Math.floor(this.floor / 4),
                        xp: enemyType.xp,
                        color: enemyType.color
                    };
                    
                    this.enemies.push(enemy);
                    placed = true;
                }
                attempts++;
            }
        }
    }
    
    spawnItems() {
        const numItems = 5 + Math.floor(Math.random() * 8);
        
        for (let i = 0; i < numItems; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const x = Math.floor(Math.random() * this.dungeonWidth);
                const y = Math.floor(Math.random() * this.dungeonHeight);
                
                if (this.dungeon[y][x] === '.' && 
                    (x !== this.player.x || y !== this.player.y) &&
                    !this.getEnemyAt(x, y) &&
                    !this.getItemAt(x, y)) {
                    
                    const itemCategory = Math.random();
                    let item;
                    
                    if (itemCategory < 0.3) {
                        // Weapon
                        const weaponIndex = Math.floor(Math.random() * this.itemTypes.weapons.length);
                        item = {
                            ...this.itemTypes.weapons[weaponIndex],
                            type: 'weapon',
                            x: x,
                            y: y
                        };
                    } else if (itemCategory < 0.5) {
                        // Armor
                        const armorIndex = Math.floor(Math.random() * this.itemTypes.armor.length);
                        item = {
                            ...this.itemTypes.armor[armorIndex],
                            type: 'armor',
                            x: x,
                            y: y
                        };
                    } else if (itemCategory < 0.7) {
                        // Potion
                        const potionIndex = Math.floor(Math.random() * this.itemTypes.potions.length);
                        item = {
                            ...this.itemTypes.potions[potionIndex],
                            type: 'potion',
                            x: x,
                            y: y
                        };
                    } else if (itemCategory < 0.9) {
                        // Food
                        const foodIndex = Math.floor(Math.random() * this.itemTypes.food.length);
                        item = {
                            ...this.itemTypes.food[foodIndex],
                            type: 'food',
                            x: x,
                            y: y
                        };
                    } else {
                        // Gold
                        item = {
                            name: 'Gold',
                            symbol: '*',
                            type: 'gold',
                            amount: 10 + Math.floor(Math.random() * 50),
                            x: x,
                            y: y
                        };
                    }
                    
                    this.items.push(item);
                    placed = true;
                }
                attempts++;
            }
        }
    }
    
    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (newX < 0 || newX >= this.dungeonWidth || 
            newY < 0 || newY >= this.dungeonHeight) {
            return false;
        }
        
        if (this.dungeon[newY][newX] === '#') {
            return false;
        }
        
        // Check for enemy
        const enemy = this.getEnemyAt(newX, newY);
        if (enemy) {
            this.attackEnemy(enemy);
            return true;
        }
        
        // Check for stairs
        if (this.dungeon[newY][newX] === '>') {
            this.descendStairs();
            return true;
        }
        
        this.player.x = newX;
        this.player.y = newY;
        return true;
    }
    
    attackEnemy(enemy) {
        const playerAttack = this.getPlayerAttack();
        const damage = Math.max(1, playerAttack - enemy.defense + Math.floor(Math.random() * 4) - 2);
        enemy.hp -= damage;
        
        this.addMessage(`You hit the ${enemy.name} for ${damage} damage!`, 'combat');
        
        if (enemy.hp <= 0) {
            this.addMessage(`You killed the ${enemy.name}!`, 'combat');
            this.player.xp += enemy.xp;
            this.enemies = this.enemies.filter(e => e !== enemy);
            this.checkLevelUp();
        } else {
            // Enemy attacks back
            const enemyDamage = Math.max(1, enemy.attack - this.getPlayerDefense() + Math.floor(Math.random() * 4) - 2);
            this.player.hp -= enemyDamage;
            this.addMessage(`The ${enemy.name} hits you for ${enemyDamage} damage!`, 'combat');
            
            if (this.player.hp <= 0) {
                this.gameOver();
            }
        }
    }
    
    getPlayerAttack() {
        let attack = this.player.strength;
        if (this.player.weapon) {
            attack += this.player.weapon.attack;
        }
        return attack;
    }
    
    getPlayerDefense() {
        let defense = this.player.defense;
        if (this.player.armor) {
            defense += this.player.armor.defense;
        }
        return defense;
    }
    
    pickupItem() {
        const item = this.getItemAt(this.player.x, this.player.y);
        if (!item) {
            this.addMessage('There is nothing here to pick up.', 'system');
            return;
        }
        
        if (item.type === 'gold') {
            this.player.gold += item.amount;
            this.addMessage(`You found ${item.amount} gold!`, 'item');
        } else if (item.type === 'weapon') {
            if (this.player.weapon) {
                this.addMessage(`You drop your ${this.player.weapon.name}.`, 'item');
            }
            this.player.weapon = item;
            this.addMessage(`You wield the ${item.name}.`, 'item');
        } else if (item.type === 'armor') {
            if (this.player.armor) {
                this.addMessage(`You remove your ${this.player.armor.name}.`, 'item');
            }
            this.player.armor = item;
            this.addMessage(`You wear the ${item.name}.`, 'item');
        } else {
            this.player.inventory.push(item);
            this.addMessage(`You pick up the ${item.name}.`, 'item');
        }
        
        this.items = this.items.filter(i => i !== item);
    }
    
    useItem(item) {
        if (item.type === 'potion') {
            if (item.effect === 'heal') {
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.power);
                this.addMessage(`You drink the ${item.name} and feel better!`, 'item');
            } else if (item.effect === 'strength') {
                this.player.strength += item.power;
                this.addMessage(`You feel stronger!`, 'item');
            } else if (item.effect === 'defense') {
                this.player.defense += item.power;
                this.addMessage(`You feel more protected!`, 'item');
            }
        } else if (item.type === 'food') {
            this.player.food += item.nutrition;
            this.addMessage(`You eat the ${item.name}. Delicious!`, 'item');
        }
        
        this.player.inventory = this.player.inventory.filter(i => i !== item);
    }
    
    rest() {
        if (this.player.hp < this.player.maxHp) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
            this.addMessage('You rest and recover some health.', 'system');
        } else {
            this.addMessage('You are already at full health.', 'system');
        }
    }
    
    enemyTurn() {
        this.enemies.forEach(enemy => {
            // Simple AI: move towards player if in sight
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.abs(dx) + Math.abs(dy);
            
            if (distance <= 10) {
                let moveX = 0;
                let moveY = 0;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    moveX = dx > 0 ? 1 : -1;
                } else {
                    moveY = dy > 0 ? 1 : -1;
                }
                
                const newX = enemy.x + moveX;
                const newY = enemy.y + moveY;
                
                if (newX === this.player.x && newY === this.player.y) {
                    // Attack player
                    const damage = Math.max(1, enemy.attack - this.getPlayerDefense() + Math.floor(Math.random() * 4) - 2);
                    this.player.hp -= damage;
                    this.addMessage(`The ${enemy.name} attacks you for ${damage} damage!`, 'combat');
                    
                    if (this.player.hp <= 0) {
                        this.gameOver();
                    }
                } else if (this.isValidMove(newX, newY)) {
                    enemy.x = newX;
                    enemy.y = newY;
                }
            }
        });
    }
    
    isValidMove(x, y) {
        if (x < 0 || x >= this.dungeonWidth || y < 0 || y >= this.dungeonHeight) {
            return false;
        }
        
        if (this.dungeon[y][x] === '#') {
            return false;
        }
        
        if (this.getEnemyAt(x, y)) {
            return false;
        }
        
        return true;
    }
    
    updateFood() {
        this.player.food--;
        if (this.player.food <= 0) {
            this.player.hp--;
            this.addMessage('You are starving!', 'combat');
            if (this.player.hp <= 0) {
                this.gameOver();
            }
        } else if (this.player.food <= 100) {
            this.addMessage('You are getting hungry.', 'system');
        }
    }
    
    checkLevelUp() {
        if (this.player.xp >= this.player.nextLevel) {
            this.player.level++;
            this.player.xp -= this.player.nextLevel;
            this.player.nextLevel = this.player.level * 20;
            
            const hpIncrease = 5 + Math.floor(Math.random() * 5);
            this.player.maxHp += hpIncrease;
            this.player.hp += hpIncrease;
            this.player.strength++;
            this.player.defense++;
            
            this.addMessage(`Level up! You are now level ${this.player.level}!`, 'system');
        }
    }
    
    descendStairs() {
        this.floor++;
        this.addMessage(`You descend to floor ${this.floor}.`, 'system');
        
        // Reset dungeon
        this.enemies = [];
        this.items = [];
        this.rooms = [];
        this.initGame();
        this.generateDungeon();
        this.placePlayer();
        this.spawnEnemies();
        this.spawnItems();
    }
    
    getEnemyAt(x, y) {
        return this.enemies.find(enemy => enemy.x === x && enemy.y === y);
    }
    
    getItemAt(x, y) {
        return this.items.find(item => item.x === x && item.y === y);
    }
    
    addMessage(text, type = 'system') {
        this.messages.push({ text, type });
        if (this.messages.length > 50) {
            this.messages.shift();
        }
        
        const messagesDiv = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    showInventory() {
        // This is a simple implementation - in a full game you'd want a proper inventory UI
        if (this.player.inventory.length === 0) {
            this.addMessage('Your inventory is empty.', 'system');
        } else {
            this.addMessage('Inventory:', 'system');
            this.player.inventory.forEach((item, index) => {
                this.addMessage(`${index + 1}. ${item.name}`, 'item');
            });
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.addMessage('You have died! Game Over!', 'combat');
        setTimeout(() => {
            alert('Game Over! Refresh to play again.');
        }, 1000);
    }
    
    render() {
        let display = '';
        
        for (let y = 0; y < this.dungeonHeight; y++) {
            for (let x = 0; x < this.dungeonWidth; x++) {
                let char = this.dungeon[y][x];
                let className = '';
                
                // Check for player
                if (x === this.player.x && y === this.player.y) {
                    char = '@';
                    className = 'player';
                } else {
                    // Check for enemies
                    const enemy = this.getEnemyAt(x, y);
                    if (enemy) {
                        char = enemy.symbol;
                        className = 'enemy';
                    } else {
                        // Check for items
                        const item = this.getItemAt(x, y);
                        if (item) {
                            char = item.symbol;
                            className = item.type;
                        } else {
                            // Terrain
                            if (char === '#') {
                                className = 'wall';
                            } else if (char === '.') {
                                className = 'floor';
                            } else if (char === '>') {
                                className = 'stairs';
                            }
                        }
                    }
                }
                
                if (className) {
                    display += `<span class="${className}">${char}</span>`;
                } else {
                    display += char;
                }
            }
            display += '\n';
        }
        
        document.getElementById('dungeon').innerHTML = display;
    }
    
    updateUI() {
        document.getElementById('level').textContent = this.player.level;
        document.getElementById('hp').textContent = this.player.hp;
        document.getElementById('maxHp').textContent = this.player.maxHp;
        document.getElementById('xp').textContent = this.player.xp;
        document.getElementById('nextLevel').textContent = this.player.nextLevel;
        document.getElementById('strength').textContent = this.player.strength;
        document.getElementById('defense').textContent = this.player.defense;
        document.getElementById('gold').textContent = this.player.gold;
        document.getElementById('food').textContent = this.player.food;
        document.getElementById('floor').textContent = this.floor;
        
        const weaponText = this.player.weapon ? 
            `${this.player.weapon.name} (+${this.player.weapon.attack})` : 
            'Fists (+0)';
        document.getElementById('currentWeapon').textContent = weaponText;
        
        const armorText = this.player.armor ? 
            `${this.player.armor.name} (+${this.player.armor.defense})` : 
            'None (+0)';
        document.getElementById('currentArmor').textContent = armorText;
        
        const inventoryDiv = document.getElementById('inventoryItems');
        inventoryDiv.innerHTML = '';
        this.player.inventory.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.textContent = `${index + 1}. ${item.name}`;
            itemDiv.style.cursor = 'pointer';
            itemDiv.onclick = () => this.useItem(item);
            inventoryDiv.appendChild(itemDiv);
        });
    }
}

// Start the game
window.onload = () => {
    const game = new Rogue();
    game.addMessage('Welcome to Rogue! Find the stairs (>) to descend deeper.', 'system');
    game.addMessage('Use WASD to move, E to pick up items, Space to wait.', 'system');
};