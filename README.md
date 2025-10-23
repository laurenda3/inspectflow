# InspectFlow

A human-centered inspection workflow I built to make life easier for operators, inspectors, and supervisors on the shop floor. No fluff. Just what you actually need: a fast, fillable inspection report, tolerances visible at a glance, autosave, and a layout that respects how we work in real life (desktop or tablet).

I’ve done this job. I know the hiccups—printing packets, hunting SOPs, outdated forms, missing gauge info. InspectFlow is my answer: put the right info in front of the right person at the right time with the fewest clicks possible.

**Created by:** **Laurenda Landry — Software Engineer**  
Background in industrial inspection & machining workflow optimization.

---

## What it does (straight up)

- **8-Round (API 5B) Inspection Report**  
  Fill it like paper—just faster. Tiny numbers like `.00125` are accepted exactly as typed.  
  Tolerances are shown right under each column:
  - **Pitch Dia (L1)**: ± .002 (centered at 0)
  - **Lead**: .002 – .006
  - **Taper Avg**: .061 – .066
  - **Thread Height**: .020 – .030
  - **ID**: 5.275 – 5.375
  - **Standoff**: ± .125 (centered at 0)

- **Soft validation**  
  Out-of-tolerance cells highlight lightly. I don’t block you; I inform you.

- **Autosave**  
  Everything saves locally while you type. Wi-Fi drops? Not a crisis.

- **Responsive, full-width**  
  No wasted margins. Desktop and iPad in landscape feel great. Sticky header + serial column so you don’t lose your place.

- **Express API**  
  The UI talks to a **separate Express server** (no Next.js API routes). Clear separation: Client = UI, Server = data/API.

---

## Screenshots

## Screenshots

![Dashboard](./docs/inspectflows1.png)
![Inspection Report – Full Width](./docs/inspectflows2.png)


---

## Tech Stack

- **Frontend:** Next.js (React) + TypeScript
- **Styling:** Tailwind CSS
- **State & Logic:** React hooks, localStorage autosave, tolerance checks
- **API:** **Express (Node.js)** — the only API the client calls
- **Transport:** REST (JSON). CORS enabled for local dev.

---

## Run it locally

> Open two terminals: one for the **server**, one for the **client**.

### 1) Server (Express API)
```bash
cd server
npm install
# optional: copy env template if you have one
# cp .env.example .env
npm run dev
# -> API on http://localhost:3001
