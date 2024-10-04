import { backend } from 'declarations/backend';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;

let player = { x: 1, y: 1 };
let score = 0;
let lives = 5;
let gameRunning = false;

const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function drawMaze() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            } else if (maze[y][x] === 0) {
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(x * GRID_SIZE + GRID_SIZE / 2, y * GRID_SIZE + GRID_SIZE / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(player.x * GRID_SIZE + GRID_SIZE / 2, player.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(player.x * GRID_SIZE + GRID_SIZE / 2, player.y * GRID_SIZE + GRID_SIZE / 2);
    ctx.fill();
}

function updateScore() {
    document.getElementById('scoreValue').textContent = score;
}

function updateLives() {
    document.getElementById('livesValue').textContent = lives;
}

function checkCollision(x, y) {
    if (maze[y][x] === 1) {
        lives--;
        updateLives();
        if (lives <= 0) {
            gameOver();
        }
        return true;
    }
    return false;
}

function collectDot(x, y) {
    if (maze[y][x] === 0) {
        maze[y][x] = 2;
        score += 10;
        updateScore();
    }
}

function gameOver() {
    gameRunning = false;
    alert(`Game Over! Your score: ${score}`);
    backend.addScore(score);
    resetGame();
    showStartButton();
}

function resetGame() {
    player = { x: 1, y: 1 };
    score = 0;
    lives = 5;
    updateScore();
    updateLives();
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (maze[y][x] === 2) {
                maze[y][x] = 0;
            }
        }
    }
    updateHighScores();
}

async function updateHighScores() {
    const highScores = await backend.getHighScores();
    const highScoresList = document.getElementById('highScoresList');
    highScoresList.innerHTML = '';
    highScores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = score;
        highScoresList.appendChild(li);
    });
}

function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameRunning = true;
    hideStartButton();
    showGameCanvas();
    resetGame();
    gameLoop();
}

function showStartButton() {
    startButton.style.display = 'block';
    canvas.style.display = 'none';
}

function hideStartButton() {
    startButton.style.display = 'none';
}

function showGameCanvas() {
    canvas.style.display = 'block';
}

document.addEventListener('keydown', (event) => {
    if (!gameRunning) return;
    const key = event.key;
    let newX = player.x;
    let newY = player.y;

    if (key === 'ArrowUp') newY--;
    else if (key === 'ArrowDown') newY++;
    else if (key === 'ArrowLeft') newX--;
    else if (key === 'ArrowRight') newX++;

    if (!checkCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
        collectDot(newX, newY);
    }
});

startButton.addEventListener('click', startGame);

showStartButton();
updateHighScores();
