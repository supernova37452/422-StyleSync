<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { userStore } from "@/stores/userStore";
import { weatherStore } from "@/stores/weatherStore";
import {
  subscribeClosetItemsByName,
  listClosetItemsByName,
} from "@/lib/closet";
import { norm } from "@/lib/username";

const username = computed(() => userStore.username || "Guest");
const temperature = computed(() => weatherStore.temperature);
const icon = computed(() => weatherStore.icon);
const shortForecast = computed(() => weatherStore.shortForecast);

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

watch(
  () => userStore.username,
  (u) => bindToName(u || null),
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
</script>

<template>
  <div>
    <!-- Header -->
    <div class="header-bar">
      <button class="button">{{ username }}</button>
      <h1>Welcome to StyleSync</h1>
      <button
        class="button"
        style="display: flex; align-items: center; gap: 12px; padding: 8px 12px"
      >
        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            line-height: 1.2;
            max-width: 100px;
          "
        >
          <span>{{ temperature }}°</span>
          <small v-if="shortForecast" style="font-size: 12px; max-width: 100px">
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

    <!-- Main closet grid: 5 scrollable columns -->
    <div class="all-groups">
      <!-- TOPS -->
      <div class="one-group">
        <div class="group-header">
          <span class="group-title">Tops</span>
          <RouterLink
            to="/upload?type=tops"
            class="group-add"
            aria-label="Add a top"
          >
            +
          </RouterLink>
        </div>
        <div class="group-scroll">
          <div class="box-grid">
            <div
              v-for="item in byType.tops"
              :key="item.id || item.imageURL"
              class="box"
            >
              <img :src="item.imageURL" alt="" class="box-img" />
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOMS -->
      <div class="one-group">
        <div class="group-header">
          <span class="group-title">Bottoms</span>
          <RouterLink
            to="/upload?type=bottoms"
            class="group-add"
            aria-label="Add bottoms"
          >
            +
          </RouterLink>
        </div>
        <div class="group-scroll">
          <div class="box-grid">
            <div
              v-for="item in byType.bottoms"
              :key="item.id || item.imageURL"
              class="box"
            >
              <img :src="item.imageURL" alt="" class="box-img" />
            </div>
          </div>
        </div>
      </div>

      <!-- SHOES -->
      <div class="one-group">
        <div class="group-header">
          <span class="group-title">Shoes</span>
          <RouterLink
            to="/upload?type=shoes"
            class="group-add"
            aria-label="Add shoes"
          >
            +
          </RouterLink>
        </div>
        <div class="group-scroll">
          <div class="box-grid">
            <div
              v-for="item in byType.shoes"
              :key="item.id || item.imageURL"
              class="box"
            >
              <img :src="item.imageURL" alt="" class="box-img" />
            </div>
          </div>
        </div>
      </div>

      <!-- JACKETS -->
      <div class="one-group">
        <div class="group-header">
          <span class="group-title">Jackets</span>
          <RouterLink
            to="/upload?type=jackets"
            class="group-add"
            aria-label="Add a jacket"
          >
            +
          </RouterLink>
        </div>
        <div class="group-scroll">
          <div class="box-grid">
            <div
              v-for="item in byType.jackets"
              :key="item.id || item.imageURL"
              class="box"
            >
              <img :src="item.imageURL" alt="" class="box-img" />
            </div>
          </div>
        </div>
      </div>

      <!-- ACCESSORIES -->
      <div class="one-group">
        <div class="group-header">
          <span class="group-title">Accessories</span>
          <RouterLink
            to="/upload?type=accessories"
            class="group-add"
            aria-label="Add an accessory"
          >
            +
          </RouterLink>
        </div>
        <div class="group-scroll">
          <div class="box-grid">
            <div
              v-for="item in byType.accessories"
              :key="item.id || item.imageURL"
              class="box"
            >
              <img :src="item.imageURL" alt="" class="box-img" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- bottom nav buttons -->
    <div class="closet-actions">
      <button class="button">
        <RouterLink
          to="/outfitbuilder"
          style="color: inherit; text-decoration: none"
        >
          Outfit Builder
        </RouterLink>
      </button>
      <button class="button">
        <RouterLink to="/favfits" style="color: inherit; text-decoration: none">
          Favorite Outfits
        </RouterLink>
      </button>
    </div>
  </div>
</template>

<style scoped>
.all-groups {
  display: flex;
  justify-content: center;
  gap: 100px; /* tweak until it matches your Figma */
  margin-top: 32px;
}

/* one column (Tops / Bottoms / ...) */
.one-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 190px; /* tweak until it matches your Figma */
}

/* header row with label + + button */
.group-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.group-header h3 {
  margin: 0;
}

.group-title {
  font-weight: 600;
  font-size: 20px;
}

.group-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #c4b5fd; /* lilac-ish, match your theme */
  color: white;
  font-size: 18px;
  text-decoration: none;
}

.header-plus {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: none;
  background: #b7a7f7;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

/* scrollable area – height stays fixed, contents scroll */
.group-scroll {
  max-height: 500px; /* adjust until it visually matches your figma */
  overflow-y: auto;
  padding-right: 4px;
}

/* if you want the scrollbar basically hidden: */
.group-scroll::-webkit-scrollbar {
  width: 4px;
}
.group-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.group-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 999px;
}

/* grid of item tiles inside each column */
.box-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 10px;
}

/* individual tile */
.box {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.box-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* bottom buttons */
.closet-actions {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 24px;
}
</style>
