let zombies = [];
let score = 0;
let shooterX, shooterY;
let health = 100;
let gameTimer = 50;
let gameStarted = false;
let movementSpeed = 6;
let crosshairSize = 50;  // Size of the crosshair (cursor)

function setup() {
  createCanvas(800, 400);
  shooterX = width / 2;
  shooterY = height - 30;

  setInterval(countdown, 1000);
}

function draw() {
  if (!gameStarted) {
    showStartMenu();
  } else if (gameTimer > 0 && health > 0) {
    // Game is running
    background(50);  // Background color

    textSize(32);
    fill(255, 25, 25);
    textAlign(CENTER, CENTER);

    // Display all zombies (walking dead MF)
    for (let i = 0; i < zombies.length; i++) {
      zombies[i].update();
      zombies[i].display();
    }

    // Display score and time
    textSize(32);
    fill(255, 0, 0);
    text("Score: " + score, 75, 40);
    text("Time: " + gameTimer, width - 160, 40);

    // Draw the shooter crosshair
    drawCrosshair();
  } else if (gameTimer <= 0 || health <= 0) {
    // Game over condition: timer or health reaches 0
    gameOver();
  }

  // Movement for aiming
  if (keyIsPressed) {
    if (keyIsDown(37)) {  // Left arrow for left
      shooterX -= movementSpeed;
    }
    if (keyIsDown(39)) {  // Right arrow for right
      shooterX += movementSpeed;
    }
    if (keyIsDown(38)) {  // Up arrow for up
      shooterY -= movementSpeed;
    }
    if (keyIsDown(40)) {  // Down arrow for down
      shooterY += movementSpeed;
    }
  }
}

// Keypress handler for shooter movement and starting the game
function keyPressed() {
  if (!gameStarted) {
    if (keyCode === 32) {  // Spacebar to start the game
      gameStarted = true;
      gameTimer = 60;  // Reset the timer
      score = 0;  // Reset the score
      health = 100;  // Reset health
      zombies = [];  // Clear any zombies
      addZombies();  // Add new zombies at the start
    }
    return;  // Prevent further key handling if the game hasn't started
  }

  // Restrict shooter movement within the canvas bounds
  shooterX = constrain(shooterX, 0, width);
  shooterY = constrain(shooterY, 0, height);

  // Restart the game when spacebar is pressed after game over
  if (gameTimer <= 0 || health <= 0) {
    if (keyCode === 32) {  // Spacebar to restart
      gameStarted = true;
      gameTimer = 60;  // Reset the timer
      score = 0;  // Reset the score
      health = 100;  // Reset health
      zombies = [];  // Clear zombies
      addZombies();  // Add new zombies at the start
    }
  }
}

// MousePressed handler to remove zombies based on left or right mouse button clicks
function mousePressed() {
  if (mouseButton === LEFT || mouseButton === RIGHT) {
    // Check if any zombie is within the cursor position (crosshair area)
    for (let i = zombies.length - 1; i >= 0; i--) {
      let d = dist(shooterX, shooterY, zombies[i].x, zombies[i].y);
      if (d <= crosshairSize / 2) {  // If the distance from the mouse to the zombie is within the crosshair
        score += zombies[i].score;  // Add points based on zombie type
        zombies.splice(i, 1);  // Remove zombie from the array
        break;  // Exit the loop once a zombie is hit
      }
    }
  }
}

function countdown() {
  if (gameStarted && gameTimer > 0) {
    gameTimer--;
  }
}

// Start menu showing instructions
function showStartMenu() {
  textSize(50);
  fill(255, 10, 10);
  textAlign(CENTER, CENTER);
  text("Zombieslanger", width / 2, height / 3);
  textSize(20);
  text("Press SPACE to Start", width / 2, height / 2);
}

// Draw crosshair (Duck Hunt style)
function drawCrosshair() {
  stroke(255, 0, 0);  // Red color for the crosshair
  strokeWeight(3);
  noFill();
  ellipse(shooterX, shooterY, crosshairSize);  // Draw outer circle of the crosshair
  line(shooterX - crosshairSize / 2, shooterY, shooterX + crosshairSize / 2, shooterY);  // Horizontal line
  line(shooterX, shooterY - crosshairSize / 2, shooterX, shooterY + crosshairSize / 2);  // Vertical line
}

// Zombie class for creating moving zombies (targets)
class Zombie {
  constructor(type) {
    this.type = type;
    this.reset();
  }

  update() {
    // Move the zombie
    this.x -= this.speed;

    if (this.x < -this.size || this.x > width + this.size || this.y < -this.size || this.y > height + this.size) {
      this.reset();
    }
  }

  display() {
    if (this.type === 'small') {
      fill(255, 165, 0);  // Orange for small zombies
      ellipse(this.x, this.y, this.size, this.size);
    } else if (this.type === 'special') {
      fill(255, 255, 0);  // Yellow for special zombie
      ellipse(this.x, this.y, this.size, this.size);
    } else if (this.type === 'fast') {
      fill(255, 0, 255);  // Magenta for fast zombies
      ellipse(this.x, this.y, this.size, this.size);
    } else {
      fill(0, 255, 0);  // Green for normal zombies
      ellipse(this.x, this.y, this.size, this.size);
    }
  }

  reset() {
    let spawnType = random() < 0.05 ? 'special' : (random() < 0.5 ? 'normal' : 'fast');
    this.type = spawnType;

    // Randomly choose spawn position
    let spawnSide = random(1);
    if (spawnSide < 0.33) {  // Spawn from top
      this.x = random(width);
      this.y = 0;
    } else if (spawnSide < 0.66) {  // Spawn from right
      this.x = width;
      this.y = random(height);
    } else {  // Spawn from left
      this.x = 0;
      this.y = random(height);
    }

    this.size = this.type === 'special' ? 60 : (this.type === 'small' ? 30 : 50);
    this.speed = random(2, 4);
    this.score = (this.type === 'special' ? 5 : (this.type === 'fast' ? 2 : 1));  // Fast zombies give 2 points, others give 1 or 5 (special)
  }
}

// Add multiple zombies at the start
function addZombies() {
  for (let i = 0; i < 10; i++) {
    zombies.push(new Zombie());
  }
}

// Display the player's health as a life bar
function displayHealth() {
  fill(255, 0, 0);  // Red color for health background
  noStroke();
  rect(20, height - 40, 200, 20);  // Health bar background
  fill(0, 255, 0);  // Green color for health
  rect(20, height - 40, map(health, 0, 100, 0, 200), 20);  // Health bar foreground
}

// Game over logic
function gameOver() {
  textSize(32);
  fill(255, 100, 150);
  textAlign(CENTER, CENTER);
  text("G a m e  O v e r !", width / 2, height / 2);
  textSize(20);
  text("S c o r e: " + score, width / 2, height / 2 + 40);
  textSize(20);
  text("P r e s s  S P A C E  t o  R e s t a r t ", width / 2, height / 2 + 80);
}
