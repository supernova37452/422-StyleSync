<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { userStore } from "@/stores/userStore";
import { weatherStore } from "@/stores/weatherStore";
import {
  subscribeClosetItemsByName,
  listClosetItemsByName,
  listFavoriteFitsByName,
  addFavoriteFitByName,
  deleteFavoriteFitById,
  type FavoriteFitPayload,
} from "@/lib/closet";
import { norm } from "@/lib/username";

const temperature = computed(() => weatherStore.temperature);
const icon = computed(() => weatherStore.icon);
const shortForecast = computed(() => weatherStore.shortForecast);
const username = computed(() => userStore.username || "Guest");

const catOptions = ["Casual", "Formal", "School", "Work"];
const selectedcat = ref<string | null>(null);
const openMenu = ref<string | null>(null);
const starActive = ref(false);
const favoriteFits = ref<any[]>([]);
const outfitTitle = ref("");

const showInstructions = ref(false);
const toggleInstructions = () =>
  (showInstructions.value = !showInstructions.value);

function toggleStar() {
  starActive.value = !starActive.value;
}

function toggleMenu(which: string) {
  openMenu.value = openMenu.value === which ? null : which;
}

function closeMenus() {
  openMenu.value = null;
}

function pickCategory(s: string) {
  selectedcat.value = s;
  closeMenus();
}

/** bind to a name: fetch once + live subscribe */
const items = ref<any[]>([]);
let stop: null | (() => void) = null;

async function bindToName(name: string | null) {
  if (stop) {
    stop();
    stop = null;
  }
  items.value = [];
  if (!name) return;
  const key = norm(name);
  try {
    items.value = await listClosetItemsByName(key);
  } catch {}
  try {
    stop = subscribeClosetItemsByName(key, (arr) => (items.value = arr));
  } catch {}
}

// loading what the user already has previously saved
async function loadFavoritesForName(name: string | null) {
  favoriteFits.value = [];
  if (!name) return;
  const key = norm(name);
  try {
    favoriteFits.value = await listFavoriteFitsByName(key);
  } catch (e) {
    console.warn("[FAVFITS] listFavoriteFitsByName error:", e);
  }
}

watch(
  () => userStore.username,
  async (u) => {
    await bindToName(u || null);
    await loadFavoritesForName(u || null);
  },
  { immediate: true }
);

onUnmounted(() => {
  if (stop) stop();
});

// group by type
const byType = computed(() => {
  const g: Record<string, any[]> = {
    tops: [],
    bottoms: [],
    shoes: [],
    jackets: [],
    accessories: [],
  };
  for (const it of items.value) {
    const t = (it as any).type || "tops";
    if (g[t]) g[t].push(it);
  }
  return g;
});

const currentIndex = ref<Record<string, number>>({
  tops: 0,
  bottoms: 0,
  shoes: 0,
  jackets: 0,
  accessories: -1, // -1 means "no primary accessory selected"
});

// separate index for the second accessory
const secondAccessoryIndex = ref<number | null>(null);

// remembers which accessory slot opened the palette: "first" | "second"
const paletteAccessorySlot = ref<"first" | "second" | null>(null);

function nextItem(type: string) {
  const arr = byType.value[type];
  if (!arr || arr.length === 0) return;
  currentIndex.value[type] = (currentIndex.value[type] + 1) % arr.length;
}

function prevItem(type: string) {
  const arr = byType.value[type];
  if (!arr || arr.length === 0) return;
  currentIndex.value[type] =
    (currentIndex.value[type] - 1 + arr.length) % arr.length;
}

function currentSelected(type: string) {
  const arr = byType.value[type];
  const idx = currentIndex.value[type];
  if (!arr || arr.length === 0) return null;
  if (idx == null || idx < 0 || idx >= arr.length) return null; // support "none"
  return arr[idx];
}

// accessory helpers
const primaryAccessory = computed(() => {
  const arr = byType.value["accessories"];
  const idx = currentIndex.value["accessories"];
  if (!arr || idx == null || idx < 0 || idx >= arr.length) return null;
  return arr[idx];
});

const secondaryAccessory = computed(() => {
  const arr = byType.value["accessories"];
  const idx = secondAccessoryIndex.value;
  if (!arr || idx == null || idx < 0 || idx >= arr.length) return null;
  return arr[idx];
});

const openPalette = ref<string | null>(null);

// open palette when clicking a clothing box
function openTypePalette(type: string, slot?: "first" | "second") {
  openPalette.value = type;
  paletteAccessorySlot.value =
    type === "accessories" ? slot ?? "first" : null;
}

function closePalette() {
  openPalette.value = null;
  paletteAccessorySlot.value = null;
}

// choose item from palette
function selectFromPalette(type: string, idx: number) {
  const arr = byType.value[type];
  if (!arr || arr.length === 0) {
    if (type === "accessories") {
      currentIndex.value["accessories"] = -1;
      secondAccessoryIndex.value = null;
    } else {
      currentIndex.value[type] = -1;
    }
    closePalette();
    return;
  }

  if (type === "accessories") {
    const slot = paletteAccessorySlot.value;
    const firstIdx = currentIndex.value["accessories"];
    const secondIdx = secondAccessoryIndex.value;

    // If no accessories yet, always place in the primary (middle) box
    if (firstIdx == null || firstIdx < 0) {
      currentIndex.value["accessories"] = idx;
      secondAccessoryIndex.value = null;
    } else if (secondIdx == null || secondIdx < 0) {
      // We have one accessory, but no second yet → new goes to second
      secondAccessoryIndex.value = idx;
    } else {
      // Both exist, update whichever slot opened the palette
      if (slot === "second") {
        secondAccessoryIndex.value = idx;
      } else {
        currentIndex.value["accessories"] = idx;
      }
    }
  } else {
    currentIndex.value[type] = idx;
  }

  closePalette();
}

// choose "no item selected" for a given type
function selectNone(type: string) {
  if (type === "accessories") {
    const slot = paletteAccessorySlot.value;
    const arr = byType.value["accessories"];

    if (slot === "second") {
      // Clear ONLY the second accessory box
      secondAccessoryIndex.value = null;
    } else {
      // Clear primary accessory
      currentIndex.value["accessories"] = -1;

      // If there was a second accessory, promote it to primary
      if (
        secondAccessoryIndex.value != null &&
        secondAccessoryIndex.value >= 0 &&
        arr &&
        secondAccessoryIndex.value < arr.length
      ) {
        currentIndex.value["accessories"] = secondAccessoryIndex.value;
        secondAccessoryIndex.value = null;
      }
    }
  } else if (type === "jackets") {
    // Jackets are optional - allow clearing them
    currentIndex.value["jackets"] = -1;
  }

  closePalette();
}

// start of favoriting outfit code
function buildCurrentSnapshot() {
  const top = currentSelected("tops");
  const bottom = currentSelected("bottoms");
  const shoes = currentSelected("shoes");
  const jacket = currentSelected("jackets");
  const accessory = primaryAccessory.value; // primary accessory only

  const category = selectedcat.value || null;

  return {
    topURL: top?.imageURL || null,
    bottomURL: bottom?.imageURL || null,
    shoesURL: shoes?.imageURL || null,
    jacketURL: jacket?.imageURL || null,
    accessoryURL: accessory?.imageURL || null,
    category,
  };
}

const isCurrentFavorited = computed(() => {
  const snap = buildCurrentSnapshot();
  const key = makeOutfitKey(snap);
  return favoriteFits.value.some((f: any) => f.key === key);
});

async function handleStarClick() {
  if (!userStore.username) return;

  const nameKey = norm(userStore.username);
  const snap = buildCurrentSnapshot();

  // ✅ NEW: Require top + bottom + shoes to save
  if (!snap.topURL || !snap.bottomURL || !snap.shoesURL) {
    alert("Please select a top, bottom, and shoes before saving this outfit.");
    return;
  }

  if (!snap.category) {
    alert("Pick a category before saving this outfit.");
    return;
  }

  const key = makeOutfitKey(snap);
  const existing = favoriteFits.value.find((f: any) => f.key === key);

  try {
    if (existing) {
      await deleteFavoriteFitById(nameKey, existing.id);
    } else {
      const payload: FavoriteFitPayload = {
        ...snap,
        key,
        outfitName: outfitTitle.value.trim() || null,
      };
      await addFavoriteFitByName(nameKey, payload);
    }

    favoriteFits.value = await listFavoriteFitsByName(nameKey);
  } catch (e) {
    console.error("[FAVFITS] handleStarClick error:", e);
  }
}

watch(
  () => isCurrentFavorited.value,
  (val) => {
    starActive.value = val;
  },
  { immediate: true }
);

function makeOutfitKey(snap: ReturnType<typeof buildCurrentSnapshot>): string {
  return JSON.stringify({
    topURL: snap.topURL,
    bottomURL: snap.bottomURL,
    shoesURL: snap.shoesURL,
    jacketURL: snap.jacketURL,
    accessoryURL: snap.accessoryURL,
    category: snap.category,
  });
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="header-bar">
      <button class="button">{{ username }}</button>
      <h1>Outfit Builder</h1>
      <button
        class="button"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 12px;
        "
      >
        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            line-height: 1.2;
            max-width: 100px;
            word-wrap: break-word;
          "
        >
          <span>{{ temperature }}°</span>
          <small
            v-if="shortForecast"
            style="font-size: 12px; max-width: 100px; word-wrap: break-word"
          >
            {{ shortForecast }}
          </small>
        </div>
        <img
          v-if="icon"
          :src="icon"
          alt="Weather icon"
          style="width: 40px; height: 40px"
        />
      </button>
    </div>

    <!-- outfit -->
    <div class="fit-groups" style="gap: 0px">
      <!-- LEFT-SIDE PALETTE -->
      <div v-if="openPalette" class="palette">
        <div class="palette-header">
          <h3 style="text-transform: capitalize">
            Click To Choose {{ openPalette }} !
          </h3>
          <button class="palette-close" @click="closePalette">×</button>
        </div>

        <div class="palette-grid">
          <!-- "None selected" ONLY for jackets & accessories -->
          <div
            v-if="openPalette === 'jackets' || openPalette === 'accessories'"
            class="palette-item palette-none"
            @click="selectNone(openPalette!)"
          >
            <span>No {{ openPalette }} selected</span>
          </div>

          <div
            v-for="(item, i) in byType[openPalette!]"
            :key="item.id"
            class="palette-item"
            @click="selectFromPalette(openPalette!, i)"
          >
            <img :src="item.imageURL" />
          </div>

          <p
            v-if="byType[openPalette!].length === 0"
            style="opacity: 0.6; grid-column: span 3"
          >
            No items in this category
          </p>
        </div>
      </div>

      <!-- left top/bottom/shoes -->
      <div class="one-fit">
        <div class="fit-grid">
          <div
            class="fit-box"
            @click="openTypePalette('tops')"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            "
          >
            <img
              v-if="currentSelected('tops')"
              :src="currentSelected('tops')!.imageURL"
              alt="Selected top"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
          </div>
        </div>

        <div class="fit-grid">
          <div
            class="fit-box"
            @click="openTypePalette('bottoms')"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            "
          >
            <img
              v-if="currentSelected('bottoms')"
              :src="currentSelected('bottoms')!.imageURL"
              alt="Selected bottoms"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
          </div>
        </div>

        <div class="fit-grid">
          <div
            class="fit-box"
            @click="openTypePalette('shoes')"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            "
          >
            <img
              v-if="currentSelected('shoes')"
              :src="currentSelected('shoes')!.imageURL"
              alt="Selected shoes"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
          </div>
        </div>
      </div>

      <!-- right jackets + accessories (2 slots) -->
      <div class="one-fit">
        <h3></h3>
        <h3></h3>

        <!-- Jacket slot (always shows a box, empty if no jacket chosen) -->
        <div class="fit-grid">
          <div
            class="fit-box"
            @click="openTypePalette('jackets')"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            "
          >
            <img
              v-if="currentSelected('jackets')"
              :src="currentSelected('jackets')!.imageURL"
              alt="Selected jackets"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
          </div>
        </div>

        <!-- Primary accessory slot (middle right) -->
        <div class="fit-grid">
          <div
            class="fit-box"
            @click="openTypePalette('accessories', 'first')"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            "
          >
            <img
              v-if="primaryAccessory"
              :src="primaryAccessory!.imageURL"
              alt="Selected accessory"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
          </div>
        </div>

        <!-- Secondary accessory slot (bottom right) -->
        <div class="fit-grid">
          <div
            class="fit-box"
            @click="openTypePalette('accessories', 'second')"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            "
          >
            <img
              v-if="secondaryAccessory"
              :src="secondaryAccessory!.imageURL"
              alt="Second accessory"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
          </div>
        </div>
      </div>

      <!-- category stuff -->
      <aside class="tagging-rail fit-rail-items">
        <div class="star-container">
          <img
            :src="
              isCurrentFavorited ? '/icons/starfilled.png' : '/icons/star.png'
            "
            alt="Favorite star"
            class="star-icon"
            @click="handleStarClick"
          />
        </div>

        <div class="title-row">
          <input
            type="text"
            class="title-input"
            placeholder="Name your outfit..."
            v-model="outfitTitle"
          />
        </div>

        <div class="tagging">
          <h3></h3>
          <h3></h3>
          <h3></h3>
          <div class="tag-dropdown" :class="{ open: openMenu === 'season' }">
            <button class="tag-trigger" @click.stop="toggleMenu('season')">
              <span class="label">Categories:</span>
              <span class="value">{{ selectedcat }}</span>
              <span class="chev">▾</span>
            </button>
            <div v-if="openMenu === 'season'" class="menu">
              <button
                v-for="s in catOptions"
                :key="s"
                class="menu-item"
                @click.stop="pickCategory(s)"
              >
                {{ s }} <span v-if="selectedcat === s" class="mark">✓</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <!-- Instructions modal -->
  <div
    v-show="showInstructions"
    class="instructions-panel"
    role="dialog"
    aria-modal="true"
  >
    <button class="close-x" @click="toggleInstructions" aria-label="Close">
      ×
    </button>
    <div class="panel-content">
      <strong> How to to build your outfit </strong>
      <ol>Click on the item box you want to add or change.</ol>
      <ol>Select your desired clothing piece from the pop-up</ol>
      <ol>Click on the star to favorite your outfit</ol>
      <ol>View your outfits by clicking "Favorite Outfits"</ol>
    </div>
  </div>

  <!-- Footer buttons -->
  <div
    style="display: flex; justify-content: center; gap: 30px; margin-top: 20px"
  >
    <button class="footer-btn left" @click="toggleInstructions">
      View Instructions
    </button>
    <button class="button">
      <RouterLink to="/closet" style="color: inherit; text-decoration: none">
        Closet View
      </RouterLink>
    </button>

    <button class="button">
      <RouterLink to="/favfits" style="color: inherit; text-decoration: none">
        Favorite Outfits
      </RouterLink>
    </button>
  </div>
</template>

<style scoped>
/* Only for styling the palette popup; box sizes/layout come from main.css */

.palette {
  position: absolute;
  top: 80px;
  left: 5%;
  width: 600px;
  max-width: 90vw;
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.palette-close {
  border: none;
  background: transparent;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  color: black; /* black X button */
  font-weight: bold;
  transition: transform 0.1s ease, color 0.1s ease;
}

.palette-close:hover {
  color: #333;
  transform: scale(1.1);
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.palette-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
}

.palette-none {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eeeeee;
  border-radius: 8px;
  cursor: pointer;
  height: 100px;
  font-size: 13px;
  opacity: 0.8;
}
</style>
