# StyleSync

StyleSync is a virtual closet web app that helps users digitize their wardrobe, build outfits, and plan what to wear based on real-world context like weather, occasion, and personal style. Users can upload clothing photos, remove the background, tag items with useful attributes, and mix & match pieces into favorite outfits.

This project was built as part of a UI/UX and front-end development course, with a strong focus on user-centered design and iterative prototyping.

---

## Features

- **Virtual Closet**
  - Upload clothing images and store them digitally.
  - Background removal for cleaner, consistent item visuals.
  - Tag items with attributes like **category**, **season**, **color**, and **occasion**.

- **Outfit Builder**
  - Swipe or scroll through items by category (tops, bottoms, shoes, etc.).
  - Assemble full outfits directly from your closet.
  - Tag outfits with occasions (school, work, casual, etc.).
  - Mark certain outfits as **favorites** to revisit later.

- **Favorite Fits**
  - Save and view favorite outfits in one place.
  - Quickly reuse go-to looks without rebuilding from scratch.

- **Weather-Aware Context**
  - Display current weather details pulled from an external API.
  - Help users choose outfits that match the temperature and conditions.

- **Cloud-Backed Storage**
  - Closet items and favorite fits are stored via Firebase so data persists across sessions.

---

## Tech Stack

- **Frontend**
  - [Vue 3](https://vuejs.org/) with `<script setup>` and Composition API  
  - [Vue Router 4](https://router.vuejs.org/) for multi-page flows

- **Backend / Services**
  - Node / Express server (for image background removal and integrations)
  - Firebase (authentication / data / storage)
  - Photo background removal API (e.g., PhotoRoom)

- **Tooling**
  - [Vite](https://vite.dev/) for dev/build
  - `concurrently` for running multiple processes in development
  - TypeScript, CSS

---

## Recommended IDE Setup
- **Editor:** VS Code  
- **Extensions:**
  - Vue - Official extension from the VS Code marketplace  
  - (Optional) Disable the older **Vetur** extension if installed, to avoid conflicts.

---

## Project Setup

```sh
npm install
npm install vue@3
npm install vue-router@4

orrrr I think just this works fine too

npm install
npm install vue-router

```

## Firebase Installation

```sh
npm i firebase
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Photo Packages

```sh
npm install concurrently --save-dev
```

### Compile and Minify for Production

---

## Project Structure (High-Level)
```text
422-StyleSync/
├─ public/          # Static assets
├─ src/
│  ├─ components/   # Reusable Vue components
│  ├─ views/        # Page-level views (Closet, Outfit Builder, Favorites, etc.)
│  ├─ router/       # Vue Router setup
│  ├─ stores/       # Pinia / store logic (user, weather, closet, etc.)
│  └─ lib/          # Firebase, closet helpers, API utilities
├─ server/          # Node/Express server for background removal & API integration
├─ index.html
├─ package.json
├─ vite.config.js
└─ README.md
