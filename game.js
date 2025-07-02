class DragonQuest {
    constructor() {
        this.gameState = 'field'; // field, battle, dialog
        this.player = {
            level: 1,
            hp: 15,
            maxHp: 15,
            mp: 0,
            maxMp: 0,
            exp: 0,
            gold: 120,
            attack: 4,
            defense: 4,
            x: 250,
            y: 150
        };
        
        this.enemies = [
            { name: 'スライム', hp: 3, attack: 2, defense: 1, exp: 1, gold: 2 },
            { name: 'ドラキー', hp: 6, attack: 3, defense: 2, exp: 2, gold: 4 },
            { name: 'おおきづち', hp: 13, attack: 9, defense: 6, exp: 6, gold: 8 }
        ];
        
        this.currentEnemy = null;
        this.fieldEnemies = [];
        this.npcs = [];
        
        this.initGame();
        this.setupControls();
        this.spawnEnemies();
        this.spawnNPCs();
    }
    
    initGame() {
        this.updateStatus();
        this.showDialog('目を覚ますと、あなたは小さな村にいた。\n\n「勇者よ、ついに目覚めたのですね！\n悪の魔王ドラゴンロードを倒してください！」', [
            { text: 'はい', action: () => this.closeDialog() },
            { text: 'いいえ', action: () => this.showDialog('そんなことを言わずに...', [{ text: 'はい', action: () => this.closeDialog() }]) }
        ]);
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'field') {
                this.handleMovement(e.key);
            }
        });
    }
    
    handleMovement(key) {
        const moveSpeed = 20;
        const playerElement = document.getElementById('player');
        const mapArea = document.getElementById('mapArea');
        const mapRect = mapArea.getBoundingClientRect();
        
        let newX = this.player.x;
        let newY = this.player.y;
        
        switch(key) {
            case 'ArrowUp':
            case 'w':
                newY = Math.max(10, this.player.y - moveSpeed);
                break;
            case 'ArrowDown':
            case 's':
                newY = Math.min(mapRect.height - 30, this.player.y + moveSpeed);
                break;
            case 'ArrowLeft':
            case 'a':
                newX = Math.max(10, this.player.x - moveSpeed);
                break;
            case 'ArrowRight':
            case 'd':
                newX = Math.min(mapRect.width - 30, this.player.x + moveSpeed);
                break;
        }
        
        this.player.x = newX;
        this.player.y = newY;
        
        playerElement.style.left = this.player.x + 'px';
        playerElement.style.top = this.player.y + 'px';
        
        this.checkCollisions();
        this.checkRandomEncounter();
    }
    
    checkCollisions() {
        this.fieldEnemies.forEach((enemy, index) => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - enemy.x, 2) + 
                Math.pow(this.player.y - enemy.y, 2)
            );
            
            if (distance < 25) {
                this.startBattle(enemy.data);
                this.fieldEnemies.splice(index, 1);
                enemy.element.remove();
            }
        });
        
        this.npcs.forEach(npc => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - npc.x, 2) + 
                Math.pow(this.player.y - npc.y, 2)
            );
            
            if (distance < 25) {
                this.showDialog(npc.message, [{ text: 'はい', action: () => this.closeDialog() }]);
            }
        });
    }
    
    checkRandomEncounter() {
        if (Math.random() < 0.02) {
            const randomEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
            this.startBattle({ ...randomEnemy });
        }
    }
    
    spawnEnemies() {
        const mapArea = document.getElementById('mapArea');
        const mapRect = mapArea.getBoundingClientRect();
        
        for (let i = 0; i < 5; i++) {
            const enemyData = { ...this.enemies[Math.floor(Math.random() * this.enemies.length)] };
            const enemyElement = document.createElement('div');
            enemyElement.className = 'enemy';
            
            const x = Math.random() * (mapRect.width - 50) + 25;
            const y = Math.random() * (mapRect.height - 50) + 25;
            
            enemyElement.style.left = x + 'px';
            enemyElement.style.top = y + 'px';
            
            mapArea.appendChild(enemyElement);
            
            this.fieldEnemies.push({
                element: enemyElement,
                x: x,
                y: y,
                data: enemyData
            });
        }
    }
    
    spawnNPCs() {
        const mapArea = document.getElementById('mapArea');
        const mapRect = mapArea.getBoundingClientRect();
        
        const npcMessages = [
            '「装備を整えてから冒険に出かけましょう！」',
            '「魔王の城は遥か北にあると聞いています。」',
            '「レベルを上げてから強い敵と戦いなさい。」',
            '「この村には武器屋と宿屋があります。」'
        ];
        
        for (let i = 0; i < 3; i++) {
            const npcElement = document.createElement('div');
            npcElement.className = 'npc';
            
            const x = Math.random() * (mapRect.width - 50) + 25;
            const y = Math.random() * (mapRect.height - 50) + 25;
            
            npcElement.style.left = x + 'px';
            npcElement.style.top = y + 'px';
            
            mapArea.appendChild(npcElement);
            
            this.npcs.push({
                element: npcElement,
                x: x,
                y: y,
                message: npcMessages[i]
            });
        }
    }
    
    startBattle(enemy) {
        this.gameState = 'battle';
        this.currentEnemy = { ...enemy };
        
        document.getElementById('battleText').innerHTML = 
            `${enemy.name}が現れた！<br><br>` +
            `${enemy.name} HP: ${enemy.hp}<br>` +
            `勇者 HP: ${this.player.hp}/${this.player.maxHp}`;
        
        document.getElementById('battleDialog').style.display = 'block';
    }
    
    attack() {
        if (!this.currentEnemy) return;
        
        const damage = Math.max(1, this.player.attack - this.currentEnemy.defense + Math.floor(Math.random() * 3));
        this.currentEnemy.hp -= damage;
        
        let battleText = `勇者の攻撃！<br>${this.currentEnemy.name}に${damage}のダメージ！<br><br>`;
        
        if (this.currentEnemy.hp <= 0) {
            battleText += `${this.currentEnemy.name}を倒した！<br>`;
            battleText += `経験値${this.currentEnemy.exp}を獲得！<br>`;
            battleText += `${this.currentEnemy.gold}ゴールドを手に入れた！`;
            
            this.player.exp += this.currentEnemy.exp;
            this.player.gold += this.currentEnemy.gold;
            
            this.checkLevelUp();
            this.endBattle();
        } else {
            const enemyDamage = Math.max(1, this.currentEnemy.attack - this.player.defense + Math.floor(Math.random() * 2));
            this.player.hp -= enemyDamage;
            
            battleText += `${this.currentEnemy.name}の攻撃！<br>勇者に${enemyDamage}のダメージ！<br><br>`;
            battleText += `${this.currentEnemy.name} HP: ${this.currentEnemy.hp}<br>`;
            battleText += `勇者 HP: ${this.player.hp}/${this.player.maxHp}`;
            
            if (this.player.hp <= 0) {
                battleText += '<br><br>勇者は力尽きた...';
                setTimeout(() => this.gameOver(), 2000);
            }
        }
        
        document.getElementById('battleText').innerHTML = battleText;
        this.updateStatus();
    }
    
    runAway() {
        if (Math.random() < 0.5) {
            document.getElementById('battleText').innerHTML = 'うまく逃げ切った！';
            setTimeout(() => this.endBattle(), 1000);
        } else {
            document.getElementById('battleText').innerHTML = '逃げられなかった！';
            setTimeout(() => {
                const enemyDamage = Math.max(1, this.currentEnemy.attack - this.player.defense + Math.floor(Math.random() * 2));
                this.player.hp -= enemyDamage;
                
                document.getElementById('battleText').innerHTML = 
                    `${this.currentEnemy.name}の攻撃！<br>勇者に${enemyDamage}のダメージ！<br><br>` +
                    `${this.currentEnemy.name} HP: ${this.currentEnemy.hp}<br>` +
                    `勇者 HP: ${this.player.hp}/${this.player.maxHp}`;
                
                this.updateStatus();
                
                if (this.player.hp <= 0) {
                    document.getElementById('battleText').innerHTML += '<br><br>勇者は力尽きた...';
                    setTimeout(() => this.gameOver(), 2000);
                }
            }, 1000);
        }
    }
    
    checkLevelUp() {
        const expNeeded = this.player.level * 7;
        if (this.player.exp >= expNeeded) {
            this.player.level++;
            this.player.exp -= expNeeded;
            
            const hpIncrease = Math.floor(Math.random() * 6) + 3;
            const mpIncrease = this.player.level > 2 ? Math.floor(Math.random() * 3) + 1 : 0;
            
            this.player.maxHp += hpIncrease;
            this.player.hp = this.player.maxHp;
            this.player.maxMp += mpIncrease;
            this.player.mp = this.player.maxMp;
            this.player.attack += Math.floor(Math.random() * 3) + 1;
            this.player.defense += Math.floor(Math.random() * 2) + 1;
            
            this.showDialog(
                `レベルアップ！<br>` +
                `レベル${this.player.level}になった！<br>` +
                `HP+${hpIncrease} MP+${mpIncrease}<br>` +
                `すべての能力が上がった！`,
                [{ text: 'つづける', action: () => this.closeDialog() }]
            );
        }
    }
    
    endBattle() {
        this.gameState = 'field';
        this.currentEnemy = null;
        document.getElementById('battleDialog').style.display = 'none';
    }
    
    gameOver() {
        this.showDialog(
            'ゲームオーバー<br><br>勇者の冒険はここで終わった...',
            [{ text: '最初から', action: () => location.reload() }]
        );
    }
    
    showDialog(text, options = []) {
        this.gameState = 'dialog';
        document.getElementById('dialogText').innerHTML = text;
        
        const optionsDiv = document.getElementById('dialogOptions');
        optionsDiv.innerHTML = '';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.onclick = option.action;
            button.style.marginRight = '10px';
            optionsDiv.appendChild(button);
        });
        
        document.getElementById('dialog').style.display = 'block';
    }
    
    closeDialog() {
        this.gameState = 'field';
        document.getElementById('dialog').style.display = 'none';
    }
    
    updateStatus() {
        document.getElementById('level').textContent = this.player.level;
        document.getElementById('hp').textContent = this.player.hp;
        document.getElementById('maxHp').textContent = this.player.maxHp;
        document.getElementById('mp').textContent = this.player.mp;
        document.getElementById('maxMp').textContent = this.player.maxMp;
        document.getElementById('exp').textContent = this.player.exp;
        document.getElementById('gold').textContent = this.player.gold;
    }
}

// グローバル関数（HTMLから呼び出すため）
let game;

function attack() {
    game.attack();
}

function runAway() {
    game.runAway();
}

// ゲーム開始
window.onload = () => {
    game = new DragonQuest();
};