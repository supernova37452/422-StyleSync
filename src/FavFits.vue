<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { userStore } from "@/stores/userStore";
import { weatherStore } from "@/stores/weatherStore";
import { norm } from "@/lib/username";
import {
  listFavoriteFitsByName,
  subscribeFavoriteFitsByName,
  deleteFavoriteFitById,
} from "@/lib/closet";

// weather + user info
const temperature = computed(() => weatherStore.temperature);
const icon = computed(() => weatherStore.icon);
const shortForecast = computed(() => weatherStore.shortForecast);
const username = computed(() => userStore.username || "Guest");

// category filtering options
const catOptions = ["All", "Casual", "Formal", "School", "Work"];

const selectedCategory = ref<string>("All");
const favoriteFits = ref<any[]>([]);

let stop: null | (() => void) = null;

// bind to Firestore favFits
async function bindFavorites(name: string | null) {
  if (stop) {
    stop();
    stop = null;
  }

  favoriteFits.value = [];
  if (!name) return;

  const key = norm(name);

  try {
    // initial load
    favoriteFits.value = await listFavoriteFitsByName(key);

    // live updates
    stop = subscribeFavoriteFitsByName(key, (arr) => {
      favoriteFits.value = arr;
    });
  } catch (e) {
    console.warn("[FAVFITS] bindFavorites error:", e);
  }
}

// react to user changes
watch(
  () => userStore.username,
  (u) => {
    bindFavorites(u || null);
  },
  { immediate: true }
);

onUnmounted(() => {
  if (stop) stop();
});

// filter by category
const filteredFits = computed(() => {
  if (selectedCategory.value === "All") return favoriteFits.value;
  return favoriteFits.value.filter(
    (f) => f.category === selectedCategory.value
  );
});

function selectCategory(cat: string) {
  selectedCategory.value = cat;
}

// delete handler
async function handleDeleteFit(fitId: string) {
  if (!userStore.username) return;
  const key = norm(userStore.username);

  try {
    await deleteFavoriteFitById(key, fitId);
    // subscribeFavoriteFitsByName will update favoriteFits automatically
  } catch (e) {
    console.error("[FAVFITS] handleDeleteFit error:", e);
  }
}

// helper: build a dynamic list of only the pieces that exist,
// and let the 2x3 grid fill them "up and over" into the white boxes
function getSlotsFromFit(fit: any) {
  const orderedFields: { field: string; label: string }[] = [
    { field: "topURL", label: "Top" },
    { field: "bottomURL", label: "Bottom" },
    { field: "shoesURL", label: "Shoes" },
    { field: "jacketURL", label: "Jacket" },
    { field: "accessoryURL", label: "Accessory" },
    { field: "accessory2URL", label: "Accessory 2" }, // use this if you save a 2nd accessory
  ];

  const slots: { url: string; label: string }[] = [];

  for (const { field, label } of orderedFields) {
    const url = fit[field];
    if (url) {
      slots.push({ url, label });
    }
  }

  return slots;
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="header-bar">
      <button class="button">{{ username }}</button>
      <h1>Favorite Outfits</h1>
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

    <div class="fav-content">
      <!-- left rail: categories -->
      <aside class="fav-rail">
        <button
          v-for="c in catOptions"
          :key="c"
          class="cat-pill"
          :class="{ active: selectedCategory === c }"
          type="button"
          @click="selectCategory(c)"
        >
          {{ c }}
        </button>
      </aside>

      <!-- cards -->
      <section class="fav-cards">
        <div v-if="filteredFits.length === 0" class="empty-state">
          <p>No favorite outfits yet.</p>
          <p>Go to the Outfit Builder and tap the star to save a look</p>
        </div>

        <!-- Outfit cards -->
        <div v-for="fit in filteredFits" :key="fit.id" class="fav-card">
          <div class="fav-card-header">
            <span class="fav-card-category">
              {{ fit.outfitName || fit.category || "Untitled Outfit" }}
            </span>
            <button
              type="button"
              class="fav-delete"
              @click="handleDeleteFit(fit.id)"
              aria-label="Remove from favorites"
            >
              ✕
            </button>
          </div>

          <!-- 2 x 3 grid of white boxes that auto-fill with existing items -->
          <div class="fav-card-grid">
            <div
              v-for="slot in getSlotsFromFit(fit)"
              :key="slot.url + slot.label"
              class="piece-box"
            >
              <img :src="slot.url" :alt="slot.label" />
              <span class="piece-label">{{ slot.label }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- footer nav -->
    <div
      style="
        display: flex;
        justify-content: center;
        gap: 30px;
        margin-top: 10px;
      "
    >
      <button class="button">
        <RouterLink to="/closet" style="color: inherit; text-decoration: none">
          Back To Closet
        </RouterLink>
      </button>

      <button class="button">
        <RouterLink
          to="/OutfitBuilder"
          style="color: inherit; text-decoration: none"
        >
          Outfit Builder
        </RouterLink>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* main layout for content area */
.fav-content {
  width: min(1700px, 96vw); /* a bit wider so 4 cards feel roomy */
  margin: 20px 0 60px 0;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 36px;
  margin-bottom: 40px;
}

/* left category rail */
.fav-rail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: flex-start;
  padding-top: 6px;
}

/* category filter buttons */
.cat-pill {
  background-color: #8f8ae6;
  color: white;
  border: none;
  border-radius: 12px;
  width: 110px;
  height: 42px;
  padding: 8px 14px;
  font-size: 15px;
  cursor: pointer;
  opacity: 0.7;
}
.cat-pill.active {
  opacity: 1;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #8f8ae6;
}

/* grid layout for 4 cards per row, but wider cells */
.fav-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(280px, 1fr));
  gap: 24px;

  /* 🔹 scrollable area */
  max-height: 700px; /* ~2 rows of cards visible */
  max-width: 100%;
  overflow-y: auto;
  padding-right: 8px; /* room so scrollbar doesn’t cover cards */
}

@media (min-width: 1600px) {
  .fav-cards {
    grid-template-columns: repeat(5, minmax(260px, 1fr));
  }
}

/* individual outfit card */
.fav-card {
  background-color: #eeeeee;
  border-radius: 12px;
  min-height: 320px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* header section in each outfit card */
.fav-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fav-card-category {
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.fav-delete {
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  color: #000000;
}

/* 2 x 3 grid of white boxes; boxes only appear for existing items */
.fav-card-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns */
  grid-auto-rows: 110px; /* rows stack as needed, up to 2 rows for 6 items */
  gap: 8px;
  margin-top: 4px;
}

/* white boxes for each clothing piece */
.piece-box {
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px;
  overflow: hidden;
}

.piece-box img {
  width: 100%;
  height: 80px;
  object-fit: contain;
}

.piece-label {
  font-size: 11px;
  margin-top: 4px;
  color: #555;
}

/* empty state when no favorites exist */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: #777;
  font-size: 14px;
}
</style>
