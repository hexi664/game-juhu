// 游戏配置
const GAME_CONFIG = {
    beginner: {
        rows: 9,
        cols: 9,
        mines: 10
    },
    intermediate: {
        rows: 16,
        cols: 16,
        mines: 40
    },
    expert: {
        rows: 16,
        cols: 30,
        mines: 99
    }
};

// 游戏状态
let gameState = {
    board: [],
    minesCount: 0,
    minesLeft: 0,
    revealed: 0,
    gameOver: false,
    gameWon: false,
    timer: 0,
    timerInterval: null,
    firstClick: true
};

// DOM 元素
const gameBoard = document.getElementById('game-board');
const minesCounter = document.getElementById('mines-count');
const timerDisplay = document.getElementById('timer');
const newGameBtn = document.getElementById('new-game-btn');
const difficultySelect = document.getElementById('difficulty');
const gameOverModal = document.getElementById('game-over-modal');
const gameResult = document.getElementById('game-result');
const gameStats = document.getElementById('game-stats');
const playAgainBtn = document.getElementById('play-again-btn');

// 初始化游戏
function initGame() {
    const difficulty = difficultySelect.value;
    const config = GAME_CONFIG[difficulty];
    
    // 重置游戏状态
    gameState = {
        board: [],
        minesCount: config.mines,
        minesLeft: config.mines,
        revealed: 0,
        gameOver: false,
        gameWon: false,
        timer: 0,
        timerInterval: null,
        firstClick: true
    };
    
    // 更新UI
    minesCounter.textContent = gameState.minesLeft;
    timerDisplay.textContent = '0';
    gameBoard.innerHTML = '';
    
    // 设置游戏板网格
    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    
    // 创建游戏板
    createBoard(config.rows, config.cols);
    
    // 隐藏游戏结束模态框
    gameOverModal.style.display = 'none';
    
    // 停止计时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// 创建游戏板
function createBoard(rows, cols) {
    // 初始化空游戏板
    for (let i = 0; i < rows; i++) {
        gameState.board[i] = [];
        for (let j = 0; j < cols; j++) {
            gameState.board[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
                row: i,
                col: j
            };
            
            // 创建单元格元素
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // 添加事件监听器
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleCellRightClick);
            
            gameBoard.appendChild(cell);
        }
    }
    
    // 调整游戏板的宽度以适应不同难度级别
    adjustBoardSize(cols);
}

// 调整游戏板大小
function adjustBoardSize(cols) {
    const cellSize = 20; // 更新为新的单元格大小(像素)
    
    // 设置游戏板列数
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
}

// 放置地雷
function placeMines(rows, cols, mines, firstClickRow, firstClickCol) {
    let minesPlaced = 0;
    
    // 确保首次点击的位置及其周围没有地雷
    const safeZone = [];
    for (let i = Math.max(0, firstClickRow - 1); i <= Math.min(rows - 1, firstClickRow + 1); i++) {
        for (let j = Math.max(0, firstClickCol - 1); j <= Math.min(cols - 1, firstClickCol + 1); j++) {
            safeZone.push(`${i},${j}`);
        }
    }
    
    while (minesPlaced < mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const key = `${row},${col}`;
        
        // 确保不在安全区域内放置地雷
        if (!safeZone.includes(key) && !gameState.board[row][col].isMine) {
            gameState.board[row][col].isMine = true;
            minesPlaced++;
            
            // 更新周围单元格的地雷计数
            updateNeighborCounts(row, col, rows, cols);
        }
    }
}

// 更新周围单元格的地雷计数
function updateNeighborCounts(mineRow, mineCol, rows, cols) {
    for (let i = Math.max(0, mineRow - 1); i <= Math.min(rows - 1, mineRow + 1); i++) {
        for (let j = Math.max(0, mineCol - 1); j <= Math.min(cols - 1, mineCol + 1); j++) {
            if (i !== mineRow || j !== mineCol) {
                gameState.board[i][j].neighborMines++;
            }
        }
    }
}

// 处理单元格点击
function handleCellClick(event) {
    if (gameState.gameOver) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = gameState.board[row][col];
    
    // 如果是标记的单元格或已揭示的单元格，不做任何操作
    if (cell.isFlagged || cell.isRevealed) return;
    
    // 首次点击
    if (gameState.firstClick) {
        gameState.firstClick = false;
        
        // 开始计时
        startTimer();
        
        // 放置地雷，确保首次点击安全
        const difficulty = difficultySelect.value;
        const config = GAME_CONFIG[difficulty];
        placeMines(config.rows, config.cols, config.mines, row, col);
    }
    
    // 揭示单元格
    revealCell(row, col);
}

// 处理单元格右键点击（标记地雷）
function handleCellRightClick(event) {
    event.preventDefault();
    
    if (gameState.gameOver) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = gameState.board[row][col];
    
    // 如果单元格已揭示，不做任何操作
    if (cell.isRevealed) return;
    
    // 切换标记状态
    cell.isFlagged = !cell.isFlagged;
    
    // 更新UI
    updateCellDisplay(row, col);
    
    // 更新剩余地雷计数
    if (cell.isFlagged) {
        gameState.minesLeft--;
    } else {
        gameState.minesLeft++;
    }
    minesCounter.textContent = gameState.minesLeft;
    
    // 检查游戏是否胜利
    checkWinCondition();
}

// 显示单元格内容
function updateCellDisplay(row, col) {
    const cellData = gameState.board[row][col];
    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    
    if (cellData.isRevealed) {
        cellElement.classList.add('revealed');
        
        if (cellData.isMine) {
            cellElement.classList.add('mine');
            cellElement.textContent = ''; // 使用CSS ::after添加炸弹图标
        } else if (cellData.neighborMines > 0) {
            cellElement.classList.add(`number-${cellData.neighborMines}`);
            cellElement.textContent = cellData.neighborMines;
        } else {
            cellElement.textContent = '';
        }
    } else if (cellData.isFlagged) {
        cellElement.classList.add('flagged');
        cellElement.classList.remove('revealed');
        cellElement.textContent = ''; // 使用CSS ::after添加旗帜图标
    } else {
        cellElement.className = 'cell';
        cellElement.textContent = '';
    }
}

// 揭示单元格
function revealCell(row, col) {
    const cellData = gameState.board[row][col];
    
    // 如果单元格已经被揭示或被标记，则不做任何操作
    if (cellData.isRevealed || cellData.isFlagged) {
        return;
    }
    
    // 将单元格标记为已揭示
    cellData.isRevealed = true;
    gameState.revealed++;
    
    // 更新单元格显示
    updateCellDisplay(row, col);
    
    // 如果单元格是地雷，则游戏结束
    if (cellData.isMine) {
        endGame(false);
        return;
    }
    
    // 如果单元格周围没有地雷，则自动揭示周围的单元格
    if (cellData.neighborMines === 0) {
        const rows = gameState.board.length;
        const cols = gameState.board[0].length;
        
        for (let i = Math.max(0, row - 1); i <= Math.min(rows - 1, row + 1); i++) {
            for (let j = Math.max(0, col - 1); j <= Math.min(cols - 1, col + 1); j++) {
                if (i !== row || j !== col) {
                    revealCell(i, j);
                }
            }
        }
    }
    
    // 检查是否赢得游戏
    checkWinCondition();
}

// 检查游戏是否胜利
function checkWinCondition() {
    const difficulty = difficultySelect.value;
    const config = GAME_CONFIG[difficulty];
    const totalCells = config.rows * config.cols;
    
    // 如果所有非地雷单元格都已揭示，游戏胜利
    if (gameState.revealed === totalCells - config.mines) {
        endGame(true);
    }
}

// 开始计时器
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        timerDisplay.textContent = gameState.timer;
    }, 1000);
}

// 结束游戏
function endGame(isWin) {
    gameState.gameOver = true;
    gameState.gameWon = isWin;
    
    // 停止计时器
    clearInterval(gameState.timerInterval);
    
    // 显示所有地雷
    revealAllMines();
    
    // 显示游戏结果
    gameResult.textContent = isWin ? 'Congratulations, You Win!' : 'Game Over!';
    gameStats.textContent = `Time: ${gameState.timer} seconds`;
    gameOverModal.style.display = 'flex';
}

// 显示所有地雷
function revealAllMines() {
    const rows = gameState.board.length;
    const cols = gameState.board[0].length;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (gameState.board[i][j].isMine) {
                gameState.board[i][j].isRevealed = true;
                updateCellDisplay(i, j);
            }
        }
    }
}

// 事件监听器
newGameBtn.addEventListener('click', initGame);
difficultySelect.addEventListener('change', initGame);
playAgainBtn.addEventListener('click', initGame);

// 阻止右键菜单
gameBoard.addEventListener('contextmenu', (e) => e.preventDefault());

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);
