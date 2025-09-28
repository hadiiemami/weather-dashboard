// Weather Dashboard (no charts) — with Weather Icons (erikflowers)
// All code & comments in English as requested.

// ---- Global state ----
const state = {
  apiKey: localStorage.getItem('ow_api_key') || '',
  units: localStorage.getItem('ow_units') || 'metric',
  defaultCity: localStorage.getItem('ow_default_city') || 'Baku',
  location: { lat: 40.4093, lon: 49.8671, name: 'Baku' },
  cooldownMs: 1200,
  lastFetchTs: 0,
};

// ---- Helpers ----
const $ = (sel) => document.querySelector(sel);
const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const pad2 = (n) => String(n).padStart(2, '0');

function windDirFromDeg(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}
function unixToLocalStr(ts, tzOffsetSec) {
  const d = new Date((ts + (tzOffsetSec || 0)) * 1000);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// ---- Settings dialog ----
const dlg = $('#settingsDialog');
$('#openSettings').addEventListener('click', (e) => { e.preventDefault(); openSettings(); });
$('#closeSettings').addEventListener('click', () => dlg.close());
$('#settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const key = $('#apiKeyInput').value.trim();
  const units = $('#unitsSelect').value;
  const city = $('#defaultCityInput').value.trim() || 'Baku';
  state.apiKey = key; state.units = units; state.defaultCity = city;
  localStorage.setItem('ow_api_key', key);
  localStorage.setItem('ow_units', units);
  localStorage.setItem('ow_default_city', city);
  dlg.close();
  fetchAll(state.location.lat, state.location.lon, state.location.name);
});
function openSettings() {
  $('#apiKeyInput').value = state.apiKey;
  $('#unitsSelect').value = state.units;
  $('#defaultCityInput').value = state.defaultCity;
  dlg.showModal();
}

// ---- Leaflet map ----
let map, marker;
function initMap() {
  map = L.map('map').setView([state.location.lat, state.location.lon], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  marker = L.marker([state.location.lat, state.location.lon]).addTo(map);
  marker.bindPopup('Loading...');

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    setLocation(lat, lng, `Lat ${lat.toFixed(4)}, Lon ${lng.toFixed(4)}`);
    fetchAll(lat, lng);
  });
}
function setLocation(lat, lon, name = '') {
  state.location = { lat, lon, name };
  marker.setLatLng([lat, lon]);
  $('#coordText').textContent = `Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`;
  $('#currentLoc').textContent = name || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
}

// ---- Geocoding (OpenWeather) ----
async function geocodeCity(q) {
  if (!ensureKey()) return;
  const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '5');
  url.searchParams.set('appid', state.apiKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const items = await res.json();
  const container = $('#searchResults');
  container.innerHTML = '';
  if (!items.length) {
    container.classList.remove('hidden');
    container.innerHTML = '<small class="muted">No results</small>';
    return;
  }
  const ul = document.createElement('ul');
  items.forEach((it) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    const label = [it.name, it.state, it.country].filter(Boolean).join(', ');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      container.classList.add('hidden');
      setLocation(it.lat, it.lon, label);
      map.setView([it.lat, it.lon], 10);
      fetchAll(it.lat, it.lon, label);
    });
    li.appendChild(btn); ul.appendChild(li);
  });
  container.appendChild(ul);
  container.classList.remove('hidden');
}

// ---- Weather fetching ----
async function fetchAll(lat, lon, label) {
  if (!ensureKey()) return;
  const now = Date.now();
  if (now - state.lastFetchTs < state.cooldownMs) return;
  state.lastFetchTs = now;

  $('#updatedAt').textContent = 'Updating…';
  try {
    const [current, forecast, air] = await Promise.all([
      fetchCurrent(lat, lon),
      fetchForecast(lat, lon),
      fetchAir(lat, lon),
    ]);
    renderAll(current, forecast, air, label);
  } catch (err) {
    console.error(err);
    alert('Failed to fetch data. Check your API key / network.');
    $('#updatedAt').textContent = '';
  }
}
function ensureKey() {
  if (!state.apiKey) { openSettings(); return false; }
  return true;
}
async function fetchCurrent(lat, lon) {
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('units', state.units);
  url.searchParams.set('appid', state.apiKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Current weather failed');
  return res.json();
}
async function fetchForecast(lat, lon) {
  const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('units', state.units);
  url.searchParams.set('appid', state.apiKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast failed');
  return res.json();
}
async function fetchAir(lat, lon) {
  const url = new URL('https://api.openweathermap.org/data/2.5/air_pollution');
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('appid', state.apiKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Air quality failed');
  return res.json();
}

// ---- Icon mapping (OpenWeather -> Weather Icons classes) ----
function wiClassFromOW(weather) {
  // weather.id (numeric code), weather.icon like "10d"/"10n", weather.main
  if (!weather) return 'wi wi-na';
  const id = weather.id || 800;
  const icon = weather.icon || '01d';
  const isDay = icon.includes('d');

  if (id >= 200 && id <= 232) return 'wi wi-thunderstorm';
  if (id >= 300 && id <= 321) return 'wi wi-sprinkle';
  if (id >= 500 && id <= 504) return 'wi wi-rain';
  if (id === 511) return 'wi wi-rain-mix'; // freezing rain
  if (id >= 520 && id <= 531) return 'wi wi-showers';
  if (id >= 600 && id <= 622) return 'wi wi-snow';
  if (id >= 701 && id <= 771) return 'wi wi-fog';
  if (id === 781) return 'wi wi-tornado';
  if (id === 800) return isDay ? 'wi wi-day-sunny' : 'wi wi-night-clear';
  if (id === 801) return isDay ? 'wi wi-day-cloudy' : 'wi wi-night-alt-cloudy';
  if (id === 802) return 'wi wi-cloud'; // scattered
  if (id === 803) return 'wi wi-cloudy'; // broken
  if (id === 804) return 'wi wi-cloudy'; // overcast
  return 'wi wi-na';
}

// ---- Render ----
function renderAll(current, forecast, air, label) {
  const name = label || `${current.name || ''}`.trim();
  if (name) $('#currentLoc').textContent = name;

  // Marker popup
  const w = current.weather?.[0];
  marker.setPopupContent(`
    <div style="display:flex;align-items:center;gap:.5rem;">
      <i class="${wiClassFromOW(w)}" style="font-size:26px;"></i>
      <div><strong>${name || 'Selected point'}</strong><br/>${fmt.format(current.main.temp)}° (${w?.description || ''})</div>
    </div>
  `);
  marker.openPopup();

  const tz = current.timezone || 0;
  $('#temp').textContent = `${fmt.format(current.main.temp)}°`;
  $('#feels').textContent = `${fmt.format(current.main.feels_like)}°`;
  $('#humidity').textContent = `${current.main.humidity}%`;
  const windUnit = state.units === 'imperial' ? 'mph' : 'm/s';
  $('#wind').textContent = `${fmt.format(current.wind.speed)} ${windUnit} ${current.wind.deg != null ? '('+ windDirFromDeg(current.wind.deg) +')' : ''}`;
  $('#clouds').textContent = `${current.clouds?.all ?? '—'}%`;
  $('#pressure').textContent = `${current.main.pressure} hPa`;
  $('#sunrise').textContent = unixToLocalStr(current.sys.sunrise, tz);
  $('#sunset').textContent = unixToLocalStr(current.sys.sunset, tz);
  $('#conditionText').textContent = JSON.stringify(current.weather?.[0] || {}, null, 2);
  $('#updatedAt').textContent = `Updated: ${new Date().toLocaleTimeString()}`;

  // Main big icon
  $('#weatherIcon').className = wiClassFromOW(w) + ' icon-xl';

  // Air quality
  const aq = air?.list?.[0];
  if (aq) {
    const aqi = aq.main.aqi; // 1..5
    const labels = {1:'Good',2:'Fair',3:'Moderate',4:'Poor',5:'Very Poor'};
    $('#aqiLabel').textContent = `AQI ${aqi} · ${labels[aqi]}`;
    $('#pm25').textContent = `${fmt.format(aq.components.pm2_5)} µg/m³`;
    $('#pm10').textContent = `${fmt.format(aq.components.pm10)} µg/m³`;
    $('#no2').textContent = `${fmt.format(aq.components.no2)} µg/m³`;
    $('#o3').textContent = `${fmt.format(aq.components.o3)} µg/m³`;
    $('#so2').textContent = `${fmt.format(aq.components.so2)} µg/m³`;
    $('#co').textContent = `${fmt.format(aq.components.co)} µg/m³`;
  }

  // Forecast list
  renderForecast(forecast);
}

function renderForecast(forecast) {
  const tz = forecast.city?.timezone || 0;
  const list = forecast.list || [];
  const container = $('#forecastList');
  container.innerHTML = '';

  list.forEach((it) => {
    const d = new Date((it.dt + tz) * 1000);
    const time = `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:00`;
    const w = it.weather?.[0];
    const iconClass = wiClassFromOW(w);

    const row = document.createElement('div');
    row.className = 'forecast-item';
    row.innerHTML = `
      <div class="forecast-left">
        <i class="${iconClass}"></i>
        <strong class="forecast-temp">${fmt.format(it.main.temp)}°</strong>
        <small class="muted">${w?.description || ''}</small>
      </div>
      <small>${time}</small>
      <small>POP: ${Math.round((it.pop || 0)*100)}%</small>
      <small>Wind: ${fmt.format(it.wind.speed)}${(state.units==='imperial'?' mph':' m/s')}</small>
    `;
    container.appendChild(row);
  });
}

// ---- Search form ----
$('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('#searchInput').value.trim();
  if (q) geocodeCity(q);
});

// ---- Bootstrap ----
(async function start() {
  initMap();
  if (!state.apiKey) { openSettings(); }
  try {
    await geocodeCity(state.defaultCity);
  } catch (e) {
    fetchAll(state.location.lat, state.location.lon, state.location.name);
  }
})();
