let zombies = [];
let score = 0;
let shooterX, shooterY;
let isShooting = false;
let shot;
let bullets = 5;
let maxBullets = 5; 
let gameTimer = 50;
let gameStarted = false;
let movementSpeed = 4;
let shooterAngle = 0;  
let crosshairSize = 20;
let health = 100;
let powerUpActive = false;
let powerUpTimer = 0;  // Power-up timer

function setup() {
  createCanvas(800, 400);
  shooterX = width / 2;
  shooterY = height - 30;
  shot = { x: -1, y: -1, active: false };

  setInterval(countdown, 1000);  
}

function draw() {
  if (!gameStarted) {
    showStartMenu();  
  } else if (gameTimer > 0 && health > 0) {
    // Game is running
    background(50);  // background color

    textSize(32);
    fill(255, 25, 25);
    textAlign(CENTER, CENTER);
    text("Time: " + gameTimer, width / 2, height / 5 - 20);
 
    // Display all zombies (walking dead MF)
    for (let i = 0; i < zombies.length; i++) {
      zombies[i].update();
      zombies[i].display();
      
      // Handle collisions with zombies
      if (zombies[i].isHit(shooterX, shooterY)) {
        health -= zombies[i].damage;  // Apply zombie damage to health
        zombies[i].reset();  // Reset zombie position
        if (health <= 0) {
          health = 0;
          gameOver();  // you lose BT#CH
        }
      }

      // Check if special zombie is hit
      if (zombies[i].type === 'special' && zombies[i].isHit(shot.x, shot.y)) {
        score += 5;  // Extra points for special zombie
        zombies[i].reset();  // Reset special zombie position
        shot.active = false;  // Deactivate shot
      }
    }
    
    // Handle power-up timer
    if (powerUpActive) {
      powerUpTimer--;
      if (powerUpTimer <= 0) {
        powerUpActive = false;  // Deactivate power-up after 5 seconds
      }
    }

    // Draw the shooter (circle representing the player)
    fill(0, 255, 0);  // Green color for the shooter
    ellipse(shooterX, shooterY, 30, 30);  // Draw shooter

    // Calculate shooter angle based on mouse position
    shooterAngle = atan2(mouseY - shooterY, mouseX - shooterX);

    // Handle bullet logic
    if (shot.active) {
      shot.x += cos(shooterAngle) * 10;  // Bullet moves in shooter direction
      shot.y += sin(shooterAngle) * 10;

      // Check if shot hits any zombie
      for (let i = 0; i < zombies.length; i++) {
        if (zombies[i].isHit(shot.x, shot.y)) {
          score += zombies[i].score;  // Increase score based on zombie type
          zombies[i].reset();  // Reset zombie position
          shot.active = false;  // Deactivate shot
          break;  // Exit loop after hit
        }
      }

      // When the shot reaches the top of the screen, stop the shot
      if (shot.y <= 0) {
        shot.active = false;
      }
      
      // Draw the bullet (circle representing the shot)
      fill(255, 0, 0);  // Red color for the bullet
      ellipse(shot.x, shot.y, 10, 20);
    }

    // Display score and bullets
    textSize(32);
    fill(255, 0, 0);
    text("Score: " + score, 75, 40);
    text("Bullets: " + bullets, width - 160, 40);

    // Shoot when "e" is pressed and bullets are available
    if (isShooting && !shot.active && bullets > 0) {
      if (powerUpActive) {
        // Triple shots when power-up is active
        shootTriple();
      } else {
        // Normal single shot
        shot.active = true;
        shot.x = shooterX;
        shot.y = shooterY - 15;  // Position bullet slightly above the shooter
        isShooting = false;
        bullets--; // Reduce bullet count
      }
    }

    // Draw bullets below the shooter
    displayBullets();

    // Draw crosshair
    drawCrosshair();

    // Display the player's health as a life bar
    displayHealth();

  } else if (gameTimer <= 0 || health <= 0) {
    // Game over condition: timer or health reaches 0
    gameOver();
  }
}

// Keypress handler for shooter movement and shooting
function keyPressed() {
  if (!gameStarted) {
    if (keyCode === 32) {  // Spacebar to start the game
      gameStarted = true;
      gameTimer = 25;  // Reset the timer
      score = 0;  // Reset the score
      bullets = 5;  // Reset the bullets
      health = 100;  // Reset health
      zombies = [];  // Clear any zombies
      addZombies();  // Add new zombies at the start
    }
    return;  // Prevent further key handling if the game hasn't started
  }

  // Movement keys for shooter (WASD style movement)
  if (keyCode === 65 || keyCode === LEFT_ARROW) {  // 'A' or left arrow for left
    shooterX -= movementSpeed;
  } else if (keyCode === 68 || keyCode === RIGHT_ARROW) {  // 'D' or right arrow for right
    shooterX += movementSpeed;
  } else if (keyCode === 87 || keyCode === UP_ARROW) {  // 'W' or up arrow for up
    shooterY -= movementSpeed;
  } else if (keyCode === 83 || keyCode === DOWN_ARROW) {  // 'S' or down arrow for down
    shooterY += movementSpeed;
  }

  // Restrict shooter movement within the canvas bounds
  shooterX = constrain(shooterX, 0, width);
  shooterY = constrain(shooterY, 0, height);

  // Reload bullets with R
  if (key === 'r' || key === 'R') {
    reload();
  }

  // Restart game with SPACE
  if (key === ' ' && (gameTimer <= 0 || health <= 0)) {
    gameStarted = true;
    gameTimer = 25;  // Reset the timer
    score = 0;  // Reset the score
    bullets = 5;  // Reset the bullets
    health = 100;  // Reset health
    zombies = [];  // Clear any zombies
    addZombies();  // Add new zombies at the start
  }

  // Shooting with 'e' or 'E'
  if (key === 'e' || key === 'E') {
    isShooting = true;  // Trigger shooting action
  }
}

function mousePressed() {
  // Remove mouse click shooting logic since it's now replaced by the "e" key
  // Right mouse click to reload
  if (mouseButton === RIGHT) {
    reload();
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

// Display bullets below the shooter
function displayBullets() {
  for (let i = 0; i < bullets; i++) {
    fill(0, 0, 255);  // Blue color for bullets
    ellipse(width / 2 - 150 + (i * 30), height - 10, 20, 10);  // Draw bullets below shooter
  }
}

// Reload bullets
function reload() {
  if (bullets < maxBullets) {
    bullets = maxBullets;  // Reload to max bullets
  }
}

// Draw crosshair (Duck Hunt style)
function drawCrosshair() {
  stroke(255, 0, 0);  // Red color for the crosshair
  strokeWeight(3);
  noFill();
  ellipse(mouseX, mouseY, crosshairSize);  // Draw outer circle of the crosshair
  line(mouseX - crosshairSize / 2, mouseY, mouseX + crosshairSize / 2, mouseY);  // Horizontal line
  line(mouseX, mouseY - crosshairSize / 2, mouseX, mouseY + crosshairSize / 2);  // Vertical line
}

// Zombie class for creating moving zombies (targets)
class Zombie {
  constructor(type) {
    this.type = type;
    this.reset();
  }

  update() {
    // Move the zombie
    if (this.type === 'normal') {
      this.x -= this.speed;
    } else if (this.type === 'fast') {
      this.x -= this.speed * 2;
    } else if (this.type === 'small') {
      this.x -= this.speed;
      this.y += this.speed / 2;
    }

    if (this.spawnedFromTop) {
      this.y += this.speed;  // Move down
    }

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

  isHit(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.size;
  }

  reset() {
    let spawnType = random() < 0.05 ? 'special' : (random() < 0.5 ? 'normal' : 'fast');
    this.type = spawnType;

    // Randomly choose spawn position
    let spawnSide = random(1);
    if (spawnSide < 0.33) {  // Spawn from top
      this.x = random(width);
      this.y = 0;
      this.spawnedFromTop = true;
    } else if (spawnSide < 0.66) {  // Spawn from top-right
      this.x = width;
      this.y = 0;
      this.spawnedFromTop = false;
    } else {  // Spawn from right
      this.x = width;
      this.y = random(height);
      this.spawnedFromTop = false;
    }

    this.size = this.type === 'special' ? 60 : (this.type === 'small' ? 30 : 50);
    this.speed = random(2, 4);
    this.score = (this.type === 'special' ? 5 : (this.type === 'fast' ? 2 : 1));  // Fast zombies give 2 points, others give 1 or 5 (special)

    // Set damage based on zombie type
    this.damage = (this.type === 'fast') ? 15 : 10;  // Fast zombies deal 15% damage, normal deal 10%
  }
}

// Add multiple zombies at the start
function addZombies() {
  for (let i = 0; i < 10; i++) {
    zombies.push(new Zombie()); 
  }
}

// Shoot triple shots
function shootTriple() {
  for (let i = -1; i <= 1; i++) {
    let angleOffset = i * 0.1;  // Spread the shots
    let newShot = { x: shooterX, y: shooterY - 15, active: true };
    newShot.x += cos(shooterAngle + angleOffset) * 10;
    newShot.y += sin(shooterAngle + angleOffset) * 10;
    shot = newShot;
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

  text("P r e s s  S P A C E  t o  R e s t a r t ", width / 2, height / 2 + 80);
}
