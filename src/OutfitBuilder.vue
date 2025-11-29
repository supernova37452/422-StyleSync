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
const selectedcat = ref(null);
const openMenu = ref(null);
const starActive = ref(false);
const favoriteFits = ref<any[]>([]); // for saving outfit
const outfitTitle = ref("");

const showInstructions = ref(false);
const toggleInstructions = () =>
  (showInstructions.value = !showInstructions.value);


function toggleStar() {
  starActive.value = !starActive.value;
}

function toggleMenu(which) {
  openMenu.value = openMenu.value === which ? null : which;
}

function closeMenus() {
  openMenu.value = null;
}

function pickCategory(s) {
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
// small edits to the watch
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

const currentIndex = ref({
  tops: 0,
  bottoms: 0,
  shoes: 0,
  jackets: 0,
  accessories: 0,
});

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
  return arr && arr.length ? arr[idx] : null;
}

const openPalette = ref<string | null>(null);

// open palette when clicking a clothing box
function openTypePalette(type: string) {
  openPalette.value = type;
}

// choose item from palette
function selectFromPalette(type: string, idx: number) {
  currentIndex.value[type] = idx;  // replace current selected item
  openPalette.value = null;        // close palette
}

// start of favoriting outfit code (dj added this )
function buildCurrentSnapshot() {
  const top = currentSelected("tops");
  const bottom = currentSelected("bottoms");
  const shoes = currentSelected("shoes");
  const jacket = currentSelected("jackets");
  const accessory = currentSelected("accessories");

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

  // optional: require category to be chosen
  if (!snap.category) {
    alert("Pick a category before saving this outfit.");
    return;
  }

  const key = makeOutfitKey(snap);
  const existing = favoriteFits.value.find((f: any) => f.key === key);

  try {
    if (existing) {
      // un-favorite
      await deleteFavoriteFitById(nameKey, existing.id);
    } else {
      // favorite
      const payload: FavoriteFitPayload = {
        ...snap,
        key,
      };
      await addFavoriteFitByName(nameKey, payload);
    }

    // refresh list + star state
    favoriteFits.value = await listFavoriteFitsByName(nameKey);
  } catch (e) {
    console.error("[FAVFITS] handleStarClick error:", e);
  }
}

// keep the UI star in sync with the data
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

// end of favoriting outfit code (dj added this )
</script>
<!-- outfit builder i stole chunks from other stuff so the names are off sometimes idk -->

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
  <h3 style="margin-bottom: 8px; text-transform: capitalize;">
    click to choose {{ openPalette }} !
  </h3>

  <div class="palette-grid">
    <div
      v-for="(item, i) in byType[openPalette]"
      :key="item.id"
      class="palette-item"
      @click="selectFromPalette(openPalette, i)"
    >
      <img :src="item.imageURL" />
    </div>

    <!-- if no items -->
    <p v-if="byType[openPalette].length === 0" style="opacity: 0.6; grid-column: span 3;">
      No items in this category
    </p>
  </div>
</div>
      <!-- left top/bottom/shoes -->
      <div class="one-fit">
        <div class="fit-grid">
          <div
            class="fit-box" @click="openTypePalette('tops')"
            style="display: flex; align-items: center; justify-content: center; gap: 10px">
            

            <img
              v-if="currentSelected('tops')"
              :src="currentSelected('tops').imageURL"
              alt="Selected top"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
           
          </div>
        </div>

        <div class="fit-grid">
          <div
            class="fit-box" @click="openTypePalette('bottoms')"
            style="display: flex;align-items: center;justify-content: center;gap: 10px;">
           
            <img
              v-if="currentSelected('bottoms')"
              :src="currentSelected('bottoms').imageURL"
              alt="Selected bottoms"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
           
          </div>
        </div>

        <div class="fit-grid">
          <div
            class= "fit-box" @click="openTypePalette('shoes')"
            style= "display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            "
          >
    

            <img
              v-if="currentSelected('shoes')"
              :src="currentSelected('shoes').imageURL"
              alt="Selected shoes"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
          
          </div>
        </div>
      </div>

      <!-- right jackets accessories -->
      <div class="one-fit">
        <h3></h3>
        <h3></h3>
        <div class="fit-grid">
          <div
            class="fit-box" @click="openTypePalette('jackets')"
            style="display: flex; align-items: center; justify-content: center;gap: 10px;">

            <img
              v-if="currentSelected('jackets')"
              :src="currentSelected('jackets').imageURL"
              alt="Selected jackets"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
            <!-- <button class="arrow-btn" @click="nextItem('jackets')">▶</button> -->
          </div>
        </div>

        <div class="fit-grid">
          <div
            class="fit-box" @click="openTypePalette('accessories')"
            style="display: flex; align-items: center; justify-content: center; gap: 10px;">


            <img
              v-if="currentSelected('accessories')"
              :src="currentSelected('accessories').imageURL"
              alt="Selected accessories"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />

          </div>
        </div>
      </div>



      <!-- category stuff -->
      <aside class="tagging-rail fit-rail-items">
              <!-- star stuff -->
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

      <div class=" title-row" >  
          <input type="text" class="title-input" placeholder="Name your outfit..."  v-model="outfitTitle"/>
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
  <!-- go back button allll the way at the bottom -->
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
      <strong
        > How to to build your outfit
      </strong>
      <ol>
          Click on the item box you want to add or change.
      </ol>
      <ol>
          Select your desired clothing piece from the pop-up
      </ol>
      <ol>
          Click on the star to favorite your outfit
      </ol>
      <ol>
          View your outfits by clicking "Favorite Outfits"
      </ol>
    </div>
  </div>
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

<style scoped></style>
