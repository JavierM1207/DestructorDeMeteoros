export function showMessage(txt, dur=1000){
  messageEl.textContent = txt;
  messageEl.classList.add('visible');
  const d = Math.min(dur, 1000);
  setTimeout(()=>messageEl.classList.remove('visible'), d);
}
export function hideMessage(){
  messageEl.classList.remove('visible');
}
export function updateScoreDisplay(){
  scoreEl.textContent = score;
  updateMissionProgress('score',0);
  if(missionStats.noPowerUpsUsedThisGame){
    updateMissionProgress('scoreWithoutPowerups',0);
  }
}
export function updateLivesDisplay(){
  livesEl.textContent = `${ship?ship.lives:0} ❤️`;
}
export function updateComboDisplay(){
  if(!comboDisplayEl) return;
  if(comboCount>1 && gameRunning && !paused){
    comboDisplayEl.textContent = `${comboCount}x`;
    comboDisplayEl.classList.add('visible');
    setTimeout(()=>comboDisplayEl.classList.remove('visible'),1000);
  }else{
    comboDisplayEl.classList.remove('visible');
  }
}
export function updateActivePowerUpDisplay(){
  if(!activePowerUpDisplayEl||!ship) return;
  let text = null;
  if(superPowerActive){
    text = `SUPER! ${Math.ceil(superPowerTimer/60)}s`;
  }else if(currentOffensivePowerType){
    text = powerUpVisuals[currentOffensivePowerType].displayName;
  }else if(shieldActive){
    text = `Escudo N${ship.shieldLevel}`;
  }
  if(text){
    activePowerUpDisplayEl.textContent = text;
    activePowerUpDisplayEl.classList.add('visible');
  }else{
    activePowerUpDisplayEl.classList.remove('visible');
  }
}
export function updateBoostBar(){
  if(!boostBarFill||!boostBarContainer) return;
  const percent = Math.min(100,(boostMeteorKills/boostTargetKills)*100);
  boostBarFill.style.height = `${percent}%`;
  if(boostReady) boostBarContainer.classList.add('ready');
  else boostBarContainer.classList.remove('ready');
}
export function activateBoost(){
  if(!boostReady||boostActive||!ship) return;
  boostActive=true; boostTimer=boostDuration; boostReady=false;
  ship.invincible=true; ship.invincibilityTimer=boostDuration;
  targetBackgroundSpeedMultiplier=25;
  playSound('boost');
  updateBoostBar();
  showMessage('¡VELOCIDAD MÁXIMA!',2000);
}
export function registerUIEvents(){
  if(startBtn) startBtn.addEventListener('click', startGame);
  if(pauseBtn) pauseBtn.addEventListener('click', pauseGame);
  if(muteBtn) muteBtn.addEventListener('click', toggleMute);
  if(newBtn) newBtn.addEventListener('click', startGame);
  if(missionsButton) missionsButton.addEventListener('click', ()=>{missionsModal.style.display='block'; if(gameRunning&&!paused) pauseGame();});
  if(closeMissionsModalBtn) closeMissionsModalBtn.addEventListener('click', ()=>{missionsModal.style.display='none';});
  if(menuButton) menuButton.addEventListener('click', ()=>{menuModal.style.display='block'; if(gameRunning&&!paused) pauseGame();});
  if(closeMenuModalBtn) closeMenuModalBtn.addEventListener('click', ()=>{menuModal.style.display='none';});
  window.addEventListener('click', (e)=>{ if(e.target==missionsModal) missionsModal.style.display='none'; if(e.target==menuModal) menuModal.style.display='none'; });
  if(boostBarContainer){
    boostBarContainer.addEventListener('click', activateBoost);
    boostBarContainer.addEventListener('touchstart', e=>{e.preventDefault();activateBoost();});
  }
}
