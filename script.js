

document.addEventListener('DOMContentLoaded', function() {
const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startButton'); const pauseBtn = document.getElementById('pauseButton'); const muteBtn = document.getElementById('muteButton');
    const muteIcon = document.getElementById('muteIcon'); const muteText = document.getElementById('muteText'); const messageEl = document.getElementById('message');
    const scoreEl = document.getElementById('scoreDisplay'); const livesEl = document.getElementById('livesDisplay'); const overMsg = document.getElementById('gameOverMessage');
    const newBtn = document.getElementById('newGameButton'); const finalEl = document.getElementById('finalScore'); const highScoreEl = document.getElementById('highScoreDisplay');
    const container = document.querySelector('.container');
    const mobileControlsContainer = document.getElementById('mobileControlsContainer'); const joystickArea = document.getElementById('joystick-area');
    const joystickHandle = document.getElementById('joystick-handle'); const mobileShootButton = document.getElementById('mobile-shoot-button');
    const boostBarContainer = document.getElementById('boostBarContainer'); const boostBarFill = document.getElementById('boostBarFill');
    const comboDisplayEl = document.getElementById('comboDisplay'); const activePowerUpDisplayEl = document.getElementById('activePowerUpDisplay');
    const menuButton = document.getElementById('menuButton');
    const menuModal = document.getElementById('menuModal');
    const closeMenuModalBtn = document.getElementById('closeMenuModal');


    let dimensions = { width: 0, height: 0 };
    let ship, bullets = [], meteors = [], powerUps = [], explosions = [], lasers = [], comets = [], shieldBreakParticles = [], backgroundParticlesLayer1 = [], backgroundParticlesLayer2 = [], debrisParticles = [], lifePowerUps = [], shockwaves = [], floatingTexts = [], thrusterParticles = [];
    let score = 0, highScore = 0, gameRunning = false, paused = false, muted = false;
    let meteorIntervalId, gameFrameId = null, powerUpIntervalId; let keys = {}; let initialShipLives = 3;
    let mousePos = { x: 0, y: 0 }; let isMouseControlsActive = false;
    let joystickActive = false; let joystickStartX = 0; let joystickStartY = 0; let joystickHandleRadius = 25; let joystickAreaRadius = 50; const joystickDeadZone = joystickAreaRadius * 0.15;
    let currentOffensivePowerType = null; let biggerBulletsActive = false;
    let shieldActive = false; let shieldLevel = 0;
    let laserActive = false; let laserLevel = 1; const laserPulseDuration = 3;
    let multishotActive = false;
    let shockwaveActive = false;
    let shockwaveShotsRemaining = 0;
    let superPowerActive = false, superPowerTimer = 0; const superPowerDuration = 10 * 60;
    let boostMeteorKills = 0; const boostTargetKills = 70; let boostReady = false; let boostActive = false; let boostTimer = 0; const boostDuration = 10 * 60; let originalShipSpeed = 7;
    let backgroundParticleSpeedMultiplier = 1; let targetBackgroundSpeedMultiplier = 1; const backgroundSpeedEasing = 0.05;
    let comboCount = 0; let difficultyMultiplier = 1;
    const superBulletColors = ['#B19CD9'];
    const powerUpVisuals = { biggerBullets: { itemColor: '#22c55e', borderColor: '#a7f3d0', bulletColor: '#22c55e', displayName: "Balas Grandes" }, shield: { itemColor: '#0ea5e9', borderColor: '#bae6fd', bulletColor: null, displayName: "Escudo" }, laser: { itemColor: '#ef4444', borderColor: '#fca5a5', bulletColor: '#ef4444', displayName: "Rayo Láser" }, multishot: { itemColor: '#FFA500', borderColor: '#fed8b1', bulletColor: '#FFA500', displayName: "Multidisparo" }, shockwave: { itemColor: '#C0C0C0', borderColor: '#FFFFFF', bulletColor: null, displayName: "Onda Expansiva" }, super: { itemColor: '#FFD700', borderColor: '#FFFACD', bulletColor: null, displayName: "SUPER PODER"} };
    let synth, explosionSynth, gameOverSynth, hitSynth, powerUpSynth, metallicHitSynth, superPowerSynth, shieldBreakSynth; let laserShootSynth, shockwaveSynth, superPowerPickupSynth, boostSynth;
    let cometSpawnTimer = 0; const cometSpawnIntervalMin = 25 * 60; const cometSpawnIntervalMax = 40 * 60; let nextCometSpawnTime = cometSpawnIntervalMin + Math.random() * (cometSpawnIntervalMax - cometSpawnIntervalMin);
    let lifeSpawnTimer = 0; const lifeSpawnInterval = 300;
    const MAX_BG_PARTICLES = 45; const BG_PARTICLE_SPAWN_INTERVAL = 3; let framesSinceLastBgParticle = 0;
    let gameFrameCounter = 0; let isGiantCometScheduled = false; let giantCometSpawnFrame = -1; let giantCometParams = null;
    let comboDisplayTimeoutId = null; let activePowerUpDisplayTimeoutId = null;
    function getDifficultyFactor() {
        const baseDifficultyIncrease = 0.30;
        const scoreThreshold = 200;
        const maxFactor = 5.0;
        let factor = 1 + (Math.floor(score / scoreThreshold) * baseDifficultyIncrease);
        factor *= difficultyMultiplier;
        return Math.min(factor, maxFactor);
    }

async function initAudio() {
    try {
        if (typeof Tone === 'undefined') {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/tone@14.8.39/build/Tone.min.js';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }
        if (Tone.context.state === 'suspended') await Tone.start();
        if (synth) return;
        synth = new Tone.Synth({ oscillator:{type:'triangle'}, envelope:{attack:0.01,decay:0.1,sustain:0.05,release:0.1} }).toDestination();
        explosionSynth = new Tone.NoiseSynth({ noise:{type:'white'}, envelope:{attack:0.005,decay:0.1,sustain:0,release:0.1} }).toDestination();
        hitSynth = new Tone.MembraneSynth({ pitchDecay:0.02, octaves:5, oscillator:{type:'sine'}, envelope:{attack:0.001,decay:0.2,sustain:0.01,release:0.2} }).toDestination();
        gameOverSynth = new Tone.Synth({ oscillator:{type:'sawtooth'}, envelope:{attack:0.1,decay:0.5,sustain:0.1,release:0.5} }).toDestination();
        powerUpSynth = new Tone.Synth({ oscillator:{type:'sine'}, envelope:{attack:0.01,decay:0.2,sustain:0.1,release:0.3} }).toDestination();
        metallicHitSynth = new Tone.MetalSynth({ frequency: 100, envelope: { attack: 0.001, decay: 0.1, release: 0.05 }, harmonicity: 3.1, modulationIndex: 16, resonance: 2000, octaves: 0.5 }).toDestination();
        metallicHitSynth.volume.value = -10;
        superPowerSynth = new Tone.Synth({ oscillator: { type: 'fatsawtooth', count: 3, spread: 30 }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 }, volume: -15 }).toDestination();
        shieldBreakSynth = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 }, volume: -8 }).toDestination();
        const shieldBreakFilter = new Tone.Filter(1500, 'highpass').connect(shieldBreakSynth.output);
        shieldBreakSynth.connect(shieldBreakFilter);
        laserShootSynth = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.001, decay: 0.03, sustain: 0.001, release: 0.05 }, volume: -15 }).toDestination();
        shockwaveSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 }, volume: -8 }).toDestination();
        superPowerPickupSynth = new Tone.Synth({ oscillator:{type:'square'}, envelope:{attack:0.01,decay:0.4,sustain:0.01,release:0.4}, volume: -5 }).toDestination();
        boostSynth = new Tone.Synth({ oscillator: { type: 'pwm', modulationFrequency: 0.2 }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.4 }, volume: -10 }).toDestination();
    } catch (e) {
        console.error('Error initializing Tone.js synths:', e);
        muted = true;
        if (muteText) muteText.textContent = 'Sonido ERR';
    }
}
    function updateDimensions() { const cont = document.querySelector('.container'); let w = cont.clientWidth; const maxWStyle = getComputedStyle(cont).maxWidth; if (maxWStyle && maxWStyle !== 'none') { const maxW = parseInt(maxWStyle,10); if (w > maxW) w = maxW; } const aspectRatio = 3/4; let h = w / aspectRatio; const reservedSpace = 120 + 20 + 20; const maxHViewport = window.innerHeight - reservedSpace; if (h > maxHViewport) { h = maxHViewport; w = h * aspectRatio; } if (w < 200) { w = 200; h = w / aspectRatio; } dimensions = { width: w, height: h }; canvas.width = w; canvas.height = h; if (ship) { ship.size = Math.max(30, dimensions.width * 0.08); if (!isMouseControlsActive) { ship.x = (dimensions.width - ship.size) / 2; ship.y = dimensions.height - ship.size - 10; } else { ship.x = Math.min(Math.max(0, ship.x), dimensions.width - ship.size); ship.y = Math.min(Math.max(0, ship.y), dimensions.height - ship.size); } } }
    if (typeof ResizeObserver !== 'undefined') { new ResizeObserver(updateDimensions).observe(document.querySelector('.container')); } else { window.addEventListener('resize', updateDimensions); }

    class Ship {
      constructor() { this.size = Math.max(30, dimensions.width * 0.08); this.x = (dimensions.width - this.size) / 2; this.y = dimensions.height - this.size - 10; this.speed = 7; originalShipSpeed = this.speed; this.color = '#3b82f6'; this.lives = initialShipLives; this.invincible = false; this.invincibilityTimer = 0; this.invincibilityDuration = 120; this.velX = 0; this.velY = 0; this.targetVelX = 0; this.targetVelY = 0; this.easingFactor = 0.15; this.multishotLevel = 1; this.laserLevel = 1; this.shieldLevel = 0; this.thrusterFrame = 0;}
      draw() {
          ctx.save(); if (this.invincible && Math.floor(this.invincibilityTimer/10)%2===0) { ctx.globalAlpha=0.5; }
          const shipColor = superPowerActive ? '#B19CD9' : this.color; ctx.translate(this.x + this.size/2, this.y + this.size/2);
          ctx.beginPath(); ctx.moveTo(0, -this.size/2); ctx.lineTo(this.size/2.5, this.size/2.5); ctx.lineTo(this.size/4, this.size/2); ctx.lineTo(-this.size/4, this.size/2); ctx.lineTo(-this.size/2.5, this.size/2.5); ctx.closePath();
          ctx.fillStyle = shipColor; ctx.fill(); ctx.shadowColor = shipColor; ctx.shadowBlur = superPowerActive ? 25 : 15; ctx.lineWidth = 2; ctx.strokeStyle = superPowerActive ? '#8A2BE2' : '#6ee7b7'; ctx.stroke();

          if (laserActive) { const indicatorRadius = 5; const pulseFactor = 0.8 + Math.sin(Date.now() * 0.01) * 0.2; ctx.beginPath(); ctx.arc(0, -this.size / 2 - indicatorRadius - 2, indicatorRadius * pulseFactor, 0, Math.PI * 2); const laserGrad = ctx.createRadialGradient(0, -this.size / 2 - indicatorRadius - 2, 0, 0, -this.size / 2 - indicatorRadius - 2, indicatorRadius * pulseFactor); laserGrad.addColorStop(0, 'rgba(255, 200, 200, 0.9)'); laserGrad.addColorStop(0.7, 'rgba(255, 0, 0, 0.6)'); laserGrad.addColorStop(1, 'rgba(200, 0, 0, 0.3)'); ctx.fillStyle = laserGrad; ctx.shadowColor = 'red'; ctx.shadowBlur = 15 * pulseFactor; ctx.fill(); ctx.shadowBlur = 0; }
          if (shockwaveActive) { const pulseRadius = this.size * 0.6 + Math.sin(Date.now() * 0.008) * 3; const pulseAlpha = 0.3 + Math.sin(Date.now() * 0.008) * 0.2; ctx.beginPath(); ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2); const shockGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseRadius); shockGrad.addColorStop(0, `rgba(220, 220, 255, ${pulseAlpha})`); shockGrad.addColorStop(0.7, `rgba(192, 192, 192, ${pulseAlpha * 0.7})`); shockGrad.addColorStop(1, `rgba(180, 180, 180, ${pulseAlpha * 0.4})`); ctx.fillStyle = shockGrad; ctx.fill(); }

          ctx.restore(); // Restore from ship translation

          // Thruster particles
          this.thrusterFrame++;
          const isMoving = Math.abs(this.velX) > 0.1 || Math.abs(this.velY) > 0.1 || boostActive;
          if (isMoving && !boostActive && this.thrusterFrame % 3 === 0) { // Only show if not boosting
              const numParticles = 1;
              for (let i = 0; i < numParticles; i++) {
                  thrusterParticles.push(new ThrusterParticle(this.x + this.size / 2, this.y + this.size * 0.8));
              }
          }


          if (shieldActive) {
              ctx.save(); const centerX = this.x + this.size / 2; const centerY = this.y + this.size / 2;
              let baseRadius = this.size / 2 + 10;
              if(this.shieldLevel === 2) baseRadius = this.size / 2 + 15;
              else if (this.shieldLevel >= 3) baseRadius = this.size / 2 + 20;
              const pulse = Math.sin(Date.now() * 0.005) * 2;
              ctx.beginPath(); ctx.arc(centerX, centerY, baseRadius + 4 + pulse, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, 200, 255, ${0.05 + (this.shieldLevel / 3) * 0.08})`; ctx.fill();
              ctx.beginPath(); ctx.arc(centerX, centerY, baseRadius + pulse, 0, Math.PI * 2);
              const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.3, centerX, centerY, baseRadius + pulse);
              const shieldOpacity = 0.15 + (this.shieldLevel / 3) * 0.25;
              gradient.addColorStop(0, `rgba(173, 230, 255, ${shieldOpacity + 0.1})`); gradient.addColorStop(0.7, `rgba(0, 191, 255, ${shieldOpacity})`); gradient.addColorStop(1, `rgba(0, 150, 220, ${shieldOpacity - 0.05 < 0 ? 0 : shieldOpacity - 0.05})`);
              ctx.fillStyle = gradient; ctx.fill(); ctx.restore();
          }
       }
      update() {
          if (isMouseControlsActive && ship) { const targetX = mousePos.x - this.size / 2; const targetY = mousePos.y - this.size / 2; this.x += (targetX - this.x) * 0.22; this.y += (targetY - this.y) * 0.22; }
          else {
              this.velX += (this.targetVelX - this.velX) * this.easingFactor;
              this.velY += (this.targetVelY - this.velY) * this.easingFactor;
              this.x += this.velX; this.y += this.velY;
          }
          this.x = Math.max(0, Math.min(this.x, dimensions.width - this.size)); this.y = Math.max(0, Math.min(this.y, dimensions.height - this.size));
          if (this.invincible && this.invincibilityTimer > 0) { this.invincibilityTimer--; if (this.invincibilityTimer <= 0 && !boostActive) this.invincible = false; }
      }
      shoot() { if (superPowerActive) { const numSuperBullets = 5; const angleIncrement = Math.PI / 6; const baseAngle = -Math.PI / 2; for (let i = 0; i < numSuperBullets; i++) { const angle = baseAngle + (i - Math.floor(numSuperBullets / 2)) * angleIncrement; const speed = 7; const bulletX = this.x + this.size / 2; const bulletY = this.y; const color = superBulletColors[0]; bullets.push(new Bullet(bulletX, bulletY, 8, 8, speed, color, angle, 'super')); } playSound('superPowerShoot'); } else if (laserActive) { const baseAngle = -Math.PI / 2; const angleSpread = 5 * Math.PI / 180; const numLasers = Math.min(5, 1 + (this.laserLevel -1) * 2); for(let i = 0; i < numLasers; i++){ const angleOffset = (i - Math.floor((numLasers-1)/2)) * angleSpread; lasers.push(new LaserBeam(this.x + this.size/2, this.y, laserPulseDuration, baseAngle + angleOffset)); } playSound('laserShoot'); } else if (shockwaveActive) { shockwaves.push(new Shockwave(this.x + this.size / 2, this.y + this.size / 2)); playSound('shockwave'); shockwaveShotsRemaining--; if(shockwaveShotsRemaining<=0){ shockwaveActive=false; currentOffensivePowerType=null; showMessage('¡Onda Expansiva Agotada!',2000); } } else { let shots = multishotActive ? [1, 2, 3, 4, 5][this.multishotLevel -1] : 1; if (bullets.length + shots > (multishotActive ? 12 : 8) ) return; let bulletColor = '#f59e0b'; let bulletType = 'normal'; if (biggerBulletsActive) { bulletColor = powerUpVisuals.biggerBullets.bulletColor; bulletType = 'bigger';} else if (multishotActive) { bulletColor = powerUpVisuals.multishot.bulletColor; } for (let i = 0; i < shots; i++) { const bulletWidth = biggerBulletsActive ? 12 : 5; const bulletHeight = biggerBulletsActive ? 22 : 12; const spacing = bulletWidth * 2.5; const xOffset = (i - (shots - 1) / 2) * spacing; const bulletX = this.x + this.size/2 - bulletWidth/2 + xOffset; const bulletY = this.y - bulletHeight; bullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight, 10, bulletColor, -Math.PI / 2, bulletType)); } playSound('shoot'); } }

      hit() {
          if (this.invincible) return;
          if (shieldActive) {
              this.shieldLevel--;
              if (this.shieldLevel <= 0) {
                  shieldActive = false;
                  shieldBreakParticles.push(new ShieldShards(this.x + this.size / 2, this.y + this.size / 2, 10, this.size));
                  playSound('shieldBreak');
              } else {
                  playSound('hit');
              }
              return;
          }
          this.lives--;
          updateLivesDisplay();
          this.invincible = true;
          this.invincibilityTimer = this.invincibilityDuration;
          playSound('hit');
      }
      loseAllLives() { this.lives = 0; updateLivesDisplay(); gameOver(); }
    }

    class Bullet {
      constructor(x, y, width, height, speed, color, angle = -Math.PI / 2, type = 'normal') { this.x = x; this.y = y; this.width = width; this.height = height; this.speed = speed; this.color = color; this.angle = angle; this.type = type; this.speedX = Math.cos(this.angle) * this.speed; this.speedY = Math.sin(this.angle) * this.speed; }
      draw() {
          ctx.save(); ctx.fillStyle = this.color; ctx.shadowColor = this.color; ctx.shadowBlur = 8;
          if(this.type === 'bigger'){ ctx.beginPath(); ctx.moveTo(this.x, this.y - this.height / 2); ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2); ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2); ctx.closePath(); ctx.fill(); }
          else { ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height); }
          ctx.restore();
      }
      update() { this.x += this.speedX; this.y += this.speedY; }
    }

    class LaserBeam {
        constructor(x, shipTopY, duration, angle = -Math.PI / 2) { this.x = x; this.shipTopY = shipTopY; this.maxWidth = 10; this.life = duration; this.maxLife = duration; this.color = powerUpVisuals.laser.bulletColor; this.angle = angle; }
        update() { this.life--; }
        draw() {
            if (this.life <= 0) return;
            const lifeRatio = this.life / this.maxLife;
            const currentWidth = this.maxWidth * (0.5 + Math.sin(lifeRatio * Math.PI) * 0.5);
            const alpha = 0.8 + Math.sin(lifeRatio * Math.PI) * 0.2;
            ctx.save();
            ctx.translate(this.x, this.shipTopY);
            ctx.rotate(this.angle + Math.PI / 2);
            ctx.translate(-this.x, -this.shipTopY);

            const gradient = ctx.createLinearGradient(this.x - currentWidth / 2, 0, this.x + currentWidth / 2, 0);
            gradient.addColorStop(0, `rgba(255, 100, 100, ${alpha * 0.5})`); gradient.addColorStop(0.3, `rgba(255, 180, 180, ${alpha * 0.8})`); gradient.addColorStop(0.5, `rgba(255, 255, 220, ${alpha})`); gradient.addColorStop(0.7, `rgba(255, 180, 180, ${alpha * 0.8})`); gradient.addColorStop(1, `rgba(255, 100, 100, ${alpha * 0.5})`);
            ctx.fillStyle = gradient; ctx.shadowColor = 'rgba(255, 0, 0, 0.9)'; ctx.shadowBlur = 40;
            ctx.fillRect(this.x - currentWidth / 2, 0, currentWidth, this.shipTopY);
            ctx.restore();
        }
    }
    class Meteor { constructor(x,y,radius,speedY, type = 'normal') { this.x = x; this.y = y; this.radius = radius; this.size = radius * 2; this.speedY = speedY; this.type = type; const maxAngleRad = 7 * Math.PI / 180; const angle = (Math.random() * 2 - 1) * maxAngleRad; this.speedX = this.speedY * Math.tan(angle); this.rotation = Math.random()*Math.PI*2; this.rotationSpeed = (Math.random()-0.5)*0.05; this.vertices = []; const vCount = Math.floor(Math.random()*5)+5; for (let i=0; i<vCount; i++){ const angleV = (i/vCount)*Math.PI*2; const r = this.radius*(0.7 + Math.random()*0.6); this.vertices.push({ x:Math.cos(angleV)*r, y:Math.sin(angleV)*r }); } if (this.type === 'metallic') { this.hitsRequired = 3; this.currentHits = 0; this.baseColor = { r: 192, g: 192, b: 192 }; this.color = `rgb(${this.baseColor.r},${this.baseColor.g},${this.baseColor.b})`; } else { this.color = `hsl(${Math.random()*60+180},70%,60%)`; this.hitsRequired = 1; this.currentHits = 0; } } draw() { ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.rotation); ctx.beginPath(); this.vertices.forEach((v,i)=> i===0?ctx.moveTo(v.x,v.y):ctx.lineTo(v.x,v.y)); ctx.closePath(); if (this.type === 'metallic') { const hitRatio = this.currentHits / this.hitsRequired; const r = Math.max(0, this.baseColor.r * (1 - hitRatio * 0.5)); const g = Math.max(0, this.baseColor.g * (1 - hitRatio * 0.5)); const b = Math.max(0, this.baseColor.b * (1 - hitRatio * 0.5)); ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`; ctx.strokeStyle = `rgb(${Math.max(0,r-30)},${Math.max(0,g-30)},${Math.max(0,b-30)})`; } else { ctx.fillStyle=this.color; const hueMatch = this.color.match(/hsl\((\d+)/); if (hueMatch && hueMatch[1]) { const hue = (parseFloat(hueMatch[1])+20)%360; ctx.strokeStyle=`hsl(${hue},90%,75%)`; } else { ctx.strokeStyle = '#FFFFFF'; } } ctx.lineWidth=this.type === 'metallic' ? 3 : 2; ctx.shadowColor=this.type === 'metallic' ? `rgb(${this.baseColor.r},${this.baseColor.g},${this.baseColor.b})` : this.color; ctx.shadowBlur=10; ctx.fill(); ctx.stroke(); ctx.restore(); } update() { this.y+=this.speedY; this.x+=this.speedX; this.rotation += this.rotationSpeed; } takeHit(bullet) { if (this.type === 'metallic') { playSound('metallicHit'); } this.currentHits++; return this.currentHits >= this.hitsRequired; } }

    class Comet {
        constructor(x, y, sizeCategory, speedX, speedY, type = 'normal') {
            this.x = x; this.y = y; this.sizeCategory = sizeCategory; this.type = type;
            this.baseRadius = 0; this.approxRadius = 0; this.hitsRequired = 10; this.points = 100; this.baseSpeedFactor = 1.0;
            this.color = '#FFFFFF'; this.borderColor = '#EEEEEE'; this.shadowBlur = 40; this.debrisSpawnInterval = 2; this.debrisBaseLife = 40; this.debrisBaseSizeFactor = 0.6;

            if (this.type === 'giant') {
                this.baseRadius = dimensions.width * 0.25; this.hitsRequired = Infinity; this.points = 0; this.baseSpeedFactor = 0.5;
                this.color = '#FFDDDD'; this.borderColor = '#FFCCCC'; this.shadowBlur = 60; this.debrisSpawnInterval = 1; this.debrisBaseLife = 60; this.debrisBaseSizeFactor = 0.4;
            } else {
                 const speedRand = Math.random();
                 if (speedRand < 0.2) this.baseSpeedFactor = 0.6;
                 else if (speedRand < 0.8) this.baseSpeedFactor = 1.0 + (Math.random() - 0.3);
                 else this.baseSpeedFactor = 1.6 + Math.random() * 0.4;

                switch(sizeCategory) { case 'small': this.baseRadius = dimensions.width * 0.035; this.hitsRequired = 15; this.points = 150; this.baseSpeedFactor *= 1.15; break; case 'medium': this.baseRadius = dimensions.width * 0.050; this.hitsRequired = 20; this.points = 200; this.baseSpeedFactor *= 1.0; break; case 'large': this.baseRadius = dimensions.width * 0.065; this.hitsRequired = 25; this.points = 250; this.baseSpeedFactor *= 0.85; break; default: this.baseRadius = dimensions.width * 0.040; this.hitsRequired = 15; this.points = 150; this.baseSpeedFactor *= 1.0; }
            }

            this.speedX = speedX * this.baseSpeedFactor; this.speedY = speedY * this.baseSpeedFactor;
            this.currentHits = 0;
            this.vertices = [];
            const vCount = Math.floor(Math.random() * 4) + (this.type === 'giant' ? 13 : 9);
            let maxDist = 0;
            const variation = this.type === 'giant' ? 0.2 : 0.6;
            const minFactor = this.type === 'giant' ? 0.9 : 0.7;
            const ellipseX = this.type === 'giant' ? (1 + (Math.random() - 0.5) * 0.5) : 1;
            const ellipseY = this.type === 'giant' ? (1 + (Math.random() - 0.5) * 0.5) : 1;
            for (let i = 0; i < vCount; i++) {
                const angle = (i / vCount) * Math.PI * 2;
                const r = this.baseRadius * (minFactor + Math.random() * variation);
                const vx = Math.cos(angle) * r * ellipseX;
                const vy = Math.sin(angle) * r * ellipseY;
                this.vertices.push({ x: vx, y: vy });
                maxDist = Math.max(maxDist, Math.sqrt(vx * vx + vy * vy));
            }
            this.approxRadius = maxDist; this.rotation = Math.atan2(this.speedY, this.speedX) + Math.PI / 2; this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.framesSinceLastDebris = 0;
        }
        draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation); ctx.beginPath(); this.vertices.forEach((v, i) => i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y)); ctx.closePath(); ctx.fillStyle = this.color; if (this.type !== 'giant' && this.currentHits > 0 && Math.floor(Date.now() / 100) % 2 === 0) { ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = 3; } else { ctx.strokeStyle = this.borderColor; ctx.lineWidth = 2; } ctx.shadowColor = this.color; ctx.shadowBlur = this.shadowBlur; ctx.fill(); ctx.stroke(); ctx.restore(); }
        update() { this.x += this.speedX; this.y += this.speedY; this.rotation += this.rotationSpeed; this.framesSinceLastDebris++; if (this.framesSinceLastDebris >= this.debrisSpawnInterval) { const debrisAngle = Math.atan2(-this.speedY, -this.speedX) + (Math.random() - 0.5) * 0.9; const numParticles = (this.type === 'giant' ? 3 : 2) + Math.floor(Math.random() * 2); for(let i=0; i<numParticles; i++){ const particleOffsetX = (Math.random() - 0.5) * this.approxRadius * 0.5; const particleOffsetY = (Math.random() - 0.5) * this.approxRadius * 0.5; debrisParticles.push(new DebrisParticle(this.x + particleOffsetX, this.y + particleOffsetY, 1, this.approxRadius * this.debrisBaseSizeFactor, this.color, debrisAngle + (Math.random() - 0.5) * 0.2, this.debrisBaseLife + Math.random()*20)); } this.framesSinceLastDebris = 0; } }
        takeHit(bullet) { if(this.type === 'giant' && bullet.type !== 'super') return false; if(this.type === 'giant' && bullet.type === 'super') { this.explodeSpectacularly(); return true; } this.currentHits++; playSound('metallicHit'); return this.currentHits >= this.hitsRequired; }
        isOffScreen() { const margin = this.approxRadius * 1.5; return this.y > dimensions.height + margin || this.y < -margin || this.x < -margin || this.x > dimensions.width + margin; }
        explodeSpectacularly() { for(let i=0; i < 50; i++) { const angle = Math.random() * Math.PI * 2; const speed = 2 + Math.random() * 4; const size = this.approxRadius * 0.05 + Math.random() * (this.approxRadius * 0.1); debrisParticles.push(new DebrisParticle(this.x, this.y, 1, size, this.color, angle, 40 + Math.random() * 40)); } playSound('explosion'); playSound('explosion'); }
    }

    class DebrisParticle {
        constructor(x, y, numShards, baseSize, color, baseAngle, baseLife = 30) {
            this.particles = []; this.color = color || '#FFFFFF';
            for (let i = 0; i < numShards; i++) {
                const angle = baseAngle + (Math.random() - 0.5) * 0.6; const speed = 1.0 + Math.random() * 1.5; const size = baseSize * 0.1 + Math.random() * (baseSize * 0.15);
                this.particles.push({ x: x, y: y, size: size, speedX: Math.cos(angle) * speed, speedY: Math.sin(angle) * speed, life: baseLife + Math.random() * (baseLife * 0.5), rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.1, points: [ { x: 0, y: -size / 2 }, { x: -size / 2.5, y: size / 2.5 }, { x: size / 2.5, y: size / 2.5 } ] });
            }
        }
        update() { this.particles.forEach(p => { p.x += p.speedX; p.y += p.speedY; p.rotation += p.rotationSpeed; p.life--; }); this.particles = this.particles.filter(p => p.life > 0); }
        draw() { this.particles.forEach(p => { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.beginPath(); p.points.forEach((point, index) => { index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y); }); ctx.closePath(); const particleColor = (this.color === '#FFFFFF' && Math.random() < 0.3) ? '#FFFF99' : this.color; const rgb = hexToRgb(particleColor); ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.life / 50})`; ctx.fill(); ctx.restore(); }); }
        isFinished() { return this.particles.length === 0; }
    }

    class ShieldShards { constructor(x, y, numShards, shipSize, color) { this.x = x; this.y = y; this.particles = []; this.color = color || '#00BFFF'; for (let i = 0; i < numShards; i++) { const angle = (Math.PI * 2 / numShards) * i + (Math.random() - 0.5) * 0.5; const speed = 1.5 + Math.random() * 2; const size = shipSize * 0.1 + Math.random() * (shipSize * 0.15); this.particles.push({ x: this.x, y: this.y, size: size, speedX: Math.cos(angle) * speed, speedY: Math.sin(angle) * speed, life: 30 + Math.random() * 30, rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.1, points: [ { x: 0, y: -size / 2 }, { x: -size / 2.5, y: size / 2.5 }, { x: size / 2.5, y: size / 2.5 } ] }); } } update() { this.particles.forEach(p => { p.x += p.speedX; p.y += p.speedY; p.rotation += p.rotationSpeed; p.life--; }); this.particles = this.particles.filter(p => p.life > 0); } draw() { this.particles.forEach(p => { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.beginPath(); p.points.forEach((point, index) => { index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y); }); ctx.closePath(); ctx.fillStyle = `rgba(${hexToRgb(this.color).r}, ${hexToRgb(this.color).g}, ${hexToRgb(this.color).b}, ${p.life / 60})`; ctx.fill(); ctx.strokeStyle = `rgba(${hexToRgb(this.color).r - 30}, ${hexToRgb(this.color).g - 30}, ${hexToRgb(this.color).b - 30}, ${p.life / 50})`; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }); } isFinished() { return this.particles.length === 0; } }
    function hexToRgb(hex) { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : {r:0, g:0, b:0}; }
    class Explosion { constructor(x,y,baseColor, particleCount = 20, speedFactor = 8, lifeFactor = 30) { this.x=x; this.y=y; this.baseColor=baseColor; this.particles = []; const count = Math.random()* (particleCount/2) + (particleCount/2); for (let i=0;i<count;i++){ this.particles.push({ x:this.x, y:this.y, size:Math.random()*3+1, speedX:(Math.random()-0.5)*(Math.random()*speedFactor), speedY:(Math.random()-0.5)*(Math.random()*speedFactor), life:Math.random()*lifeFactor+lifeFactor }); } } update() { this.particles.forEach(p=>{ p.x+=p.speedX; p.y+=p.speedY; p.life--; }); this.particles = this.particles.filter(p=>p.life>0); } draw() { this.particles.forEach(p=>{ ctx.fillStyle = `rgba(${this.baseColor.r},${this.baseColor.g},${this.baseColor.b},${p.life/60})`; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); }); } isFinished() { return this.particles.length===0; } }
    class PowerUp {
        constructor(x,y,size,type) { this.x=x; this.y=y; this.size=size; this.radius=size/2; this.type=type; const visuals = powerUpVisuals[type] || { itemColor: '#ffffff', borderColor: '#cccccc', displayName: "Power-Up" }; this.color = visuals.itemColor; this.borderColor = visuals.borderColor; this.displayName = visuals.displayName; this.speedY=1.5; }
        draw() {
            ctx.save();
            ctx.beginPath(); ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
            ctx.fillStyle=this.color; ctx.shadowColor=this.color; ctx.shadowBlur=20;
            if (this.type === 'super') {
                const pulseFactor = 0.8 + Math.sin(Date.now() * 0.006) * 0.2;
                ctx.shadowBlur = 30 * pulseFactor;
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * pulseFactor);
                gradient.addColorStop(0, 'rgba(255, 255, 220, 1)');
                gradient.addColorStop(0.6, this.color);
                gradient.addColorStop(1, this.borderColor);
                ctx.fillStyle = gradient;
            }
            ctx.fill();
            ctx.strokeStyle=this.borderColor; ctx.lineWidth=3; ctx.stroke();
            ctx.beginPath(); ctx.arc(this.x-this.radius/3,this.y-this.radius/3,this.radius/4,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill();
            ctx.restore();
        }
        update() { this.y+=this.speedY; }
    }
    class LifePowerUp { constructor(x,y,size) { this.x=x; this.y=y; this.size=size; this.radius=size/2; this.type='life'; this.speedY=1.8; this.color = '#FF69B4'; } draw() { ctx.save(); ctx.font = `${this.size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = this.color; ctx.shadowColor = this.color; ctx.shadowBlur = 15; ctx.fillText('❤️', this.x, this.y); ctx.restore(); } update() { this.y+=this.speedY; } }
    class BackgroundParticle { constructor(layer = 1) { this.layer = layer; this.x = Math.random() * dimensions.width; this.y = Math.random() * dimensions.height; this.size = (Math.random() * 1.5 + 0.5) / this.layer; this.baseSpeedY = (0.2 + Math.random() * 0.8) / this.layer; this.opacity = (0.1 + Math.random() * 0.3) / (this.layer * 0.5); this.color = Math.random() < 0.7 ? `rgba(220, 220, 255, ${this.opacity})` : `rgba(255, 255, 255, ${this.opacity})`; } update() { this.y += this.baseSpeedY * backgroundParticleSpeedMultiplier; if (this.y > dimensions.height + this.size) { this.y = -this.size; this.x = Math.random() * dimensions.width; } } draw() { ctx.fillStyle = this.color; if(boostActive){ const length = this.baseSpeedY * backgroundParticleSpeedMultiplier * 0.8 * (3 - this.layer); ctx.fillRect(this.x - this.size/4, this.y - length/2, this.size/2, length); } else { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } } }
    class Shockwave {
        constructor(x, y) { this.x = x; this.y = y; this.radius = 0; this.maxRadius = Math.max(dimensions.width, dimensions.height) * 0.8; this.life = 30; this.maxLife = 30; this.color = '#FFFFFF'; }
        update() { this.radius += (this.maxRadius - this.radius) * 0.1; this.life--; }
        draw() { if(this.life <= 0) return; const alpha = (this.life / this.maxLife) * 0.9; ctx.save(); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); const grad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.6, this.x, this.y, this.radius); grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`); grad.addColorStop(0.7, `rgba(220, 220, 255, ${alpha * 0.7})`); grad.addColorStop(1, `rgba(192, 192, 220, 0)`); ctx.strokeStyle = grad; ctx.lineWidth = 6 + (1 - this.life / this.maxLife) * 12; ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.8})`; ctx.shadowBlur = 50; ctx.stroke(); ctx.restore(); }
        isFinished() { return this.life <= 0; }
    }
    class FloatingText { constructor(text, x, y, color = '#FFFF99') { this.text = text; this.x = x; this.y = y; this.color = color; this.life = 60; this.opacity = 1; this.speedY = -0.5; } update() { this.y += this.speedY; this.life--; this.opacity = this.life / 60; } draw() { ctx.save(); ctx.globalAlpha = this.opacity; ctx.fillStyle = this.color; ctx.font = "0.7rem 'Press Start 2P'"; ctx.textAlign = 'center'; ctx.fillText(this.text, this.x, this.y); ctx.restore(); } isFinished() { return this.life <= 0; } }
    class ThrusterParticle { constructor(x, y) { this.x = x; this.y = y; this.size = Math.random() * 2 + 1; this.speedY = 1 + Math.random() * 2; this.speedX = (Math.random() - 0.5) * 1.5; this.life = 20 + Math.random() * 20; this.maxLife = this.life; this.color = `rgba(0, 150, 255, ${Math.random() * 0.5 + 0.3})`; } update() { this.y += this.speedY; this.x += this.speedX; this.life--; } draw() { if (this.life <= 0) return; ctx.save(); ctx.globalAlpha = (this.life / this.maxLife) * 0.8; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size * (this.life / this.maxLife), 0, Math.PI * 2); ctx.fill(); ctx.restore(); } isFinished() { return this.life <= 0; } }


function playSound(type) {
    if (muted || typeof Tone === 'undefined') return;
    try {
        if (!Tone.context || Tone.context.state !== 'running') return;
        const now = Tone.now();
        let bulletSoundColor = biggerBulletsActive ? powerUpVisuals.biggerBullets.bulletColor : (multishotActive ? powerUpVisuals.multishot.bulletColor : '#f59e0b');
        let note = 'C5';
        if (biggerBulletsActive) note = 'A4';
        else if (multishotActive) note = 'E4';
        if (type=='shoot' && synth) synth.triggerAttackRelease(note,'8n',now);
        else if (type==='laserShoot' && laserShootSynth) { laserShootSynth.triggerAttackRelease("G5", "32n", now); }
        else if (type==='explosion' && explosionSynth) explosionSynth.triggerAttackRelease('0.2n',now);
        else if (type==='hit' && hitSynth) hitSynth.triggerAttackRelease('C2','0.1n',now);
        else if (type==='gameOver' && gameOverSynth) { gameOverSynth.triggerAttackRelease('C3','1n',now); gameOverSynth.triggerAttackRelease('G2','0.8n',now+0.5); gameOverSynth.triggerAttackRelease('E2','1.5n',now+1); }
        else if (type==='powerup' && powerUpSynth) powerUpSynth.triggerAttackRelease('G5','0.3n',now);
        else if (type==='metallicHit' && metallicHitSynth) metallicHitSynth.triggerAttackRelease(now);
        else if (type==='superPowerShoot' && superPowerSynth) { superPowerSynth.triggerAttackRelease("C4", "0.5n", now); }
        else if (type==='superPowerActivate' && superPowerPickupSynth) { superPowerPickupSynth.triggerAttackRelease('C4', '0.4n', now); superPowerPickupSynth.triggerAttackRelease('G4', '0.4n', now + 0.1); superPowerPickupSynth.triggerAttackRelease('C5', '0.4n', now + 0.2); }
        else if (type==='shieldBreak' && shieldBreakSynth) { shieldBreakSynth.triggerAttackRelease("0.4n", now); }
        else if (type==='lifeUp' && powerUpSynth) { powerUpSynth.triggerAttackRelease('A5', '0.2n', now); }
        else if (type==='shockwave' && shockwaveSynth) { shockwaveSynth.triggerAttackRelease('C3', '0.6n', now); }
        else if (type==='boost' && boostSynth) { boostSynth.triggerAttackRelease('E5', '0.3n', now); }
    } catch(e){
        console.warn('Error playing sound:',e);
    }
}
    function spawnMeteor() { if (meteors.length < 10 && gameRunning && !paused) { let difficulty = getDifficultyFactor(); if(boostActive) difficulty *=1.5; const minS=dimensions.width*0.05, maxS=dimensions.width*0.1; const size = Math.random()*(maxS-minS)+minS; const x = Math.random()*(dimensions.width-size)+size/2; const y = -size/2; let speedY = (Math.random() * 1.5 + 0.8) * difficulty; let meteorType = 'normal'; if (Math.random() < 0.20) { meteorType = 'metallic'; } meteors.push(new Meteor(x,y,size/2,speedY, meteorType)); } }
    function trySpawnComet() { if (!gameRunning || paused || comets.length > 0 || isGiantCometScheduled) return; cometSpawnTimer++; if (cometSpawnTimer >= nextCometSpawnTime) { const difficulty = getDifficultyFactor(); const isGiant = boostActive ? false : Math.random() < 0.19; let sizeCategory; if(isGiant) { sizeCategory = 'giant'; } else { const randSize = Math.random(); if (randSize < 0.5) sizeCategory = 'small'; else if (randSize < 0.85) sizeCategory = 'medium'; else sizeCategory = 'large'; } const side = Math.floor(Math.random() * 3); let x, y, speedX, speedY; let baseSpeedMagnitude; let targetX, targetY; if(isGiant){ baseSpeedMagnitude = 1.0; } else { const speedRand = Math.random(); if (speedRand < 0.2) baseSpeedMagnitude = (0.8 + Math.random() * 0.4) * difficulty; else if (speedRand < 0.8) baseSpeedMagnitude = (1.2 + Math.random() * 0.6) * difficulty; else baseSpeedMagnitude = (2.0 + Math.random() * 0.8) * difficulty; if(boostActive) baseSpeedMagnitude *=1.5; } let tempRadius; if (sizeCategory === 'giant') tempRadius = dimensions.width * 0.25; else if (sizeCategory === 'small') tempRadius = dimensions.width * 0.035; else if (sizeCategory === 'medium') tempRadius = dimensions.width * 0.050; else tempRadius = dimensions.width * 0.065; const spawnOffset = tempRadius * 1.3; switch (side) { case 0: x = Math.random() * dimensions.width; y = -spawnOffset; targetX = Math.random() * dimensions.width * 0.8 + dimensions.width * 0.1; targetY = dimensions.height + spawnOffset; break; case 1: x = -spawnOffset; y = Math.random() * dimensions.height * 0.7 + dimensions.height * 0.15; targetX = dimensions.width + spawnOffset; targetY = Math.random() * dimensions.height; break; case 2: x = dimensions.width + spawnOffset; y = Math.random() * dimensions.height * 0.7 + dimensions.height * 0.15; targetX = -spawnOffset; targetY = Math.random() * dimensions.height; break; } const dx = targetX - x; const dy = targetY - y; const dist = Math.sqrt(dx * dx + dy * dy); speedX = (dx / dist) * baseSpeedMagnitude; speedY = (dy / dist) * baseSpeedMagnitude; if(isGiant){ isGiantCometScheduled = true; giantCometSpawnFrame = gameFrameCounter + 420; giantCometParams = {x, y, sizeCategory, speedX, speedY, type: 'giant'}; showMessage("¡Se aproxima algo grande!", 7000); } else { comets.push(new Comet(x, y, sizeCategory, speedX, speedY, 'normal')); } cometSpawnTimer = 0; nextCometSpawnTime = cometSpawnIntervalMin + Math.random() * (cometSpawnIntervalMax - cometSpawnIntervalMin); } lifeSpawnTimer++; if (lifeSpawnTimer >= lifeSpawnInterval) { if (Math.random() < 0.01 && lifePowerUps.length < 1 && !boostActive) { spawnLifePowerUp(); } lifeSpawnTimer = 0; } }
    const powerUpTypes = ['biggerBullets','shield','laser','multishot', 'shockwave']; // 'super' removed
    function spawnPowerUp() { if (!gameRunning || paused || superPowerActive || powerUps.length >= 2 || boostActive) return; const availableTypes = powerUpTypes.filter(type => { if (type === 'multishot' && multishotActive && ship.multishotLevel >= 5) return false; if (type === 'laser' && laserActive && ship.laserLevel >= 3) return false; return !powerUps.some(p => p.type === type); }); if (!availableTypes.length) return; const type = availableTypes[Math.floor(Math.random()*availableTypes.length)]; const size = dimensions.width*0.06; const x = Math.random()*(dimensions.width-size)+size/2; const y = -size/2; powerUps.push(new PowerUp(x,y,size,type)); }
    function spawnLifePowerUp() { if (!gameRunning || paused || lifePowerUps.length >= 1 || boostActive) return; const size = dimensions.width*0.05; const x = Math.random()*(dimensions.width-size)+size/2; const y = -size; lifePowerUps.push(new LifePowerUp(x,y,size)); }
    function deactivateAllOffensivePowers(resetLevels = true) { biggerBulletsActive = false; laserActive = false; lasers = []; shockwaveActive = false; shockwaveShotsRemaining = 0; if(resetLevels && ship){ multishotActive = false; ship.multishotLevel = 1; ship.laserLevel = 1; } currentOffensivePowerType = multishotActive && !resetLevels ? 'multishot' : null; }
    function startPowerUpSpawner() { if (powerUpIntervalId) clearInterval(powerUpIntervalId); setTimeout(spawnPowerUp, 12000); powerUpIntervalId = setInterval(spawnPowerUp, 20000 + Math.random() * 8000); } function stopPowerUpSpawner() { if (powerUpIntervalId) clearInterval(powerUpIntervalId); }
    function checkAabbCircleCollision(aabb,circle) { const closestX = Math.max(aabb.x, Math.min(circle.x, aabb.x+aabb.width)); const closestY = Math.max(aabb.y, Math.min(circle.y, aabb.y+aabb.height)); const distanceX = circle.x - closestX; const distanceY = circle.y - closestY; return (distanceX * distanceX + distanceY * distanceY) <= (circle.radius * circle.radius); }
function showMessage(txt, dur = 1000) {
  messageEl.textContent = txt;
  messageEl.classList.remove('float-up');
  void messageEl.offsetWidth;
  messageEl.classList.add('visible', 'float-up');
  const displayDuration = Math.min(dur, 1000);
  setTimeout(() => messageEl.classList.remove('visible'), displayDuration);
}
function hideMessage() {
  messageEl.classList.remove('visible');
}
function updateScoreDisplay() {
  scoreEl.textContent = score;
}
function updateLivesDisplay() {
  livesEl.textContent = `${ship ? ship.lives : 0} ❤️`;
}
function updateComboDisplay() {
    if (!comboDisplayEl) return;
    if (comboCount > 1 && gameRunning && !paused) {
        comboDisplayEl.textContent = `Combo: ${comboCount}x`;
        comboDisplayEl.classList.remove('float-up');
        void comboDisplayEl.offsetWidth;
        comboDisplayEl.classList.add('visible', 'combo-flash', 'float-up');
        comboDisplayEl.addEventListener('animationend', () => {
            comboDisplayEl.classList.remove('combo-flash');
        }, { once: true });
        if (comboDisplayTimeoutId) clearTimeout(comboDisplayTimeoutId);
        comboDisplayTimeoutId = setTimeout(() => {
            comboDisplayEl.classList.remove('visible');
            comboDisplayTimeoutId = null;
        }, 1000);
    } else {
        comboDisplayEl.classList.remove('visible');
        if (comboDisplayTimeoutId) {
            clearTimeout(comboDisplayTimeoutId);
            comboDisplayTimeoutId = null;
        }
    }
}
    function updateActivePowerUpDisplay() { if (!activePowerUpDisplayEl || !ship) return; let textToShow = null; let shouldBeVisible = false; if (superPowerActive) { textToShow = `SUPER! ${Math.ceil(superPowerTimer/60)}s`; shouldBeVisible = true; } else if (currentOffensivePowerType && currentOffensivePowerType !== 'super') { textToShow = powerUpVisuals[currentOffensivePowerType].displayName; if (currentOffensivePowerType === 'multishot') textToShow += ` N${ship.multishotLevel}`; if (currentOffensivePowerType === 'laser') textToShow += ` N${ship.laserLevel}`; shouldBeVisible = true; } else if (shieldActive) { textToShow = `Escudo N${ship.shieldLevel}`; shouldBeVisible = true; } if (shouldBeVisible) { activePowerUpDisplayEl.innerHTML = textToShow; activePowerUpDisplayEl.classList.remove('float-up'); void activePowerUpDisplayEl.offsetWidth; activePowerUpDisplayEl.classList.add('visible','float-up'); if (activePowerUpDisplayTimeoutId) clearTimeout(activePowerUpDisplayTimeoutId); activePowerUpDisplayTimeoutId = setTimeout(() => { activePowerUpDisplayEl.classList.remove('visible'); activePowerUpDisplayTimeoutId = null; }, 1000); } else { activePowerUpDisplayEl.classList.remove('visible'); if (activePowerUpDisplayTimeoutId) { clearTimeout(activePowerUpDisplayTimeoutId); activePowerUpDisplayTimeoutId = null; } } }
    function updateBoostBar(){ if(!boostBarFill || !boostBarContainer) return; const fillPercent = Math.min(100, (boostMeteorKills / boostTargetKills) * 100); boostBarFill.style.height = `${fillPercent}%`; if(boostReady){ boostBarContainer.classList.add('ready'); } else { boostBarContainer.classList.remove('ready'); } }
    function activateBoost() { if(!boostReady || boostActive || !ship) return; boostActive = true; boostTimer = boostDuration; boostReady = false; boostMeteorKills = 0; ship.invincible = true; ship.invincibilityTimer = boostDuration; targetBackgroundSpeedMultiplier = 25; playSound('boost'); updateBoostBar(); showMessage("¡VELOCIDAD MÁXIMA!", 2000); deactivateAllOffensivePowers(true); superPowerActive = true; superPowerTimer = boostDuration; currentOffensivePowerType = 'super'; playSound('superPowerActivate'); }

    function resetGame() {
        score = 0;
        bullets = [];
        meteors = [];
        powerUps = [];
        explosions = [];
        lasers = [];
        comets = [];
        shieldBreakParticles = [];
        backgroundParticlesLayer1 = [];
        backgroundParticlesLayer2 = [];
        debrisParticles = [];
        lifePowerUps = [];
        shockwaves = [];
        floatingTexts = [];
        thrusterParticles = [];
        updateScoreDisplay();
        ship = new Ship();
        if (isMouseControlsActive && ship) {
            mousePos.x = ship.x + ship.size / 2;
            mousePos.y = ship.y + ship.size / 2;
        }
        updateLivesDisplay();
        deactivateAllOffensivePowers(true);
        if (shieldActive) {
            shieldActive = false;
            ship.shieldLevel = 0;
        }
        superPowerActive = false;
        superPowerTimer = 0;
        currentOffensivePowerType = null;
        multishotActive = false;
        if (ship) ship.multishotLevel = 1;
        shockwaveActive = false;
        laserActive = false;
        ship.laserLevel = 1;
        boostMeteorKills = 0;
        boostReady = false;
        boostActive = false;
        backgroundParticleSpeedMultiplier = 1;
        targetBackgroundSpeedMultiplier = 1;
        comboCount = 0;
        updateComboDisplay();
        updateActivePowerUpDisplay();
        updateBoostBar();
        stopPowerUpSpawner();
        cometSpawnTimer = 0;
        nextCometSpawnTime =
            cometSpawnIntervalMin + Math.random() * (cometSpawnIntervalMax - cometSpawnIntervalMin);
        lifeSpawnTimer = 0;
        for (let i = 0; i < MAX_BG_PARTICLES / 2; i++) {
            backgroundParticlesLayer1.push(new BackgroundParticle(1));
            backgroundParticlesLayer2.push(new BackgroundParticle(2));
        }
        overMsg.classList.remove('visible');
        container.classList.remove('game-over-shake');
        messageEl.classList.add('visible');
        scoreEl.classList.remove('hidden');
        livesEl.classList.remove('hidden');
        comboDisplayEl.classList.remove('hidden');
        activePowerUpDisplayEl.classList.remove('hidden');
        pauseBtn.classList.remove('hidden');
        startBtn.classList.add('hidden');
        if (!isMouseControlsActive && navigator.maxTouchPoints > 0) {
            if (mobileControlsContainer) mobileControlsContainer.style.display = 'flex';
        } else {
            if (mobileControlsContainer) mobileControlsContainer.style.display = 'none';
        }
        paused = false;
        pauseBtn.innerHTML =
            `<img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/pause.svg" alt="[Icono de Pausa]"/> <span>Pausa</span>`;
        gameFrameCounter = 0;
        isGiantCometScheduled = false;
        giantCometSpawnFrame = -1;
        giantCometParams = null;
        highScore = localStorage.getItem('highScore') || 0;
    }
    function startGame() {
        initAudio()
            .then(() => {
                if (!gameRunning) {
                    gameRunning = true;
                    resetGame();
                }
                paused = false;
                gameRunning = true;
                showMessage("¡Prepárate!", 1500);
                let meteorIntervalBase = 1500;
                if (meteorIntervalId) clearInterval(meteorIntervalId);
                meteorIntervalId = setInterval(
                    spawnMeteor,
                    (meteorIntervalBase / difficultyMultiplier) - Math.min(1200, score / 1.5)
                );
                startPowerUpSpawner();
                if (gameFrameId) {
                    cancelAnimationFrame(gameFrameId);
                    gameFrameId = null;
                }
                gameLoop();
            })
            .catch(err => {
                console.error(
                    "Audio initialization failed, starting game without sound.",
                    err
                );
                muted = true;
                if (typeof Tone !== "undefined") Tone.Master.mute = true;
                if (muteText) muteText.textContent = "Sonido OFF";
                if (!gameRunning) {
                    gameRunning = true;
                    resetGame();
                }
                paused = false;
                gameRunning = true;
                showMessage("¡Prepárate! (Audio Error)", 1500);
                let meteorIntervalBase = 1500;
                if (meteorIntervalId) clearInterval(meteorIntervalId);
                meteorIntervalId = setInterval(
                    spawnMeteor,
                    (meteorIntervalBase / difficultyMultiplier) - Math.min(1200, score / 1.5)
                );
                startPowerUpSpawner();
                if (gameFrameId) {
                    cancelAnimationFrame(gameFrameId);
                    gameFrameId = null;
                }
                gameLoop();
            });
    }
    function pauseGame() { if (!gameRunning) return; paused = !paused; if (paused) { showMessage("Juego Pausado"); pauseBtn.innerHTML = `<img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/play.svg" alt="[Icono de Reanudar]"/> <span>Reanudar</span>`; if (meteorIntervalId) clearInterval(meteorIntervalId); stopPowerUpSpawner(); if (gameFrameId) { cancelAnimationFrame(gameFrameId); gameFrameId = null; } } else { hideMessage(); pauseBtn.innerHTML = `<img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/pause.svg" alt="[Icono de Pausa]"/> <span>Pausa</span>`; let meteorIntervalBase = 1500; if (meteorIntervalId) clearInterval(meteorIntervalId); meteorIntervalId = setInterval(spawnMeteor, (meteorIntervalBase / difficultyMultiplier) - Math.min(1200,score/1.5)); startPowerUpSpawner(); if (!gameFrameId) gameLoop(); } }
    function toggleMute() { initAudio().then(() => { muted = !muted; Tone.Master.mute = muted; muteIcon.src = muted ? "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/volume-x.svg" : "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/volume-2.svg"; muteText.textContent = muted ? "Sonido OFF" : "Sonido ON"; if (!muted && ship) playSound('shoot'); }).catch(err => { console.error("Failed to toggle mute (audio init issue):", err); showMessage("Error de audio. Intenta recargar.",2000); }); }
    function gameOver() { gameRunning=false; paused=true; playSound('gameOver'); if (score > highScore) { highScore = score; localStorage.setItem('highScore', highScore); } highScoreEl.textContent = highScore; finalEl.textContent = score; overMsg.classList.add('visible'); scoreEl.classList.add('hidden'); livesEl.classList.add('hidden'); comboDisplayEl.classList.add('hidden'); activePowerUpDisplayEl.classList.add('hidden'); pauseBtn.classList.add('hidden'); startBtn.classList.remove('hidden');  startBtn.querySelector('span').textContent = "Reintentar"; if(mobileControlsContainer) mobileControlsContainer.style.display = 'none'; container.classList.add('game-over-shake'); setTimeout(()=>container.classList.remove('game-over-shake'),1000); if (meteorIntervalId) clearInterval(meteorIntervalId); stopPowerUpSpawner(); if (gameFrameId) { cancelAnimationFrame(gameFrameId); gameFrameId = null; } hideMessage(); deactivateAllOffensivePowers(true); if (shieldActive) { shieldActive = false; ship.shieldLevel = 0;} superPowerActive = false; superPowerTimer = 0; currentOffensivePowerType = null; multishotActive = false; if (ship) ship.multishotLevel = 1; shockwaveActive = false; laserActive = false; ship.laserLevel = 1; boostActive = false; boostTimer = 0; if(ship) ship.speed = originalShipSpeed; backgroundParticleSpeedMultiplier = 1; targetBackgroundSpeedMultiplier = 1; lasers=[]; comets = []; shieldBreakParticles = []; backgroundParticlesLayer1 = []; backgroundParticlesLayer2 = []; debrisParticles = []; lifePowerUps = []; shockwaves = []; isGiantCometScheduled = false; giantCometSpawnFrame = -1; giantCometParams = null; }

    function updateGame() {
      if (!ship || paused || !gameRunning) return;
      gameFrameCounter++;

      if (!isMouseControlsActive) {
          if (!joystickActive) {
              ship.targetVelX = 0; ship.targetVelY = 0;
              if (keys['ArrowLeft'] || keys['KeyA']) ship.targetVelX = -ship.speed;
              if (keys['ArrowRight'] || keys['KeyD']) ship.targetVelX = ship.speed;
              if (keys['ArrowUp'] || keys['KeyW']) ship.targetVelY = -ship.speed;
              if (keys['ArrowDown'] || keys['KeyS']) ship.targetVelY = ship.speed;
          }
      }

      backgroundParticleSpeedMultiplier += (targetBackgroundSpeedMultiplier - backgroundParticleSpeedMultiplier) * backgroundSpeedEasing;
      framesSinceLastBgParticle++; if (framesSinceLastBgParticle >= BG_PARTICLE_SPAWN_INTERVAL) { if (backgroundParticlesLayer1.length + backgroundParticlesLayer2.length < MAX_BG_PARTICLES) { Math.random() < 0.6 ? backgroundParticlesLayer1.push(new BackgroundParticle(1)) : backgroundParticlesLayer2.push(new BackgroundParticle(2));} framesSinceLastBgParticle = 0; }
      backgroundParticlesLayer1.forEach(p => p.update()); backgroundParticlesLayer2.forEach(p => p.update());
      bullets.forEach(b=>b.update()); bullets = bullets.filter(b => b.x + b.width > 0 && b.x < dimensions.width && b.y + b.height > 0 && b.y < dimensions.height);
      meteors.forEach(m=>m.update()); meteors = meteors.filter(m=>m.y < dimensions.height + m.radius && m.x > -m.radius && m.x < dimensions.width + m.radius);
      comets.forEach((comet, index) => { comet.update(); if (comet.isOffScreen()) { comets.splice(index, 1); } });
      powerUps.forEach(p=>p.update()); powerUps = powerUps.filter(p=>p.y<dimensions.height+p.radius);
      lifePowerUps.forEach(lp=>lp.update()); lifePowerUps = lifePowerUps.filter(lp=>lp.y<dimensions.height+lp.radius);
      explosions.forEach(e=>e.update()); explosions = explosions.filter(e=>!e.isFinished());
      shieldBreakParticles.forEach(sbp => sbp.update()); shieldBreakParticles = shieldBreakParticles.filter(sbp => !sbp.isFinished());
      debrisParticles.forEach(dp => dp.update()); debrisParticles = debrisParticles.filter(dp => !dp.isFinished());
      lasers.forEach(l=>l.update()); lasers = lasers.filter(l=>l.life>0);
      shockwaves.forEach(sw=>sw.update()); shockwaves = shockwaves.filter(sw=>!sw.isFinished());
      floatingTexts.forEach(ft=>ft.update()); floatingTexts = floatingTexts.filter(ft=>!ft.isFinished());
      thrusterParticles.forEach(tp => tp.update()); thrusterParticles = thrusterParticles.filter(tp => !tp.isFinished());
      updateComboDisplay(); updateActivePowerUpDisplay();

      if (isGiantCometScheduled && gameFrameCounter >= giantCometSpawnFrame) { if(giantCometParams){ comets.push(new Comet(giantCometParams.x, giantCometParams.y, giantCometParams.sizeCategory, giantCometParams.speedX, giantCometParams.speedY, 'giant')); } isGiantCometScheduled = false; giantCometSpawnFrame = -1; giantCometParams = null; }



      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        let bulletConsumed = false;
        const bulletAABB = { x: b.x - b.width / 2, y: b.y - b.height / 2, width: b.width, height: b.height };
        for (let j = meteors.length - 1; j >= 0 && !bulletConsumed; j--) {
          const m = meteors[j];
          const meteorCircle = { x: m.x, y: m.y, radius: m.radius };
          if (checkAabbCircleCollision(bulletAABB, meteorCircle)) {
            if (m.takeHit(b)) {
              score += m.points;
              updateScoreDisplay();
              floatingTexts.push(new FloatingText(`+${m.points}`, m.x, m.y));
              explosions.push(new Explosion(m.x, m.y, { r: 200, g: 50, b: 50 }));
              meteors.splice(j, 1);
              boostMeteorKills++;
            }
            bullets.splice(i, 1);
            bulletConsumed = true;
          }
        }
        for (let j = comets.length - 1; j >= 0 && !bulletConsumed; j--) {
          const c = comets[j];
          const cometCircle = { x: c.x, y: c.y, radius: c.approxRadius };
          if (checkAabbCircleCollision(bulletAABB, cometCircle)) {
            if (c.takeHit(b)) {
              score += c.points;
              updateScoreDisplay();
              floatingTexts.push(new FloatingText(`+${c.points}`, c.x, c.y));
              explosions.push(new Explosion(c.x, c.y, { r: 255, g: 120, b: 0 }));
              comets.splice(j, 1);
              boostMeteorKills++;
            }
            bullets.splice(i, 1);
            bulletConsumed = true;
          }
        }
        if (bulletConsumed) {
          updateBoostBar();
          comboCount++;
        }
      }

      for (let i=meteors.length-1; i>=0; i--) { const m=meteors[i]; if(!m) continue; const shipAABB={x:ship.x,y:ship.y,width:ship.size,height:ship.size}; const meteorCircle={x:m.x,y:m.y,radius:m.radius}; if (checkAabbCircleCollision(shipAABB,meteorCircle)) { ship.hit(); explosions.push(new Explosion(m.x,m.y,{r:200,g:50,b:50})); meteors.splice(i,1); if (ship.lives <= 0 && gameRunning) gameOver(); } }
      for (let k = comets.length - 1; k >= 0; k--) { const c = comets[k]; if(!c) continue; const shipAABB = { x: ship.x, y: ship.y, width: ship.size, height: ship.size }; const cometCircle = { x: c.x, y: c.y, radius: c.approxRadius }; if (checkAabbCircleCollision(shipAABB, cometCircle)) { if (c.type === 'giant') { if (superPowerActive) { c.explodeSpectacularly(); comets.splice(k, 1); playSound('explosion'); } else { explosions.push(new Explosion(c.x, c.y, { r: 255, g: 0, b: 0 })); comets.splice(k, 1); if (ship) ship.loseAllLives(); } } else if (superPowerActive) { superPowerActive = false; superPowerTimer = 0; currentOffensivePowerType = null; showMessage("¡Super Poder Perdido por Cometa!", 2000); playSound('hit'); comets.splice(k, 1); explosions.push(new Explosion(c.x, c.y, { r: 255, g: 120, b: 0 })); } else { explosions.push(new Explosion(c.x, c.y, { r: 255, g: 0, b: 0 })); comets.splice(k, 1); if (ship) ship.loseAllLives(); } break; } }

      for (let i=powerUps.length-1; i>=0; i--) { const p=powerUps[i]; if(!p) continue; const shipAABB={x:ship.x,y:ship.y,width:ship.size,height:ship.size}; const powerUpCircle={x:p.x,y:p.y,radius:p.radius}; if (checkAabbCircleCollision(shipAABB,powerUpCircle)) {
          const collectedType = p.type;

          if (collectedType === 'super') { // This case should no longer be reachable if 'super' is removed from spawn
              deactivateAllOffensivePowers(true);
              superPowerActive = true; superPowerTimer = superPowerDuration; currentOffensivePowerType = 'super';
              showMessage("¡¡SUPER PODER!!", 2500); playSound('superPowerActivate');
          } else if (collectedType === 'shield') {
              shieldActive = true; ship.shieldLevel = Math.min(3, ship.shieldLevel + 1);
              showMessage(`${powerUpVisuals[collectedType].displayName} Nivel ${ship.shieldLevel}!`, 2000);
          } else {
              if (collectedType !== 'multishot' && collectedType !== 'biggerBullets') { // Laser or Shockwave
                  deactivateAllOffensivePowers(false); // Keep multishot level if it was active
                  currentOffensivePowerType = collectedType;
                  if (collectedType === 'laser') {
                      if(ship.laserLevel < 3) ship.laserLevel++; else ship.laserLevel = 3;
                      laserActive = true;
                      showMessage(`${powerUpVisuals[collectedType].displayName} Nivel ${ship.laserLevel}!`, 1500);
                  } else if (collectedType === 'shockwave') {
                      shockwaveActive = true;
                      shockwaveShotsRemaining = 5;
                      showMessage(`¡${powerUpVisuals[collectedType].displayName} Activado!`, 2000);
                  }
              } else if (collectedType === 'multishot') {
                  if (currentOffensivePowerType === 'laser' || currentOffensivePowerType === 'shockwave') {
                      deactivateAllOffensivePowers(false);
                  }
                  if(ship.multishotLevel < 5) ship.multishotLevel++;
                  multishotActive = true; currentOffensivePowerType = 'multishot';
                  showMessage(`${powerUpVisuals[collectedType].displayName} Nivel ${ship.multishotLevel}!`, 1500);
              } else if (collectedType === 'biggerBullets') {
                  if (currentOffensivePowerType === 'laser' || currentOffensivePowerType === 'shockwave') {
                      deactivateAllOffensivePowers(false);
                  }
                  biggerBulletsActive = true;
                  if (!multishotActive && !laserActive && !shockwaveActive) currentOffensivePowerType = 'biggerBullets';
                  else if (multishotActive) currentOffensivePowerType = 'multishot'; // If multishot is active, bigger bullets modify it
                  showMessage(`¡${powerUpVisuals[collectedType].displayName} Activado!`, 2000);
              }
          }
          powerUps.splice(i,1);
      } }
      for (let i=lifePowerUps.length-1; i>=0; i--) { const lp=lifePowerUps[i]; if(!lp) continue; const shipAABB={x:ship.x,y:ship.y,width:ship.size,height:ship.size}; const lifeCircle={x:lp.x,y:lp.y,radius:lp.radius}; if (checkAabbCircleCollision(shipAABB,lifeCircle)) { if(ship) ship.lives++; updateLivesDisplay(); playSound('lifeUp'); lifePowerUps.splice(i,1); showMessage("¡Vida Extra!", 1500); } }

      if (superPowerActive && --superPowerTimer <=0) { superPowerActive = false; currentOffensivePowerType = null; if (ship) ship.multishotLevel = 1; multishotActive = false; showMessage("Super Poder Agotado", 2000); }
      if (boostActive && --boostTimer <= 0) { boostActive = false; if(ship) { ship.speed = originalShipSpeed; ship.invincible = false; ship.invincibilityTimer = 0; } targetBackgroundSpeedMultiplier = 1; superPowerActive = false; superPowerTimer = 0; if(currentOffensivePowerType === 'super') currentOffensivePowerType = null; showMessage("Velocidad Normal", 1500); if (meteorIntervalId) clearInterval(meteorIntervalId); meteorIntervalId = setInterval(spawnMeteor, (1500 / difficultyMultiplier) - Math.min(1200, score / 1.5)); }
      if (!boostReady && boostMeteorKills >= boostTargetKills) { boostReady = true; updateBoostBar(); showMessage("¡Velocidad Lista!", 2000); }
    }

    function drawGame() { ctx.clearRect(0,0,dimensions.width,dimensions.height); backgroundParticlesLayer1.forEach(p => p.draw()); backgroundParticlesLayer2.forEach(p => p.draw()); if(ship) ship.draw(); bullets.forEach(b=>b.draw()); lasers.forEach(l=>l.draw()); meteors.forEach(m=>m.draw()); comets.forEach(c => c.draw()); powerUps.forEach(p=>p.draw()); lifePowerUps.forEach(lp=>lp.draw()); explosions.forEach(e=>e.draw()); shieldBreakParticles.forEach(sbp => sbp.draw()); debrisParticles.forEach(dp => dp.draw()); shockwaves.forEach(sw => sw.draw()); floatingTexts.forEach(ft=>ft.draw()); thrusterParticles.forEach(tp => tp.draw());}
    function gameLoop() { if (gameRunning && !paused) { updateGame(); drawGame(); } gameFrameId = requestAnimationFrame(gameLoop); }

    document.addEventListener('keydown', e=>{ if (e.code==='Space') { e.preventDefault(); if (!isMouseControlsActive && gameRunning && !paused && ship) { ship.shoot(); } } keys[e.code] = true; if (e.code==='KeyW') keys['ArrowUp']=true; if (e.code==='KeyS') keys['ArrowDown']=true; if (e.code==='KeyA') keys['ArrowLeft']=true; if (e.code==='KeyD') keys['ArrowRight']=true; });
    document.addEventListener('keyup', e=>{ keys[e.code] = false; if (e.code==='KeyW') keys['ArrowUp']=false; if (e.code==='KeyS') keys['ArrowDown']=false; if (e.code==='KeyA') keys['ArrowLeft']=false; if (e.code==='KeyD') keys['ArrowRight']=false; });
    function handleGlobalClickForShoot(e) { if (!isMouseControlsActive || !gameRunning || paused || !ship) return; const clickedElement = e.target; const isButton = clickedElement.closest('button'); if (isButton) { const gameButtons = [startBtn, pauseBtn, muteBtn, newBtn]; if (gameButtons.some(btn => btn === isButton || (btn && btn.contains(isButton)) )) { return; } } ship.shoot(); }
    function handleJoystickStart(event) { event.preventDefault(); if (!gameRunning || paused || !ship) return; joystickActive = true; const touch = event.touches[0]; const joystickRect = joystickArea.getBoundingClientRect(); joystickStartX = joystickRect.left + joystickAreaRadius; joystickStartY = joystickRect.top + joystickAreaRadius; updateJoystick(touch.clientX, touch.clientY); }
    function handleJoystickMove(event) { event.preventDefault(); if (!joystickActive || !gameRunning || paused || !ship) return; const touch = event.touches[0]; updateJoystick(touch.clientX, touch.clientY); }
    function handleJoystickEnd(event) { event.preventDefault(); if (!joystickActive || !ship) return; joystickActive = false; joystickHandle.style.transform = `translate(-50%, -50%)`; ship.targetVelX = 0; ship.targetVelY = 0; }
    function updateJoystick(touchX, touchY) { if(!ship) return; const deltaX = touchX - joystickStartX; const deltaY = touchY - joystickStartY; let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); const angle = Math.atan2(deltaY, deltaX); let handleX = deltaX; let handleY = deltaY; if (distance > joystickAreaRadius - joystickHandleRadius) { handleX = Math.cos(angle) * (joystickAreaRadius - joystickHandleRadius); handleY = Math.sin(angle) * (joystickAreaRadius - joystickHandleRadius); distance = joystickAreaRadius - joystickHandleRadius; } joystickHandle.style.transform = `translate(calc(-50% + ${handleX}px), calc(-50% + ${handleY}px))`; if (distance > joystickDeadZone) { const normalizedDistance = (distance - joystickDeadZone) / (joystickAreaRadius - joystickHandleRadius - joystickDeadZone); const currentSpeed = ship.speed * normalizedDistance; ship.targetVelX = Math.cos(angle) * currentSpeed; ship.targetVelY = Math.sin(angle) * currentSpeed; } else { ship.targetVelX = 0; ship.targetVelY = 0; } }

    if(startBtn) startBtn.addEventListener('click', startGame);
    if(pauseBtn) pauseBtn.addEventListener('click', pauseGame);
    if(muteBtn) muteBtn.addEventListener('click', toggleMute);
    if(newBtn) newBtn.addEventListener('click', startGame);
    if(menuButton) { menuButton.addEventListener('click', () => { menuModal.style.display = 'block'; if(gameRunning && !paused) pauseGame(); }); }
    if(closeMenuModalBtn) { closeMenuModalBtn.addEventListener('click', () => { menuModal.style.display = 'none'; }); }
    if(boostBarContainer){ boostBarContainer.addEventListener('click', activateBoost); boostBarContainer.addEventListener('touchstart', (e)=>{ e.preventDefault(); activateBoost(); }); }

    window.onload = function(){
      updateDimensions(); showMessage("¡Presiona Empezar!");
      isMouseControlsActive = navigator.maxTouchPoints === 0;
      if (isMouseControlsActive) { console.log("Controles de Ratón ACTIVADOS"); if(mobileControlsContainer) mobileControlsContainer.style.display = 'none'; canvas.addEventListener('mousemove', e => { if (!gameRunning || paused || !ship) return; const rect = canvas.getBoundingClientRect(); mousePos.x = e.clientX - rect.left; mousePos.y = e.clientY - rect.top; }); document.addEventListener('click', handleGlobalClickForShoot); }
      else { console.log("Controles Táctiles (Joystick) ACTIVADOS"); if(mobileControlsContainer) mobileControlsContainer.style.display = 'flex'; if(joystickArea) { joystickArea.addEventListener('touchstart', handleJoystickStart, { passive: false }); joystickArea.addEventListener('touchmove', handleJoystickMove, { passive: false }); joystickArea.addEventListener('touchend', handleJoystickEnd); joystickArea.addEventListener('touchcancel', handleJoystickEnd); } if(mobileShootButton) { mobileShootButton.addEventListener('touchstart', (e) => { e.preventDefault(); if (gameRunning && !paused && ship) ship.shoot(); }, { passive: false }); } }
      initAudio().catch(err => console.warn("Initial audio setup prompt might be needed or failed:", err));
    };
});
