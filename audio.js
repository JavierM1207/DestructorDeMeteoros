export let synth, explosionSynth, gameOverSynth, hitSynth, powerUpSynth, metallicHitSynth, superPowerSynth, shieldBreakSynth, laserShootSynth, shockwaveSynth, superPowerPickupSynth, boostSynth;
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
export { initAudio, playSound, synth, explosionSynth, gameOverSynth, hitSynth, powerUpSynth, metallicHitSynth, superPowerSynth, shieldBreakSynth, laserShootSynth, shockwaveSynth, superPowerPickupSynth, boostSynth };
