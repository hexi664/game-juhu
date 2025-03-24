// Snake Game Implementation
var Snakes = function() {
    // Game configuration
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

    // Game state
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
        count: 0,
        initialized: false
    };

    // Initialize game
    function init() {
        try {
            console.log("Initializing game...");
            
            // Get canvas that should already be created in the HTML
            state.canvas = document.getElementById(config.canvasId);
            if (!state.canvas) {
                console.error("Could not find canvas with ID:", config.canvasId);
                return false;
            }
            
            // Get context
            state.context = state.canvas.getContext('2d');
            if (!state.context) {
                console.error("Could not get canvas context!");
                return false;
            }
            
            // Load high score from local storage
            var savedHighScore = localStorage.getItem('snakeHighScore');
            if (savedHighScore) {
                state.highScore = parseInt(savedHighScore);
                // Score display should already be created in HTML
                updateScoreDisplay();
            }
            
            // Set up event listeners
            document.addEventListener('keydown', handleKeyDown);
            
            // Reset game state
            resetGame();
            
            // Mark as initialized
            state.initialized = true;
            
            // Initial draw to show the game immediately
            drawInitialState();
            
            // Start game loop
            requestAnimationFrame(gameLoop);
            
            console.log("Game initialized successfully");
            return true;
        } catch (error) {
            console.error("Error initializing game:", error);
            return false;
        }
    }
    
    // Initial draw to show the game immediately
    function drawInitialState() {
        // Clear and draw background
        state.context.fillStyle = config.backgroundColor;
        state.context.fillRect(0, 0, state.canvas.width, state.canvas.height);
        
        // Draw food
        state.context.fillStyle = config.foodColor;
        state.context.fillRect(state.food.x, state.food.y, config.gridSize, config.gridSize);
        
        // Draw snake
        state.context.fillStyle = config.snakeColor;
        state.snake.cells.forEach(function(cell) {
            state.context.fillRect(cell.x, cell.y, config.gridSize - 1, config.gridSize - 1);
        });
    }
    
    // Update score display
    function updateScoreDisplay() {
        var currentScoreElem = document.getElementById('current-score');
        var highScoreElem = document.getElementById('high-score');
        
        if (currentScoreElem) {
            currentScoreElem.textContent = 'Score: ' + state.score;
        }
        
        if (highScoreElem) {
            highScoreElem.textContent = 'High Score: ' + state.highScore;
        }
    }
    
    // Get random integer between min and max
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
    // Game loop
    function gameLoop() {
        // Only continue if game is initialized
        if (!state.initialized) {
            console.warn("Game loop called but game is not initialized");
            return;
        }
        
        if (state.gameOver) {
            // Show game over message
            state.context.fillStyle = 'rgba(0, 0, 0, 0.75)';
            state.context.fillRect(0, 0, state.canvas.width, state.canvas.height);
            
            state.context.font = '30px Arial';
            state.context.fillStyle = 'white';
            state.context.textAlign = 'center';
            state.context.fillText('GAME OVER', state.canvas.width / 2, state.canvas.height / 2 - 30);
            
            state.context.font = '20px Arial';
            state.context.fillText('Score: ' + state.score, state.canvas.width / 2, state.canvas.height / 2 + 10);
            
            state.context.font = '16px Arial';
            state.context.fillText('Press Space to Play Again', state.canvas.width / 2, state.canvas.height / 2 + 50);
            
            return;
        }
        
        requestAnimationFrame(gameLoop);
        
        // Slow down the game loop
        if (++state.count < config.speed) {
            return;
        }
        
        state.count = 0;
        state.context.clearRect(0, 0, state.canvas.width, state.canvas.height);
        
        // Draw background
        state.context.fillStyle = config.backgroundColor;
        state.context.fillRect(0, 0, state.canvas.width, state.canvas.height);
        
        // Move snake
        state.snake.x += state.snake.dx;
        state.snake.y += state.snake.dy;
        
        // Wrap snake position if it goes off screen
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
        
        // Keep track of where snake has been
        state.snake.cells.unshift({x: state.snake.x, y: state.snake.y});
        
        // Remove tail
        if (state.snake.cells.length > state.snake.maxCells) {
            state.snake.cells.pop();
        }
        
        // Draw food
        state.context.fillStyle = config.foodColor;
        state.context.fillRect(state.food.x, state.food.y, config.gridSize, config.gridSize);
        
        // Draw snake
        state.context.fillStyle = config.snakeColor;
        state.snake.cells.forEach(function(cell, index) {
            state.context.fillRect(cell.x, cell.y, config.gridSize - 1, config.gridSize - 1);
            
            // Snake ate food
            if (cell.x === state.food.x && cell.y === state.food.y) {
                state.snake.maxCells++;
                state.score++;
                
                // Update high score
                if (state.score > state.highScore) {
                    state.highScore = state.score;
                    localStorage.setItem('snakeHighScore', state.highScore);
                }
                
                updateScoreDisplay();
                
                // Place new food
                state.food.x = getRandomInt(0, Math.floor(state.canvas.width / config.gridSize)) * config.gridSize;
                state.food.y = getRandomInt(0, Math.floor(state.canvas.height / config.gridSize)) * config.gridSize;
            }
            
            // Check for collision with own body
            for (var i = index + 1; i < state.snake.cells.length; i++) {
                if (cell.x === state.snake.cells[i].x && cell.y === state.snake.cells[i].y) {
                    state.gameOver = true;
                }
            }
        });
    }
    
    // Handle keyboard input
    function handleKeyDown(e) {
        // Prevent arrow keys from scrolling the page
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
        
        if (state.gameOver) {
            // Space to restart game
            if (e.keyCode === 32) {
                resetGame();
            }
            return;
        }
        
        // Left arrow key
        if (e.keyCode === 37 && state.snake.dx === 0) {
            state.snake.dx = -config.gridSize;
            state.snake.dy = 0;
        }
        // Up arrow key
        else if (e.keyCode === 38 && state.snake.dy === 0) {
            state.snake.dy = -config.gridSize;
            state.snake.dx = 0;
        }
        // Right arrow key
        else if (e.keyCode === 39 && state.snake.dx === 0) {
            state.snake.dx = config.gridSize;
            state.snake.dy = 0;
        }
        // Down arrow key
        else if (e.keyCode === 40 && state.snake.dy === 0) {
            state.snake.dy = config.gridSize;
            state.snake.dx = 0;
        }
    }
    
    // Reset game state
    function resetGame() {
        state.snake.x = 160;
        state.snake.y = 160;
        state.snake.cells = []; // Clear existing cells array
        state.snake.maxCells = 4;
        state.snake.dx = config.gridSize;
        state.snake.dy = 0;
        state.food.x = getRandomInt(0, Math.floor(state.canvas.width / config.gridSize)) * config.gridSize;
        state.food.y = getRandomInt(0, Math.floor(state.canvas.height / config.gridSize)) * config.gridSize;
        state.score = 0;
        state.gameOver = false;
        
        // Initialize snake cells after reset
        for (var i = 0; i < state.snake.maxCells; i++) {
            state.snake.cells.push({
                x: state.snake.x - (i * config.gridSize),
                y: state.snake.y
            });
        }
        
        updateScoreDisplay();
        
        // If canvas context exists, redraw the initial state
        if (state.context) {
            // Clear and draw background
            state.context.fillStyle = config.backgroundColor;
            state.context.fillRect(0, 0, state.canvas.width, state.canvas.height);
            
            // Draw food
            state.context.fillStyle = config.foodColor;
            state.context.fillRect(state.food.x, state.food.y, config.gridSize, config.gridSize);
            
            // Draw snake
            state.context.fillStyle = config.snakeColor;
            state.snake.cells.forEach(function(cell) {
                state.context.fillRect(cell.x, cell.y, config.gridSize - 1, config.gridSize - 1);
            });
        }
    }
    
    // Initialize the game
    var result = init();
    
    // Return public interface
    return {
        isInitialized: function() {
            return state.initialized;
        },
        resetGame: resetGame,
        getScore: function() {
            return state.score;
        },
        getHighScore: function() {
            return state.highScore;
        }
    };
}; 