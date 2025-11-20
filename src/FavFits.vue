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

const temperature = computed(() => weatherStore.temperature);
const icon = computed(() => weatherStore.icon);
const shortForecast = computed(() => weatherStore.shortForecast);
const username = computed(() => userStore.username || "Guest");

const catOptions = ["All", "Casual", "Formal", "School", "Work"];

const selectedCategory = ref<string>("All");
const favoriteFits = ref<any[]>([]);

let stop: null | (() => void) = null;

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
          <p>Go to the Outfit Builder and tap the star to save a look ✨</p>
        </div>

        <div
          v-for="fit in filteredFits"
          :key="fit.id"
          class="fav-card"
        >
          <div class="fav-card-header">
            <span class="fav-card-category">{{ fit.category }}</span>
            <button
              type="button"
              class="fav-delete"
              @click="handleDeleteFit(fit.id)"
              aria-label="Remove from favorites"
            >
              ✕
            </button>
          </div>

          <div class="fav-card-images">
            <img v-if="fit.topURL" :src="fit.topURL" alt="Top" />
            <img v-if="fit.bottomURL" :src="fit.bottomURL" alt="Bottom" />
            <img v-if="fit.shoesURL" :src="fit.shoesURL" alt="Shoes" />
            <img v-if="fit.jacketURL" :src="fit.jacketURL" alt="Jacket" />
            <img
              v-if="fit.accessoryURL"
              :src="fit.accessoryURL"
              alt="Accessory"
            />
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
          Closet View
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
.fav-content {
  width: min(1200px, 94vw);
  margin: 20px 0 60px 0;
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 36px;
  margin-bottom: 40px;
}

.fav-rail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: flex-start;
  padding-top: 6px;
}

.cat-pill {
  background-color: #8f8ae6;
  color: white;
  border: none;
  border-radius: 12px;
  width: 100px;
  height: 40px;
  padding: 8px 14px;
  font-size: 15px;
  cursor: pointer;
  opacity: 0.7;
}

.cat-pill.active {
  opacity: 1;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #8f8ae6;
}

.fav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.fav-card {
  background-color: #eeeeee;
  border-radius: 12px;
  min-height: 260px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

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
}

.fav-card-images {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 110px;
  gap: 8px;
}

.fav-card-images img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: white;
  border-radius: 8px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: #777;
  font-size: 14px;
}
</style>
