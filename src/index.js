import { createRouter, createWebHistory } from "vue-router";
import Login from "./Login.vue";
import App from "./App.vue";

//all route definitions go here for everything
const routes = [
  { path: "/", component: Login },
  { path: "/closet", component: App },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
