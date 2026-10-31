
// ==========================================
// THE LAST DOOR - HORROR PLATFORMER
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const WORLD_WIDTH = 3000;

// ==========================================
// GAME STATE
// ==========================================

let gameRunning = false;
let cameraX = 0;
let lives = 3;
let animationId = null;

// ==========================================
// BACKGROUND MUSIC
// ==========================================

const backgroundMusic = new Audio("audio/background.mp3");

backgroundMusic.loop = true;
backgroundMusic.volume = 0.35;

// ==========================================
// INPUT
// ==========================================

const keys = {};

document.addEventListener("keydown", (event) => {

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) {
        event.preventDefault();
    }

    keys[event.code] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// ==========================================
// PLAYER
// ==========================================

const player = {
    x: 60,
    y: 300,
    width: 32,
    height: 48,
    speed: 4,
    velocityY: 0,
    jumpPower: -12,
    gravity: 0.5,
    grounded: false,
    facing: 1
};

// ==========================================
// LEVEL DESIGN
// ==========================================

const platforms = [

    // Main ground
    { x: 0, y: 480, width: 550, height: 60 },
    { x: 680, y: 430, width: 420, height: 110 },
    { x: 1200, y: 480, width: 400, height: 60 },
    { x: 1730, y: 420, width: 430, height: 120 },
    { x: 2300, y: 480, width: 700, height: 60 },

    // Floating platforms
    { x: 180, y: 380, width: 130, height: 20 },
    { x: 390, y: 310, width: 120, height: 20 },

    { x: 700, y: 340, width: 140, height: 20 },
    { x: 940, y: 270, width: 120, height: 20 },

    { x: 1250, y: 390, width: 140, height: 20 },
    { x: 1480, y: 320, width: 130, height: 20 },

    { x: 1760, y: 340, width: 150, height: 20 },
    { x: 2000, y: 270, width: 120, height: 20 },

    { x: 2340, y: 380, width: 150, height: 20 },
    { x: 2580, y: 310, width: 150, height: 20 }
];

// ==========================================
// FINISH FLAG
// ==========================================

const finishFlag = {
    x: 2900,
    y: 340,
    width: 40,
    height: 140
};

function drawFinishFlag() {

    const x = finishFlag.x - cameraX;
    const y = finishFlag.y;

    // Pole
    ctx.fillStyle = "#d6d0bd";
    ctx.fillRect(x, y, 7, finishFlag.height);

    // Ball on top
    ctx.fillStyle = "#c83232";
    ctx.beginPath();
    ctx.arc(x + 3, y - 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // Checkered flag
    const size = 12;

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {

            ctx.fillStyle =
                (row + col) % 2 === 0 ? "#f0eee5" : "#252631";

            ctx.fillRect(
                x + 7 + col * size,
                y + row * size,
                size,
                size
            );
        }
    }

    // Flag outline
    ctx.strokeStyle = "#aaa395";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 7, y, size * 4, size * 4);
}

// ==========================================
// BACKGROUND
// ==========================================

function drawBackground() {

    ctx.fillStyle = "#171923";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Stars
    ctx.fillStyle = "#d9d6c5";

    for (let i = 0; i < 90; i++) {

        let x = (i * 137 - cameraX * 0.2) % WIDTH;

        if (x < 0) x += WIDTH;

        let y = (i * 73) % 230;

        ctx.fillRect(x, y, 3, 3);
    }

    // Moon
    ctx.fillStyle = "#ded5bb";
    ctx.beginPath();
    ctx.arc(790, 110, 38, 0, Math.PI * 2);
    ctx.fill();

    // Distant buildings
    ctx.fillStyle = "#252631";

    for (let i = 0; i < 12; i++) {

        const x = i * 180 - (cameraX * 0.35) % 2160;

        ctx.fillRect(x, 260, 115, 280);

        ctx.fillStyle = "#b5a071";

        ctx.fillRect(x + 20, 290, 14, 24);
        ctx.fillRect(x + 70, 350, 14, 24);

        ctx.fillStyle = "#252631";
    }

    // Fog
    ctx.fillStyle = "rgba(180, 180, 190, 0.06)";
    ctx.fillRect(0, 440, WIDTH, 100);
}

// ==========================================
// DRAW PLATFORMS
// ==========================================

function drawPlatforms() {

    platforms.forEach(platform => {

        const x = platform.x - cameraX;

        if (x + platform.width < 0 || x > WIDTH) {
            return;
        }

        ctx.fillStyle = "#39383b";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );

        // Top edge
        ctx.fillStyle = "#89806e";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            8
        );

        // Details
        ctx.fillStyle = "#55504a";

        for (let i = 12; i < platform.width; i += 40) {

            ctx.fillRect(
                x + i,
                platform.y + 20,
                10,
                8
            );
        }
    });
}

// ==========================================
// DRAW PLAYER
// ==========================================

function drawPlayer() {

    const x = Math.floor(player.x - cameraX);
    const y = Math.floor(player.y);

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(x + 3, y + 46, 30, 5);

    // Hair
    ctx.fillStyle = "#211e27";
    ctx.fillRect(x + 4, y, 25, 9);

    // Head
    ctx.fillStyle = "#d0b89b";
    ctx.fillRect(x + 7, y + 5, 19, 14);

    // Eyes
    ctx.fillStyle = "#171923";
    ctx.fillRect(x + 12, y + 10, 3, 3);
    ctx.fillRect(x + 21, y + 10, 3, 3);

    // Body
    ctx.fillStyle = "#8e302d";
    ctx.fillRect(x + 6, y + 19, 22, 17);

    // Arms
    ctx.fillStyle = "#d0b89b";
    ctx.fillRect(x, y + 21, 7, 13);
    ctx.fillRect(x + 27, y + 21, 7, 13);

    // Legs
    ctx.fillStyle = "#252631";
    ctx.fillRect(x + 7, y + 36, 8, 12);
    ctx.fillRect(x + 19, y + 36, 8, 12);
}

// ==========================================
// PLAYER MOVEMENT AND PHYSICS
// ==========================================

function updatePlayer() {

    const previousBottom = player.y + player.height;

    // Horizontal movement
    if (keys["ArrowLeft"] || keys["KeyA"]) {
        player.x -= player.speed;
        player.facing = -1;
    }

    if (keys["ArrowRight"] || keys["KeyD"]) {
        player.x += player.speed;
        player.facing = 1;
    }

    // Jump
    if (
        (keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) &&
        player.grounded
    ) {
        player.velocityY = player.jumpPower;
        player.grounded = false;
    }

    // Gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Reset grounded state
    player.grounded = false;

    // Platform collision
    platforms.forEach(platform => {

        const playerBottom = player.y + player.height;

        const overlaps =
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width;

        const landedOnTop =
            previousBottom <= platform.y &&
            playerBottom >= platform.y &&
            player.velocityY >= 0;

        if (overlaps && landedOnTop) {

            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
        }
    });

    // World boundaries
    player.x = Math.max(
        0,
        Math.min(player.x, WORLD_WIDTH - player.width)
    );

    // Falling into a pit
    if (player.y > HEIGHT + 100) {
        loseLife();
        return;
    }

    // Camera follows player
    cameraX = player.x - WIDTH / 2 + player.width / 2;

    cameraX = Math.max(
        0,
        Math.min(cameraX, WORLD_WIDTH - WIDTH)
    );

    // Finish line collision
    if (
        player.x + player.width >= finishFlag.x &&
        player.y + player.height > finishFlag.y
    ) {
        endGame(
            "YOU ESCAPED!",
            "You reached the flag and escaped the darkness... or did you?"
        );
        return;
    }
}

// ==========================================
// LIVES AND GAME OVER
// ==========================================

function loseLife() {

    lives--;

    document.getElementById("health").textContent = lives;

    if (lives <= 0) {

        endGame(
            "GAME OVER",
            "The darkness has claimed you. You never escaped the house."
        );

        return;
    }

    // Respawn
    player.x = 60;
    player.y = 300;
    player.velocityY = 0;
    player.grounded = false;

    cameraX = 0;
}

// ==========================================
// END GAME
// ==========================================

function endGame(title, message) {

    gameRunning = false;

    // Stop music
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    document.getElementById("end-title").textContent = title;
    document.getElementById("end-message").textContent = message;

    document.getElementById("end-screen")
        .classList.remove("hidden");
}

// ==========================================
// DRAW GAME
// ==========================================

function drawGame() {

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawBackground();
    drawPlatforms();
    drawFinishFlag();
    drawPlayer();
}

// ==========================================
// MAIN GAME LOOP
// ==========================================

function gameLoop() {

    if (!gameRunning) return;

    updatePlayer();

    drawGame();

    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// ==========================================
// START AND RESTART
// ==========================================

function startGame() {

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    player.x = 60;
    player.y = 300;
    player.velocityY = 0;
    player.grounded = false;

    cameraX = 0;
    lives = 3;

    document.getElementById("health").textContent = lives;
    document.getElementById("keys").textContent = 0;

    document.getElementById("start-screen")
        .classList.add("hidden");

    document.getElementById("end-screen")
        .classList.add("hidden");

    gameRunning = true;

    // Start background music
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch(error => {
        console.log("Music playback failed:", error);
    });

    drawGame();
    gameLoop();
}

// ==========================================
// BUTTONS
// ==========================================

document.getElementById("start-btn")
    .addEventListener("click", startGame);

document.getElementById("restart-btn")
    .addEventListener("click", startGame);

// ==========================================
// INITIAL SCREEN
// ==========================================

drawGame();
