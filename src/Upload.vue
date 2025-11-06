<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { userStore } from "@/stores/userStore";

const router = useRouter();
const username = computed(() => userStore.username || "Guest");
const weather = ref("62");

const showInstructions = ref(false);
const toggleInstructions = () => (showInstructions.value = !showInstructions.value);

// ---- NEW: state for upload + result
const fileInput = ref(null);
const selectedFile = ref(null);      // the actual File object we will send
const selectedImage = ref(null);     // preview of original file
const resultUrl = ref("");           // preview of the background-removed PNG
const loading = ref(false);
const errorMsg = ref("");

// open file picker
function pickFiles() {
  fileInput.value?.click();
}

// when user picks a file, preview & store it
function onFilesChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  selectedFile.value = file;
  selectedImage.value = URL.createObjectURL(file);
  resultUrl.value = "";
  errorMsg.value = "";
}

// ---- NEW: call our backend proxy -> PhotoRoom
async function removeBackground() {
  if (!selectedFile.value) {
    errorMsg.value = "Pick an image first.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    const form = new FormData();
    // IMPORTANT: field name must be "image" (what the Express route expects)
    form.append("image", selectedFile.value);

    const res = await fetch("/api/remove-bg", { method: "POST", body: form });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }

    const blob = await res.blob();
    resultUrl.value = URL.createObjectURL(blob);
  } catch (err) {
    console.error(err);
    errorMsg.value = err?.message || "Background removal failed.";
  } finally {
    loading.value = false;
  }
}

// keep if you need routing later
function proceed() {
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
      <!-- Original preview -->
      <img
        v-if="selectedImage"
        :src="selectedImage"
        alt="Uploaded"
        class="uploaded-img"
      />
    </div>

    <!-- Result preview -->
    <div v-if="resultUrl" class="upload-box" style="margin-top:12px;">
      <img :src="resultUrl" alt="Background-removed" class="uploaded-img" />
      <small>Background removed ✅</small>
    </div>

    <!-- Error message -->
    <p v-if="errorMsg" style="color:#d33; margin-top:8px;">{{ errorMsg }}</p>
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
    <button class="footer-btn left" @click="toggleInstructions">View Instructions</button>

    <!-- Upload (pick file) -->
    <button class="footer-btn main-btn" @click="pickFiles">Upload</button>

    <!-- NEW: Remove background action -->
    <button
      class="footer-btn right"
      :disabled="!selectedFile || loading"
      @click="removeBackground"
      :aria-disabled="!selectedFile || loading"
    >
      {{ loading ? 'Removing…' : 'Remove BG' }}
    </button>
  </div>

  <!-- Instructions panel -->
  <div v-show="showInstructions" class="instructions-panel" role="dialog" aria-modal="true">
    <button class="close-x" @click="toggleInstructions" aria-label="Close">×</button>
    <div class="panel-content">
      <strong>Before getting started, make sure you take some pictures of your favorite items! When you're ready:</strong>
      <ol>
        <li>Click <em>Upload</em> to choose a PNG/JPG from your device.</li>
        <li>Click <strong>Remove BG</strong> to remove the background.</li>
        <li>Tag the item by color, season, and occasion.</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.hidden-input { display: none; }
.upload-box { display:flex; flex-direction:column; align-items:center; }
.uploaded-img { max-width: 420px; border-radius: 8px; }
.bottom-buttons { display:flex; gap:.5rem; justify-content:space-between; margin-top:1rem; }
.footer-btn[disabled], .footer-btn[aria-disabled="true"] { opacity:.6; cursor:not-allowed; }
</style>
