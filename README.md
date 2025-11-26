# StyleSync

StyleSync is a virtual closet web app that helps users digitize their wardrobe, build outfits, and plan what to wear based on real-world context like weather, occasion, and personal style. Users can upload clothing photos, remove the background, tag items with useful attributes, and mix & match pieces into favorite outfits.

This project was built as part of a UI/UX and front-end development course, with a strong focus on user-centered design and iterative prototyping.

## Step-by-Step Explanation of the Project

1. User Creates an Account / Logs In
When the user enters StyleSync, they can log in or continue as a guest. If logged in, Firebase Authentication identifies the user and loads their personal closet, outfits, and favorites from Firebase’s database and storage.

2. User Uploads Clothing Items
On the Closet page, the user selects an image from their device. The image is sent to the Node/Express backend, which handles the background removal API (e.g., PhotoRoom). The backend receives the cleaned image and returns it to the frontend.

3. System Removes Background and Saves Item
Once the background-removed image is returned, the Vue client displays a preview. The user can assign labels such as category (top, bottom, shoes), season, color, and occasion. After confirming, the item is uploaded to Firebase Storage and the metadata is stored in Firestore under the user’s closet collection.

4. Closet Automatically Updates
The closet view listens in real time using Firebase listeners. As soon as a new item is added, the UI automatically updates without page reloads. Users can scroll or filter items based on category, tags, or weather.

5. User Opens the Outfit Builder Page
On the Outfit Builder view, the system pulls all the user’s clothing items and organizes them into horizontal carousels by category. Users swipe or click through each category to choose a top, bottom, outerwear, and shoes.

6. User Creates an Outfit
As users select pieces from each carousel, the chosen items appear in the central “outfit preview” area. The backend is not needed here—the outfit preview is assembled entirely client-side using Vue’s reactive state.

7. User Tags and Saves the Outfit
Once the user finalizes their outfit, they can assign an occasion tag (school, work, casual, etc.) and press save. The frontend constructs an outfit object and writes it to Firebase Firestore under the user’s favoriteFits collection.

8. Favorite Fits Page Displays Saved Outfits
The Favorite Fits page retrieves the user’s saved outfits and displays them as cards. Users can open, view, or delete saved outfits. The page updates automatically through Firebase’s real-time listeners.

9. Weather Integration Enhances Decision Making
On every page, the app fetches weather data through a weather API. Temperature, conditions, and icons appear at the top of the UI. This context helps users choose weather-appropriate outfits and improves overall usability.

10. User Experience Supported by Vue Router + Stores
Each main feature—Closet, Outfit Builder, Favorite Fits—is a separate route managed by Vue Router. Global state such as username and weather is stored in Vue’s Composition API + Pinia-style stores. This ensures smooth navigation and consistent UI state.

11. Project Development Workflow (For Developers)

- Vue 3 + Vite serve the frontend during development (npm run dev).
- The Node/Express server runs separately and exposes the /api/remove-bg route.
- concurrently can run both the frontend and backend together during development.
- Firebase handles persistent storage across all user actions.
- The project is deployed as a Vite-generated static frontend + hosted backend endpoint.

12. End Result
- The final project is a functional virtual closet tool where users can:
- Upload and clean clothing photos
- Organize pieces with rich metadata
- Build mix-and-match outfits
- Save and favorite looks
- Rely on real weather data to guide outfit choices

All of this is tied together using a modern Vue 3 architecture, real-time Firebase syncing, and a small Node/Express backend to support image processing.

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


## Recommended IDE Setup
- **Editor:** VS Code  
- **Extensions:**
  - Vue - Official extension from the VS Code marketplace  
  - (Optional) Disable the older **Vetur** extension if installed, to avoid conflicts.


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
