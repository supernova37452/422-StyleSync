<script setup>
import { ref } from "vue";

const username = ref("Layla"); //this are reactive variables, we can inject anything here but obvi must write the logic 4 that
const weather = ref("62");
</script>
<!-- okay so here is our app.vue: this is the top parent component! 
from my understanding, each component in vue would be a screen, this is the closet view for now
-->
<template>
  <router-view />
  <!-- this is where the router will inject the components based on the route -->
  <div class="header-bar">
    <button class="button">{{ username }}</button>
    <h1>Welcome to StyleSync</h1>
    <button class="button">{{ weather }}</button>
  </div>
  <div class="all-groups">
    <div class="one-group">
      <h3>Tops</h3>
      <div class="box-grid">
        <div v-for="n in 8" :key="`tops-${n}`" class="box"></div>
      </div>
    </div>

    <div class="one-group">
      <h3>Bottoms</h3>
      <div class="box-grid">
        <div v-for="n in 8" :key="`bottoms-${n}`" class="box"></div>
      </div>
    </div>

    <div class="one-group">
      <h3>Shoes</h3>
      <div class="box-grid">
        <div v-for="n in 8" :key="`shoes-${n}`" class="box"></div>
      </div>
    </div>

    <div class="one-group">
      <h3>Jackets</h3>
      <div class="box-grid">
        <div v-for="n in 8" :key="`jackets-${n}`" class="box"></div>
      </div>
    </div>

    <div class="one-group">
      <h3>Accessories</h3>
      <div class="box-grid">
        <div v-for="n in 8" :key="`acc-${n}`" class="box"></div>
      </div>
    </div>
  </div>
  <p></p>
</template>

<style scoped></style>
