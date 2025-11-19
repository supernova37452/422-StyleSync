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
// const selectedcat = ref(null);
// const openMenu = ref(null);
// const starActive = ref(false);

// function toggleStar() {
//   starActive.value = !starActive.value;
// }

// function toggleMenu(which) {
//   openMenu.value = openMenu.value === which ? null : which;
// }

// function closeMenus() {
//   openMenu.value = null;
// }

// function pickCategory(s) {
//   selectedcat.value = s;
//   closeMenus();
// }
</script>
<!-- outfit builder i stole chunks from other stuff so the names are off sometimes idk -->

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
      <!-- left rail -->
      <aside class="fav-rail">
        <button v-for="c in catOptions" :key="c" class="cat-pill" type="button">
          {{ c }}
        </button>
      </aside>

      <!-- three large boxes -->
      <section class="fav-cards">
        <div class="fav-card"></div>
        <div class="fav-card"></div>
        <div class="fav-card"></div>
        <div class="fav-card"></div>
      </section>
    </div>
    <!-- go back button allll the way at the bottom -->
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
/* layout: rail + cards */
.fav-content {
  width: min(1200px, 94vw);
  margin: 20px 0 60px 0;
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 36px;
  margin-bottom: 40px;
}

/* left category rail – styled to your light lavender family */
.fav-rail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 24px;
  padding-top: 6px;
}

.cat-pill {
  background-color: #8f8ae6;
  color: white;
  border: none;
  border-radius: 12px;
  width: 100px; /* make all same width */
  height: 48px;
  padding: 10px 16px;
  font-size: 16px;
  cursor: default; /* no functionality yet */
}

.fav-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.fav-card {
  background-color: #eeeeee; /* same box gray from main.css */
  border-radius: 12px;
  height: clamp(250px, 50vw, 500px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  width: 300px;
}

/* footer buttons centered; color pulled from your global button */
.fav-footer {
  display: flex;
  justify-content: center;
  gap: 50px;
  padding: 36px 0 54px;
}

.buttonlike {
  background-color: #6c67c6; /* same as button */
  color: #fff;
  border: none;
  padding: 12px 26px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
</style>
