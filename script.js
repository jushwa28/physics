const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');

// State Variables
let time = 0;
let pulseActive = false;
let pulseTime = 0;

// Floating context backgrounds
const particles = [];
for (let i = 0; i < 40; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.2 + 0.05),
        alpha: Math.random() * 0.5 + 0.2
    });
}

// Element Bindings
const waveTypeSelect = document.getElementById('waveType');
const ampUnitSelect = document.getElementById('ampUnit');
const ampInput = document.getElementById('ampInput');
const freqSlider = document.getElementById('freqSlider');
const tensionSlider = document.getElementById('tensionSlider');
const pulseBtnContainer = document.getElementById('pulseBtnContainer');
const pulseBtn = document.getElementById('pulseBtn');

// Value Displays
const freqVal = document.getElementById('freqVal');
const tensionVal = document.getElementById('tensionVal');
const outSpeed = document.getElementById('outSpeed');
const outLambda = document.getElementById('outLambda');
const outOmega = document.getElementById('outOmega');
const outK = document.getElementById('outK');

waveTypeSelect.addEventListener('change', (e) => {
    if(e.target.value === 'pulse') {
        pulseBtnContainer.style.display = 'block';
    } else {
        pulseBtnContainer.style.display = 'none';
        pulseActive = false;
    }
});

pulseBtn.addEventListener('click', () => {
    pulseActive = true;
    pulseTime = 0;
});

function drawCyberGrid() {
    ctx.strokeStyle = 'rgba(0, 118, 255, 0.15)';
    ctx.lineWidth = 1;
    
    let gridHorizon = canvas.height * 0.45;
    let numLines = 24;

    for (let i = 0; i <= numLines; i++) {
        let xOffset = (i / numLines) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(xOffset, gridHorizon);
        ctx.lineTo((xOffset - canvas.width/2) * 1.5 + canvas.width/2, canvas.height);
        ctx.stroke();
    }

    for (let y = gridHorizon; y < canvas.height; y += 15) {
        let ratio = (y - gridHorizon) / (canvas.height - gridHorizon);
        ctx.strokeStyle = `rgba(0, 118, 255, ${ratio * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function updateParticles() {
    particles.forEach(p => {
        p.y += p.speedY;
        if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(135, 206, 250, ${p.alpha})`;
        ctx.fill();
    });
}

function animate() {
    ctx.fillStyle = 'rgba(4, 8, 20, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCyberGrid();
    updateParticles();

    let rawAmp = parseFloat(ampInput.value) || 0;
    let ampUnit = ampUnitSelect.value;
    let amplitudeInMeters;

    if (ampUnit === 'cm') amplitudeInMeters = rawAmp / 100;
    else if (ampUnit === 'in') amplitudeInMeters = rawAmp * 0.0254;
    else amplitudeInMeters = rawAmp;

    let visualAmplitude = Math.min(amplitudeInMeters * 50, 90); 
    let frequency = parseFloat(freqSlider.value);
    freqVal.innerText = frequency.toFixed(2);

    let tensionRaw = parseInt(tensionSlider.value);
    let speed = tensionRaw === 10 ? 150 : (tensionRaw === 30 ? 300 : 450);
    tensionVal.innerText = tensionRaw === 10 ? "Low" : (tensionRaw === 30 ? "Medium" : "High");

    let wavelength = speed / frequency;
    let omega = 2 * Math.PI * frequency;
    let k = (2 * Math.PI) / wavelength;

    outSpeed.innerText = speed.toFixed(2);
    outLambda.innerText = wavelength.toFixed(2);
    outOmega.innerText = omega.toFixed(2);
    outK.innerText = k.toFixed(4);

    let midY = canvas.height / 2;
    let numPoints = 120; 

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, midY);
    ctx.lineTo(canvas.width, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f2fe';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00f2fe';
    ctx.beginPath();

    for (let i = 0; i <= numPoints; i++) {
        let x = (i / numPoints) * canvas.width;
        let y = midY;

        if (waveTypeSelect.value === 'oscillate') {
            y += visualAmplitude * Math.sin(k * x - omega * time);
        } else if (waveTypeSelect.value === 'pulse' && pulseActive) {
            let pulseCenter = speed * pulseTime;
            let distanceFromCenter = x - pulseCenter;
            let pulseWidth = 70;
            y += visualAmplitude * Math.exp(-Math.pow(distanceFromCenter / pulseWidth, 2)) * Math.sin(k * x - omega * pulseTime);
        }

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0; 

    for (let i = 4; i < numPoints; i += 6) {
        let x = (i / numPoints) * canvas.width;
        let y = midY;

        if (waveTypeSelect.value === 'oscillate') {
            y += visualAmplitude * Math.sin(k * x - omega * time);
        } else if (waveTypeSelect.value === 'pulse' && pulseActive) {
            let pulseCenter = speed * pulseTime;
            let distanceFromCenter = x - pulseCenter;
            let pulseWidth = 70;
            y += visualAmplitude * Math.exp(-Math.pow(distanceFromCenter / pulseWidth, 2)) * Math.sin(k * x - omega * pulseTime);
        }

        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 242, 254, 0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }

    time += 0.025;
    if(pulseActive) {
        pulseTime += 0.025;
        if(speed * pulseTime > canvas.width + 150) {
            pulseActive = false;
        }
    }

    requestAnimationFrame(animate);
}

animate();