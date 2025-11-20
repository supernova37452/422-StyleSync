<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { userStore } from "@/stores/userStore";
import { norm } from "@/lib/username";
import { weatherStore } from "@/stores/weatherStore";
import { uploadClosetImageByName } from "@/lib/storage"; // <-- NEW
import { addClosetItemByName } from "@/lib/closet";

const temperature = computed(() => weatherStore.temperature);
const icon = computed(() => weatherStore.icon);
const shortForecast = computed(() => weatherStore.shortForecast);

const route = useRoute();
const router = useRouter();
const username = computed(() => userStore.username || "Guest");
const showInstructions = ref(false);
const toggleInstructions = () =>
  (showInstructions.value = !showInstructions.value);

const itemType = computed(() => {
  const t = route.query.type;
  return typeof t === "string" ? t : "tops";
});

// ---- NEW: state for upload + result
const fileInput = ref(null);
const selectedFile = ref(null); // the actual File object we will send
const selectedImage = ref(null); // preview of original file
const resultUrl = ref(""); // preview of the background-removed PNG
const loading = ref(false);
const errorMsg = ref("");
const bgRemoved = ref(false);
const adding = ref(false);
const successMsg = ref("");

const seasonOptions = ["Year Round", "Summer", "Fall", "Winter", "Spring"];
const colorOptions = ["Blue", "Green", "Red", "Black", "White", "Other"];

const selectedSeason = ref(null);
const selectedColor = ref(null);

// open file picker
function pickFiles() {
  fileInput.value?.click();
}

// when user picks a file, preview & store it
function onFilesChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  selectedFile.value = file;

  //replace olf url
  revokeUrl(selectedImage.value);
  selectedImage.value = makeUrl(file);

  revokeUrl(resultUrl.value);
  resultUrl.value = "";

  errorMsg.value = "";
  bgRemoved.value = false;
  successMsg.value = "";
  errorMsg.value = "";
}

// ---- NEW: call our backend proxy -> PhotoRoom NOTE: i rewrite parts of this to make the call a bit faster
async function removeBackground() {
  if (!selectedFile.value) {
    errorMsg.value = "Pick an image first.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    const form = new FormData();
    form.append("image", selectedFile.value);

    const res = await fetch("/api/remove-bg", { method: "POST", body: form });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    const blob = await res.blob();

    //this is to replace the original image with the new one
    const newUrl = makeUrl(blob);
    revokeUrl(selectedImage.value);
    selectedImage.value = newUrl;

    //clearing the box per new upload
    revokeUrl(resultUrl.value);
    resultUrl.value = "";

    //checking type but also assinging name? i think lol this is aimas stuff
    selectedFile.value = new File(
      [blob],
      (selectedFile.value.name.replace(/\.(png|jpg|jpeg|webp)$/i, "") ||
        "image") + "-bg.png",
      { type: "image/png" }
    );

    bgRemoved.value = true;
  } catch (err) {
    console.error(err);
    errorMsg.value = err?.message || "Background removal failed.";
    bgRemoved.value = false;
  } finally {
    loading.value = false;
  }
}
//only add if its cut out and they selected a file and they seleected a season and color for tagging
const canAddToCloset = computed(
  () =>
    !!(
      bgRemoved.value &&
      selectedFile.value &&
      selectedSeason.value &&
      selectedColor.value
    )
);

async function addToCloset() {
  if (!canAddToCloset.value || !userStore.username || !selectedFile.value)
    return;
  adding.value = true;
  errorMsg.value = "";
  try {
    const nameKey = norm(userStore.username);

    // upload to /usernames/{name}/closet/...
    const { url, path } = await uploadClosetImageByName(
      nameKey,
      selectedFile.value
    );

    // write Firestore under /usernames/{name}/closet
    await addClosetItemByName(nameKey, {
      name: selectedFile.value.name.replace(/\.[^.]+$/, ""),
      type: itemType.value,
      imageURL: url,
      storagePath: path,
      color: selectedColor.value || undefined,
      season: selectedSeason.value || undefined,
    });

    router.push("/closet");
  } catch (e) {
    errorMsg.value = e?.message || "Save failed.";
  } finally {
    adding.value = false;
  }
}

// keep if you need routing later
function proceed() {
  router.push("/upload");
}

const openMenu = ref(null); //so season, color, etc

function toggleMenu(which) {
  openMenu.value = openMenu.value === which ? null : which;
}

function closeMenus() {
  openMenu.value = null;
}

function pickSeason(s) {
  selectedSeason.value = s;
  closeMenus();
}

function pickColor(c) {
  selectedColor.value = c;

  closeMenus();
}
//NOTE: this is what i assume for what u need for the db @ shuroq
//so when u do const tags = getTagPayload() --> you can save these vars
function getTagPayload() {
  const payload = {
    season: selectedSeason.value,
    color: selectedColor.value,
  };
  console.log("tag payload (this is for db):", payload);
  return payload;
}
const objectUrls = new Set();

function makeUrl(blobOrFile) {
  const url = URL.createObjectURL(blobOrFile);
  objectUrls.add(url);
  return url;
}

function revokeUrl(url) {
  if (url && objectUrls.has(url)) {
    URL.revokeObjectURL(url);
    objectUrls.delete(url);
  }
}
</script>

<template>
  <div class="header-bar">
    <button class="button">{{ username }}</button>
    <h1>Add Your Items</h1>
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

  <div class="upload-container" style="margin: 24px auto 140px">
    <div class="upload-box">
      <img
        v-if="selectedImage"
        :src="selectedImage"
        alt="Uploaded"
        class="uploaded-img"
      />
    </div>

    <!-- Result preview -->
    <div v-if="resultUrl" class="upload-box" style="margin-top: 12px">
      <img :src="resultUrl" alt="Background-removed" class="uploaded-img" />
    </div>

    <!-- Error message -->
    <p v-if="errorMsg" style="color: #d33; margin-top: 8px">{{ errorMsg }}</p>
  </div>

  <!-- Hidden file input -->
  <input
    ref="fileInput"
    type="file"
    accept="image/*"
    class="hidden-input"
    @change="onFilesChange"
  />

  <div class="bottom-buttons">
    <button class="footer-btn left" @click="toggleInstructions">
      View Instructions
    </button>

    <!-- Upload (pick file) -->
    <button
      v-if="!canAddToCloset"
      class="footer-btn main-btn"
      @click="pickFiles"
      :disabled="loading"
      :aria-disabled="loading"
    >
      Upload
    </button>

    <button
      v-if="canAddToCloset"
      class="footer-btn main-btn"
      @click="addToCloset"
      :disabled="adding"
      :aria-disabled="adding"
    >
      {{ adding ? "Saving…" : "Add Item to Closet" }}
    </button>

    <!-- NEW: Remove background action -->
    <button
      class="footer-btn right"
      :disabled="!selectedFile || loading"
      @click="removeBackground"
      :aria-disabled="!selectedFile || loading"
    >
      {{ loading ? "Removing…" : "Remove" }}
    </button>
  </div>
  <div
    v-show="showInstructions"
    class="instructions-panel"
    role="dialog"
    aria-modal="true"
  >
    <button class="close-x" @click="toggleInstructions" aria-label="Close">
      ×
    </button>
    <div class="panel-content">
      <strong
        >Before getting started with uploading, take pictures of your favorite
        items! See the example photos for inspiration.
      </strong>
      <ol>
        <li>
          Click <strong>Upload </strong> to choose a PNG/JPG from your files.
          The more centered your item is, the better.
        </li>
        <li>
          Click <strong>Remove</strong> to remove the background of your photo.
        </li>
        <li>
          Tag the item via the dropdown based on the color it is and the season
          you would wear it for!
        </li>
      </ol>
      <div class="example-grid example-grid img">
        <img src="/icons/shoes.jpeg" alt="Example shoes" />
        <img src="/icons/jeans.jpeg" alt="Example jeans" />
        <img src="/icons/hoodie.jpeg" alt="Example hoodie" />
        <img src="/icons/hat.jpeg" alt="Example hat" />
      </div>
    </div>
  </div>
  <aside class="tagging-rail additional-rail-items">
    <div class="tagging">
      <!--season stuff-->
      <div class="tag-dropdown" :class="{ open: openMenu === 'season' }">
        <button class="tag-trigger" @click.stop="toggleMenu('season')">
          <span class="label">Season:</span>
          <span class="value">{{ selectedSeason }}</span>
          <span class="chev">▾</span>
        </button>
        <div v-if="openMenu === 'season'" class="menu">
          <button
            v-for="s in seasonOptions"
            :key="s"
            class="menu-item"
            @click.stop="pickSeason(s)"
          >
            {{ s }} <span v-if="selectedSeason === s" class="mark">✓</span>
          </button>
        </div>
      </div>
      <!--for color-->
      <div class="tag-dropdown" :class="{ open: openMenu === 'color' }">
        <button class="tag-trigger" @click.stop="toggleMenu('color')">
          <span class="label">Color:</span>
          <span class="value">{{ selectedColor }}</span>
          <span class="chev">▾</span>
        </button>
        <div v-if="openMenu === 'color'" class="menu">
          <button
            v-for="c in colorOptions"
            :key="c"
            class="menu-item"
            @click.stop="pickColor(c)"
          >
            {{ c }} <span v-if="selectedColor === c" class="mark">✓</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.hidden-input {
  display: none;
}
.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.uploaded-img {
  max-width: 420px;
  border-radius: 8px;
}
.bottom-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  margin-top: 1rem;
}
.footer-btn[disabled],
.footer-btn[aria-disabled="true"] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>