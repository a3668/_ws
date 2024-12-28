let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird
let birdWidth = 68;
let birdHeight = 48;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

// pipe
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth; // 右上角開始
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;
let score = 0;
let gameOver = false;

let countdown = 3;
let gameStarted = false;
let flapSound;

window.onload = function () {
  showGameRules();

  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

  birdImg = new Image();
  birdImg.src = "/static/images/airpica.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = "/static/images/toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "/static/images/bottompipe.png";

  flapSound = new Audio("/static/sounds/pixel.mp3");
};

function update() {
  if (gameOver || !gameStarted) {
    return;
  }
  requestAnimationFrame(update);
  context.clearRect(0, 0, board.width, board.height);

  // bird
  if (velocityY > 0) {
    flapSound.play();
  }
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0); // 0是頂部
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  if (bird.y > boardHeight - 80) {
    stopSound(flapSound);
    gameOver = true;
    showScoreBoard();
  }

  // pipe
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 1;
      pipe.passed = true;
    }
    if (detectCollision(bird, pipe) || bird.y > boardHeight) {
      stopSound(flapSound);
      gameOver = true;
      showScoreBoard();
    }
  }
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift();
  }

  // score
  context.textBaseline = "top";
  context.textAlign = "left";
  context.fillStyle = "white";
  context.font = "15px Arial";
  context.fillText("分数: " + score, 5, 45);
}

function placePipes() {
  if (gameOver) {
    return;
  }
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;
  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

function moveBird(e) {
  if (e.code == "Space" || e.code == "ArrowUp") {
    velocityY = -6;
    if (gameOver || !gameStarted) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
      countdown = 3;
      update();
      hideScoreBoard();
    }
  }
}

function detectCollision(a, b) {
  if (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  ) {
    return true; // 撞到柱子
  }
  return false;
}

function stopSound(sound) {
  sound.pause();
  sound.currentTime = 0;
}

function showScoreBoard() {
  // 保存分數
  fetch("/api/save-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score: score }),
  })
    .then((response) => response.json())
    .then((data) => console.log("分數保存結果:", data))
    .catch((error) => console.error("保存分數時出錯:", error));

  let scoreBoard = document.createElement("div");
  scoreBoard.id = "scoreBoard";
  scoreBoard.style.position = "fixed"; /* 修改為 fixed */
  scoreBoard.style.width = "300px";
  scoreBoard.style.height = "300px";
  scoreBoard.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  scoreBoard.style.color = "white";
  scoreBoard.style.fontSize = "20px";
  scoreBoard.style.textAlign = "center";
  scoreBoard.style.padding = "20px";
  scoreBoard.style.borderRadius = "10px";
  scoreBoard.style.top = "50%";
  scoreBoard.style.left = "50%";
  scoreBoard.style.transform = "translate(-50%, -50%)";
  scoreBoard.style.zIndex = "2"; /* 確保在粒子背景上方 */

  scoreBoard.innerHTML = `
    <h1>遊戲結束</h1>
    <p>分數: ${score}</p>
    <h3>按空白鍵或上箭頭鍵再玩一次</h3>
  `;

  document.body.appendChild(scoreBoard);
}

function hideScoreBoard() {
  let scoreBoard = document.getElementById("scoreBoard");
  if (scoreBoard) {
    document.body.removeChild(scoreBoard);
  }
}

function showGameRules() {
  let gameRules = document.createElement("div");
  gameRules.style.position = "fixed"; /* 修改為 fixed */
  gameRules.style.width = "300px";
  gameRules.style.height = "300px";
  gameRules.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  gameRules.style.color = "white";
  gameRules.style.fontSize = "20px";
  gameRules.style.textAlign = "center";
  gameRules.style.padding = "20px";
  gameRules.style.borderRadius = "10px";
  gameRules.style.top = "50%";
  gameRules.style.left = "50%";
  gameRules.style.transform = "translate(-50%, -50%)";
  gameRules.style.zIndex = "2"; /* 確保在粒子背景上方 */

  gameRules.innerHTML = `
    <h1>遊戲規則</h1>
    <p>按空白鍵或上箭頭鍵向上飛，不要撞到柱子。</p>
    <p>經過柱子加1分。</p>
    <button onclick="startCountdown()">開始遊戲</button>
  `;

  document.body.appendChild(gameRules);
}

function startCountdown() {
  let gameRules = document.getElementById("scoreBoard") || document.querySelector("div[style*='position: fixed']");
  if (gameRules) {
    document.body.removeChild(gameRules);
  }

  let countdownInterval = setInterval(function () {
    context.clearRect(0, 0, board.width, board.height);
    context.font = "55px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText(countdown, board.width / 2, board.height / 2);
    countdown--;
    if (countdown < 0) {
      clearInterval(countdownInterval);
      gameStarted = true;
      requestAnimationFrame(update);
      setInterval(placePipes, 1500); // 每1.5秒放置新的管道
      document.addEventListener("keydown", moveBird);
    }
  }, 1000);
}
