// Game constants
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 10;
const POWERUP_SIZE = 30;

// Game state
let canvas, ctx;
let gameRunning = false;
let score = 0;
let health = 3;
let lastTime = 0;
let enemySpawnTimer = 0;
let powerupSpawnTimer = 0;
let backgroundY = 0;

// Game objects
let player = {
    x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: GAME_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: 5,
    color: '#0071e3',
    bullets: [],
    fireRate: 300,
    lastFire: 0,
    powerupActive: false,
    powerupTimer: 0
};

let enemies = [];
let powerups = [];

// Keyboard controls
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// Initialize game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Mobile controls
    document.getElementById('left-button').addEventListener('touchstart', () => keys.ArrowLeft = true);
    document.getElementById('left-button').addEventListener('touchend', () => keys.ArrowLeft = false);
    document.getElementById('right-button').addEventListener('touchstart', () => keys.ArrowRight = true);
    document.getElementById('right-button').addEventListener('touchend', () => keys.ArrowRight = false);
    document.getElementById('fire-button').addEventListener('touchstart', () => keys.Space = true);
    document.getElementById('fire-button').addEventListener('touchend', () => keys.Space = false);
    
    // Start button
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    // Pre-render start screen
    drawBackground();
    drawPlayer();
}

// Start game
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    gameRunning = true;
    score = 0;
    health = 3;
    updateScoreDisplay();
    updateHealthDisplay();
    
    // Reset game objects
    player.x = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
    player.y = GAME_HEIGHT - PLAYER_HEIGHT - 20;
    player.bullets = [];
    player.powerupActive = false;
    player.powerupTimer = 0;
    
    enemies = [];
    powerups = [];
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Restart game
function restartGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    startGame();
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('final-score').textContent = `Your Score: ${score}`;
    document.getElementById('game-over-screen').style.display = 'flex';
}

// Main game loop
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Update and draw
    drawBackground();
    updatePlayer(deltaTime);
    updateBullets(deltaTime);
    updateEnemies(deltaTime);
    updatePowerups(deltaTime);
    checkCollisions();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Update player
function updatePlayer(deltaTime) {
    // Move player
    if (keys.ArrowLeft) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight) {
        player.x += player.speed;
    }
    
    // Boundary check
    if (player.x < 0) player.x = 0;
    if (player.x > GAME_WIDTH - player.width) player.x = GAME_WIDTH - player.width;
    
    // Fire bullets
    if (keys.Space && Date.now() - player.lastFire > player.fireRate) {
        fireBullet();
        player.lastFire = Date.now();
    }
    
    // Powerup effect timer
    if (player.powerupActive) {
        player.powerupTimer -= deltaTime;
        if (player.powerupTimer <= 0) {
            player.powerupActive = false;
            player.fireRate = 300; // Restore normal fire rate
        }
    }
    
    // Draw player
    drawPlayer();
}

// Fire bullet
function fireBullet() {
    // Normal shot
    player.bullets.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: 7,
        color: '#fff'
    });
    
    // If powerup is active, fire three bullets
    if (player.powerupActive) {
        player.bullets.push({
            x: player.x + player.width / 2 - BULLET_WIDTH / 2 - 15,
            y: player.y + 10,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            speed: 7,
            color: '#fff'
        });
        
        player.bullets.push({
            x: player.x + player.width / 2 - BULLET_WIDTH / 2 + 15,
            y: player.y + 10,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            speed: 7,
            color: '#fff'
        });
    }
}

// Update bullets
function updateBullets(deltaTime) {
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        
        // Move bullet
        bullet.y -= bullet.speed;
        
        // Remove bullets that are off screen
        if (bullet.y + bullet.height < 0) {
            player.bullets.splice(i, 1);
            continue;
        }
        
        // Draw bullet
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// Update enemies
function updateEnemies(deltaTime) {
    // Generate new enemies
    enemySpawnTimer += deltaTime;
    if (enemySpawnTimer > 1000) { // Generate one enemy per second
        spawnEnemy();
        enemySpawnTimer = 0;
    }
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Move enemy
        enemy.y += enemy.speed;
        
        // Remove enemies that are off screen
        if (enemy.y > GAME_HEIGHT) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Draw enemy
        drawEnemy(enemy);
    }
}

// Spawn enemy
function spawnEnemy() {
    const x = Math.random() * (GAME_WIDTH - ENEMY_WIDTH);
    const speed = 2 + Math.random() * 2; // Random speed
    
    enemies.push({
        x: x,
        y: -ENEMY_HEIGHT,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        speed: speed,
        color: '#ff3b30'
    });
}

// Update powerups
function updatePowerups(deltaTime) {
    // Generate new powerup
    powerupSpawnTimer += deltaTime;
    if (powerupSpawnTimer > 10000) { // Generate a powerup every 10 seconds
        spawnPowerup();
        powerupSpawnTimer = 0;
    }
    
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        
        // Move powerup
        powerup.y += powerup.speed;
        
        // Remove powerups that are off screen
        if (powerup.y > GAME_HEIGHT) {
            powerups.splice(i, 1);
            continue;
        }
        
        // Draw powerup
        drawPowerup(powerup);
    }
}

// Spawn powerup
function spawnPowerup() {
    const x = Math.random() * (GAME_WIDTH - POWERUP_SIZE);
    const type = Math.random() < 0.5 ? 'fireRate' : 'health';
    
    powerups.push({
        x: x,
        y: -POWERUP_SIZE,
        width: POWERUP_SIZE,
        height: POWERUP_SIZE,
        speed: 1.5,
        type: type,
        color: type === 'fireRate' ? '#ffcc00' : '#4cd964'
    });
}

// Draw background
function drawBackground() {
    // Simple scrolling background
    backgroundY = (backgroundY + 0.5) % 20;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
        const x = Math.sin(i * 487.5) * GAME_WIDTH / 2 + GAME_WIDTH / 2;
        const y = (i * 10 + backgroundY) % GAME_HEIGHT;
        const size = i % 3 + 1;
        ctx.fillRect(x, y, size, size);
    }
}

// Check for collisions
function checkCollisions() {
    // Check bullet-enemy collisions
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            
            if (collision(bullet, enemy)) {
                // Remove bullet and enemy
                player.bullets.splice(i, 1);
                enemies.splice(j, 1);
                
                // Increase score
                score += 10;
                updateScoreDisplay();
                
                // Break out of inner loop once collision is found
                break;
            }
        }
    }
    
    // Check player-enemy collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (collision(player, enemy)) {
            // Remove enemy
            enemies.splice(i, 1);
            
            // Reduce health
            health--;
            updateHealthDisplay();
            
            // Check if game over
            if (health <= 0) {
                gameOver();
            }
        }
    }
    
    // Check player-powerup collisions
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        
        if (collision(player, powerup)) {
            // Apply powerup effect
            if (powerup.type === 'fireRate') {
                player.powerupActive = true;
                player.fireRate = 150; // Faster firing rate
                player.powerupTimer = 5000; // 5 second powerup effect
            } else {
                health = Math.min(health + 1, 5); // Maximum 5 health points
                updateHealthDisplay();
            }
            
            // Remove powerup
            powerups.splice(i, 1);
        }
    }
}

// Collision detection helper
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Draw player
function drawPlayer() {
    // Aircraft body
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Aircraft wings
    ctx.fillStyle = '#0077ed';
    ctx.fillRect(player.x + 5, player.y + player.height - 20, player.width - 10, 10);
    
    // Aircraft engine
    ctx.fillStyle = '#ff9500';
    ctx.fillRect(player.x + player.width / 2 - 5, player.y + player.height, 10, 5);
    
    // Powerup effect indicator
    if (player.powerupActive) {
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Draw enemy
function drawEnemy(enemy) {
    // Enemy aircraft body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
    ctx.lineTo(enemy.x + enemy.width, enemy.y);
    ctx.lineTo(enemy.x, enemy.y);
    ctx.closePath();
    ctx.fill();
    
    // Enemy aircraft wings
    ctx.fillStyle = '#ff6b58';
    ctx.fillRect(enemy.x + 5, enemy.y + 10, enemy.width - 10, 10);
}

// Draw powerup
function drawPowerup(powerup) {
    ctx.fillStyle = powerup.color;
    ctx.beginPath();
    ctx.arc(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, powerup.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Powerup icon
    ctx.fillStyle = '#fff';
    if (powerup.type === 'fireRate') {
        // Draw lightning icon
        ctx.beginPath();
        ctx.moveTo(powerup.x + powerup.width / 2, powerup.y + 8);
        ctx.lineTo(powerup.x + powerup.width / 2 - 5, powerup.y + powerup.height / 2);
        ctx.lineTo(powerup.x + powerup.width / 2 + 2, powerup.y + powerup.height / 2);
        ctx.lineTo(powerup.x + powerup.width / 2, powerup.y + powerup.height - 8);
        ctx.lineTo(powerup.x + powerup.width / 2 + 5, powerup.y + powerup.height / 2);
        ctx.lineTo(powerup.x + powerup.width / 2 - 2, powerup.y + powerup.height / 2);
        ctx.closePath();
        ctx.fill();
    } else {
        // Draw plus icon
        ctx.fillRect(powerup.x + powerup.width / 2 - 8, powerup.y + powerup.height / 2 - 2, 16, 4);
        ctx.fillRect(powerup.x + powerup.width / 2 - 2, powerup.y + powerup.height / 2 - 8, 4, 16);
    }
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('score-display').textContent = `Score: ${score}`;
}

// Update health display
function updateHealthDisplay() {
    document.getElementById('health-display').textContent = `Health: ${health}`;
}

// Keyboard event handlers
function handleKeyDown(e) {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space') {
        keys[e.code] = true;
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space') {
        keys[e.code] = false;
        e.preventDefault();
    }
}

// Initialize game
window.addEventListener('load', init); 