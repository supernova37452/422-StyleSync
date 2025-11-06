// this is just a test comment I am trying to figure out if my commits are working right
import { createApp } from "vue";
import App from "./App.vue";
import router from "./index.js";
import "./main.css";

import { auth } from "./lib/firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { hydrateUser } from "./stores/userStore"; // <-- rename here

onAuthStateChanged(auth, (u) => {
  if (!u) signInAnonymously(auth).catch(() => {});
});

hydrateUser(); // <-- rename here

createApp(App).use(router).mount("#app");
