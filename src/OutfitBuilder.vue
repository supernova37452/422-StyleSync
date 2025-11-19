<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { userStore } from "@/stores/userStore";
import { weatherStore } from "@/stores/weatherStore";
import { subscribeClosetItemsByName, listClosetItemsByName } from "@/lib/closet";
import { norm } from "@/lib/username";

const temperature = computed(() => weatherStore.temperature);
const icon = computed(() => weatherStore.icon);
const shortForecast = computed(() => weatherStore.shortForecast);
const username = computed(() => userStore.username || "Guest");

const catOptions = ["Casual", "Formal", "School", "Work"];
const selectedcat = ref(null);
const openMenu = ref(null);
const starActive = ref(false);

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
  currentIndex.value[type] =
    (currentIndex.value[type] + 1) % arr.length;
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
      <!-- left top/bottom/shoes -->
      <div class="one-fit">

        <div class="fit-grid">
          <div class="fit-box" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            
            <button class="arrow-btn" @click="prevItem('tops')">◀</button>

            <img
              v-if="currentSelected('tops')"
              :src="currentSelected('tops').imageURL"
              alt="Selected top"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
            <button class="arrow-btn" @click="nextItem('tops')">▶</button>
          </div>
        </div>


        <div class="fit-grid">
          <div class="fit-box" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            
            <button class="arrow-btn" @click="prevItem('bottoms')">◀</button>

            <img
              v-if="currentSelected('bottoms')"
              :src="currentSelected('bottoms').imageURL"
              alt="Selected bottoms"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
            <button class="arrow-btn" @click="nextItem('bottoms')">▶</button>
          </div>
        </div>




        <div class="fit-grid">
          <div class="fit-box" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            
            <button class="arrow-btn" @click="prevItem('shoes')">◀</button>

            <img
              v-if="currentSelected('shoes')"
              :src="currentSelected('shoes').imageURL"
              alt="Selected shoes"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
            <button class="arrow-btn" @click="nextItem('shoes')">▶</button>
          </div>
        </div>

      </div>


      <!-- right jackets accessories -->
      <div class="one-fit">
        <h3></h3>
        <h3></h3>
        <div class="fit-grid">
          <div class="fit-box" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            
            <button class="arrow-btn" @click="prevItem('jackets')">◀</button>

            <img
              v-if="currentSelected('jackets')"
              :src="currentSelected('jackets').imageURL"
              alt="Selected jackets"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
            <button class="arrow-btn" @click="nextItem('jackets')">▶</button>
          </div>
        </div>


        <div class="fit-grid">
          <div class="fit-box" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            
            <button class="arrow-btn" @click="prevItem('accessories')">◀</button>

            <img
              v-if="currentSelected('accessories')"
              :src="currentSelected('accessories').imageURL"
              alt="Selected accessories"
              style="max-width: 80%; max-height: 100%; object-fit: contain"
            />
            <button class="arrow-btn" @click="nextItem('accessories')">▶</button>
          </div>
        </div>


      </div>

      <!-- star stuff -->
      <div class="star-container">
        <img
          :src="starActive ? '/icons/starfilled.png' : '/icons/star.png'"
          alt="Favorite star"
          class="star-icon"
          @click="toggleStar"
        />
      </div>

      <!-- category stuff -->
      <aside class="tagging-rail fit-rail-items">
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
    style="display: flex; justify-content: center; gap: 30px; margin-top: 20px"
  >
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
