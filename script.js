// NYC Airbnb — Room Type Predictor Frontend Logic

const form = document.getElementById('predictionForm');
const predictBtn = document.getElementById('predictBtn');
const exampleBtn = document.getElementById('exampleBtn');
const availSlider = document.getElementById('availability_365');
const availDisplay = document.getElementById('availDisplay');

const apiStatus = document.getElementById('apiStatus');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

const emptyState = document.getElementById('emptyState');
const resultState = document.getElementById('resultState');
const winnerIcon = document.getElementById('winnerIcon');
const winnerName = document.getElementById('winnerName');
const winnerConfidence = document.getElementById('winnerConfidence');

const barEntire = document.getElementById('barEntire');
const valEntire = document.getElementById('valEntire');
const barPrivate = document.getElementById('barPrivate');
const valPrivate = document.getElementById('valPrivate');
const barShared = document.getElementById('barShared');
const valShared = document.getElementById('valShared');

const insightText = document.getElementById('insightText');
const predictionCard = document.getElementById('predictionCard');

// Real NYC Listing Examples
const EXAMPLES = [
  {
    name: "Williamsburg Loft (Entire Home)",
    lat: 40.7144,
    lon: -73.9554,
    borough: "Brooklyn",
    neighbourhood: "Williamsburg",
    price: 195,
    min_nights: 3,
    avail: 180,
    reviews: 32,
    rev_month: 1.6,
    host_listings: 1
  },
  {
    name: "Luxury SoHo Penthouse",
    lat: 40.7241,
    lon: -73.9998,
    borough: "Manhattan",
    neighbourhood: "SoHo",
    price: 360,
    min_nights: 2,
    avail: 240,
    reviews: 58,
    rev_month: 2.3,
    host_listings: 2
  },
  {
    name: "Quiet Brownstone Bedroom",
    lat: 40.6862,
    lon: -73.9482,
    borough: "Brooklyn",
    neighbourhood: "Bedford-Stuyvesant",
    price: 78,
    min_nights: 1,
    avail: 120,
    reviews: 19,
    rev_month: 0.9,
    host_listings: 1
  },
  {
    name: "East Village Cozy Flat",
    lat: 40.7282,
    lon: -73.9857,
    borough: "Manhattan",
    neighbourhood: "East Village",
    price: 175,
    min_nights: 3,
    avail: 90,
    reviews: 44,
    rev_month: 1.8,
    host_listings: 1
  },
  {
    name: "Midtown Traveler Bunk",
    lat: 40.7549,
    lon: -73.9840,
    borough: "Manhattan",
    neighbourhood: "Midtown",
    price: 42,
    min_nights: 1,
    avail: 45,
    reviews: 12,
    rev_month: 0.5,
    host_listings: 3
  }
];

let exampleIndex = 0;

// Update Slider Track Color & Badge
function updateSliderTrack() {
  const min = availSlider.min || 0;
  const max = availSlider.max || 365;
  const val = availSlider.value;
  const pct = ((val - min) / (max - min)) * 100;
  availSlider.style.background = `linear-gradient(to right, #f59e0b 0%, #f59e0b ${pct}%, #1e293b ${pct}%, #1e293b 100%)`;
  availDisplay.textContent = val;
}

availSlider.addEventListener('input', updateSliderTrack);
updateSliderTrack();

// Populate an Example Listing
function populateExample(ex) {
  document.getElementById('latitude').value = ex.lat;
  document.getElementById('longitude').value = ex.lon;
  document.getElementById('neighbourhood_group').value = ex.borough;
  document.getElementById('neighbourhood').value = ex.neighbourhood;
  document.getElementById('price').value = ex.price;
  document.getElementById('minimum_nights').value = ex.min_nights;
  availSlider.value = ex.avail;
  updateSliderTrack();
  document.getElementById('number_of_reviews').value = ex.reviews;
  document.getElementById('reviews_per_month').value = ex.rev_month;
  document.getElementById('calculated_host_listings_count').value = ex.host_listings;
}

exampleBtn.addEventListener('click', () => {
  exampleBtn.style.transform = 'scale(0.95)';
  setTimeout(() => (exampleBtn.style.transform = ''), 150);
  
  const ex = EXAMPLES[exampleIndex % EXAMPLES.length];
  populateExample(ex);
  exampleIndex++;
});

// Check API Health
async function checkApiHealth() {
  try {
    const res = await fetch('/api/health', { method: 'GET', cache: 'no-cache' });
    if (res.ok) {
      statusDot.className = 'status-dot pulse';
      statusText.textContent = 'API connected';
      return true;
    }
  } catch (err) {
    // API not reachable directly (e.g. static preview or offline)
  }
  statusDot.className = 'status-dot warning';
  statusText.textContent = 'Standalone Demo';
  return false;
}

// Fallback intelligent predictor if backend API is not running
function simulatePrediction(data) {
  let pEntire = 0.1;
  let pPrivate = 0.5;
  let pShared = 0.05;

  const price = parseFloat(data.price);
  const minNights = parseInt(data.minimum_nights);

  if (price >= 160) {
    pEntire += 0.65;
    pPrivate -= 0.35;
  } else if (price >= 110) {
    pEntire += 0.4;
    pPrivate -= 0.2;
  } else if (price <= 55) {
    pShared += 0.35;
    pPrivate += 0.15;
    pEntire = 0.02;
  }

  if (minNights >= 3) {
    pEntire += 0.15;
    pShared -= 0.05;
  }

  if (data.neighbourhood_group === 'Manhattan') {
    if (price > 140) pEntire += 0.1;
  }

  const sum = Math.max(0.001, pEntire + pPrivate + pShared);
  pEntire = pEntire / sum;
  pPrivate = pPrivate / sum;
  pShared = pShared / sum;

  let predicted = 'Entire home/apt';
  if (pPrivate >= pEntire && pPrivate >= pShared) {
    predicted = 'Private room';
  } else if (pShared >= pEntire && pShared >= pPrivate) {
    predicted = 'Shared room';
  }

  return {
    Predicted_room_type: predicted,
    Probabilities: {
      'Entire home/apt': pEntire,
      'Private room': pPrivate,
      'Shared room': pShared
    }
  };
}

// Render Prediction Result in UI
function renderPrediction(result, inputData) {
  emptyState.classList.add('hidden');
  resultState.classList.remove('hidden');

  const winner = result.Predicted_room_type;
  winnerName.textContent = winner;

  let icon = '🏡';
  if (winner === 'Private room') icon = '🚪';
  if (winner === 'Shared room') icon = '🛏️';
  winnerIcon.textContent = icon;

  let probs = result.Probabilities;
  if (!probs && result.Probability && result.Classes) {
    probs = {};
    result.Classes.forEach((c, idx) => {
      probs[c] = result.Probability[idx];
    });
  }

  const pEntire = Math.round((probs['Entire home/apt'] || 0) * 100);
  const pPrivate = Math.round((probs['Private room'] || 0) * 100);
  const pShared = Math.round((probs['Shared room'] || 0) * 100);

  const winningConfidence = Math.max(pEntire, pPrivate, pShared);
  winnerConfidence.textContent = `${winningConfidence}% Confidence`;

  valEntire.textContent = `${pEntire}%`;
  barEntire.style.width = `${pEntire}%`;

  valPrivate.textContent = `${pPrivate}%`;
  barPrivate.style.width = `${pPrivate}%`;

  valShared.textContent = `${pShared}%`;
  barShared.style.width = `${pShared}%`;

  // Dynamic Insight Generator
  let insight = '';
  if (winner === 'Entire home/apt') {
    insight = `At $${inputData.price}/night in ${inputData.neighbourhood}, this listing exhibits pricing and booking patterns characteristic of full apartments and private home stays.`;
  } else if (winner === 'Private room') {
    insight = `With an accessible nightly rate ($${inputData.price}) and typical traveler availability, this listing aligns with private room offerings in ${inputData.neighbourhood_group}.`;
  } else {
    insight = `The lower nightly price ($${inputData.price}) and short stay flexibility strongly match shared accommodation or communal dormitory setups in NYC.`;
  }
  insightText.textContent = insight;

  // Mobile Friendly UX: Auto scroll to result if on mobile/stacked view
  if (window.innerWidth <= 960 && predictionCard) {
    predictionCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Handle Form Submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = {
    latitude: parseFloat(formData.get('latitude')),
    longitude: parseFloat(formData.get('longitude')),
    price: parseFloat(formData.get('price')),
    minimum_nights: parseInt(formData.get('minimum_nights')),
    number_of_reviews: parseInt(formData.get('number_of_reviews')),
    reviews_per_month: parseFloat(formData.get('reviews_per_month')),
    calculated_host_listings_count: parseInt(formData.get('calculated_host_listings_count')),
    availability_365: parseInt(formData.get('availability_365')),
    neighbourhood_group: formData.get('neighbourhood_group'),
    neighbourhood: formData.get('neighbourhood')
  };

  const btnText = predictBtn.querySelector('.btn-text');
  const spinner = predictBtn.querySelector('.spinner');

  predictBtn.disabled = true;
  btnText.textContent = 'Predicting...';
  spinner.classList.remove('hidden');

  try {
    let result = null;
    try {
      const resp = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        result = await resp.json();
      }
    } catch (netErr) {
      console.warn('Backend /predict unavailable, using simulated model:', netErr);
    }

    if (!result) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      result = simulatePrediction(data);
    }

    renderPrediction(result, data);
  } catch (err) {
    console.error('Prediction error:', err);
  } finally {
    predictBtn.disabled = false;
    btnText.textContent = 'Predict room type';
    spinner.classList.add('hidden');
  }
});

// Ambient Particles Canvas Animation (optimized for mobile)
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const isMobile = window.innerWidth <= 600;
  const count = isMobile ? 22 : 45;
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.8,
      speedY: Math.random() * 0.35 + 0.12,
      speedX: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.2,
      amber: Math.random() > 0.4
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.amber
        ? `rgba(245, 158, 11, ${p.alpha * 0.7})`
        : `rgba(45, 212, 191, ${p.alpha * 0.6})`;
      ctx.shadowColor = p.amber ? '#f59e0b' : '#2dd4bf';
      ctx.shadowBlur = p.amber ? 5 : 3;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// Generate Skyline Illuminated Windows
function initSkylineWindows() {
  const container = document.getElementById('skylineWindows');
  if (!container) return;

  const isMobile = window.innerWidth <= 600;
  const totalWindows = isMobile ? 35 : 60;
  
  for (let i = 0; i < totalWindows; i++) {
    const win = document.createElement('div');
    win.className = 'win';

    const randX = Math.random() * 96 + 2;
    const randY = Math.random() * 55 + 38;

    win.style.left = `${randX}%`;
    win.style.top = `${randY}%`;

    const randType = Math.random();
    if (randType > 0.65) win.classList.add('amber');
    else if (randType > 0.45) win.classList.add('blue');

    if (Math.random() > 0.5) {
      win.classList.add('flicker');
      win.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
      win.style.animationDuration = `${(Math.random() * 3 + 2).toFixed(2)}s`;
    }

    container.appendChild(win);
  }
}

// Init on Load
window.addEventListener('DOMContentLoaded', () => {
  checkApiHealth();
  initParticleCanvas();
  initSkylineWindows();
});
