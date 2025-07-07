// Weather App JavaScript
// API Key
const API_KEY = '62fe8854de323697a188f3fbfb13db26';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const currentWeather = document.getElementById('currentWeather');
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const currentTemp = document.getElementById('currentTemp');
const tempUnit = document.getElementById('tempUnit');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const windDirection = document.getElementById('windDirection');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const uvIndex = document.getElementById('uvIndex');
const clouds = document.getElementById('clouds');

// --- My Location Button ---
const locationBtn = document.getElementById('locationBtn');
locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    errorText.textContent = 'Geolocation is not supported by your browser.';
    show(errorMessage);
    return;
  }
  show(loadingSpinner);
  hide(errorMessage);
  hide(currentWeather);
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${getTempUnit()}`);
      if (!res.ok) throw new Error('Location weather not found');
      const data = await res.json();
      displayWeather(data);
    } catch (err) {
      errorText.textContent = err.message || 'Failed to fetch weather.';
      show(errorMessage);
    } finally {
      hide(loadingSpinner);
    }
  }, (err) => {
    errorText.textContent = 'Unable to get your location.';
    show(errorMessage);
    hide(loadingSpinner);
  });
});

// --- Settings Modal ---
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const cancelSettings = document.getElementById('cancelSettings');
const saveSettings = document.getElementById('saveSettings');

settingsBtn.addEventListener('click', () => show(settingsModal));
closeSettings.addEventListener('click', () => hide(settingsModal));
cancelSettings.addEventListener('click', () => hide(settingsModal));

// --- Settings Logic ---
function getTempUnit() {
  return (localStorage.getItem('tempUnit') || 'celsius') === 'celsius' ? 'metric' : 'imperial';
}
function getWindUnit() {
  return (localStorage.getItem('windUnit') || 'kmh');
}
function setSettingsUI() {
  const tempUnit = localStorage.getItem('tempUnit') || 'celsius';
  const windUnit = localStorage.getItem('windUnit') || 'kmh';
  document.querySelectorAll('input[name="tempUnit"]').forEach(r => r.checked = (r.value === tempUnit));
  document.querySelectorAll('input[name="windUnit"]').forEach(r => r.checked = (r.value === windUnit));
}
settingsBtn.addEventListener('click', setSettingsUI);

saveSettings.addEventListener('click', () => {
  const tempUnit = document.querySelector('input[name="tempUnit"]:checked').value;
  const windUnit = document.querySelector('input[name="windUnit"]:checked').value;
  localStorage.setItem('tempUnit', tempUnit);
  localStorage.setItem('windUnit', windUnit);
  hide(settingsModal);
  // Optionally, refresh weather if already displayed
  if (cityName.textContent && cityName.textContent !== 'City Name') {
    const city = cityName.textContent.split(',')[0];
    fetchWeather(city);
  }
});

// Helper: Show/Hide
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

// Helper: Convert wind degrees to direction
function degToCompass(num) {
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[(val % 16)];
}

// Helper: Format date
function formatDate(dt) {
  const date = new Date(dt * 1000);
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Fetch weather data
async function fetchWeather(city) {
  show(loadingSpinner);
  hide(errorMessage);
  hide(currentWeather);
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${getTempUnit()}`);
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    errorText.textContent = err.message || 'Failed to fetch weather.';
    show(errorMessage);
  } finally {
    hide(loadingSpinner);
  }
}

// Display weather data
function displayWeather(data) {
  cityName.textContent = data.name + ', ' + data.sys.country;
  currentDate.textContent = formatDate(data.dt);
  currentTemp.textContent = Math.round(data.main.temp);
  tempUnit.textContent = (getTempUnit() === 'metric') ? '°C' : '°F';
  weatherDescription.textContent = data.weather[0].description;
  feelsLike.textContent = Math.round(data.main.feels_like) + ((getTempUnit() === 'metric') ? '°C' : '°F');
  humidity.textContent = data.main.humidity + '%';
  // Wind speed
  let wind = data.wind.speed;
  if (getTempUnit() === 'imperial') wind = wind * 1.60934; // mph to km/h if needed
  if (getWindUnit() === 'kmh') {
    windSpeed.textContent = Math.round(wind * 3.6) + ' km/h'; // m/s to km/h
  } else {
    windSpeed.textContent = Math.round(wind * 2.23694) + ' mph'; // m/s to mph
  }
  windDirection.textContent = degToCompass(data.wind.deg);
  visibility.textContent = (data.visibility / 1000) + ' km';
  pressure.textContent = data.main.pressure + ' hPa';
  clouds.textContent = data.clouds.all + '%';
  uvIndex.textContent = '-'; // Needs separate API call
  // Set icon
  const iconMap = {
    '01': 'fa-sun', '02': 'fa-cloud-sun', '03': 'fa-cloud', '04': 'fa-cloud-meatball',
    '09': 'fa-cloud-showers-heavy', '10': 'fa-cloud-rain', '11': 'fa-bolt', '13': 'fa-snowflake', '50': 'fa-smog'
  };
  const iconCode = data.weather[0].icon.substring(0,2);
  weatherIcon.className = 'fas ' + (iconMap[iconCode] || 'fa-question') + ' text-4xl text-yellow-300 mb-2';
  show(currentWeather);
}

// Event listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
}); 