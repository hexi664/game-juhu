// 贪吃蛇游戏实现
var Snakes = function() {
    // 游戏配置
    var config = {
        canvasId: 'game-canvas',
        width: 400,
        height: 400,
        gridSize: 16,
        speed: 8,
        backgroundColor: 'black',
        snakeColor: 'green',
        foodColor: 'red'
    };

    // 游戏状态
    var state = {
        canvas: null,
        context: null,
        snake: {
            x: 160,
            y: 160,
            dx: config.gridSize,
            dy: 0,
            cells: [],
            maxCells: 4
        },
        food: {
            x: 320,
            y: 320
        },
        score: 0,
        highScore: 0,
        gameOver: false,
        count: 0
    };

    // 初始化游戏
    function init() {
        try {
            console.log("初始化游戏...");
            
            // 检查游戏容器是否存在
            var gameContainer = document.getElementById('game');
            if (!gameContainer) {
                console.error("找不到ID为'game'的元素！");
                alert("游戏初始化失败：找不到游戏容器元素");
                return;
            }
            
            // 创建画布
            if (!document.getElementById(config.canvasId)) {
                console.log("创建新的画布元素...");
                state.canvas = document.createElement('canvas');
                state.canvas.id = config.canvasId;
                state.canvas.width = config.width;
                state.canvas.height = config.height;
                state.canvas.className = 'game-canvas';
                gameContainer.appendChild(state.canvas);
            } else {
                console.log("使用现有的画布元素...");
                state.canvas = document.getElementById(config.canvasId);
            }
            
            state.context = state.canvas.getContext('2d');
            
            // 加载高分
            if (localStorage.getItem('snakeHighScore')) {
                state.highScore = parseInt(localStorage.getItem('snakeHighScore'));
                console.log("加载最高分: " + state.highScore);
            }
            
            // 创建分数显示
            createScoreDisplay();
            
            // 添加键盘事件监听
            document.addEventListener('keydown', handleKeyDown);
            
            // 开始游戏循环
            console.log("开始游戏循环...");
            requestAnimationFrame(gameLoop);
        } catch (error) {
            console.error("游戏初始化错误:", error);
            alert("游戏初始化失败: " + error.message);
        }
    }
    
    // 创建分数显示
    function createScoreDisplay() {
        try {
            var gameContainer = document.getElementById('game');
            if (!gameContainer) {
                console.error("创建分数显示失败：找不到游戏容器");
                return;
            }
            
            var scoreDiv = document.createElement('div');
            scoreDiv.className = 'score-display';
            scoreDiv.innerHTML = '<p>分数: <span id="score">0</span> | 最高分: <span id="high-score">' + state.highScore + '</span></p>';
            gameContainer.appendChild(scoreDiv);
            console.log("分数显示创建成功");
        } catch (error) {
            console.error("创建分数显示错误:", error);
        }
    }
    
    // 获取随机整数
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
    // 游戏循环
    function gameLoop() {
        try {
            requestAnimationFrame(gameLoop);
            
            // 控制游戏速度
            if (++state.count < config.speed) {
                return;
            }
            
            state.count = 0;
            state.context.clearRect(0, 0, state.canvas.width, state.canvas.height);
            
            // 移动蛇
            state.snake.x += state.snake.dx;
            state.snake.y += state.snake.dy;
            
            // 边界处理 - 穿墙
            if (state.snake.x < 0) {
                state.snake.x = state.canvas.width - config.gridSize;
            } else if (state.snake.x >= state.canvas.width) {
                state.snake.x = 0;
            }
            
            if (state.snake.y < 0) {
                state.snake.y = state.canvas.height - config.gridSize;
            } else if (state.snake.y >= state.canvas.height) {
                state.snake.y = 0;
            }
            
            // 记录蛇的位置
            state.snake.cells.unshift({x: state.snake.x, y: state.snake.y});
            
            // 移除多余的蛇身
            if (state.snake.cells.length > state.snake.maxCells) {
                state.snake.cells.pop();
            }
            
            // 绘制食物
            state.context.fillStyle = config.foodColor;
            state.context.fillRect(state.food.x, state.food.y, config.gridSize-1, config.gridSize-1);
            
            // 绘制蛇
            state.context.fillStyle = config.snakeColor;
            state.snake.cells.forEach(function(cell, index) {
                state.context.fillRect(cell.x, cell.y, config.gridSize-1, config.gridSize-1);
                
                // 检测是否吃到食物
                if (cell.x === state.food.x && cell.y === state.food.y) {
                    state.snake.maxCells++;
                    state.score++;
                    
                    var scoreElement = document.getElementById('score');
                    if (scoreElement) {
                        scoreElement.textContent = state.score;
                    }
                    
                    // 更新最高分
                    if (state.score > state.highScore) {
                        state.highScore = state.score;
                        localStorage.setItem('snakeHighScore', state.highScore);
                        
                        var highScoreElement = document.getElementById('high-score');
                        if (highScoreElement) {
                            highScoreElement.textContent = state.highScore;
                        }
                    }
                    
                    // 生成新的食物
                    state.food.x = getRandomInt(0, state.canvas.width / config.gridSize) * config.gridSize;
                    state.food.y = getRandomInt(0, state.canvas.height / config.gridSize) * config.gridSize;
                }
                
                // 检测是否碰到自己
                for (var i = index + 1; i < state.snake.cells.length; i++) {
                    if (cell.x === state.snake.cells[i].x && cell.y === state.snake.cells[i].y) {
                        // 游戏结束，重置游戏
                        resetGame();
                    }
                }
            });
        } catch (error) {
            console.error("游戏循环错误:", error);
        }
    }
    
    // 处理键盘事件
    function handleKeyDown(e) {
        // 左箭头键
        if (e.which === 37 && state.snake.dx === 0) {
            state.snake.dx = -config.gridSize;
            state.snake.dy = 0;
        }
        // 上箭头键
        else if (e.which === 38 && state.snake.dy === 0) {
            state.snake.dy = -config.gridSize;
            state.snake.dx = 0;
        }
        // 右箭头键
        else if (e.which === 39 && state.snake.dx === 0) {
            state.snake.dx = config.gridSize;
            state.snake.dy = 0;
        }
        // 下箭头键
        else if (e.which === 40 && state.snake.dy === 0) {
            state.snake.dy = config.gridSize;
            state.snake.dx = 0;
        }
    }
    
    // 重置游戏
    function resetGame() {
        state.snake.x = 160;
        state.snake.y = 160;
        state.snake.cells = [];
        state.snake.maxCells = 4;
        state.snake.dx = config.gridSize;
        state.snake.dy = 0;
        state.score = 0;
        
        var scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = state.score;
        }
        
        // 重新生成食物
        state.food.x = getRandomInt(0, state.canvas.width / config.gridSize) * config.gridSize;
        state.food.y = getRandomInt(0, state.canvas.height / config.gridSize) * config.gridSize;
    }
    
    // 初始化游戏
    init();
    
    // 返回游戏控制接口
    return {
        reset: resetGame,
        getScore: function() { return state.score; },
        getHighScore: function() { return state.highScore; }
    };
}; 