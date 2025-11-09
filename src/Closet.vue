<script setup lang="ts">
import { ref } from "vue";
import { computed } from "vue";
import { userStore } from "@/stores/userStore";
import { weatherStore } from "@/stores/weatherStore";
import { uploadClosetImage } from "@/lib/storage";
import { addClosetItem } from "@/lib/closet";

const temperature = computed(() => weatherStore.temperature);
const icon = computed(() => weatherStore.icon);
const shortForecast = computed(() => weatherStore.shortForecast);

const username = computed(() => userStore.username || "Guest"); //this are reactive variables, we can inject anything here but obvi must write the logic 4 that
async function onPickFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !userStore.uid) return;

  const img = await uploadClosetImage(userStore.uid, file);
  await addClosetItem(userStore.uid, {
    name: file.name.replace(/\.[^.]+$/, ""),
    category: "tops",
    imageURL: img.url, // <- store download URL in Firestore
    storagePath: img.path,
  });
}
</script>
<!-- okay so here is our app.vue: this is the top parent component! 
from my understanding, each component in vue would be a screen, this is the closet view for now
-->

<template>
  <!-- this is where the router will inject the components based on the route -->
  <div class="header-bar">
    <button class="button">{{ username }}</button>
    <h1>Welcome to StyleSync</h1>
     <button
    class="button"
    style=" display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 8px 12px;">
    <div
      style=" display: flex; flex-direction: column; align-items: flex-start; text-align: left; line-height: 1.2;
        max-width: 100px; word-wrap: break-word;">
      <span>{{ temperature }}°</span>
      <small v-if="shortForecast" style="font-size: 12px;  max-width: 100px; word-wrap: break-word;">
        {{ shortForecast }}
      </small>
    </div>
    <img
      v-if="icon"
      :src="icon"
      alt="Weather icon"
      style="width: 40px; height: 40px;"
    />
  </button>
</div>
  <div class="all-groups">
    <div class="one-group">
      <h3>Tops</h3>
      <div class="box-grid">
        <!-- <div v-for="n in 8" :key="`tops-${n}`" class="box"></div> -->
        <div
          v-for="n in 8"
          :key="`tops-${n}`"
          :class="['box', n === 8 ? 'plus-in-box' : '']"
        >
          <RouterLink
            v-if="n === 8"
            to="/upload?type=tops"
            class="plus-box"
            aria-label="Add a top"
            >+</RouterLink
          >
        </div>
      </div>
    </div>

    <div class="one-group">
      <h3>Bottoms</h3>
      <div class="box-grid">
        <!-- <div v-for="n in 8" :key="`bottoms-${n}`" class="box"></div> -->
        <div
          v-for="n in 8"
          :key="`tops-${n}`"
          :class="['box', n === 8 ? 'plus-in-box' : '']"
        >
          <RouterLink
            v-if="n === 8"
            to="/upload?type=bottoms"
            class="plus-box"
            aria-label="Add a top"
            >+</RouterLink
          >
        </div>
      </div>
    </div>

    <div class="one-group">
      <h3>Shoes</h3>
      <div class="box-grid">
        <!-- <div v-for="n in 8" :key="`shoes-${n}`" class="box"></div> -->
        <div
          v-for="n in 8"
          :key="`tops-${n}`"
          :class="['box', n === 8 ? 'plus-in-box' : '']"
        >
          <RouterLink
            v-if="n === 8"
            to="/upload?type=shoes"
            class="plus-box"
            aria-label="Add a top"
            >+</RouterLink
          >
        </div>
      </div>
    </div>

    <div class="one-group">
      <h3>Jackets</h3>
      <div class="box-grid">
        <!-- <div v-for="n in 8" :key="`jackets-${n}`" class="box"></div> -->
        <div
          v-for="n in 8"
          :key="`tops-${n}`"
          :class="['box', n === 8 ? 'plus-in-box' : '']"
        >
          <RouterLink
            v-if="n === 8"
            to="/upload?type=jackets"
            class="plus-box"
            aria-label="Add a top"
            >+</RouterLink
          >
        </div>
      </div>
    </div>

    <div class="one-group">
      <h3>Accessories</h3>
      <div class="box-grid">
        <!-- <div v-for="n in 8" :key="`acc-${n}`" class="box"></div> -->
        <div
          v-for="n in 8"
          :key="`tops-${n}`"
          :class="['box', n === 8 ? 'plus-in-box' : '']"
        >
          <RouterLink
            v-if="n === 8"
            to="/upload?type=accessories"
            class="plus-box"
            aria-label="Add a top"
            >+</RouterLink
          >
        </div>
      </div>
    </div>
  </div>
  <p></p>
  <div
    style="
        display: flex;
        justify-content: center;
        gap: 30px;
        margin-top: 20px;
    ">
    <button class="button">
        <RouterLink to="/outfitbuilder" style="color: inherit; text-decoration: none;">
        Outfit Builder
        </RouterLink>
    </button>

    <button class="button">
        <RouterLink to="/closet" style="color: inherit; text-decoration: none;">
        Favorite Outfits
        </RouterLink>
    </button>
    </div>
</template>

<style scoped></style>