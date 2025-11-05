import { createApp } from "vue";
import App from "./App.vue";
import router from "./index.js";
import "./devSmoke"; // just to test firebase setup
import "./main.css";

import { hydrateUsername } from "./stores/userStore";
hydrateUsername();

createApp(App).use(router).mount("#app");
