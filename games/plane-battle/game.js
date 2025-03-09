// 游戏常量
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 10;
const POWERUP_SIZE = 30;

// 游戏状态
let canvas, ctx;
let gameRunning = false;
let score = 0;
let health = 3;
let lastTime = 0;
let enemySpawnTimer = 0;
let powerupSpawnTimer = 0;
let backgroundY = 0;

// 游戏对象
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

// 键盘控制
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// 初始化游戏
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // 事件监听
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // 移动端控制
    document.getElementById('left-button').addEventListener('touchstart', () => keys.ArrowLeft = true);
    document.getElementById('left-button').addEventListener('touchend', () => keys.ArrowLeft = false);
    document.getElementById('right-button').addEventListener('touchstart', () => keys.ArrowRight = true);
    document.getElementById('right-button').addEventListener('touchend', () => keys.ArrowRight = false);
    document.getElementById('fire-button').addEventListener('touchstart', () => keys.Space = true);
    document.getElementById('fire-button').addEventListener('touchend', () => keys.Space = false);
    
    // 开始按钮
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    // 预渲染开始界面
    drawBackground();
    drawPlayer();
}

// 开始游戏
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    gameRunning = true;
    score = 0;
    health = 3;
    updateScoreDisplay();
    updateHealthDisplay();
    
    // 重置游戏对象
    player.x = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
    player.y = GAME_HEIGHT - PLAYER_HEIGHT - 20;
    player.bullets = [];
    player.powerupActive = false;
    player.powerupTimer = 0;
    
    enemies = [];
    powerups = [];
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 重新开始游戏
function restartGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    startGame();
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    document.getElementById('final-score').textContent = `你的得分: ${score}`;
    document.getElementById('game-over-screen').style.display = 'flex';
}

// 游戏主循环
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (!gameRunning) return;
    
    // 清除画布
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 更新和绘制
    drawBackground();
    updatePlayer(deltaTime);
    updateBullets(deltaTime);
    updateEnemies(deltaTime);
    updatePowerups(deltaTime);
    checkCollisions();
    
    // 继续循环
    requestAnimationFrame(gameLoop);
}

// 更新玩家
function updatePlayer(deltaTime) {
    // 移动玩家
    if (keys.ArrowLeft) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight) {
        player.x += player.speed;
    }
    
    // 边界检查
    if (player.x < 0) player.x = 0;
    if (player.x > GAME_WIDTH - player.width) player.x = GAME_WIDTH - player.width;
    
    // 发射子弹
    if (keys.Space && Date.now() - player.lastFire > player.fireRate) {
        fireBullet();
        player.lastFire = Date.now();
    }
    
    // 道具效果计时
    if (player.powerupActive) {
        player.powerupTimer -= deltaTime;
        if (player.powerupTimer <= 0) {
            player.powerupActive = false;
            player.fireRate = 300; // 恢复正常射速
        }
    }
    
    // 绘制玩家
    drawPlayer();
}

// 发射子弹
function fireBullet() {
    // 普通射击
    player.bullets.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: 7,
        color: '#fff'
    });
    
    // 如果有道具效果，发射三发子弹
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

// 更新子弹
function updateBullets(deltaTime) {
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        
        // 移动子弹
        bullet.y -= bullet.speed;
        
        // 移除超出屏幕的子弹
        if (bullet.y + bullet.height < 0) {
            player.bullets.splice(i, 1);
            continue;
        }
        
        // 绘制子弹
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// 更新敌人
function updateEnemies(deltaTime) {
    // 生成新敌人
    enemySpawnTimer += deltaTime;
    if (enemySpawnTimer > 1000) { // 每秒生成一个敌人
        spawnEnemy();
        enemySpawnTimer = 0;
    }
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // 移动敌人
        enemy.y += enemy.speed;
        
        // 移除超出屏幕的敌人
        if (enemy.y > GAME_HEIGHT) {
            enemies.splice(i, 1);
            continue;
        }
        
        // 绘制敌人
        drawEnemy(enemy);
    }
}

// 生成敌人
function spawnEnemy() {
    const x = Math.random() * (GAME_WIDTH - ENEMY_WIDTH);
    const speed = 2 + Math.random() * 2; // 随机速度
    
    enemies.push({
        x: x,
        y: -ENEMY_HEIGHT,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        speed: speed,
        color: '#ff3b30'
    });
}

// 更新道具
function updatePowerups(deltaTime) {
    // 生成新道具
    powerupSpawnTimer += deltaTime;
    if (powerupSpawnTimer > 10000) { // 每10秒生成一个道具
        spawnPowerup();
        powerupSpawnTimer = 0;
    }
    
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        
        // 移动道具
        powerup.y += powerup.speed;
        
        // 移除超出屏幕的道具
        if (powerup.y > GAME_HEIGHT) {
            powerups.splice(i, 1);
            continue;
        }
        
        // 绘制道具
        drawPowerup(powerup);
    }
}

// 生成道具
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

// 碰撞检测
function checkCollisions() {
    // 子弹与敌人碰撞
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            
            if (isColliding(bullet, enemy)) {
                // 移除子弹和敌人
                player.bullets.splice(i, 1);
                enemies.splice(j, 1);
                
                // 增加分数
                score += 10;
                updateScoreDisplay();
                
                break;
            }
        }
    }
    
    // 玩家与敌人碰撞
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (isColliding(player, enemy)) {
            // 移除敌人
            enemies.splice(i, 1);
            
            // 减少生命值
            health--;
            updateHealthDisplay();
            
            // 检查游戏结束
            if (health <= 0) {
                gameOver();
                return;
            }
        }
    }
    
    // 玩家与道具碰撞
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        
        if (isColliding(player, powerup)) {
            // 应用道具效果
            if (powerup.type === 'fireRate') {
                player.powerupActive = true;
                player.powerupTimer = 5000; // 5秒道具效果
                player.fireRate = 150; // 提高射速
            } else if (powerup.type === 'health') {
                health = Math.min(health + 1, 5); // 最多5点生命值
                updateHealthDisplay();
            }
            
            // 移除道具
            powerups.splice(i, 1);
        }
    }
}

// 碰撞检测辅助函数
function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// 绘制背景
function drawBackground() {
    // 移动背景
    backgroundY = (backgroundY + 1) % GAME_HEIGHT;
    
    // 绘制星空背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 绘制星星
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
        const x = Math.sin(i * 10) * GAME_WIDTH / 2 + GAME_WIDTH / 2;
        const y = (i * 12 + backgroundY) % GAME_HEIGHT;
        const size = Math.random() * 2 + 1;
        ctx.fillRect(x, y, size, size);
    }
}

// 绘制玩家
function drawPlayer() {
    // 飞机主体
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // 飞机机翼
    ctx.fillStyle = '#0077ed';
    ctx.fillRect(player.x + 5, player.y + player.height - 20, player.width - 10, 10);
    
    // 飞机引擎
    ctx.fillStyle = '#ff9500';
    ctx.fillRect(player.x + player.width / 2 - 5, player.y + player.height, 10, 5);
    
    // 道具效果指示
    if (player.powerupActive) {
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// 绘制敌人
function drawEnemy(enemy) {
    // 敌机主体
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
    ctx.lineTo(enemy.x + enemy.width, enemy.y);
    ctx.lineTo(enemy.x, enemy.y);
    ctx.closePath();
    ctx.fill();
    
    // 敌机机翼
    ctx.fillStyle = '#ff6b58';
    ctx.fillRect(enemy.x + 5, enemy.y + 10, enemy.width - 10, 10);
}

// 绘制道具
function drawPowerup(powerup) {
    ctx.fillStyle = powerup.color;
    ctx.beginPath();
    ctx.arc(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, powerup.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 道具图标
    ctx.fillStyle = '#fff';
    if (powerup.type === 'fireRate') {
        // 绘制闪电图标
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
        // 绘制加号图标
        ctx.fillRect(powerup.x + powerup.width / 2 - 8, powerup.y + powerup.height / 2 - 2, 16, 4);
        ctx.fillRect(powerup.x + powerup.width / 2 - 2, powerup.y + powerup.height / 2 - 8, 4, 16);
    }
}

// 更新分数显示
function updateScoreDisplay() {
    document.getElementById('score-display').textContent = `分数: ${score}`;
}

// 更新生命值显示
function updateHealthDisplay() {
    document.getElementById('health-display').textContent = `生命: ${health}`;
}

// 键盘事件处理
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

// 初始化游戏
window.addEventListener('load', init); 