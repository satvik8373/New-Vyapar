# New-Vyapar

> **Navo Vyapar (નવો વ્યાપાર)** — A modern, full-featured Gujarati business and commerce multiplayer board game built with React, TypeScript, Vite, Framer Motion, and Firebase Realtime Database.

---

## 🌟 Overview

**Navo Vyapar** brings the beloved experience of classic business & monopoly trading games to Gujarat's vibrant economy. Players roll the 3D dice, drive miniature collectible car tokens tile-by-tile across iconic Gujarati commercial hubs (Ahmedabad, Surat, Vadodara, Rajkot, Bhavnagar, Jamnagar, Gandhinagar, GIFT City, and Statue of Unity), acquire property deeds, develop houses & luxury hotels, collect rents, and build trading empires!

---

## ✨ Key Features

- 🎲 **Interactive 3D Dice Rolling**: Realistic physics tumbling and instant face reveal.
- 🚗 **Smooth Tile-by-Tile Car Driving**: Collectible miniature cars glide along the road lane with dynamic corner rotation, realistic engine purr, brake screeches, and dividend chimes.
- 🌐 **Online Multiplayer (Firebase Realtime Database)**:
  - Create and join rooms with 5-letter room codes.
  - Live opponent turn sync with real-time audio and animations.
  - Automatic session reconnection and state recovery.
- 🤖 **Smart Solo Play (Offline Bot AI)**: Intelligent AI bots with distinct personalities, risk profiles, and automatic turn progression.
- 🏙️ **Gujarat Commerce & Heritage Theme**:
  - 32 board tiles featuring prominent Gujarat cities, ports (Kandla, Mundra, Pipavav), municipal utilities, and state landmarks.
  - Authentic Gujarati nomenclature and bilingual deed cards.
- 💰 **Economic & Property System**:
  - Buying unowned properties, ports, and utilities.
  - Dynamic rent calculation based on house and hotel tiers.
  - GST Municipal taxes, Sabarmati Central Jail detainment, and chance fortune cards.
- 🎵 **Custom Sound Engine**: Web Audio API generated sound effects (dice rolls, car acceleration, brakes, money chimes, card flips).
- 📱 **Mobile & PWA Ready**: Fully responsive layout with standalone PWA support, official clean icon, and touch-optimized controls.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI & Animation**: Framer Motion, Emotion, Material-UI Icons, Lucide Icons, Canvas Confetti
- **Multiplayer Backend**: Firebase Realtime Database
- **Audio Engine**: Web Audio API Sound Synthesizer
- **Hosting / Deployment**: Vercel ready

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or newer)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/satvikpatel8373/New-Vyapar.git

# Navigate to project directory
cd New-Vyapar

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Type-check and bundle production assets
npm run build

# Preview production build locally
npm run preview
```

---

## 📦 Deployment to Vercel

This project includes a pre-configured `vercel.json` for single-page application (SPA) routing:

1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Set the Framework Preset to **Vite**.
4. Click **Deploy** — your game will be live instantly!

---

## 📄 License

MIT License. Designed with ❤️ for Gujarat commerce and board game enthusiasts.
