// Game State
const gameState = {
    coins: 0,
    level: 1,
    speed: 1,
    magnet: {
        level: 0,
        radius: 0
    },
    coinCount: 10,
    rainbowColor: false,
    darkMatterColor: false,
    bomb: {
        owned: false,
        cooldown: 0,
        active: false
    },
    upgrades: {
        speed: {
            level: 1,
            maxLevel: 5,
            cost: 10
        },
        magnet: {
            level: 0,
            maxLevel: 2,
            cost: 120
        },
        moreCoins: {
            level: 1,
            maxLevel: 10,
            cost: 50
        },
        bomb: {
            cost: 400
        },
        rainbow: {
            cost: 200
        },
        darkMatter: {
            cost: 300
        }
    }
};

// Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player with enhanced customization
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 40,
    speed: 4, // Increased base speed
    // Enhanced customization
    bodyColor: '#4CAF50',
    accessories: [],
    emotion: 'happy',
    rainbowHue: 0,
    darkMatterPhase: 0
};

// Coins array with animation support
let coins = [];
let collectedCoins = [];
let bombEffect = {
    active: false,
    radius: 0,
    maxRadius: 300,
    x: 0,
    y: 0,
    particles: []
};

// Key states
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    q: false
};

// Audio elements
const coinSound = document.getElementById('coinSound');
const clickSound = document.getElementById('clickSound');
const buySound = document.getElementById('buySound');
const bombSound = document.getElementById('bombSound');

// Sound data
function initSounds() {
    coinSound.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
    clickSound.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
    buySound.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
    bombSound.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
}

// DOM Elements
const coinCountElement = document.getElementById('coinCount');
const levelElement = document.getElementById('level');
const speedElement = document.getElementById('speed');
const bombStatusElement = document.getElementById('bombStatus');
const cooldownProgressElement = document.querySelector('.cooldown-progress');

// Shop Elements
const speedCostElement = document.getElementById('speedCost');
const magnetCostElement = document.getElementById('magnetCost');
const moreCoinsCostElement = document.getElementById('moreCoinsCost');
const bombCostElement = document.getElementById('bombCost');
const buySpeedButton = document.getElementById('buySpeed');
const buyMagnetButton = document.getElementById('buyMagnet');
const buyMoreCoinsButton = document.getElementById('buyMoreCoins');
const buyBombButton = document.getElementById('buyBomb');
const bombShopStatusElement = document.getElementById('bombShopStatus');
const speedLevelElement = document.getElementById('speedLevel');
const moreCoinsLevelElement = document.getElementById('moreCoinsLevel');
const magnetLevelElement = document.getElementById('magnetLevel');
const speedProgressElement = document.getElementById('speedProgress');
const moreCoinsProgressElement = document.getElementById('moreCoinsProgress');
const magnetProgressElement = document.getElementById('magnetProgress');

// UI Tab Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Character Editor Elements
const colorOptions = document.querySelectorAll('.color-option');
const accessoryButtons = document.querySelectorAll('.accessory-btn');
const emotionButtons = document.querySelectorAll('.emotion-btn');

// Initialize game
function init() {
    initSounds();
    
    // Keyboard event listeners
    window.addEventListener('keydown', (e) => {
        if (e.key === 'w' || e.key === 'W') keys.w = true;
        if (e.key === 'a' || e.key === 'A') keys.a = true;
        if (e.key === 's' || e.key === 'S') keys.s = true;
        if (e.key === 'd' || e.key === 'D') keys.d = true;
        if (e.key === 'q' || e.key === 'Q') keys.q = true;
        
        // Bomb activation with Q
        if ((e.key === 'q' || e.key === 'Q') && gameState.bomb.owned && gameState.bomb.cooldown <= 0) {
            activateBomb();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.key === 'w' || e.key === 'W') keys.w = false;
        if (e.key === 'a' || e.key === 'A') keys.a = false;
        if (e.key === 's' || e.key === 'S') keys.s = false;
        if (e.key === 'd' || e.key === 'D') keys.d = false;
        if (e.key === 'q' || e.key === 'Q') keys.q = false;
    });
    
    // Tab event listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
            playSound('click');
        });
    });
    
    // Upgrade event listeners
    buySpeedButton.addEventListener('click', buySpeedUpgrade);
    buyMagnetButton.addEventListener('click', buyMagnetUpgrade);
    buyMoreCoinsButton.addEventListener('click', buyMoreCoinsUpgrade);
    buyBombButton.addEventListener('click', buyBombUpgrade);
    
    // Character editor event listeners
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const color = option.getAttribute('data-color');
            
            if (color === 'rainbow') {
                if (gameState.coins >= 200 && !gameState.rainbowColor) {
                    gameState.coins -= 200;
                    gameState.rainbowColor = true;
                    playSound('buy');
                    updateDisplay();
                } else if (!gameState.rainbowColor) {
                    return;
                }
            }
            
            if (color === 'darkmatter') {
                if (gameState.coins >= 300 && !gameState.darkMatterColor) {
                    gameState.coins -= 300;
                    gameState.darkMatterColor = true;
                    playSound('buy');
                    updateDisplay();
                } else if (!gameState.darkMatterColor) {
                    return;
                }
            }
            
            if ((color !== 'rainbow' && color !== 'darkmatter') || 
                (color === 'rainbow' && gameState.rainbowColor) ||
                (color === 'darkmatter' && gameState.darkMatterColor)) {
                player.bodyColor = color;
                
                colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                playSound('click');
            }
        });
    });
    
    // Multiple accessory selection
    accessoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const accessory = button.getAttribute('data-accessory');
            
            if (accessory === 'none') {
                player.accessories = [];
                accessoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            } else {
                const index = player.accessories.indexOf(accessory);
                if (index > -1) {
                    player.accessories.splice(index, 1);
                    button.classList.remove('active');
                } else {
                    if (player.accessories.length < 3) { // Limit to 3 accessories
                        player.accessories.push(accessory);
                        button.classList.add('active');
                    }
                }
            }
            playSound('click');
        });
    });
    
    emotionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emotion = button.getAttribute('data-emotion');
            player.emotion = emotion;
            
            emotionButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            playSound('click');
        });
    });
    
    // Set default options
    colorOptions[0].classList.add('active');
    accessoryButtons[0].classList.add('active');
    emotionButtons[0].classList.add('active');
    
    createCoins();
    updateDisplay();
    gameLoop();
    cooldownLoop();
    effectLoop();
}

// Play sound
function playSound(type) {
    try {
        const sound = document.getElementById(type + 'Sound');
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound play error:", e));
    } catch (e) {
        console.log("Sound Error:", e);
    }
}

// Switch tabs
function switchTab(tabId) {
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        }
    });
    
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}-tab`) {
            content.classList.add('active');
        }
    });
}

// Create coins
function createCoins() {
    coins = [];
    for (let i = 0; i < gameState.coinCount; i++) {
        coins.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            width: 20,
            height: 20,
            color: '#FFD700',
            collected: false,
            rotation: Math.random() * Math.PI * 2,
            scale: 1,
            floatOffset: Math.random() * Math.PI * 2
        });
    }
}

// Activate bomb
function activateBomb() {
    if (gameState.bomb.owned && gameState.bomb.cooldown <= 0) {
        gameState.bomb.cooldown = 45;
        bombEffect.active = true;
        bombEffect.radius = 0;
        bombEffect.x = player.x + player.width / 2;
        bombEffect.y = player.y + player.height / 2;
        bombEffect.particles = [];
        
        // Create explosion particles
        for (let i = 0; i < 80; i++) {
            bombEffect.particles.push({
                x: bombEffect.x,
                y: bombEffect.y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 1,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                size: Math.random() * 4 + 2
            });
        }
        
        playSound('bomb');
        
        setTimeout(() => {
            collectCoinsInRadius();
            bombEffect.active = false;
        }, 800);
    }
}

// Collect coins in bomb radius
function collectCoinsInRadius() {
    let coinsCollected = 0;
    
    coins.forEach(coin => {
        if (!coin.collected) {
            const dx = bombEffect.x - (coin.x + coin.width / 2);
            const dy = bombEffect.y - (coin.y + coin.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bombEffect.maxRadius) {
                coin.collected = true;
                gameState.coins++;
                coinsCollected++;
                
                // Create collection animation
                collectedCoins.push({
                    x: coin.x,
                    y: coin.y,
                    life: 1,
                    scale: 1,
                    targetX: 50, // Coin counter position
                    targetY: 50
                });
                
                checkLevelUp();
            }
        }
    });
    
    if (coinsCollected > 0) {
        playSound('coin');
    }
    
    updateDisplay();
    
    if (coins.every(c => c.collected)) {
        createCoins();
    }
}

// Check for level up and rewards
function checkLevelUp() {
    const oldLevel = gameState.level;
    gameState.level = Math.floor(gameState.coins / 10) + 1;
    
    // Level up rewards
    if (gameState.level > oldLevel) {
        if (gameState.level === 25) {
            gameState.coins += 20;
            showRewardMessage("Level 25 Reward: +20 Coins!");
        } else if (gameState.level === 50) {
            gameState.coins += 40;
            showRewardMessage("Level 50 Reward: +40 Coins!");
        } else if (gameState.level === 75) {
            gameState.coins += 60;
            showRewardMessage("Level 75 Reward: +60 Coins!");
        } else if (gameState.level === 100) {
            gameState.coins += 100;
            showRewardMessage("Level 100 Reward: +100 Coins!");
        } else if (gameState.level > 100 && gameState.level % 25 === 0) {
            const reward = Math.floor(gameState.level / 25) * 20;
            gameState.coins += reward;
            showRewardMessage(`Level ${gameState.level} Reward: +${reward} Coins!`);
        }
    }
}

// Show reward message
function showRewardMessage(message) {
    const rewardElement = document.createElement('div');
    rewardElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: #FFD700;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #FFD700;
        font-family: 'Press Start 2P', cursive;
        font-size: 0.8rem;
        z-index: 1000;
        text-align: center;
    `;
    rewardElement.textContent = message;
    document.body.appendChild(rewardElement);
    
    setTimeout(() => {
        document.body.removeChild(rewardElement);
    }, 3000);
}

// Cooldown loop
function cooldownLoop() {
    setInterval(() => {
        if (gameState.bomb.cooldown > 0) {
            gameState.bomb.cooldown -= 0.1;
            if (gameState.bomb.cooldown < 0) gameState.bomb.cooldown = 0;
            
            const progress = (45 - gameState.bomb.cooldown) / 45 * 100;
            cooldownProgressElement.style.width = `${progress}%`;
            
            if (gameState.bomb.cooldown > 0) {
                bombStatusElement.textContent = `${Math.ceil(gameState.bomb.cooldown)}s`;
            } else {
                bombStatusElement.textContent = "Ready";
            }
        }
    }, 100);
}

// Effect loop for animations
function effectLoop() {
    setInterval(() => {
        // Rainbow color animation
        if (gameState.rainbowColor && player.bodyColor === 'rainbow') {
            player.rainbowHue = (player.rainbowHue + 3) % 360;
        }
        
        // Dark matter animation
        if (gameState.darkMatterColor && player.bodyColor === 'darkmatter') {
            player.darkMatterPhase = (player.darkMatterPhase + 0.05) % (Math.PI * 2);
        }
        
        // Update magnet radius based on level
        if (gameState.magnet.level === 1) {
            gameState.magnet.radius = 80;
        } else if (gameState.magnet.level === 2) {
            gameState.magnet.radius = 150;
        }
        
        // Update coin floating animation
        const time = Date.now() * 0.001;
        coins.forEach(coin => {
            coin.rotation += 0.02;
            coin.floatOffset += 0.05;
            coin.scale = 1 + Math.sin(coin.floatOffset) * 0.1;
        });
        
        // Update collected coin animations
        collectedCoins = collectedCoins.filter(coin => {
            coin.life -= 0.03;
            coin.scale -= 0.03;
            return coin.life > 0;
        });
        
    }, 1000 / 60);
}

// Main game loop (120 FPS target)
let lastTime = 0;
const fps = 120;
const frameInterval = 1000 / fps;

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);
    
    const deltaTime = timestamp - lastTime;
    if (deltaTime < frameInterval) return;
    
    lastTime = timestamp - (deltaTime % frameInterval);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Move player
    movePlayer();
    
    // Apply magnet effect
    if (gameState.magnet.level > 0) {
        applyMagnetEffect();
    }
    
    // Animate bomb effect
    if (bombEffect.active) {
        animateBombEffect();
    }
    
    // Check collisions
    checkCoinCollisions();
    
    // Draw game elements
    drawCoins();
    drawPlayer();
    drawCollectedCoins();
    
    if (bombEffect.active) {
        drawBombEffect();
    }
}

// Draw background
function drawBackground() {
    // Dark gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d2d2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Animate bomb effect
function animateBombEffect() {
    if (bombEffect.radius < bombEffect.maxRadius) {
        bombEffect.radius += 20;
    }
    
    bombEffect.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vy += 0.1;
    });
    
    bombEffect.particles = bombEffect.particles.filter(p => p.life > 0);
}

// Draw bomb effect
function drawBombEffect() {
    // Shockwaves
    for (let i = 0; i < 3; i++) {
        const waveRadius = bombEffect.radius - i * 50;
        if (waveRadius > 0) {
            ctx.beginPath();
            ctx.arc(bombEffect.x, bombEffect.y, waveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, ${100 + i * 50}, 50, ${0.6 - i * 0.2})`;
            ctx.lineWidth = 8 - i * 2;
            ctx.stroke();
        }
    }
    
    // Particles
    bombEffect.particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// Move player (smooth movement)
function movePlayer() {
    const currentSpeed = player.speed * gameState.speed;
    
    let targetX = player.x;
    let targetY = player.y;
    
    if (keys.w && player.y > 0) targetY -= currentSpeed;
    if (keys.s && player.y < canvas.height - player.height) targetY += currentSpeed;
    if (keys.a && player.x > 0) targetX -= currentSpeed;
    if (keys.d && player.x < canvas.width - player.width) targetX += currentSpeed;
    
    // Smooth interpolation
    player.x += (targetX - player.x) * 0.3;
    player.y += (targetY - player.y) * 0.3;
}

// Apply magnet effect
function applyMagnetEffect() {
    coins.forEach(coin => {
        if (!coin.collected) {
            const dx = player.x + player.width/2 - (coin.x + coin.width/2);
            const dy = player.y + player.height/2 - (coin.y + coin.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < gameState.magnet.radius) {
                const strength = 1 - (distance / gameState.magnet.radius);
                coin.x += dx * 0.08 * strength;
                coin.y += dy * 0.08 * strength;
            }
        }
    });
}

// Check coin collisions
function checkCoinCollisions() {
    coins.forEach(coin => {
        if (!coin.collected && 
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            
            coin.collected = true;
            gameState.coins++;
            
            // Create collection animation
            collectedCoins.push({
                x: coin.x,
                y: coin.y,
                life: 1,
                scale: 1,
                targetX: 50,
                targetY: 50
            });
            
            playSound('coin');
            checkLevelUp();
            updateDisplay();
            
            if (coins.every(c => c.collected)) {
                createCoins();
            }
        }
    });
}

// Draw player with enhanced customization
function drawPlayer() {
    // Body color with special effects
    let bodyColor;
    if (player.bodyColor === 'rainbow' && gameState.rainbowColor) {
        bodyColor = `hsl(${player.rainbowHue}, 100%, 50%)`;
    } else if (player.bodyColor === 'darkmatter' && gameState.darkMatterColor) {
        const r = Math.sin(player.darkMatterPhase) * 50 + 50;
        const g = Math.sin(player.darkMatterPhase + 2) * 30 + 30;
        const b = Math.sin(player.darkMatterPhase + 4) * 70 + 70;
        bodyColor = `rgb(${r}, ${g}, ${b})`;
    } else {
        bodyColor = player.bodyColor;
    }
    
    // Draw player body
    ctx.fillStyle = bodyColor;
    drawRoundedRect(ctx, player.x, player.y, player.width, player.height, 5);
    
    // Draw accessories
    player.accessories.forEach(accessory => {
        drawAccessory(accessory);
    });
    
    // Draw face
    drawFace();
    
    // Draw magnet radius visualization
    if (gameState.magnet.level > 0) {
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y + player.height/2, gameState.magnet.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.1 + gameState.magnet.level * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Draw rounded rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Draw accessories (fixed positioning)
function drawAccessory(accessory) {
    ctx.save();
    
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    switch(accessory) {
        case 'hat':
            ctx.fillStyle = '#8B4513';
            // Hat brim
            ctx.fillRect(player.x - 2, player.y - 5, player.width + 4, 4);
            // Hat cone
            ctx.beginPath();
            ctx.moveTo(player.x + 5, player.y - 5);
            ctx.lineTo(centerX, player.y - 18);
            ctx.lineTo(player.x + player.width - 5, player.y - 5);
            ctx.fill();
            // Star
            ctx.fillStyle = '#FFD700';
            drawStar(ctx, centerX, player.y - 21, 3, 6, 5);
            break;
            
        case 'glasses':
            ctx.fillStyle = '#1a1a1a';
            // Left lens
            ctx.fillRect(player.x + 5, player.y + 13, 6, 4);
            // Right lens
            ctx.fillRect(player.x + 19, player.y + 13, 6, 4);
            // Bridge
            ctx.fillRect(player.x + 11, player.y + 14, 8, 2);
            break;
            
        case 'crown':
            ctx.fillStyle = '#FFD700';
            // Base
            ctx.fillRect(player.x + 5, player.y - 5, player.width - 10, 3);
            // Spikes
            for (let i = 0; i < 3; i++) {
                const spikeX = player.x + 8 + i * 7;
                ctx.beginPath();
                ctx.moveTo(spikeX, player.y - 5);
                ctx.lineTo(spikeX + 3.5, player.y - 12);
                ctx.lineTo(spikeX + 7, player.y - 5);
                ctx.fill();
            }
            // Gems
            ctx.fillStyle = '#FF69B4';
            ctx.fillRect(centerX - 2, player.y - 9, 4, 4);
            break;
            
        case 'halo':
            ctx.beginPath();
            ctx.arc(centerX, player.y - 3, 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
            
        case 'mask':
            ctx.fillStyle = '#FFFFFF';
            drawRoundedRect(ctx, player.x + 5, player.y + 10, player.width - 10, 10, 3);
            // Eye holes
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(player.x + 8, player.y + 12, 4, 3);
            ctx.fillRect(player.x + 18, player.y + 12, 4, 3);
            // Mouth
            ctx.beginPath();
            ctx.arc(centerX, player.y + 18, 3, 0, Math.PI);
            ctx.stroke();
            break;
            
        case 'headphones':
            ctx.fillStyle = '#FF5722';
            // Headband
            ctx.fillRect(player.x - 1, player.y + 12, player.width + 2, 3);
            // Earcups
            ctx.beginPath();
            ctx.arc(player.x - 2, player.y + 13, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(player.x + player.width + 2, player.y + 13, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'wings':
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            // Left wing
            ctx.beginPath();
            ctx.moveTo(player.x - 1, player.y + 12);
            ctx.lineTo(player.x - 15, player.y + 5);
            ctx.lineTo(player.x - 6, player.y + 22);
            ctx.closePath();
            ctx.fill();
            // Right wing
            ctx.beginPath();
            ctx.moveTo(player.x + player.width + 1, player.y + 12);
            ctx.lineTo(player.x + player.width + 15, player.y + 5);
            ctx.lineTo(player.x + player.width + 6, player.y + 22);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'cape':
            ctx.fillStyle = '#C41E3A';
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(player.x - 3, player.y + 30);
            ctx.lineTo(player.x + player.width + 3, player.y + 30);
            ctx.lineTo(player.x + player.width, player.y);
            ctx.fill();
            break;
            
        case 'jetpack':
            ctx.fillStyle = '#333';
            // Tanks
            ctx.fillRect(player.x - 6, player.y + 10, 4, 18);
            ctx.fillRect(player.x + player.width + 2, player.y + 10, 4, 18);
            // Nozzles
            ctx.fillStyle = '#FF5722';
            ctx.fillRect(player.x - 7, player.y + 28, 6, 5);
            ctx.fillRect(player.x + player.width + 1, player.y + 28, 6, 5);
            break;
            
        case 'sword':
            ctx.fillStyle = '#CCCCCC';
            // Hilt
            ctx.fillRect(player.x + player.width - 1, player.y + 17, 6, 2);
            // Blade
            ctx.fillRect(player.x + player.width + 5, player.y + 12, 12, 6);
            // Tip
            ctx.beginPath();
            ctx.moveTo(player.x + player.width + 17, player.y + 15);
            ctx.lineTo(player.x + player.width + 20, player.y + 15);
            ctx.lineTo(player.x + player.width + 17, player.y + 12);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'shield':
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(player.x - 4, player.y + 17, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.arc(player.x - 4, player.y + 17, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
    
    ctx.restore();
}

// Draw star
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// Draw face based on emotion
function drawFace() {
    ctx.fillStyle = '#000000';
    const centerX = player.x + player.width / 2;
    
    switch(player.emotion) {
        case 'happy':
            // Eyes
            ctx.fillRect(player.x + 10, player.y + 15, 3, 3);
            ctx.fillRect(player.x + 17, player.y + 15, 3, 3);
            // Smile
            ctx.beginPath();
            ctx.arc(centerX, player.y + 25, 4, 0.1, Math.PI - 0.1, false);
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
            
        case 'sad':
            ctx.fillRect(player.x + 10, player.y + 15, 3, 3);
            ctx.fillRect(player.x + 17, player.y + 15, 3, 3);
            // Frown
            ctx.beginPath();
            ctx.arc(centerX, player.y + 28, 4, Math.PI + 0.1, 2 * Math.PI - 0.1, false);
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
            
        case 'angry':
            // Slanted eyes
            ctx.fillRect(player.x + 9, player.y + 15, 4, 2);
            ctx.fillRect(player.x + 17, player.y + 15, 4, 2);
            // Angry eyebrows
            ctx.fillRect(player.x + 8, player.y + 12, 5, 1);
            ctx.fillRect(player.x + 17, player.y + 12, 5, 1);
            // Angry mouth
            ctx.fillRect(player.x + 12, player.y + 25, 6, 2);
            break;
            
        case 'surprised':
            // Big eyes
            ctx.beginPath();
            ctx.arc(player.x + 11, player.y + 16, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(player.x + 19, player.y + 16, 2, 0, Math.PI * 2);
            ctx.fill();
            // Open mouth
            ctx.beginPath();
            ctx.arc(centerX, player.y + 26, 3, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'cool':
            // Sunglasses
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(player.x + 8, player.y + 14, 5, 3);
            ctx.fillRect(player.x + 17, player.y + 14, 5, 3);
            // Smirk
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(centerX, player.y + 25, 3, 0.1, Math.PI - 0.1, false);
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
            
        case 'laughing':
            ctx.fillRect(player.x + 10, player.y + 15, 3, 3);
            ctx.fillRect(player.x + 17, player.y + 15, 3, 3);
            // Open laughing mouth
            ctx.beginPath();
            ctx.arc(centerX, player.y + 27, 5, 0, Math.PI, false);
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
            
        case 'sleepy':
            // Closed eyes
            ctx.fillRect(player.x + 10, player.y + 16, 3, 1);
            ctx.fillRect(player.x + 17, player.y + 16, 3, 1);
            // Zzz mouth
            ctx.beginPath();
            ctx.moveTo(player.x + 12, player.y + 25);
            ctx.lineTo(player.x + 18, player.y + 25);
            ctx.lineTo(player.x + 12, player.y + 27);
            ctx.lineTo(player.x + 18, player.y + 27);
            ctx.stroke();
            break;
            
        case 'devil':
            ctx.fillRect(player.x + 10, player.y + 15, 3, 3);
            ctx.fillRect(player.x + 17, player.y + 15, 3, 3);
            // Devil smile
            ctx.beginPath();
            ctx.moveTo(player.x + 11, player.y + 25);
            ctx.lineTo(centerX, player.y + 28);
            ctx.lineTo(player.x + 19, player.y + 25);
            ctx.stroke();
            // Horns
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.moveTo(player.x + 11, player.y + 7);
            ctx.lineTo(player.x + 8, player.y + 2);
            ctx.lineTo(player.x + 13, player.y + 5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(player.x + 19, player.y + 7);
            ctx.lineTo(player.x + 22, player.y + 2);
            ctx.lineTo(player.x + 17, player.y + 5);
            ctx.fill();
            break;
            
        case 'love':
            ctx.fillRect(player.x + 10, player.y + 15, 3, 3);
            ctx.fillRect(player.x + 17, player.y + 15, 3, 3);
            // Heart eyes
            ctx.fillStyle = '#FF69B4';
            drawHeart(ctx, player.x + 11, player.y + 14, 2);
            drawHeart(ctx, player.x + 18, player.y + 14, 2);
            // Happy mouth
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(centerX, player.y + 25, 3, 0.1, Math.PI - 0.1, false);
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
            
        case 'robot':
            // Square eyes
            ctx.fillStyle = '#333';
            ctx.fillRect(player.x + 9, player.y + 14, 4, 4);
            ctx.fillRect(player.x + 17, player.y + 14, 4, 4);
            // Robot mouth
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(player.x + 11 + i * 4, player.y + 25, 2, 2);
            }
            break;
            
        case 'alien':
            // Vertical eyes
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(player.x + 9, player.y + 13, 3, 5);
            ctx.fillRect(player.x + 18, player.y + 13, 3, 5);
            // Alien mouth
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(centerX, player.y + 26, 2, 0, Math.PI);
            ctx.stroke();
            // Antennas
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(centerX - 3, player.y + 2, 2, 6);
            ctx.fillRect(centerX + 1, player.y + 2, 2, 6);
            break;
            
        case 'clown':
            // Red nose
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(centerX, player.y + 18, 2, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(player.x + 10, player.y + 15, 3, 3);
            ctx.fillRect(player.x + 17, player.y + 15, 3, 3);
            // Smile
            ctx.beginPath();
            ctx.arc(centerX, player.y + 26, 4, 0.2, Math.PI - 0.2, false);
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
    }
}

// Draw heart
function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size, x, y + size);
    ctx.bezierCurveTo(x, y + size, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.closePath();
    ctx.fill();
}

// Draw coins with animation
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2);
            ctx.rotate(coin.rotation);
            ctx.scale(coin.scale, coin.scale);
            
            // Coin body
            ctx.fillStyle = coin.color;
            ctx.beginPath();
            ctx.arc(0, 0, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Coin details
            ctx.fillStyle = '#D4AF37';
            ctx.beginPath();
            ctx.arc(0, 0, coin.width/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Coin shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(-coin.width/6, -coin.height/6, coin.width/8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    });
}

// Draw collected coin animations
function drawCollectedCoins() {
    collectedCoins.forEach(coin => {
        ctx.save();
        ctx.globalAlpha = coin.life;
        
        // Calculate position with easing
        const progress = 1 - coin.life;
        const currentX = coin.x + (coin.targetX - coin.x) * progress;
        const currentY = coin.y + (coin.targetY - coin.y) * progress;
        
        ctx.translate(currentX, currentY);
        ctx.scale(coin.scale, coin.scale);
        
        // Draw fading coin
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// Upgrade functions
function buySpeedUpgrade() {
    if (gameState.coins >= gameState.upgrades.speed.cost && 
        gameState.upgrades.speed.level < gameState.upgrades.speed.maxLevel) {
        
        gameState.coins -= gameState.upgrades.speed.cost;
        gameState.upgrades.speed.level++;
        gameState.speed = 1 + (gameState.upgrades.speed.level - 1) * 0.5;
        gameState.upgrades.speed.cost = Math.floor(gameState.upgrades.speed.cost * 1.8);
        playSound('buy');
        updateDisplay();
    }
}

function buyMagnetUpgrade() {
    if (gameState.coins >= gameState.upgrades.magnet.cost && 
        gameState.upgrades.magnet.level < gameState.upgrades.magnet.maxLevel) {
        
        gameState.coins -= gameState.upgrades.magnet.cost;
        gameState.upgrades.magnet.level++;
        gameState.upgrades.magnet.cost = Math.floor(gameState.upgrades.magnet.cost * 2);
        playSound('buy');
        updateDisplay();
    }
}

function buyMoreCoinsUpgrade() {
    if (gameState.coins >= gameState.upgrades.moreCoins.cost && 
        gameState.upgrades.moreCoins.level < gameState.upgrades.moreCoins.maxLevel) {
        
        gameState.coins -= gameState.upgrades.moreCoins.cost;
        gameState.upgrades.moreCoins.level++;
        gameState.coinCount = 10 + (gameState.upgrades.moreCoins.level - 1) * 5;
        gameState.upgrades.moreCoins.cost = Math.floor(gameState.upgrades.moreCoins.cost * 1.5);
        
        const coinsToAdd = gameState.coinCount - coins.length;
        for (let i = 0; i < coinsToAdd; i++) {
            coins.push({
                x: Math.random() * (canvas.width - 20),
                y: Math.random() * (canvas.height - 20),
                width: 20,
                height: 20,
                color: '#FFD700',
                collected: false,
                rotation: Math.random() * Math.PI * 2,
                scale: 1,
                floatOffset: Math.random() * Math.PI * 2
            });
        }
        
        playSound('buy');
        updateDisplay();
    }
}

function buyBombUpgrade() {
    if (gameState.coins >= gameState.upgrades.bomb.cost && !gameState.bomb.owned) {
        gameState.coins -= gameState.upgrades.bomb.cost;
        gameState.bomb.owned = true;
        playSound('buy');
        updateDisplay();
    }
}

// Update display
function updateDisplay() {
    coinCountElement.textContent = gameState.coins;
    levelElement.textContent = gameState.level;
    speedElement.textContent = gameState.speed.toFixed(1);
    
    // Update costs
    speedCostElement.textContent = gameState.upgrades.speed.cost;
    magnetCostElement.textContent = gameState.upgrades.magnet.cost;
    moreCoinsCostElement.textContent = gameState.upgrades.moreCoins.cost;
    bombCostElement.textContent = gameState.upgrades.bomb.cost;
    
    // Update levels and progress
    speedLevelElement.textContent = gameState.upgrades.speed.level;
    moreCoinsLevelElement.textContent = gameState.upgrades.moreCoins.level;
    magnetLevelElement.textContent = gameState.upgrades.magnet.level;
    
    const speedProgress = (gameState.upgrades.speed.level / gameState.upgrades.speed.maxLevel) * 100;
    const moreCoinsProgress = (gameState.upgrades.moreCoins.level / gameState.upgrades.moreCoins.maxLevel) * 100;
    const magnetProgress = (gameState.upgrades.magnet.level / gameState.upgrades.magnet.maxLevel) * 100;
    
    speedProgressElement.style.width = `${speedProgress}%`;
    moreCoinsProgressElement.style.width = `${moreCoinsProgress}%`;
    magnetProgressElement.style.width = `${magnetProgress}%`;
    
    // Update buttons
    buySpeedButton.disabled = gameState.coins < gameState.upgrades.speed.cost || 
                              gameState.upgrades.speed.level >= gameState.upgrades.speed.maxLevel;
    
    buyMagnetButton.disabled = gameState.coins < gameState.upgrades.magnet.cost || 
                               gameState.upgrades.magnet.level >= gameState.upgrades.magnet.maxLevel;
    
    buyMoreCoinsButton.disabled = gameState.coins < gameState.upgrades.moreCoins.cost || 
                                  gameState.upgrades.moreCoins.level >= gameState.upgrades.moreCoins.maxLevel;
    
    buyBombButton.disabled = gameState.coins < gameState.upgrades.bomb.cost || gameState.bomb.owned;
    
    // Update bomb status
    if (gameState.bomb.owned) {
        bombShopStatusElement.textContent = "Purchased";
        bombShopStatusElement.style.color = "#4CAF50";
    } else {
        bombShopStatusElement.textContent = "Not purchased";
        bombShopStatusElement.style.color = "#FF5722";
    }
    
    // Update button texts for max level
    if (gameState.upgrades.speed.level >= gameState.upgrades.speed.maxLevel) {
        buySpeedButton.textContent = "Max Level";
    }
    
    if (gameState.upgrades.magnet.level >= gameState.upgrades.magnet.maxLevel) {
        buyMagnetButton.textContent = "Max Level";
    }
    
    if (gameState.upgrades.moreCoins.level >= gameState.upgrades.moreCoins.maxLevel) {
        buyMoreCoinsButton.textContent = "Max Level";
    }
}

// Start the game
init();
