<script setup lang="ts">
import { ref } from "vue";
import { computed } from "vue";
import { userStore } from "@/stores/userStore";
import { weatherStore } from "@/stores/weatherStore";

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
          <div class="fit-box"></div>
        </div>

        <div class="fit-grid">
          <div class="fit-box"></div>
        </div>
        <div class="fit-grid">
          <div class="fit-box"></div>
        </div>
      </div>
      <!-- right jackets accessories -->
      <div class="one-fit">
        <h3></h3>
        <h3></h3>
        <div class="fit-grid">
          <div class="fit-box"></div>
        </div>
        <div class="fit-grid">
          <div class="fit-box"></div>
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
