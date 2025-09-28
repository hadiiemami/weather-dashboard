# Weather Dashboard 🌦️

A minimal, dark-themed weather dashboard with an interactive **OpenStreetMap (OSM)** map (via **Leaflet**).  
Pick a location by **searching** or **clicking on the map** and view **current weather**, **air quality**, and the **5‑day / 3‑hour forecast** — with clean vector **icons by Weather Icons**.

- Dark theme color: **`#111827`**
- 100% **client-side** (no backend). Your API key is stored in your browser’s `localStorage`.
- Built with **HTML, CSS, and JavaScript**

---

## 🎥 Demo

(Optional) Add a GIF or screenshot of the app here:


![Demo](Intro.gif)


---

## 🚀 Features

- 🗺️ **Interactive map** (Leaflet + OSM tiles)
- 🔎 **Search by place name** (OpenWeather Geocoding API) and **map click** to select any point
- 🌤️ **Current weather**: temperature, feels-like, humidity, wind speed/direction, clouds, pressure, sunrise/sunset
- 🌫️ **Air quality** (OpenWeather Air Pollution API): AQI + PM2.5, PM10, NO₂, O₃, SO₂, CO
- 📅 **5‑day / 3‑hour forecast** (scrollable list)
- 🎨 **Dark UI** with color `#111827`
- 🧩 **Weather icons** via Erik Flowers’ **Weather Icons** (icon font + CSS)
- ⚙️ **Settings dialog** for: API key, units (metric/imperial/standard), and initial city
- 💾 Preferences persisted in `localStorage`

> **Note:** This project intentionally **does not** include hourly charts or precipitation charts.

---

## 🔌 Data & APIs

This app uses the following **OpenWeather** endpoints:

- **Geocoding API** (Direct): `GET /geo/1.0/direct`
- **Current Weather**: `GET /data/2.5/weather`
- **5‑day / 3‑hour Forecast**: `GET /data/2.5/forecast`
- **Air Pollution**: `GET /data/2.5/air_pollution`

You’ll need an **OpenWeather API key**. The app prompts for it on first run and saves it in your browser.

---

## 🎯 Icons

- Icons are provided by **[Weather Icons (Erik Flowers)](https://erikflowers.github.io/weather-icons/)**.  
- Licenses: **SIL OFL 1.1** (font) and **MIT** (CSS/LESS/SASS). Please see their repo for details.
- In this project, the icon mapping translates OpenWeather codes → Weather Icons classes (e.g., `wi wi-day-sunny`, `wi wi-rain`, `wi wi-snow`, …).

> To make icons work, place the downloaded `weather-icons-master/` folder next to `index.html`, keeping its internal `css/` and `font/` structure intact.

---

## 📂 Project Structure

```bash
weather-dashboard/
│
├── index.html                # Main entry
├── css/
│   └── style.css             # Theme & layout (dark: #111827)
├── js/
│   └── app.js                # App logic (Leaflet + OpenWeather)
├── weather-icons-master/     # Weather Icons (downloaded)
│   ├── css/
│   │   └── weather-icons.min.css
│   └── font/
│       ├── weathericons-regular-webfont.woff2
│       ├── weathericons-regular-webfont.woff
│       └── weathericons-regular-webfont.ttf
└── Intro.gif                 # (Optional) Demo GIF
```

---

## ⚡ How to Run (Local)

### Option A — VS Code Live Server (recommended)
1. Open the folder in VS Code.
2. Right‑click `index.html` → **Open with Live Server**.

### Option B — Python simple server
```bash
# From the project folder:
python -m http.server 5500
# Then open: http://127.0.0.1:5500/
```

---

## 🛠 First‑time Setup (in App)

1. Click **Settings** (top right).
2. Paste your **OpenWeather API key**.
3. Choose **Units** (`metric`, `imperial`, or `standard`).
4. Set an **initial city** (e.g., `Baku`) and save.
5. Search a place or click on the map to update the dashboard.

> The API key and preferences are stored in your browser’s `localStorage`.

---

## 🌐 Live Demo (GitHub Pages)

When you enable **GitHub Pages** for this repository (Settings → Pages → *Deploy from a branch*, `main`, `/ (root)`), your app will be accessible at:

```
https://hadiiemami.github.io/weather-dashboard/
```

---

## 🧩 Tech Stack

- **Leaflet** (map) + **OpenStreetMap** tiles
- **OpenWeather** (Geocoding, Current, Forecast, Air Pollution)
- **Weather Icons** (icon font & CSS)
- **HTML, CSS, JavaScript** (client‑side only)

---

## 🔒 Notes on API Key

This is a **static** site. Your API key is entered by the user and stored client‑side.  
For a public deployment where you want to hide a key, consider a tiny proxy (Cloudflare Workers / Vercel / Netlify Functions) to keep secrets server‑side.

---

## 📜 License

This project’s code is under the **MIT License** (unless you choose otherwise).  
Weather Icons are © Erik Flowers and contributors (see their license).  
OpenStreetMap tiles © OpenStreetMap contributors.

---

✨ Built with ❤️ using **Leaflet + OpenStreetMap + OpenWeather + Weather Icons**
