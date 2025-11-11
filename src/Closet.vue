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

// exactly 7 slots per category → real items first, then placeholders
function slotsFor(
  type: "tops" | "bottoms" | "shoes" | "jackets" | "accessories"
) {
  const arr = byType.value[type] ?? [];
  const real = arr.slice(0, 7);
  const phCount = Math.max(0, 7 - real.length);
  return [...real, ...Array(phCount).fill(null)];
}
</script>

<template>
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
        <small v-if="shortForecast" style="font-size: 12px; max-width: 100px">{{
          shortForecast
        }}</small>
      </div>
      <img
        v-if="icon"
        :src="icon"
        alt="Weather icon"
        style="width: 40px; height: 40px"
      />
    </button>
  </div>

  <div class="all-groups">
    <!-- TOPS -->
    <div class="one-group">
      <h3>Tops</h3>
      <div class="box-grid">
        <div
          v-for="(slot, i) in slotsFor('tops')"
          :key="'tops-' + i"
          class="box"
        >
          <img
            v-if="slot"
            :src="slot.imageURL"
            alt=""
            style="max-width: 100%; max-height: 100%; object-fit: contain"
          />
        </div>
        <div class="box plus-in-box">
          <RouterLink
            to="/upload?type=tops"
            class="plus-box"
            aria-label="Add a top"
            >+</RouterLink
          >
        </div>
      </div>
    </div>

    <!-- BOTTOMS -->
    <div class="one-group">
      <h3>Bottoms</h3>
      <div class="box-grid">
        <div
          v-for="(slot, i) in slotsFor('bottoms')"
          :key="'bottoms-' + i"
          class="box"
        >
          <img
            v-if="slot"
            :src="slot.imageURL"
            alt=""
            style="max-width: 100%; max-height: 100%; object-fit: contain"
          />
        </div>
        <div class="box plus-in-box">
          <RouterLink
            to="/upload?type=bottoms"
            class="plus-box"
            aria-label="Add bottoms"
            >+</RouterLink
          >
        </div>
      </div>
    </div>

    <!-- SHOES -->
    <div class="one-group">
      <h3>Shoes</h3>
      <div class="box-grid">
        <div
          v-for="(slot, i) in slotsFor('shoes')"
          :key="'shoes-' + i"
          class="box"
        >
          <img
            v-if="slot"
            :src="slot.imageURL"
            alt=""
            style="max-width: 100%; max-height: 100%; object-fit: contain"
          />
        </div>
        <div class="box plus-in-box">
          <RouterLink
            to="/upload?type=shoes"
            class="plus-box"
            aria-label="Add shoes"
            >+</RouterLink
          >
        </div>
      </div>
    </div>

    <!-- JACKETS -->
    <div class="one-group">
      <h3>Jackets</h3>
      <div class="box-grid">
        <div
          v-for="(slot, i) in slotsFor('jackets')"
          :key="'jackets-' + i"
          class="box"
        >
          <img
            v-if="slot"
            :src="slot.imageURL"
            alt=""
            style="max-width: 100%; max-height: 100%; object-fit: contain"
          />
        </div>
        <div class="box plus-in-box">
          <RouterLink
            to="/upload?type=jackets"
            class="plus-box"
            aria-label="Add a jacket"
            >+</RouterLink
          >
        </div>
      </div>
    </div>

    <!-- ACCESSORIES -->
    <div class="one-group">
      <h3>Accessories</h3>
      <div class="box-grid">
        <div
          v-for="(slot, i) in slotsFor('accessories')"
          :key="'accessories-' + i"
          class="box"
        >
          <img
            v-if="slot"
            :src="slot.imageURL"
            alt=""
            style="max-width: 100%; max-height: 100%; object-fit: contain"
          />
        </div>
        <div class="box plus-in-box">
          <RouterLink
            to="/upload?type=accessories"
            class="plus-box"
            aria-label="Add an accessory"
            >+</RouterLink
          >
        </div>
      </div>
    </div>
  </div>
  <p></p>
  <div
    style="display: flex; justify-content: center; gap: 30px; margin-top: 20px"
  >
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
</template>
