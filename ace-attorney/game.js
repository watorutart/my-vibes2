class AceAttorney {
    constructor() {
        this.gameContainer = document.getElementById('gameContainer');
        this.titleScreen = document.getElementById('titleScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.startButton = document.getElementById('startGame');
        
        // Game elements
        this.phaseIndicator = document.getElementById('phaseIndicator');
        this.healthFill = document.getElementById('healthFill');
        this.courtRecord = document.getElementById('courtRecord');
        this.evidenceList = document.getElementById('evidenceList');
        this.characterArea = document.getElementById('characterArea');
        this.speakerName = document.getElementById('speakerName');
        this.dialogueText = document.getElementById('dialogueText');
        this.continueIndicator = document.getElementById('continueIndicator');
        this.actionButtons = document.getElementById('actionButtons');
        this.endScreen = document.getElementById('endScreen');
        this.endContent = document.getElementById('endContent');
        this.endTitle = document.getElementById('endTitle');
        this.endMessage = document.getElementById('endMessage');
        
        // Character elements
        this.phoenix = document.getElementById('phoenix');
        this.judge = document.getElementById('judge');
        this.prosecutor = document.getElementById('prosecutor');
        this.witness = document.getElementById('witness');
        
        // Action buttons
        this.objectBtn = document.getElementById('objectBtn');
        this.presentBtn = document.getElementById('presentBtn');
        this.pressBtn = document.getElementById('pressBtn');
        
        // Game state
        this.gameStarted = false;
        this.currentPhase = 'investigation'; // investigation, trial
        this.currentScene = 0;
        this.currentDialogue = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.isTyping = false;
        this.waitingForInput = false;
        this.gameWon = false;
        this.gameOver = false;
        
        // Evidence system
        this.evidence = [];
        this.selectedEvidence = null;
        
        // Game data
        this.scenes = [];
        this.currentTestimony = null;
        this.testimonyIndex = 0;
        
        this.initializeGame();
        this.setupEventListeners();
        this.loadGameData();
    }
    
    initializeGame() {
        this.updateHealthBar();
        this.updateEvidenceList();
    }
    
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        
        // Continue dialogue on click
        document.addEventListener('click', (e) => {
            if (this.gameStarted && !this.isTyping && this.waitingForInput && 
                !e.target.classList.contains('action-btn') && 
                !e.target.classList.contains('evidence-item')) {
                if (this.currentTestimony) {
                    this.testimonyIndex++;
                    this.showTestimonyStatement();
                } else {
                    this.continueDialogue();
                }
            }
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameStarted) return;
            
            switch(e.code) {
                case 'Space':
                case 'Enter':
                    if (!this.isTyping && this.waitingForInput) {
                        if (this.currentTestimony) {
                            this.testimonyIndex++;
                            this.showTestimonyStatement();
                        } else {
                            this.continueDialogue();
                        }
                    }
                    e.preventDefault();
                    break;
                case 'KeyO':
                    if (this.actionButtons.style.display !== 'none') {
                        this.makeObjection();
                    }
                    break;
            }
        });
        
        // Action buttons
        this.objectBtn.addEventListener('click', () => this.makeObjection());
        this.presentBtn.addEventListener('click', () => this.toggleEvidenceSelection());
        this.pressBtn.addEventListener('click', () => this.pressStatement());
    }
    
    loadGameData() {
        this.scenes = [
            {
                type: 'investigation',
                dialogues: [
                    {
                        speaker: 'ナレーション',
                        text: '今日は成歩堂龍一の初めての法廷の日だった。彼は新米弁護士として、初めての事件を担当することになった。',
                        character: null
                    },
                    {
                        speaker: '成歩堂龍一',
                        text: '緊張するなあ...でも、依頼人の無実を証明するために頑張らないと！',
                        character: 'phoenix'
                    },
                    {
                        speaker: 'ナレーション',
                        text: '事件の概要：昨夜、オフィスビルで殺人事件が発生。容疑者は被害者の同僚である田中太郎氏。',
                        character: null,
                        evidence: {
                            name: '事件ファイル',
                            description: '殺人事件の基本情報が記載されている'
                        }
                    },
                    {
                        speaker: '成歩堂龍一',
                        text: '証拠を整理しよう。まず、事件現場で見つかった凶器について調べてみよう。',
                        character: 'phoenix',
                        evidence: {
                            name: 'ナイフ',
                            description: '事件現場で発見された凶器。被害者の血痕が付着している'
                        }
                    },
                    {
                        speaker: 'ナレーション',
                        text: '調査の結果、もう一つ重要な証拠が見つかった...',
                        character: null,
                        evidence: {
                            name: '目撃者の証言',
                            description: '事件当夜、現場付近で不審な人物を見たという証言'
                        }
                    }
                ]
            },
            {
                type: 'trial',
                dialogues: [
                    {
                        speaker: '裁判長',
                        text: '法廷を開廷いたします。田中太郎氏殺人事件の審理を行います。',
                        character: 'judge'
                    },
                    {
                        speaker: '亜内検事',
                        text: '検察側は、被告人田中太郎が被害者を殺害したと主張いたします。証拠は明確です。',
                        character: 'prosecutor'
                    },
                    {
                        speaker: '成歩堂龍一',
                        text: '弁護側は被告人の無実を主張いたします！真実を明らかにしてみせます！',
                        character: 'phoenix'
                    }
                ]
            },
            {
                type: 'testimony',
                title: '事件当夜の状況について',
                witness: '目撃者',
                statements: [
                    {
                        text: '私は事件当夜、11時頃にオフィスビル前を通りかかりました。',
                        canPress: true,
                        contradiction: null
                    },
                    {
                        text: 'その時、ビルから出てくる男性を見ました。',
                        canPress: true,
                        contradiction: null
                    },
                    {
                        text: 'その男性は血まみれの服を着ていて、手にはナイフを持っていました。',
                        canPress: false,
                        contradiction: '目撃者の証言'
                    },
                    {
                        text: '男性の顔ははっきりと見えませんでしたが、体格は被告人と似ていました。',
                        canPress: true,
                        contradiction: null
                    }
                ]
            }
        ];
        
        // Initialize evidence
        this.evidence = [
            {
                name: '事件ファイル',
                description: '殺人事件の基本情報が記載されている'
            }
        ];
    }
    
    startGame() {
        this.titleScreen.style.display = 'none';
        this.gameScreen.classList.add('active');
        this.gameStarted = true;
        
        this.showDialogue();
    }
    
    showDialogue() {
        if (this.currentScene >= this.scenes.length) {
            this.endGame(true);
            return;
        }
        
        const scene = this.scenes[this.currentScene];
        
        // Update phase indicator
        if (scene.type === 'investigation') {
            this.phaseIndicator.textContent = '捜査フェーズ';
            this.actionButtons.style.display = 'none';
        } else if (scene.type === 'trial') {
            this.phaseIndicator.textContent = '法廷フェーズ';
            this.actionButtons.style.display = 'none';
        } else if (scene.type === 'testimony') {
            this.phaseIndicator.textContent = '証言フェーズ';
            this.startTestimony(scene);
            return;
        }
        
        if (this.currentDialogue >= scene.dialogues.length) {
            this.currentScene++;
            this.currentDialogue = 0;
            this.showDialogue();
            return;
        }
        
        const dialogue = scene.dialogues[this.currentDialogue];
        this.displayDialogue(dialogue);
    }
    
    displayDialogue(dialogue) {
        this.waitingForInput = false;
        this.isTyping = true;
        
        // Update speaker
        this.speakerName.textContent = dialogue.speaker;
        
        // Show/hide characters
        this.hideAllCharacters();
        if (dialogue.character) {
            this.showCharacter(dialogue.character);
        }
        
        // Add evidence if present
        if (dialogue.evidence) {
            this.addEvidence(dialogue.evidence);
        }
        
        // Type out dialogue
        this.typeText(dialogue.text, () => {
            this.isTyping = false;
            this.waitingForInput = true;
            this.continueIndicator.style.display = 'block';
        });
    }
    
    typeText(text, callback) {
        this.dialogueText.textContent = '';
        this.continueIndicator.style.display = 'none';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            this.dialogueText.textContent += text[i];
            i++;
            
            if (i >= text.length) {
                clearInterval(typeInterval);
                callback();
            }
        }, 30);
    }
    
    continueDialogue() {
        this.currentDialogue++;
        this.showDialogue();
    }
    
    hideAllCharacters() {
        [this.phoenix, this.judge, this.prosecutor, this.witness].forEach(char => {
            char.style.display = 'none';
            char.classList.remove('speaking');
        });
    }
    
    showCharacter(characterName) {
        const characters = {
            phoenix: this.phoenix,
            judge: this.judge,
            prosecutor: this.prosecutor,
            witness: this.witness
        };
        
        const character = characters[characterName];
        if (character) {
            character.style.display = 'flex';
            character.classList.add('speaking');
        }
    }
    
    addEvidence(evidence) {
        // Check if evidence already exists
        if (!this.evidence.find(e => e.name === evidence.name)) {
            this.evidence.push(evidence);
            this.updateEvidenceList();
            this.showEvidenceNotification(evidence.name);
        }
    }
    
    updateEvidenceList() {
        this.evidenceList.innerHTML = '';
        
        this.evidence.forEach((evidence, index) => {
            const evidenceItem = document.createElement('div');
            evidenceItem.className = 'evidence-item';
            evidenceItem.dataset.index = index;
            
            evidenceItem.innerHTML = `
                <div class="evidence-name">${evidence.name}</div>
                <div class="evidence-desc">${evidence.description}</div>
            `;
            
            evidenceItem.addEventListener('click', () => {
                this.selectEvidence(index);
            });
            
            this.evidenceList.appendChild(evidenceItem);
        });
    }
    
    showEvidenceNotification(evidenceName) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(218, 165, 32, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: bold;
            z-index: 150;
            animation: fadeInOut 2s ease;
        `;
        notification.textContent = `証拠品「${evidenceName}」を入手！`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    startTestimony(scene) {
        this.currentTestimony = scene;
        this.testimonyIndex = 0;
        
        // Show testimony introduction
        const introDialogue = {
            speaker: '裁判長',
            text: `それでは、証人には「${scene.title}」について証言していただきます。`,
            character: 'judge'
        };
        
        this.displayDialogue(introDialogue);
        
        setTimeout(() => {
            this.actionButtons.style.display = 'flex';
            this.showTestimonyStatement();
        }, 4000);
    }
    
    showTestimonyStatement() {
        if (this.testimonyIndex >= this.currentTestimony.statements.length) {
            // Testimony finished, move to next scene
            this.currentScene++;
            this.currentDialogue = 0;
            this.actionButtons.style.display = 'none';
            this.currentTestimony = null;
            this.selectedEvidence = null; // Reset evidence selection
            this.showDialogue();
            return;
        }
        
        const statement = this.currentTestimony.statements[this.testimonyIndex];
        
        const dialogue = {
            speaker: this.currentTestimony.witness,
            text: statement.text,
            character: 'witness'
        };
        
        this.displayTestimonyDialogue(dialogue);
        
        // Enable/disable buttons based on statement
        this.pressBtn.disabled = !statement.canPress;
        this.objectBtn.disabled = false;
        this.presentBtn.disabled = false;
        
        // Debug: Show statement info in console
        console.log(`証言 ${this.testimonyIndex + 1}:`, statement.text);
        console.log('矛盾証拠:', statement.contradiction);
        console.log('選択中の証拠:', this.selectedEvidence !== null ? this.evidence[this.selectedEvidence].name : 'なし');
    }
    
    displayTestimonyDialogue(dialogue) {
        this.waitingForInput = false;
        this.isTyping = true;
        
        // Update speaker
        this.speakerName.textContent = dialogue.speaker;
        
        // Show/hide characters
        this.hideAllCharacters();
        if (dialogue.character) {
            this.showCharacter(dialogue.character);
        }
        
        // Type out dialogue
        this.typeText(dialogue.text, () => {
            this.isTyping = false;
            this.waitingForInput = true;
            this.continueIndicator.style.display = 'block';
        });
    }
    
    makeObjection() {
        this.showObjectionEffect();
        
        const statement = this.currentTestimony.statements[this.testimonyIndex];
        
        // Check if this statement has a contradiction
        if (statement.contradiction) {
            // Check if evidence is selected
            if (this.selectedEvidence !== null) {
                const evidence = this.evidence[this.selectedEvidence];
                if (evidence.name === statement.contradiction) {
                    // Correct objection!
                    this.showCorrectObjection();
                    return;
                }
            }
        }
        
        // Wrong objection - either no contradiction exists, no evidence selected, or wrong evidence
        this.showWrongObjection();
    }
    
    showObjectionEffect() {
        const objection = document.createElement('div');
        objection.className = 'objection-effect';
        objection.textContent = '異議あり！';
        this.gameContainer.appendChild(objection);
        
        const flash = document.createElement('div');
        flash.className = 'flash-effect';
        this.gameContainer.appendChild(flash);
        
        setTimeout(() => {
            objection.remove();
            flash.remove();
        }, 2000);
    }
    
    showCorrectObjection() {
        setTimeout(() => {
            this.displayTestimonyDialogue({
                speaker: '成歩堂龍一',
                text: 'その証言には矛盾があります！証拠品「目撃者の証言」をご覧ください。目撃者は「顔ははっきり見えなかった」と言っているのに、なぜ血まみれの服やナイフが見えたのでしょうか？',
                character: 'phoenix'
            });
            
            setTimeout(() => {
                this.endGame(true);
            }, 5000);
        }, 2000);
    }
    
    showWrongObjection() {
        this.health -= 25;
        this.updateHealthBar();
        
        const statement = this.currentTestimony.statements[this.testimonyIndex];
        let message = '';
        
        if (!statement.contradiction) {
            message = 'その証言に問題はありません。異議は却下します。';
        } else if (this.selectedEvidence === null) {
            message = '証拠品を提示してください。異議の根拠が不明です。';
        } else {
            message = 'その証拠品では矛盾を証明できません。異議は却下します。';
        }
        
        setTimeout(() => {
            this.displayTestimonyDialogue({
                speaker: '裁判長',
                text: message,
                character: 'judge'
            });
            
            if (this.health <= 0) {
                setTimeout(() => {
                    this.endGame(false);
                }, 3000);
            } else {
                setTimeout(() => {
                    this.showTestimonyStatement();
                }, 3000);
            }
        }, 2000);
    }
    
    pressStatement() {
        const statement = this.currentTestimony.statements[this.testimonyIndex];
        
        if (statement.canPress) {
            this.displayTestimonyDialogue({
                speaker: '成歩堂龍一',
                text: 'その部分についてもう少し詳しく説明してください。',
                character: 'phoenix'
            });
            
            setTimeout(() => {
                this.displayTestimonyDialogue({
                    speaker: this.currentTestimony.witness,
                    text: '...特に付け加えることはありません。',
                    character: 'witness'
                });
                
                setTimeout(() => {
                    this.testimonyIndex++;
                    this.showTestimonyStatement();
                }, 3000);
            }, 3000);
        } else {
            this.health -= 10;
            this.updateHealthBar();
            
            this.displayTestimonyDialogue({
                speaker: '裁判長',
                text: 'その質問は関係ありません。',
                character: 'judge'
            });
            
            setTimeout(() => {
                this.showTestimonyStatement();
            }, 3000);
        }
    }
    
    toggleEvidenceSelection() {
        const evidenceItems = document.querySelectorAll('.evidence-item');
        evidenceItems.forEach(item => {
            item.style.border = '1px solid #8b4513';
        });
        
        this.selectedEvidence = null;
        
        // Highlight evidence for selection
        evidenceItems.forEach((item, index) => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                this.selectEvidence(index);
            });
        });
    }
    
    selectEvidence(index) {
        // Reset all evidence items
        const evidenceItems = document.querySelectorAll('.evidence-item');
        evidenceItems.forEach(item => {
            item.style.border = '1px solid #8b4513';
            item.style.background = 'rgba(139, 69, 19, 0.3)';
        });
        
        // Select new evidence
        if (this.selectedEvidence === index) {
            // Deselect if clicking the same evidence
            this.selectedEvidence = null;
        } else {
            this.selectedEvidence = index;
            evidenceItems[index].style.border = '2px solid #daa520';
            evidenceItems[index].style.background = 'rgba(218, 165, 32, 0.5)';
        }
    }
    
    updateHealthBar() {
        const percentage = (this.health / this.maxHealth) * 100;
        this.healthFill.style.width = percentage + '%';
        
        if (percentage <= 25) {
            this.healthFill.style.background = '#dc2626';
        } else if (percentage <= 50) {
            this.healthFill.style.background = 'linear-gradient(90deg, #dc2626, #fbbf24)';
        } else {
            this.healthFill.style.background = 'linear-gradient(90deg, #dc2626, #fbbf24, #10b981)';
        }
    }
    
    endGame(victory) {
        this.gameWon = victory;
        this.gameOver = true;
        
        if (victory) {
            this.endContent.classList.add('victory');
            this.endTitle.textContent = '勝利！';
            this.endMessage.textContent = '見事に真実を明らかにし、依頼人の無実を証明しました！';
        } else {
            this.endContent.classList.add('defeat');
            this.endTitle.textContent = '敗北...';
            this.endMessage.textContent = '信頼度が0になりました。真実を見つけることができませんでした...';
        }
        
        setTimeout(() => {
            this.endScreen.classList.add('show');
        }, 1000);
    }
}

// CSS for fade effects
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new AceAttorney();
});