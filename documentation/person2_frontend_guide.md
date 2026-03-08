# CivicPulse: Person 2 (Frontend & 3D Map) Master Guide

Welcome to the **CivicPulse** frontend! You are responsible for the stunning 3D visual map and the React UI. This guide is designed so that you (or an AI agent) can drop into the repo and immediately build the UI.

## Current State of Your Domain
You have already completed the Saturday deliverables. The current directory `civicpulse/` has the following ready:
- Vite React 18 scaffolded.
- Tailwind v3 installed and perfectly configured to the dark-mode color specification in `tailwind.config.js` and `index.css`.
- The application shell `App.jsx` exists with a functional top navigation bar, accurate styling, flexbox layout, and state hooks for the three user modes (Entrepreneur, Contractor, Resident).
- `.env.example` is ready for your `VITE_MAPBOX_TOKEN`.

## Your Sunday Deliverables

### 1. The Mapbox Integration (`src/components/CivicMap.jsx`)
**Goal:** Render the base map of Montgomery, AL.
**Requirements:**
- Use `mapbox-gl`.
- Center on `[-86.2964, 32.3617]`, Zoom 12.
- Map style: `mapbox://styles/mapbox/dark-v11`.
- When the map loads, fetch data from `GET http://localhost:8000/api/heatmap`.
- Render the heatmap data as a Mapbox circle layer (colored based on `survival_score`).
- Implement an `onClick` listener on the map to capture `lat/lng` and pass it up to the parent component.

### 2. The 3D Pillars (`src/components/ThreePillars.jsx` or Mapbox Extrusions)
**Goal:** Add the "wow" factor by rendering glowing 3D pillars over the map blocks.
**Requirements:**
- **Primary Plan:** Create a `THREE.Scene` over the map canvas. Map the heatmap `lat/lng` scores to 3D `BoxGeometry` pillars. Height = score / 10. Emissive materials based on score (Green > 70, Yellow 40-70, Red < 40).
- **Fallback Plan (Crucial):** If WebGL contexts conflict between Mapbox and Three.js, do NOT waste more than 3 hours debugging. Fall back immediately to using Mapbox `fill-extrusion` layers. The visual impact is nearly identical and it is natively supported.

### 3. The Three Side Panels
**Goal:** Build the interactive UI panels for the three user modes that communicate with Person 1's backend.
**Requirements:**

**`src/components/EntrepreneurPanel.jsx`**
- Input field for Address/Lat-Lng and a dropdown for Business Category.
- On submit, fetch `/api/block`.
- Display the `survival_score` as a large animated circular progress ring.
- Render the `permit_history` array as a vertical timeline.
- Render an AI output box by calling `POST /api/generate` with `mode: "entrepreneur"`.

**`src/components/ContractorPanel.jsx`**
- Fetch and display a list of cards from `/api/contracts`.
- Each card shows: category, estimated value, and matched Bright Data business.
- Add a "Generate Bid" button. On click, call `POST /api/generate` with `mode: "contractor"`.
- Display the Claude-generated bid proposal in a scrollable markdown container.

**`src/components/ResidentPanel.jsx`**
- Listens to map clicks to capture a neighborhood.
- Displays `civic_health_score` broken down into 4 horizontal progress bars (infrastructure, permits, safety, contracts).
- Add a "Generate Advocacy Letter" button calling `POST /api/generate` with `mode: "resident"`.
- Display the generated letter.
