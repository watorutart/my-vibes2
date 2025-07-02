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
            baseAttack: 4,
            baseDefense: 4,
            attack: 4,
            defense: 4,
            x: 250,
            y: 150,
            weapon: null,
            armor: null,
            shield: null,
            inventory: []
        };
        
        this.enemies = [
            { name: 'スライム', hp: 4, attack: 3, defense: 0, exp: 1, gold: 2, level: 1 },
            { name: 'ドラキー', hp: 8, attack: 4, defense: 1, exp: 2, gold: 4, level: 2 },
            { name: 'おおきづち', hp: 16, attack: 8, defense: 3, exp: 4, gold: 8, level: 3 },
            { name: 'ゴースト', hp: 12, attack: 9, defense: 0, exp: 5, gold: 10, level: 4 },
            { name: 'オーク', hp: 22, attack: 12, defense: 6, exp: 7, gold: 15, level: 5 },
            { name: 'スケルトン', hp: 18, attack: 14, defense: 4, exp: 8, gold: 18, level: 6 },
            { name: 'ロースト', hp: 35, attack: 18, defense: 8, exp: 12, gold: 25, level: 7 },
            { name: 'マジシャン', hp: 28, attack: 20, defense: 6, exp: 15, gold: 35, level: 8 },
            { name: 'ナイト', hp: 45, attack: 25, defense: 15, exp: 20, gold: 50, level: 9 },
            { name: 'ドラゴン', hp: 80, attack: 35, defense: 20, exp: 35, gold: 100, level: 12 },
            { name: 'ドラゴンロード', hp: 100, attack: 45, defense: 25, exp: 50, gold: 0, level: 15 }
        ];
        
        this.currentEnemy = null;
        this.fieldEnemies = [];
        this.npcs = [];
        
        this.items = {
            weapons: [
                { name: 'ひのきのぼう', attack: 2, price: 10, description: '木でできた棒' },
                { name: 'どうのつるぎ', attack: 10, price: 180, description: '銅でできた剣' },
                { name: 'てつのつるぎ', attack: 16, price: 450, description: '鉄でできた剣' },
                { name: 'はがねのつるぎ', attack: 24, price: 1500, description: '鋼でできた剣' },
                { name: 'ロトのつるぎ', attack: 40, price: 0, description: '伝説の勇者の剣' }
            ],
            armor: [
                { name: 'ぬののふく', defense: 2, price: 20, description: '布でできた服' },
                { name: 'かわのふく', defense: 4, price: 70, description: '皮でできた服' },
                { name: 'くさりかたびら', defense: 10, price: 300, description: '鎖でできた鎧' },
                { name: 'てつのよろい', defense: 16, price: 1000, description: '鉄でできた鎧' },
                { name: 'はがねのよろい', defense: 24, price: 3000, description: '鋼でできた鎧' },
                { name: 'ロトのよろい', defense: 28, price: 0, description: '伝説の勇者の鎧' }
            ],
            shields: [
                { name: 'かわのたて', defense: 2, price: 90, description: '皮でできた盾' },
                { name: 'てつのたて', defense: 6, price: 180, description: '鉄でできた盾' },
                { name: 'みかがみのたて', defense: 10, price: 800, description: '魔法を反射する盾' },
                { name: 'ロトのたて', defense: 20, price: 0, description: '伝説の勇者の盾' }
            ],
            consumables: [
                { name: 'やくそう', effect: 'heal', power: 30, price: 24, description: 'HPを30回復する' },
                { name: 'どくけしそう', effect: 'poison_cure', power: 1, price: 10, description: '毒を治す' },
                { name: 'せいすい', effect: 'curse_cure', power: 1, price: 20, description: '呪いを解く' },
                { name: 'マホウのカギ', effect: 'key', power: 1, price: 0, description: '魔法の扉を開く' }
            ]
        };
        
        this.spells = [
            { name: 'ホイミ', mp: 3, effect: 'heal', power: 30, level: 3, description: 'HPを回復する' },
            { name: 'ギラ', mp: 3, effect: 'damage', power: 15, level: 4, description: '敵に炎のダメージ' },
            { name: 'リレミト', mp: 8, effect: 'escape', power: 1, level: 7, description: 'ダンジョンから脱出' },
            { name: 'ベギラマ', mp: 5, effect: 'damage', power: 30, level: 10, description: 'より強い炎のダメージ' },
            { name: 'ラリホー', mp: 2, effect: 'sleep', power: 1, level: 6, description: '敵を眠らせる' }
        ];
        
        this.learnedSpells = [];
        
        this.initGame();
        this.setupControls();
        this.spawnEnemies();
        this.spawnNPCs();
    }
    
    initGame() {
        this.player.inventory.push(this.items.consumables[0]);
        this.player.inventory.push(this.items.consumables[0]);
        this.updateStatus();
        this.showDialog('目を覚ますと、あなたは小さな村にいた。\n\n「勇者よ、ついに目覚めたのですね！\n悪の魔王ドラゴンロードを倒してください！」', [
            { text: 'はい', action: () => this.closeDialog() },
            { text: 'いいえ', action: () => this.showDialog('そんなことを言わずに...', [{ text: 'はい', action: () => this.closeDialog() }]) }
        ]);
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'field') {
                if (e.key === 'i' || e.key === 'I') {
                    this.openInventory();
                } else if (e.key === 's' || e.key === 'S') {
                    this.openStatusScreen();
                } else {
                    this.handleMovement(e.key);
                }
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
                if (npc.type === 'weapon_shop') {
                    this.openWeaponShop();
                } else if (npc.type === 'armor_shop') {
                    this.openArmorShop();
                } else if (npc.type === 'item_shop') {
                    this.openItemShop();
                } else {
                    this.showDialog(npc.message, [{ text: 'はい', action: () => this.closeDialog() }]);
                }
            }
        });
    }
    
    checkRandomEncounter() {
        if (Math.random() < 0.02) {
            const availableEnemies = this.enemies.filter(enemy => 
                enemy.level <= this.player.level + 3 && 
                enemy.name !== 'ドラゴンロード'
            );
            
            if (availableEnemies.length > 0) {
                const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
                this.startBattle({ ...randomEnemy });
            }
        }
    }
    
    spawnEnemies() {
        const mapArea = document.getElementById('mapArea');
        const mapRect = mapArea.getBoundingClientRect();
        
        for (let i = 0; i < 8; i++) {
            const availableEnemies = this.enemies.filter(enemy => 
                enemy.level <= this.player.level + 2 && 
                enemy.name !== 'ドラゴンロード'
            );
            
            if (availableEnemies.length === 0) continue;
            
            const enemyData = { ...availableEnemies[Math.floor(Math.random() * availableEnemies.length)] };
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
        
        const npcData = [
            { message: '「装備を整えてから冒険に出かけましょう！」', type: 'villager' },
            { message: '「魔王の城は遥か北にあると聞いています。」', type: 'villager' },
            { message: '「レベルを上げてから強い敵と戦いなさい。」', type: 'villager' },
            { message: '「いらっしゃいませ！武器をお売りしております。」', type: 'weapon_shop' },
            { message: '「いらっしゃいませ！防具をお売りしております。」', type: 'armor_shop' },
            { message: '「いらっしゃいませ！道具をお売りしております。」', type: 'item_shop' }
        ];
        
        for (let i = 0; i < 6; i++) {
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
                message: npcData[i].message,
                type: npcData[i].type
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
        
        const totalAttack = this.getTotalAttack();
        const damage = Math.max(1, totalAttack - this.currentEnemy.defense + Math.floor(Math.random() * 3));
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
            const totalDefense = this.getTotalDefense();
            const enemyDamage = Math.max(1, this.currentEnemy.attack - totalDefense + Math.floor(Math.random() * 2));
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
                const totalDefense = this.getTotalDefense();
                const enemyDamage = Math.max(1, this.currentEnemy.attack - totalDefense + Math.floor(Math.random() * 2));
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
            this.player.baseAttack += Math.floor(Math.random() * 3) + 1;
            this.player.baseDefense += Math.floor(Math.random() * 2) + 1;
            this.player.attack = this.getTotalAttack();
            this.player.defense = this.getTotalDefense();
            
            if (this.player.level === 3 && !this.learnedSpells.includes('ホイミ')) {
                this.learnedSpells.push('ホイミ');
                this.showDialog(`ホイミを覚えた。`, [{ text: 'つづける', action: () => this.closeDialog() }]);
            }
            
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
        if (this.gameState === 'shop') {
            this.closeShop();
        } else {
            this.gameState = 'field';
            document.getElementById('dialog').style.display = 'none';
        }
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
    
    getTotalAttack() {
        let attack = this.player.baseAttack;
        if (this.player.weapon) {
            attack += this.player.weapon.attack;
        }
        return attack;
    }
    
    getTotalDefense() {
        let defense = this.player.baseDefense;
        if (this.player.armor) {
            defense += this.player.armor.defense;
        }
        if (this.player.shield) {
            defense += this.player.shield.defense;
        }
        return defense;
    }
    
    addItemToInventory(item) {
        this.player.inventory.push(item);
    }
    
    equipItem(item, slot) {
        if (slot === 'weapon') {
            this.player.weapon = item;
        } else if (slot === 'armor') {
            this.player.armor = item;
        } else if (slot === 'shield') {
            this.player.shield = item;
        }
        this.player.attack = this.getTotalAttack();
        this.player.defense = this.getTotalDefense();
        this.updateStatus();
    }
    
    useItem(item) {
        if (item.effect === 'heal') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.power);
            this.showDialog(`${item.name}を使った。<br>HPが${item.power}回復した。`, [{ text: 'つづける', action: () => this.closeDialog() }]);
        } else if (item.effect === 'poison_cure') {
            this.showDialog(`${item.name}を使った。<br>毒が治った。`, [{ text: 'つづける', action: () => this.closeDialog() }]);
        } else if (item.effect === 'curse_cure') {
            this.showDialog(`${item.name}を使った。<br>呪いが解けた。`, [{ text: 'つづける', action: () => this.closeDialog() }]);
        }
        
        const index = this.player.inventory.indexOf(item);
        if (index > -1) {
            this.player.inventory.splice(index, 1);
        }
        this.updateStatus();
    }
    
    castSpell(spell) {
        if (this.player.mp < spell.mp) {
            this.showDialog('メラがたりない。', [{ text: 'つづける', action: () => this.closeDialog() }]);
            return false;
        }
        
        this.player.mp -= spell.mp;
        
        if (spell.effect === 'heal') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + spell.power);
            this.showDialog(`${spell.name}を唄えた。<br>HPが${spell.power}回復した。`, [{ text: 'つづける', action: () => this.closeDialog() }]);
        } else if (spell.effect === 'damage') {
            if (this.currentEnemy) {
                this.currentEnemy.hp -= spell.power;
                this.showDialog(`${spell.name}を唄えた。<br>${this.currentEnemy.name}に${spell.power}のダメージ。`, [{ text: 'つづける', action: () => this.closeDialog() }]);
            }
        }
        
        this.updateStatus();
        return true;
    }
    
    openInventory() {
        let inventoryText = '所持アイテム:<br><br>';
        
        if (this.player.inventory.length === 0) {
            inventoryText += 'アイテムを持っていない。';
        } else {
            this.player.inventory.forEach((item, index) => {
                inventoryText += `${index + 1}. ${item.name} - ${item.description}<br>`;
            });
        }
        
        const options = [{ text: '閉じる', action: () => this.closeDialog() }];
        
        if (this.player.inventory.length > 0) {
            options.unshift({ text: '使う', action: () => this.selectItemToUse() });
        }
        
        this.showDialog(inventoryText, options);
    }
    
    selectItemToUse() {
        let inventoryText = 'どのアイテムを使いますか？<br><br>';
        
        const options = [];
        this.player.inventory.forEach((item, index) => {
            options.push({
                text: `${index + 1}. ${item.name}`,
                action: () => {
                    this.useItem(item);
                }
            });
        });
        
        options.push({ text: 'やめる', action: () => this.openInventory() });
        
        this.showDialog(inventoryText, options);
    }
    
    openStatusScreen() {
        const statusText = `勇者のステータス:<br><br>` +
            `レベル: ${this.player.level}<br>` +
            `HP: ${this.player.hp}/${this.player.maxHp}<br>` +
            `MP: ${this.player.mp}/${this.player.maxMp}<br>` +
            `攻撃力: ${this.getTotalAttack()}<br>` +
            `守備力: ${this.getTotalDefense()}<br>` +
            `経験値: ${this.player.exp}<br>` +
            `ゴールド: ${this.player.gold}<br><br>` +
            `装備:<br>` +
            `武器: ${this.player.weapon ? this.player.weapon.name : 'なし'}<br>` +
            `防具: ${this.player.armor ? this.player.armor.name : 'なし'}<br>` +
            `盾: ${this.player.shield ? this.player.shield.name : 'なし'}`;
        
        this.showDialog(statusText, [{ text: '閉じる', action: () => this.closeDialog() }]);
    }
    
    castSpellInBattle() {
        if (this.learnedSpells.length === 0) {
            this.showDialog('まだ呪文を覚えていない。', [{ text: 'つづける', action: () => this.closeDialog() }]);
            return;
        }
        
        let spellText = 'どの呪文を使いますか？<br><br>';
        const options = [];
        
        this.learnedSpells.forEach(spellName => {
            const spell = this.spells.find(s => s.name === spellName);
            if (spell) {
                options.push({
                    text: `${spell.name} (MP${spell.mp})`,
                    action: () => {
                        if (this.castSpellInBattleAction(spell)) {
                            setTimeout(() => this.enemyTurn(), 1500);
                        }
                    }
                });
            }
        });
        
        options.push({ text: 'やめる', action: () => this.closeDialog() });
        
        this.showDialog(spellText, options);
    }
    
    castSpellInBattleAction(spell) {
        if (this.player.mp < spell.mp) {
            this.showDialog('メラが足りない。', [{ text: 'つづける', action: () => this.closeDialog() }]);
            return false;
        }
        
        this.player.mp -= spell.mp;
        
        if (spell.effect === 'heal') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + spell.power);
            this.showDialog(`${spell.name}を唱えた。<br>HPが${spell.power}回復した。`, [{ text: 'つづける', action: () => this.closeDialog() }]);
        } else if (spell.effect === 'damage') {
            this.currentEnemy.hp -= spell.power;
            let battleText = `${spell.name}を唱えた。<br>${this.currentEnemy.name}に${spell.power}のダメージ。<br><br>`;
            
            if (this.currentEnemy.hp <= 0) {
                battleText += `${this.currentEnemy.name}を倒した！<br>`;
                battleText += `経験値${this.currentEnemy.exp}を獲得！<br>`;
                battleText += `${this.currentEnemy.gold}ゴールドを手に入れた！`;
                
                this.player.exp += this.currentEnemy.exp;
                this.player.gold += this.currentEnemy.gold;
                
                this.checkLevelUp();
                this.endBattle();
            } else {
                battleText += `${this.currentEnemy.name} HP: ${this.currentEnemy.hp}`;
            }
            
            this.showDialog(battleText, [{ text: 'つづける', action: () => this.closeDialog() }]);
        }
        
        this.updateStatus();
        return true;
    }
    
    useItemInBattle() {
        if (this.player.inventory.length === 0) {
            this.showDialog('アイテムを持っていない。', [{ text: 'つづける', action: () => this.closeDialog() }]);
            return;
        }
        
        let itemText = 'どのアイテムを使いますか？<br><br>';
        const options = [];
        
        this.player.inventory.forEach(item => {
            options.push({
                text: item.name,
                action: () => {
                    this.useItemInBattleAction(item);
                    setTimeout(() => this.enemyTurn(), 1500);
                }
            });
        });
        
        options.push({ text: 'やめる', action: () => this.closeDialog() });
        
        this.showDialog(itemText, options);
    }
    
    useItemInBattleAction(item) {
        if (item.effect === 'heal') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.power);
            this.showDialog(`${item.name}を使った。<br>HPが${item.power}回復した。`, [{ text: 'つづける', action: () => this.closeDialog() }]);
        }
        
        const index = this.player.inventory.indexOf(item);
        if (index > -1) {
            this.player.inventory.splice(index, 1);
        }
        this.updateStatus();
    }
    
    enemyTurn() {
        if (!this.currentEnemy || this.currentEnemy.hp <= 0) return;
        
        const totalDefense = this.getTotalDefense();
        const enemyDamage = Math.max(1, this.currentEnemy.attack - totalDefense + Math.floor(Math.random() * 2));
        this.player.hp -= enemyDamage;
        
        let battleText = `${this.currentEnemy.name}の攻撃！<br>勇者に${enemyDamage}のダメージ！<br><br>`;
        battleText += `${this.currentEnemy.name} HP: ${this.currentEnemy.hp}<br>`;
        battleText += `勇者 HP: ${this.player.hp}/${this.player.maxHp}`;
        
        if (this.player.hp <= 0) {
            battleText += '<br><br>勇者は力尽きた...';
            setTimeout(() => this.gameOver(), 2000);
        }
        
        document.getElementById('battleText').innerHTML = battleText;
        this.updateStatus();
    }
    
    openWeaponShop() {
        this.gameState = 'shop';
        let shopText = '武器屋へようこそ！<br><br>何をお求めでしょうか？<br><br>';
        
        const options = [
            { text: 'かう', action: () => this.showWeaponBuyMenu() },
            { text: 'うる', action: () => this.showSellMenu('weapon') },
            { text: 'やめる', action: () => this.closeShop() }
        ];
        
        this.showShopDialog(shopText, options);
    }
    
    openArmorShop() {
        this.gameState = 'shop';
        let shopText = '防具屋へようこそ！<br><br>何をお求めでしょうか？<br><br>';
        
        const options = [
            { text: 'かう', action: () => this.showArmorBuyMenu() },
            { text: 'うる', action: () => this.showSellMenu('armor') },
            { text: 'やめる', action: () => this.closeShop() }
        ];
        
        this.showShopDialog(shopText, options);
    }
    
    openItemShop() {
        this.gameState = 'shop';
        let shopText = '道具屋へようこそ！<br><br>何をお求めでしょうか？<br><br>';
        
        const options = [
            { text: 'かう', action: () => this.showItemBuyMenu() },
            { text: 'うる', action: () => this.showSellMenu('item') },
            { text: 'やめる', action: () => this.closeShop() }
        ];
        
        this.showShopDialog(shopText, options);
    }
    
    showWeaponBuyMenu() {
        let shopText = `ゴールド: ${this.player.gold}<br><br>どの武器をお買い上げでしょうか？<br><br>`;
        
        const options = [];
        
        this.items.weapons.forEach(weapon => {
            if (weapon.name !== 'ロトのつるぎ') {
                const canAfford = this.player.gold >= weapon.price;
                options.push({
                    text: `${weapon.name} - ${weapon.price}G${canAfford ? '' : ' (お金が足りません)'}`,
                    action: canAfford ? () => this.buyItem(weapon, 'weapon') : null
                });
            }
        });
        
        options.push({ text: 'やめる', action: () => this.openWeaponShop() });
        
        this.showShopDialog(shopText, options);
    }
    
    showArmorBuyMenu() {
        let shopText = `ゴールド: ${this.player.gold}<br><br>どの防具をお買い上げでしょうか？<br><br>`;
        
        const options = [];
        
        this.items.armor.forEach(armor => {
            if (armor.name !== 'ロトのよろい') {
                const canAfford = this.player.gold >= armor.price;
                options.push({
                    text: `${armor.name} - ${armor.price}G${canAfford ? '' : ' (お金が足りません)'}`,
                    action: canAfford ? () => this.buyItem(armor, 'armor') : null
                });
            }
        });
        
        this.items.shields.forEach(shield => {
            if (shield.name !== 'ロトのたて') {
                const canAfford = this.player.gold >= shield.price;
                options.push({
                    text: `${shield.name} - ${shield.price}G${canAfford ? '' : ' (お金が足りません)'}`,
                    action: canAfford ? () => this.buyItem(shield, 'shield') : null
                });
            }
        });
        
        options.push({ text: 'やめる', action: () => this.openArmorShop() });
        
        this.showShopDialog(shopText, options);
    }
    
    showItemBuyMenu() {
        let shopText = `ゴールド: ${this.player.gold}<br><br>どのアイテムをお買い上げでしょうか？<br><br>`;
        
        const options = [];
        
        this.items.consumables.forEach(item => {
            if (item.price > 0) {
                const canAfford = this.player.gold >= item.price;
                options.push({
                    text: `${item.name} - ${item.price}G${canAfford ? '' : ' (お金が足りません)'}`,
                    action: canAfford ? () => this.buyItem(item, 'consumable') : null
                });
            }
        });
        
        options.push({ text: 'やめる', action: () => this.openItemShop() });
        
        this.showShopDialog(shopText, options);
    }
    
    buyItem(item, type) {
        if (this.player.gold < item.price) {
            this.showShopDialog('お金が足りません。', [{ text: '戻る', action: () => this.openWeaponShop() }]);
            return;
        }
        
        this.player.gold -= item.price;
        
        if (type === 'weapon') {
            this.equipItem(item, 'weapon');
            this.showShopDialog(`${item.name}を購入し、装備しました。`, [{ text: 'つづける', action: () => this.openWeaponShop() }]);
        } else if (type === 'armor') {
            this.equipItem(item, 'armor');
            this.showShopDialog(`${item.name}を購入し、装備しました。`, [{ text: 'つづける', action: () => this.openArmorShop() }]);
        } else if (type === 'shield') {
            this.equipItem(item, 'shield');
            this.showShopDialog(`${item.name}を購入し、装備しました。`, [{ text: 'つづける', action: () => this.openArmorShop() }]);
        } else if (type === 'consumable') {
            this.addItemToInventory({ ...item });
            this.showShopDialog(`${item.name}を購入しました。`, [{ text: 'つづける', action: () => this.openItemShop() }]);
        }
        
        this.updateStatus();
    }
    
    showSellMenu(shopType) {
        this.showShopDialog('申し訳ありませんが、買い取りはしておりません。', [{ text: '戻る', action: () => {
            if (shopType === 'weapon') this.openWeaponShop();
            else if (shopType === 'armor') this.openArmorShop();
            else this.openItemShop();
        }}]);
    }
    
    showShopDialog(text, options = []) {
        document.getElementById('shopText').innerHTML = text;
        
        const optionsDiv = document.getElementById('shopOptions');
        optionsDiv.innerHTML = '';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            if (option.action) {
                button.onclick = option.action;
            } else {
                button.disabled = true;
                button.style.opacity = '0.5';
            }
            button.style.marginRight = '10px';
            button.style.marginBottom = '5px';
            optionsDiv.appendChild(button);
        });
        
        document.getElementById('shopDialog').style.display = 'block';
    }
    
    closeShop() {
        this.gameState = 'field';
        document.getElementById('shopDialog').style.display = 'none';
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

function castSpellInBattle() {
    game.castSpellInBattle();
}

function useItemInBattle() {
    game.useItemInBattle();
}

// ゲーム開始
window.onload = () => {
    game = new DragonQuest();
};