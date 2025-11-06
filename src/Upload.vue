<script setup>
import { ref } from "vue";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { userStore } from "@/stores/userStore";
import { weatherStore } from "@/stores/weatherStore";


const temperature = computed(() => weatherStore.temperature);

const router = useRouter();
const username = computed(() => userStore.username || "Guest");
const weather = temperature;
const showInstructions = ref(false);
const toggleInstructions = () => {
  showInstructions.value = !showInstructions.value;
  console.log(" toggled:", showInstructions.value);
};

const fileInput = ref(null);
const selectedImage = ref(null);
//selected files-> this is what we will store for later when displaying?? idk if this has to be a list tbh
const files = ref([]);

//this will trigger the file sys to open (idk if this works on windows but it still should)
function pickFiles() {
  fileInput.value?.click();
}
//set the original image inside the file box
function onFilesChange(e) {
    console.log("file changetriggered:", e);
  const file = e.target.files[0];
  if (file) {
    selectedImage.value = URL.createObjectURL(file);
    console.log("file from user", selectedImage.value);
  }
}

function proceed() {
//   const u = username.value.trim();
  router.push("/upload");
}
</script>

<template>
  <div class="header-bar">
    <button class="button">{{ username }}</button>
    <h1>Upload ur shi gang</h1>
    <button class="button">{{ weather }}</button>
  </div>

  <div class="upload-container" style="margin: 24px auto 140px;">
    <div class="upload-box">
      <img
        v-if="selectedImage"
        :src="selectedImage"
        alt="Uploaded"
        class="uploaded-img"
      />
      <!-- <img
        v-else
        src="come back to this this is for the fake pants lol"
        alt="placeholder"
        class="placeholder-icon"
      /> -->
    </div>
  </div>

  <!-- this is a built in tag for html that allows for file uploads-->
  <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="onFilesChange"
  />

  <div class="bottom-buttons">
 <button class="footer-btn left" @click="toggleInstructions">View Instructions</button>
 <button class="footer-btn main-btn" @click="pickFiles">Upload</button>
  <button class="footer-btn right" disabled aria-disabled="true">Add Item</button>
  </div>

        <!-- <div v-show="showInstructions" class="instructions-panel" wait... -->
        <div v-show="showInstructions" class="instructions-panel" role="dialog" aria-modal="true">
    <button class="close-x" @click="toggleInstructions" aria-label="Close">×</button>
      <div class="panel-content">
      <strong>Before getting started, make sure you take some pictures of your favorite items! See the example photos to see how they should be taken. When you're ready: </strong>
      <ol>
        <li>Click the T-Shirt placeholder to open your files.</li>
        <li>Select a PNG/JPG from your device.</li>
        <li>Hit <strong>Upload</strong> to remove the background of your photo.</li>
        <li>Tag the item based on the color it is, the season, and the occasion you would wear it!</li>
            <!-- we'll add the pics and stuff here w the <img> tag i needa lookn at some doc for dat -->
      </ol>

  <div class="bottom-buttons">
    <button class="footer-btn left" @click="toggleInstructions">View Instructions</button>
    <button class="footer-btn main-btn" @click="pickFiles">Upload</button>
    <button class="footer-btn right" disabled aria-disabled="true">Add Item</button>
  </div>

  <div v-if="files.length" class="preview-row">
    <div v-for="(f, i) in files" :key="i" class="preview-item">
      <img :src="URL.createObjectURL(f)" :alt="f.name" />
      <small>{{ f.name }}</small>
    </div>
    </div>
  </div>
</div>
</template>