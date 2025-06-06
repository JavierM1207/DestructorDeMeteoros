export class Ship {
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
      shoot() { if (superPowerActive) { const numSuperBullets = 5; const angleIncrement = Math.PI / 6; const baseAngle = -Math.PI / 2; for (let i = 0; i < numSuperBullets; i++) { const angle = baseAngle + (i - Math.floor(numSuperBullets / 2)) * angleIncrement; const speed = 7; const bulletX = this.x + this.size / 2; const bulletY = this.y; const color = superBulletColors[0]; bullets.push(new Bullet(bulletX, bulletY, 8, 8, speed, color, angle, 'super')); } playSound('superPowerShoot'); } else if (laserActive) { const baseAngle = -Math.PI / 2; const angleSpread = 5 * Math.PI / 180; const numLasers = Math.min(5, 1 + (this.laserLevel -1) * 2); for(let i = 0; i < numLasers; i++){ const angleOffset = (i - Math.floor((numLasers-1)/2)) * angleSpread; lasers.push(new LaserBeam(this.x + this.size/2, this.y, laserPulseDuration, baseAngle + angleOffset)); } playSound('laserShoot'); } else if (shockwaveActive) { shockwaves.push(new Shockwave(this.x + this.size / 2, this.y + this.size / 2)); playSound('shockwave'); } else { let shots = multishotActive ? [1, 2, 3, 4, 5][this.multishotLevel -1] : 1; if (bullets.length + shots > (multishotActive ? 12 : 8) ) return; let bulletColor = '#f59e0b'; let bulletType = 'normal'; if (biggerBulletsActive) { bulletColor = powerUpVisuals.biggerBullets.bulletColor; bulletType = 'bigger';} else if (multishotActive) { bulletColor = powerUpVisuals.multishot.bulletColor; } for (let i = 0; i < shots; i++) { const bulletWidth = biggerBulletsActive ? 12 : 5; const bulletHeight = biggerBulletsActive ? 22 : 12; const spacing = bulletWidth * 2.5; const xOffset = (i - (shots - 1) / 2) * spacing; const bulletX = this.x + this.size/2 - bulletWidth/2 + xOffset; const bulletY = this.y - bulletHeight; bullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight, 10, bulletColor, -Math.PI / 2, bulletType)); } playSound('shoot'); } }
      hit() { if (this.invincible) return; missionStats.shipHits++; comboCount = 0; if (shieldActive) { ship.shieldLevel--; if(ship.shieldLevel <= 0) { shieldActive = false; currentOffensivePowerType = multishotActive ? 'multishot' : (laserActive ? 'laser' : (biggerBulletsActive ? 'biggerBullets' : (shockwaveActive ? 'shockwave' : null))); } playSound('shieldBreak'); shieldBreakParticles.push(new ShieldShards(this.x + this.size/2, this.y + this.size/2, 10, this.size, powerUpVisuals.shield.itemColor)); showMessage("¡Escudo Roto!", 1500); this.invincible = true; this.invincibilityTimer = 60; return; } if (superPowerActive) { return; } deactivateAllOffensivePowers(true); currentOffensivePowerType = null; this.lives--; playSound('hit'); updateLivesDisplay(); if (this.lives <= 0) { gameOver(); } else { this.invincible = true; this.invincibilityTimer = this.invincibilityDuration; } }
      loseAllLives() { this.lives = 0; updateLivesDisplay(); gameOver(); }
    }

export class Bullet {
      constructor(x, y, width, height, speed, color, angle = -Math.PI / 2, type = 'normal') { this.x = x; this.y = y; this.width = width; this.height = height; this.speed = speed; this.color = color; this.angle = angle; this.type = type; this.speedX = Math.cos(this.angle) * this.speed; this.speedY = Math.sin(this.angle) * this.speed; }
      draw() {
          ctx.save(); ctx.fillStyle = this.color; ctx.shadowColor = this.color; ctx.shadowBlur = 8;
          if(this.type === 'bigger'){ ctx.beginPath(); ctx.moveTo(this.x, this.y - this.height / 2); ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2); ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2); ctx.closePath(); ctx.fill(); }
          else { ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height); }
          ctx.restore();
      }
      update() { this.x += this.speedX; this.y += this.speedY; }
    }

export class LaserBeam {
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
export class Meteor { constructor(x,y,radius,speedY, type = 'normal') { this.x = x; this.y = y; this.radius = radius; this.size = radius * 2; this.speedY = speedY; this.type = type; const maxAngleRad = 7 * Math.PI / 180; const angle = (Math.random() * 2 - 1) * maxAngleRad; this.speedX = this.speedY * Math.tan(angle); this.rotation = Math.random()*Math.PI*2; this.rotationSpeed = (Math.random()-0.5)*0.05; this.vertices = []; const vCount = Math.floor(Math.random()*5)+5; for (let i=0; i<vCount; i++){ const angleV = (i/vCount)*Math.PI*2; const r = this.radius*(0.7 + Math.random()*0.6); this.vertices.push({ x:Math.cos(angleV)*r, y:Math.sin(angleV)*r }); } if (this.type === 'metallic') { this.hitsRequired = 3; this.currentHits = 0; this.baseColor = { r: 192, g: 192, b: 192 }; this.color = `rgb(${this.baseColor.r},${this.baseColor.g},${this.baseColor.b})`; } else { this.color = `hsl(${Math.random()*60+180},70%,60%)`; this.hitsRequired = 1; this.currentHits = 0; } } draw() { ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.rotation); ctx.beginPath(); this.vertices.forEach((v,i)=> i===0?ctx.moveTo(v.x,v.y):ctx.lineTo(v.x,v.y)); ctx.closePath(); if (this.type === 'metallic') { const hitRatio = this.currentHits / this.hitsRequired; const r = Math.max(0, this.baseColor.r * (1 - hitRatio * 0.5)); const g = Math.max(0, this.baseColor.g * (1 - hitRatio * 0.5)); const b = Math.max(0, this.baseColor.b * (1 - hitRatio * 0.5)); ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`; ctx.strokeStyle = `rgb(${Math.max(0,r-30)},${Math.max(0,g-30)},${Math.max(0,b-30)})`; } else { ctx.fillStyle=this.color; const hueMatch = this.color.match(/hsl\((\d+)/); if (hueMatch && hueMatch[1]) { const hue = (parseFloat(hueMatch[1])+20)%360; ctx.strokeStyle=`hsl(${hue},90%,75%)`; } else { ctx.strokeStyle = '#FFFFFF'; } } ctx.lineWidth=this.type === 'metallic' ? 3 : 2; ctx.shadowColor=this.type === 'metallic' ? `rgb(${this.baseColor.r},${this.baseColor.g},${this.baseColor.b})` : this.color; ctx.shadowBlur=10; ctx.fill(); ctx.stroke(); ctx.restore(); } update() { this.y+=this.speedY; this.x+=this.speedX; this.rotation += this.rotationSpeed; } takeHit(bullet) { if (this.type === 'metallic') { playSound('metallicHit'); } this.currentHits++; return this.currentHits >= this.hitsRequired; } }

export class Comet {
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
            this.vertices = []; const vCount = Math.floor(Math.random() * 4) + (this.type === 'giant' ? 11 : 9); let maxDist = 0;
            for (let i = 0; i < vCount; i++) { const angle = (i / vCount) * Math.PI * 2; const r = this.baseRadius * (0.7 + Math.random() * 0.6); const vx = Math.cos(angle) * r; const vy = Math.sin(angle) * r; this.vertices.push({ x: vx, y: vy }); maxDist = Math.max(maxDist, Math.sqrt(vx*vx + vy*vy)); }
            this.approxRadius = maxDist; this.rotation = Math.atan2(this.speedY, this.speedX) + Math.PI / 2; this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.framesSinceLastDebris = 0;
        }
        draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation); ctx.beginPath(); this.vertices.forEach((v, i) => i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y)); ctx.closePath(); ctx.fillStyle = this.color; if (this.type !== 'giant' && this.currentHits > 0 && Math.floor(Date.now() / 100) % 2 === 0) { ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = 3; } else { ctx.strokeStyle = this.borderColor; ctx.lineWidth = 2; } ctx.shadowColor = this.color; ctx.shadowBlur = this.shadowBlur; ctx.fill(); ctx.stroke(); ctx.restore(); }
        update() { this.x += this.speedX; this.y += this.speedY; this.rotation += this.rotationSpeed; this.framesSinceLastDebris++; if (this.framesSinceLastDebris >= this.debrisSpawnInterval) { const debrisAngle = Math.atan2(-this.speedY, -this.speedX) + (Math.random() - 0.5) * 0.9; const numParticles = (this.type === 'giant' ? 3 : 2) + Math.floor(Math.random() * 2); for(let i=0; i<numParticles; i++){ const particleOffsetX = (Math.random() - 0.5) * this.approxRadius * 0.5; const particleOffsetY = (Math.random() - 0.5) * this.approxRadius * 0.5; debrisParticles.push(new DebrisParticle(this.x + particleOffsetX, this.y + particleOffsetY, 1, this.approxRadius * this.debrisBaseSizeFactor, this.color, debrisAngle + (Math.random() - 0.5) * 0.2, this.debrisBaseLife + Math.random()*20)); } this.framesSinceLastDebris = 0; } }
        takeHit(bullet) { if(this.type === 'giant' && bullet.type !== 'super') return false; if(this.type === 'giant' && bullet.type === 'super') { this.explodeSpectacularly(); return true; } this.currentHits++; playSound('metallicHit'); return this.currentHits >= this.hitsRequired; }
        isOffScreen() { const margin = this.approxRadius * 1.5; return this.y > dimensions.height + margin || this.y < -margin || this.x < -margin || this.x > dimensions.width + margin; }
        explodeSpectacularly() { for(let i=0; i < 50; i++) { const angle = Math.random() * Math.PI * 2; const speed = 2 + Math.random() * 4; const size = this.approxRadius * 0.05 + Math.random() * (this.approxRadius * 0.1); debrisParticles.push(new DebrisParticle(this.x, this.y, 1, size, this.color, angle, 40 + Math.random() * 40)); } playSound('explosion'); playSound('explosion'); }
    }

export class DebrisParticle {
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

export class ShieldShards { constructor(x, y, numShards, shipSize, color) { this.x = x; this.y = y; this.particles = []; this.color = color || '#00BFFF'; for (let i = 0; i < numShards; i++) { const angle = (Math.PI * 2 / numShards) * i + (Math.random() - 0.5) * 0.5; const speed = 1.5 + Math.random() * 2; const size = shipSize * 0.1 + Math.random() * (shipSize * 0.15); this.particles.push({ x: this.x, y: this.y, size: size, speedX: Math.cos(angle) * speed, speedY: Math.sin(angle) * speed, life: 30 + Math.random() * 30, rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.1, points: [ { x: 0, y: -size / 2 }, { x: -size / 2.5, y: size / 2.5 }, { x: size / 2.5, y: size / 2.5 } ] }); } } update() { this.particles.forEach(p => { p.x += p.speedX; p.y += p.speedY; p.rotation += p.rotationSpeed; p.life--; }); this.particles = this.particles.filter(p => p.life > 0); } draw() { this.particles.forEach(p => { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.beginPath(); p.points.forEach((point, index) => { index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y); }); ctx.closePath(); ctx.fillStyle = `rgba(${hexToRgb(this.color).r}, ${hexToRgb(this.color).g}, ${hexToRgb(this.color).b}, ${p.life / 60})`; ctx.fill(); ctx.strokeStyle = `rgba(${hexToRgb(this.color).r - 30}, ${hexToRgb(this.color).g - 30}, ${hexToRgb(this.color).b - 30}, ${p.life / 50})`; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }); } isFinished() { return this.particles.length === 0; } }
    function hexToRgb(hex) { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : {r:0, g:0, b:0}; }
export class Explosion { constructor(x,y,baseColor, particleCount = 20, speedFactor = 8, lifeFactor = 30) { this.x=x; this.y=y; this.baseColor=baseColor; this.particles = []; const count = Math.random()* (particleCount/2) + (particleCount/2); for (let i=0;i<count;i++){ this.particles.push({ x:this.x, y:this.y, size:Math.random()*3+1, speedX:(Math.random()-0.5)*(Math.random()*speedFactor), speedY:(Math.random()-0.5)*(Math.random()*speedFactor), life:Math.random()*lifeFactor+lifeFactor }); } } update() { this.particles.forEach(p=>{ p.x+=p.speedX; p.y+=p.speedY; p.life--; }); this.particles = this.particles.filter(p=>p.life>0); } draw() { this.particles.forEach(p=>{ ctx.fillStyle = `rgba(${this.baseColor.r},${this.baseColor.g},${this.baseColor.b},${p.life/60})`; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); }); } isFinished() { return this.particles.length===0; } }
export class PowerUp {
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
export class LifePowerUp { constructor(x,y,size) { this.x=x; this.y=y; this.size=size; this.radius=size/2; this.type='life'; this.speedY=1.8; this.color = '#FF69B4'; } draw() { ctx.save(); ctx.font = `${this.size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = this.color; ctx.shadowColor = this.color; ctx.shadowBlur = 15; ctx.fillText('❤️', this.x, this.y); ctx.restore(); } update() { this.y+=this.speedY; } }
export class BackgroundParticle { constructor(layer = 1) { this.layer = layer; this.x = Math.random() * dimensions.width; this.y = Math.random() * dimensions.height; this.size = (Math.random() * 1.5 + 0.5) / this.layer; this.baseSpeedY = (0.2 + Math.random() * 0.8) / this.layer; this.opacity = (0.1 + Math.random() * 0.3) / (this.layer * 0.5); this.color = Math.random() < 0.7 ? `rgba(220, 220, 255, ${this.opacity})` : `rgba(255, 255, 255, ${this.opacity})`; } update() { this.y += this.baseSpeedY * backgroundParticleSpeedMultiplier; if (this.y > dimensions.height + this.size) { this.y = -this.size; this.x = Math.random() * dimensions.width; } } draw() { ctx.fillStyle = this.color; if(boostActive){ const length = this.baseSpeedY * backgroundParticleSpeedMultiplier * 0.8 * (3 - this.layer); ctx.fillRect(this.x - this.size/4, this.y - length/2, this.size/2, length); } else { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } } }
export class Shockwave {
        constructor(x, y) { this.x = x; this.y = y; this.radius = 0; this.maxRadius = Math.max(dimensions.width, dimensions.height) * 0.8; this.life = 30; this.maxLife = 30; this.color = '#FFFFFF'; }
        update() { this.radius += (this.maxRadius - this.radius) * 0.1; this.life--; }
        draw() { if(this.life <= 0) return; const alpha = (this.life / this.maxLife) * 0.9; ctx.save(); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); const grad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.6, this.x, this.y, this.radius); grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`); grad.addColorStop(0.7, `rgba(220, 220, 255, ${alpha * 0.7})`); grad.addColorStop(1, `rgba(192, 192, 220, 0)`); ctx.strokeStyle = grad; ctx.lineWidth = 6 + (1 - this.life / this.maxLife) * 12; ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.8})`; ctx.shadowBlur = 50; ctx.stroke(); ctx.restore(); }
        isFinished() { return this.life <= 0; }
    }
export class FloatingText { constructor(text, x, y, color = '#FFFF99') { this.text = text; this.x = x; this.y = y; this.color = color; this.life = 60; this.opacity = 1; this.speedY = -0.5; } update() { this.y += this.speedY; this.life--; this.opacity = this.life / 60; } draw() { ctx.save(); ctx.globalAlpha = this.opacity; ctx.fillStyle = this.color; ctx.font = "0.7rem 'Press Start 2P'"; ctx.textAlign = 'center'; ctx.fillText(this.text, this.x, this.y); ctx.restore(); } isFinished() { return this.life <= 0; } }
export class ThrusterParticle { constructor(x, y) { this.x = x; this.y = y; this.size = Math.random() * 2 + 1; this.speedY = 1 + Math.random() * 2; this.speedX = (Math.random() - 0.5) * 1.5; this.life = 20 + Math.random() * 20; this.maxLife = this.life; this.color = `rgba(0, 150, 255, ${Math.random() * 0.5 + 0.3})`; } update() { this.y += this.speedY; this.x += this.speedX; this.life--; } draw() { if (this.life <= 0) return; ctx.save(); ctx.globalAlpha = (this.life / this.maxLife) * 0.8; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size * (this.life / this.maxLife), 0, Math.PI * 2); ctx.fill(); ctx.restore(); } isFinished() { return this.life <= 0; } }
