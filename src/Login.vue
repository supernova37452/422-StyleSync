<script setup>
import { ref } from "vue";
import { setUsername } from "@/stores/userStore";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");

function proceed() {
  const u = username.value.trim();
  if (!u) {
    alert("Please enter a valid username.");
    return;
  }
  setUsername(u);
  router.push("/closet");
}
</script>

<template>
  <div class="welcome-container">
    <h1>Welcome to Style Sync!</h1>
    <h2>New Users: Type in a unique name to use every time you log in</h2>
    <h2>Returning Users: Type in your existing username</h2>

    <div class="input-section">
      <label for="username">Username:</label>
      <input id="username" v-model="username" placeholder="Enter username" />
      <button class="proceed-btn" @click="proceed">Proceed to Closet</button>
      <!-- router Link is where we define where it is going based on the path names from index.js -->
    </div>
  </div>
</template>

<style scoped>
/* makes the entire page centered vertically + horizontally */
.welcome-container {
  display: flex;
  flex-direction: column;
  justify-content: center; /* centers vertically */
  align-items: center; /* centers horizontally */
  height: 100vh; /* take up full viewport */
  text-align: center;
  background-color: #f6f6f6; /* neutral background like your figma */
  font-family: "Playfair Display", serif;
}

/* spacing between title/instructions and input area */
h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.2rem;
  font-weight: normal;
  margin: 0.2rem 0;
}

.input-section {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input {
  width: 300px;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1.5px solid #aaa;
  text-align: center;
  font-size: 1rem;
}

button.proceed-btn {
  margin-top: 1rem;
  padding: 10px 25px;
  border-radius: 20px;
  border: none;
  background-color: #d8d4d1; /* soft neutral tone */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

button.proceed-btn:hover {
  background-color: #c0bbb7;
}
</style>
