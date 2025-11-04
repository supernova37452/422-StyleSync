import { createRouter, createWebHistory } from "vue-router";
import Login from "./Login.vue";
import App from "./App.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/closet", component: App },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
