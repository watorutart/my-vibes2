class BabaIsYou {
    constructor() {
        this.gameGrid = document.getElementById('gameGrid');
        this.currentLevelSpan = document.getElementById('currentLevel');
        this.levelNameSpan = document.getElementById('levelName');
        this.rulesListElement = document.getElementById('rulesList');
        this.gameMessage = document.getElementById('gameMessage');
        this.undoBtn = document.getElementById('undoBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Game state
        this.gridWidth = 20;
        this.gridHeight = 15;
        this.currentLevel = 0;
        this.gameWon = false;
        this.moveHistory = [];
        this.maxHistorySize = 50;
        
        // Game objects and rules
        this.objects = [];
        this.rules = new Map();
        this.youObjects = [];
        this.winObjects = [];
        this.stopObjects = [];
        this.pushObjects = [];
        this.defeatObjects = [];
        this.hotObjects = [];
        this.meltObjects = [];
        this.sinkObjects = [];
        this.openObjects = [];
        this.shutObjects = [];
        this.weakObjects = [];
        this.safeObjects = [];
        this.floatObjects = [];
        
        // Level definitions
        this.levels = [
            {
                name: "First Steps",
                width: 20,
                height: 15,
                objects: [
                    // Rule: BABA IS YOU
                    {type: 'text', subtype: 'baba', x: 2, y: 2},
                    {type: 'text', subtype: 'is', x: 3, y: 2},
                    {type: 'text', subtype: 'you', x: 4, y: 2},
                    
                    // Rule: FLAG IS WIN
                    {type: 'text', subtype: 'flag', x: 2, y: 4},
                    {type: 'text', subtype: 'is', x: 3, y: 4},
                    {type: 'text', subtype: 'win', x: 4, y: 4},
                    
                    // Rule: WALL IS STOP
                    {type: 'text', subtype: 'wall', x: 2, y: 6},
                    {type: 'text', subtype: 'is', x: 3, y: 6},
                    {type: 'text', subtype: 'stop', x: 4, y: 6},
                    
                    // Rule: TEXT IS PUSH
                    {type: 'text', subtype: 'text', x: 2, y: 8},
                    {type: 'text', subtype: 'is', x: 3, y: 8},
                    {type: 'text', subtype: 'push', x: 4, y: 8},
                    
                    // Actual objects
                    {type: 'baba', x: 8, y: 8},
                    {type: 'flag', x: 15, y: 8},
                    
                    // Walls around the edge
                    ...this.createBorder(20, 15, 'wall')
                ]
            },
            {
                name: "Push and Win",
                width: 20,
                height: 15,
                objects: [
                    // Rules
                    {type: 'text', subtype: 'baba', x: 1, y: 1},
                    {type: 'text', subtype: 'is', x: 2, y: 1},
                    {type: 'text', subtype: 'you', x: 3, y: 1},
                    
                    {type: 'text', subtype: 'flag', x: 1, y: 3},
                    {type: 'text', subtype: 'is', x: 2, y: 3},
                    {type: 'text', subtype: 'win', x: 3, y: 3},
                    
                    {type: 'text', subtype: 'wall', x: 1, y: 5},
                    {type: 'text', subtype: 'is', x: 2, y: 5},
                    {type: 'text', subtype: 'stop', x: 3, y: 5},
                    
                    {type: 'text', subtype: 'rock', x: 1, y: 7},
                    {type: 'text', subtype: 'is', x: 2, y: 7},
                    {type: 'text', subtype: 'push', x: 3, y: 7},
                    
                    {type: 'text', subtype: 'text', x: 5, y: 1},
                    {type: 'text', subtype: 'is', x: 6, y: 1},
                    {type: 'text', subtype: 'push', x: 7, y: 1},
                    
                    // Objects
                    {type: 'baba', x: 6, y: 8},
                    {type: 'rock', x: 8, y: 8},
                    {type: 'rock', x: 10, y: 8},
                    {type: 'flag', x: 15, y: 8},
                    
                    // Walls
                    ...this.createBorder(20, 15, 'wall')
                ]
            },
            {
                name: "Make Your Own Rules",
                width: 20,
                height: 15,
                objects: [
                    // Complete rule to start: TEXT IS PUSH
                    {type: 'text', subtype: 'text', x: 1, y: 1},
                    {type: 'text', subtype: 'is', x: 2, y: 1},
                    {type: 'text', subtype: 'push', x: 3, y: 1},
                    
                    // Complete rule to start: BABA IS YOU (so player can move)
                    {type: 'text', subtype: 'baba', x: 5, y: 1},
                    {type: 'text', subtype: 'is', x: 6, y: 1},
                    {type: 'text', subtype: 'you', x: 7, y: 1},
                    
                    // Incomplete rules that player must complete
                    {type: 'text', subtype: 'flag', x: 8, y: 3},
                    {type: 'text', subtype: 'is', x: 9, y: 3},
                    
                    {type: 'text', subtype: 'wall', x: 11, y: 3},
                    {type: 'text', subtype: 'is', x: 12, y: 3},
                    {type: 'text', subtype: 'stop', x: 13, y: 3},
                    
                    // Available rule words
                    {type: 'text', subtype: 'win', x: 5, y: 5},
                    {type: 'text', subtype: 'push', x: 8, y: 5},
                    {type: 'text', subtype: 'rock', x: 11, y: 5},
                    {type: 'text', subtype: 'is', x: 14, y: 5},
                    
                    // Objects
                    {type: 'baba', x: 3, y: 10},
                    {type: 'flag', x: 16, y: 10},
                    {type: 'rock', x: 10, y: 8},
                    {type: 'rock', x: 12, y: 8},
                    
                    // Walls
                    ...this.createBorder(20, 15, 'wall'),
                    // Additional walls
                    {type: 'wall', x: 7, y: 8},
                    {type: 'wall', x: 7, y: 9},
                    {type: 'wall', x: 7, y: 10},
                    {type: 'wall', x: 7, y: 11},
                    {type: 'wall', x: 7, y: 12}
                ]
            },
            {
                name: "Dangerous Waters",
                width: 20,
                height: 15,
                objects: [
                    // Rules
                    {type: 'text', subtype: 'baba', x: 1, y: 1},
                    {type: 'text', subtype: 'is', x: 2, y: 1},
                    {type: 'text', subtype: 'you', x: 3, y: 1},
                    
                    {type: 'text', subtype: 'flag', x: 1, y: 3},
                    {type: 'text', subtype: 'is', x: 2, y: 3},
                    {type: 'text', subtype: 'win', x: 3, y: 3},
                    
                    {type: 'text', subtype: 'wall', x: 1, y: 5},
                    {type: 'text', subtype: 'is', x: 2, y: 5},
                    {type: 'text', subtype: 'stop', x: 3, y: 5},
                    
                    {type: 'text', subtype: 'water', x: 1, y: 7},
                    {type: 'text', subtype: 'is', x: 2, y: 7},
                    {type: 'text', subtype: 'defeat', x: 3, y: 7},
                    
                    {type: 'text', subtype: 'text', x: 1, y: 9},
                    {type: 'text', subtype: 'is', x: 2, y: 9},
                    {type: 'text', subtype: 'push', x: 3, y: 9},
                    
                    // Objects
                    {type: 'baba', x: 6, y: 12},
                    {type: 'flag', x: 15, y: 3},
                    
                    // Water hazard
                    {type: 'water', x: 8, y: 8},
                    {type: 'water', x: 9, y: 8},
                    {type: 'water', x: 10, y: 8},
                    {type: 'water', x: 11, y: 8},
                    {type: 'water', x: 12, y: 8},
                    {type: 'water', x: 8, y: 9},
                    {type: 'water', x: 9, y: 9},
                    {type: 'water', x: 10, y: 9},
                    {type: 'water', x: 11, y: 9},
                    {type: 'water', x: 12, y: 9},
                    
                    // Walls
                    ...this.createBorder(20, 15, 'wall')
                ]
            },
            {
                name: "Advanced Mechanics",
                width: 20,
                height: 15,
                objects: [
                    // Basic rules
                    {type: 'text', subtype: 'baba', x: 1, y: 1},
                    {type: 'text', subtype: 'is', x: 2, y: 1},
                    {type: 'text', subtype: 'you', x: 3, y: 1},
                    
                    {type: 'text', subtype: 'flag', x: 1, y: 3},
                    {type: 'text', subtype: 'is', x: 2, y: 3},
                    {type: 'text', subtype: 'win', x: 3, y: 3},
                    
                    {type: 'text', subtype: 'wall', x: 1, y: 5},
                    {type: 'text', subtype: 'is', x: 2, y: 5},
                    {type: 'text', subtype: 'stop', x: 3, y: 5},
                    
                    {type: 'text', subtype: 'text', x: 1, y: 7},
                    {type: 'text', subtype: 'is', x: 2, y: 7},
                    {type: 'text', subtype: 'push', x: 3, y: 7},
                    
                    // Advanced mechanic rules
                    {type: 'text', subtype: 'lava', x: 10, y: 1},
                    {type: 'text', subtype: 'is', x: 11, y: 1},
                    {type: 'text', subtype: 'hot', x: 12, y: 1},
                    
                    {type: 'text', subtype: 'ice', x: 10, y: 3},
                    {type: 'text', subtype: 'is', x: 11, y: 3},
                    {type: 'text', subtype: 'melt', x: 12, y: 3},
                    
                    {type: 'text', subtype: 'key', x: 10, y: 5},
                    {type: 'text', subtype: 'is', x: 11, y: 5},
                    {type: 'text', subtype: 'open', x: 12, y: 5},
                    
                    {type: 'text', subtype: 'door', x: 10, y: 7},
                    {type: 'text', subtype: 'is', x: 11, y: 7},
                    {type: 'text', subtype: 'shut', x: 12, y: 7},
                    
                    // Objects to interact
                    {type: 'baba', x: 3, y: 12},
                    {type: 'flag', x: 17, y: 12},
                    {type: 'lava', x: 8, y: 8},
                    {type: 'ice', x: 9, y: 8},
                    {type: 'ice', x: 10, y: 8},
                    {type: 'key', x: 6, y: 10},
                    {type: 'door', x: 15, y: 10},
                    
                    // Walls
                    ...this.createBorder(20, 15, 'wall')
                ]
            },
            {
                name: "Complex Puzzle",
                width: 20,
                height: 15,
                objects: [
                    // Initial rules
                    {type: 'text', subtype: 'text', x: 1, y: 1},
                    {type: 'text', subtype: 'is', x: 2, y: 1},
                    {type: 'text', subtype: 'push', x: 3, y: 1},
                    
                    {type: 'text', subtype: 'keke', x: 5, y: 1},
                    {type: 'text', subtype: 'is', x: 6, y: 1},
                    {type: 'text', subtype: 'you', x: 7, y: 1},
                    
                    {type: 'text', subtype: 'wall', x: 1, y: 3},
                    {type: 'text', subtype: 'is', x: 2, y: 3},
                    {type: 'text', subtype: 'stop', x: 3, y: 3},
                    
                    {type: 'text', subtype: 'water', x: 1, y: 5},
                    {type: 'text', subtype: 'is', x: 2, y: 5},
                    {type: 'text', subtype: 'defeat', x: 3, y: 5},
                    
                    // Puzzle elements
                    {type: 'text', subtype: 'baba', x: 10, y: 2},
                    {type: 'text', subtype: 'is', x: 11, y: 2},
                    
                    {type: 'text', subtype: 'flag', x: 13, y: 2},
                    {type: 'text', subtype: 'is', x: 14, y: 2},
                    
                    // Available words
                    {type: 'text', subtype: 'you', x: 10, y: 5},
                    {type: 'text', subtype: 'win', x: 13, y: 5},
                    {type: 'text', subtype: 'push', x: 16, y: 5},
                    
                    // Objects
                    {type: 'keke', x: 3, y: 12},
                    {type: 'baba', x: 8, y: 8},
                    {type: 'flag', x: 16, y: 12},
                    
                    // Hazards
                    {type: 'water', x: 6, y: 9},
                    {type: 'water', x: 7, y: 9},
                    {type: 'water', x: 8, y: 9},
                    {type: 'water', x: 9, y: 9},
                    {type: 'water', x: 10, y: 9},
                    {type: 'water', x: 11, y: 9},
                    {type: 'water', x: 12, y: 9},
                    {type: 'water', x: 13, y: 9},
                    
                    // Walls
                    ...this.createBorder(20, 15, 'wall')
                ]
            }
        ];
        
        this.setupEventListeners();
        this.loadLevel(0);
    }
    
    createBorder(width, height, objectType) {
        const border = [];
        
        // Top and bottom borders
        for (let x = 0; x < width; x++) {
            border.push({type: objectType, x: x, y: 0});
            border.push({type: objectType, x: x, y: height - 1});
        }
        
        // Left and right borders
        for (let y = 1; y < height - 1; y++) {
            border.push({type: objectType, x: 0, y: y});
            border.push({type: objectType, x: width - 1, y: y});
        }
        
        return border;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameWon) return;
            
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    e.preventDefault();
                    this.moveYouObjects(0, -1);
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveYouObjects(0, 1);
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveYouObjects(-1, 0);
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveYouObjects(1, 0);
                    break;
                case 'KeyZ':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.resetLevel();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.waitTurn();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.showLevelSelect();
                    break;
            }
        });
        
        this.undoBtn.addEventListener('click', () => this.undo());
        this.resetBtn.addEventListener('click', () => this.resetLevel());
    }
    
    loadLevel(levelIndex) {
        if (levelIndex >= this.levels.length) return;
        
        this.currentLevel = levelIndex;
        this.gameWon = false;
        this.moveHistory = [];
        
        const level = this.levels[levelIndex];
        this.currentLevelSpan.textContent = levelIndex + 1;
        this.levelNameSpan.textContent = level.name;
        
        // Clear previous objects
        this.objects = [];
        
        // Load level objects
        level.objects.forEach(objData => {
            this.objects.push({
                type: objData.type,
                subtype: objData.subtype || objData.type,
                x: objData.x,
                y: objData.y,
                id: this.generateId()
            });
        });
        
        this.parseRules();
        this.renderGrid();
        this.updateRulesDisplay();
    }
    
    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }
    
    parseRules() {
        this.rules.clear();
        this.youObjects = [];
        this.winObjects = [];
        this.stopObjects = [];
        this.pushObjects = [];
        this.defeatObjects = [];
        
        const textObjects = this.objects.filter(obj => obj.type === 'text');
        
        // Find horizontal rules (X IS Y)
        for (let obj of textObjects) {
            if (obj.subtype === 'is') {
                const leftObj = textObjects.find(t => t.x === obj.x - 1 && t.y === obj.y);
                const rightObj = textObjects.find(t => t.x === obj.x + 1 && t.y === obj.y);
                
                if (leftObj && rightObj) {
                    this.addRule(leftObj.subtype, rightObj.subtype);
                }
            }
        }
        
        // Find vertical rules
        for (let obj of textObjects) {
            if (obj.subtype === 'is') {
                const topObj = textObjects.find(t => t.x === obj.x && t.y === obj.y - 1);
                const bottomObj = textObjects.find(t => t.x === obj.x && t.y === obj.y + 1);
                
                if (topObj && bottomObj) {
                    this.addRule(topObj.subtype, bottomObj.subtype);
                }
            }
        }
        
        // Apply rules to categorize objects
        this.categorizeObjects();
    }
    
    addRule(subject, property) {
        if (!this.rules.has(subject)) {
            this.rules.set(subject, []);
        }
        if (!this.rules.get(subject).includes(property)) {
            this.rules.get(subject).push(property);
        }
    }
    
    categorizeObjects() {
        // Clear all arrays
        this.youObjects = [];
        this.winObjects = [];
        this.stopObjects = [];
        this.pushObjects = [];
        this.defeatObjects = [];
        this.hotObjects = [];
        this.meltObjects = [];
        this.sinkObjects = [];
        this.openObjects = [];
        this.shutObjects = [];
        this.weakObjects = [];
        this.safeObjects = [];
        this.floatObjects = [];
        
        for (let obj of this.objects) {
            const objectType = obj.type === 'text' ? 'text' : obj.type;
            const rules = this.rules.get(objectType) || [];
            
            if (rules.includes('you')) {
                this.youObjects.push(obj);
            }
            if (rules.includes('win')) {
                this.winObjects.push(obj);
            }
            if (rules.includes('stop')) {
                this.stopObjects.push(obj);
            }
            if (rules.includes('push')) {
                this.pushObjects.push(obj);
            }
            if (rules.includes('defeat')) {
                this.defeatObjects.push(obj);
            }
            if (rules.includes('hot')) {
                this.hotObjects.push(obj);
            }
            if (rules.includes('melt')) {
                this.meltObjects.push(obj);
            }
            if (rules.includes('sink')) {
                this.sinkObjects.push(obj);
            }
            if (rules.includes('open')) {
                this.openObjects.push(obj);
            }
            if (rules.includes('shut')) {
                this.shutObjects.push(obj);
            }
            if (rules.includes('weak')) {
                this.weakObjects.push(obj);
            }
            if (rules.includes('safe')) {
                this.safeObjects.push(obj);
            }
            if (rules.includes('float')) {
                this.floatObjects.push(obj);
            }
        }
        
        // Text objects are always pushable by default (unless they have STOP rule)
        for (let obj of this.objects) {
            if (obj.type === 'text' && !this.stopObjects.includes(obj)) {
                if (!this.pushObjects.includes(obj)) {
                    this.pushObjects.push(obj);
                }
            }
        }
    }
    
    moveYouObjects(dx, dy) {
        if (this.youObjects.length === 0) return;
        
        // Save state for undo
        this.saveState();
        
        let moved = false;
        
        // Sort objects by movement direction to handle pushing correctly
        const sortedYouObjects = [...this.youObjects].sort((a, b) => {
            if (dx > 0) return b.x - a.x;  // Moving right: process rightmost first
            if (dx < 0) return a.x - b.x;  // Moving left: process leftmost first
            if (dy > 0) return b.y - a.y;  // Moving down: process bottommost first
            if (dy < 0) return a.y - b.y;  // Moving up: process topmost first
            return 0;
        });
        
        for (let youObj of sortedYouObjects) {
            if (this.canMove(youObj, dx, dy)) {
                this.moveObject(youObj, dx, dy);
                moved = true;
            }
        }
        
        if (moved) {
            // Apply transformations
            this.applyTransformations();
            
            // Re-parse rules after movement
            this.parseRules();
            this.renderGrid();
            this.updateRulesDisplay();
            
            // Check for defeat
            if (this.checkDefeat()) {
                this.showMessage("You were defeated!", () => {
                    this.undo();
                });
                return;
            }
            
            // Check for win
            if (this.checkWin()) {
                this.gameWon = true;
                this.showMessage("You Win!", () => {
                    if (this.currentLevel < this.levels.length - 1) {
                        this.loadLevel(this.currentLevel + 1);
                    } else {
                        this.showMessage("Congratulations! You completed all levels!");
                    }
                });
            }
        }
    }
    
    canMove(obj, dx, dy) {
        const newX = obj.x + dx;
        const newY = obj.y + dy;
        
        // Check bounds
        if (newX < 0 || newX >= this.gridWidth || newY < 0 || newY >= this.gridHeight) {
            return false;
        }
        
        const objectsAtTarget = this.getObjectsAt(newX, newY);
        
        for (let targetObj of objectsAtTarget) {
            if (targetObj === obj) continue;
            
            // Check if target is STOP
            if (this.stopObjects.includes(targetObj)) {
                return false;
            }
            
            // Check if target is PUSH
            if (this.pushObjects.includes(targetObj)) {
                if (!this.canMove(targetObj, dx, dy)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    moveObject(obj, dx, dy) {
        const newX = obj.x + dx;
        const newY = obj.y + dy;
        
        // Push objects at target location
        const objectsAtTarget = this.getObjectsAt(newX, newY);
        for (let targetObj of objectsAtTarget) {
            if (targetObj !== obj && this.pushObjects.includes(targetObj)) {
                this.moveObject(targetObj, dx, dy);
            }
        }
        
        // Move the object
        obj.x = newX;
        obj.y = newY;
        
        this.createMovementTrail(obj.x - dx, obj.y - dy);
        
        // Check for special interactions after movement
        this.checkSpecialInteractions(obj);
    }
    
    createMovementTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'movement-trail';
        trail.style.left = (x * 33 + 1) + 'px';
        trail.style.top = (y * 33 + 1) + 'px';
        this.gameGrid.appendChild(trail);
        
        setTimeout(() => {
            if (trail.parentNode) {
                trail.remove();
            }
        }, 500);
    }
    
    applyTransformations() {
        const transformations = new Map();
        
        // Find transformation rules (X IS Y where Y is an object type)
        for (let [subject, properties] of this.rules) {
            for (let property of properties) {
                if (this.isObjectType(property)) {
                    transformations.set(subject, property);
                }
            }
        }
        
        // Apply transformations
        for (let obj of this.objects) {
            if (obj.type === 'text') continue;
            
            if (transformations.has(obj.type)) {
                obj.type = transformations.get(obj.type);
            }
        }
    }
    
    isObjectType(word) {
        const objectTypes = ['baba', 'flag', 'wall', 'rock', 'water', 'lava', 'skull', 'key', 'door', 'love', 
                           'keke', 'me', 'grass', 'flower', 'tree', 'hedge', 'brick', 'ice', 'text'];
        return objectTypes.includes(word);
    }
    
    checkDefeat() {
        for (let youObj of this.youObjects) {
            const objectsAtPos = this.getObjectsAt(youObj.x, youObj.y);
            for (let obj of objectsAtPos) {
                if (obj !== youObj && this.defeatObjects.includes(obj)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkWin() {
        if (this.youObjects.length === 0) return false;
        
        for (let youObj of this.youObjects) {
            const objectsAtPos = this.getObjectsAt(youObj.x, youObj.y);
            for (let obj of objectsAtPos) {
                if (obj !== youObj && this.winObjects.includes(obj)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    getObjectsAt(x, y) {
        return this.objects.filter(obj => obj.x === x && obj.y === y);
    }
    
    saveState() {
        const state = {
            objects: JSON.parse(JSON.stringify(this.objects)),
            rules: new Map(this.rules)
        };
        
        this.moveHistory.push(state);
        if (this.moveHistory.length > this.maxHistorySize) {
            this.moveHistory.shift();
        }
    }
    
    undo() {
        if (this.moveHistory.length === 0) return;
        
        const previousState = this.moveHistory.pop();
        this.objects = previousState.objects;
        this.rules = previousState.rules;
        
        this.parseRules();
        this.renderGrid();
        this.updateRulesDisplay();
        this.gameWon = false;
    }
    
    resetLevel() {
        this.loadLevel(this.currentLevel);
    }
    
    renderGrid() {
        this.gameGrid.innerHTML = '';
        
        // Create grid cells
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.gridColumn = x + 1;
                cell.style.gridRow = y + 1;
                this.gameGrid.appendChild(cell);
            }
        }
        
        // Render objects
        for (let obj of this.objects) {
            this.renderObject(obj);
        }
    }
    
    renderObject(obj) {
        const objectElement = document.createElement('div');
        objectElement.className = 'object';
        objectElement.style.left = (obj.x * 33 + 1) + 'px';
        objectElement.style.top = (obj.y * 33 + 1) + 'px';
        
        // Add object ID for special interactions
        objectElement.setAttribute('data-object-id', obj.id);
        
        if (obj.type === 'text') {
            objectElement.classList.add('text');
            objectElement.textContent = obj.subtype.toUpperCase();
            
            // Check if this text is part of an active rule
            if (this.isPartOfActiveRule(obj)) {
                objectElement.classList.add('rule-active');
            }
        } else {
            objectElement.classList.add(obj.type);
            objectElement.textContent = this.getObjectDisplay(obj.type);
            
            // Add special classes based on rules
            if (this.youObjects.includes(obj)) {
                objectElement.classList.add('you-controlled');
            }
            if (this.winObjects.includes(obj)) {
                objectElement.classList.add('win-object');
            }
            if (this.stopObjects.includes(obj)) {
                objectElement.classList.add('stop-object');
            }
            if (this.pushObjects.includes(obj)) {
                objectElement.classList.add('push-object');
            }
            if (this.defeatObjects.includes(obj)) {
                objectElement.classList.add('defeat-object');
            }
            if (this.hotObjects.includes(obj)) {
                objectElement.classList.add('hot-object');
            }
            if (this.weakObjects.includes(obj)) {
                objectElement.classList.add('weak-object');
            }
            if (this.shutObjects.includes(obj)) {
                objectElement.classList.add('shut-object');
            }
            if (this.safeObjects.includes(obj)) {
                objectElement.classList.add('safe-object');
            }
            if (this.floatObjects.includes(obj)) {
                objectElement.classList.add('float-object');
            }
        }
        
        this.gameGrid.appendChild(objectElement);
    }
    
    isPartOfActiveRule(textObj) {
        const textObjects = this.objects.filter(obj => obj.type === 'text');
        
        // Check horizontal rules
        if (textObj.subtype === 'is') {
            const left = textObjects.find(t => t.x === textObj.x - 1 && t.y === textObj.y);
            const right = textObjects.find(t => t.x === textObj.x + 1 && t.y === textObj.y);
            if (left && right) return true;
        }
        
        // Check if part of horizontal rule
        const centerIs = textObjects.find(t => t.x === textObj.x + 1 && t.y === textObj.y && t.subtype === 'is');
        if (centerIs) {
            const right = textObjects.find(t => t.x === centerIs.x + 1 && t.y === centerIs.y);
            if (right) return true;
        }
        
        const leftIs = textObjects.find(t => t.x === textObj.x - 1 && t.y === textObj.y && t.subtype === 'is');
        if (leftIs) {
            const left = textObjects.find(t => t.x === leftIs.x - 1 && t.y === leftIs.y);
            if (left) return true;
        }
        
        // Check vertical rules
        if (textObj.subtype === 'is') {
            const top = textObjects.find(t => t.x === textObj.x && t.y === textObj.y - 1);
            const bottom = textObjects.find(t => t.x === textObj.x && t.y === textObj.y + 1);
            if (top && bottom) return true;
        }
        
        const centerVertIs = textObjects.find(t => t.x === textObj.x && t.y === textObj.y + 1 && t.subtype === 'is');
        if (centerVertIs) {
            const bottom = textObjects.find(t => t.x === centerVertIs.x && t.y === centerVertIs.y + 1);
            if (bottom) return true;
        }
        
        const topVertIs = textObjects.find(t => t.x === textObj.x && t.y === textObj.y - 1 && t.subtype === 'is');
        if (topVertIs) {
            const top = textObjects.find(t => t.x === topVertIs.x && t.y === topVertIs.y - 1);
            if (top) return true;
        }
        
        return false;
    }
    
    getObjectDisplay(type) {
        const displays = {
            baba: 'BABA',
            flag: 'FLAG',
            wall: '▓',
            rock: '●',
            water: '≈',
            lava: '▲',
            skull: '☠',
            key: '♦',
            door: '⌐',
            love: '♥',
            keke: 'KEKE',
            me: 'ME',
            grass: '▄',
            flower: '❀',
            tree: '♠',
            hedge: '████',
            brick: '■',
            ice: '❅'
        };
        return displays[type] || type.toUpperCase();
    }
    
    updateRulesDisplay() {
        this.rulesListElement.innerHTML = '';
        
        for (let [subject, properties] of this.rules) {
            for (let property of properties) {
                const ruleElement = document.createElement('div');
                ruleElement.className = 'rule active';
                ruleElement.textContent = `${subject.toUpperCase()} IS ${property.toUpperCase()}`;
                this.rulesListElement.appendChild(ruleElement);
            }
        }
        
        if (this.rules.size === 0) {
            const noRulesElement = document.createElement('div');
            noRulesElement.className = 'rule';
            noRulesElement.textContent = 'No active rules';
            this.rulesListElement.appendChild(noRulesElement);
        }
    }
    
    showMessage(text, callback = null) {
        this.gameMessage.textContent = text;
        this.gameMessage.style.display = 'block';
        
        setTimeout(() => {
            this.gameMessage.style.display = 'none';
            if (callback) callback();
        }, 2000);
    }
    
    checkSpecialInteractions(obj) {
        const objectsAtPos = this.getObjectsAt(obj.x, obj.y);
        
        for (let otherObj of objectsAtPos) {
            if (otherObj === obj) continue;
            
            // HOT + MELT interaction
            if (this.hotObjects.includes(obj) && this.meltObjects.includes(otherObj)) {
                this.meltObject(otherObj);
            }
            if (this.hotObjects.includes(otherObj) && this.meltObjects.includes(obj)) {
                this.meltObject(obj);
            }
            
            // WATER + SINK interaction
            if (obj.type === 'water' && this.sinkObjects.includes(otherObj)) {
                this.sinkObject(otherObj);
            }
            if (otherObj.type === 'water' && this.sinkObjects.includes(obj)) {
                this.sinkObject(obj);
            }
            
            // KEY + DOOR (OPEN/SHUT) interaction
            if (obj.type === 'key' && otherObj.type === 'door') {
                if (this.shutObjects.includes(otherObj)) {
                    this.openObject(otherObj);
                } else if (this.openObjects.includes(otherObj)) {
                    this.openObject(otherObj);
                }
            }
        }
    }
    
    meltObject(obj) {
        const index = this.objects.indexOf(obj);
        if (index !== -1) {
            // Add melt animation class
            const element = document.querySelector(`[data-object-id="${obj.id}"]`);
            if (element) {
                element.classList.add('melt-object');
                setTimeout(() => {
                    this.objects.splice(index, 1);
                    this.renderGrid();
                }, 1000);
            }
        }
    }
    
    sinkObject(obj) {
        const index = this.objects.indexOf(obj);
        if (index !== -1) {
            const element = document.querySelector(`[data-object-id="${obj.id}"]`);
            if (element) {
                element.classList.add('sink-object');
                setTimeout(() => {
                    this.objects.splice(index, 1);
                    this.renderGrid();
                }, 800);
            }
        }
    }
    
    openObject(obj) {
        const index = this.objects.indexOf(obj);
        if (index !== -1) {
            const element = document.querySelector(`[data-object-id="${obj.id}"]`);
            if (element) {
                element.classList.add('open-object');
                setTimeout(() => {
                    this.objects.splice(index, 1);
                    this.renderGrid();
                }, 500);
            }
        }
    }
    
    waitTurn() {
        // Save state for undo
        this.saveState();
        
        // Apply any waiting effects
        this.applyWaitingEffects();
        
        // Re-parse rules and update display
        this.parseRules();
        this.renderGrid();
        this.updateRulesDisplay();
    }
    
    applyWaitingEffects() {
        // WEAK objects might break when waiting
        for (let obj of this.weakObjects) {
            if (Math.random() < 0.1) { // 10% chance to break
                const index = this.objects.indexOf(obj);
                if (index !== -1) {
                    this.objects.splice(index, 1);
                }
            }
        }
    }
    
    showLevelSelect() {
        // Simple level select for now
        let levelChoice = prompt(`Choose level (1-${this.levels.length}):`);
        if (levelChoice) {
            let levelIndex = parseInt(levelChoice) - 1;
            if (levelIndex >= 0 && levelIndex < this.levels.length) {
                this.loadLevel(levelIndex);
            }
        }
    }
}

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
    new BabaIsYou();
});