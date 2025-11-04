import { createRouter, createWebHistory } from "vue-router";
import Login from "./Login.vue";
import Closet from "./Closet.vue";

//all route definitions go here for everything
const routes = [
  { path: "/", component: Login },
  { path: "/closet", component: Closet },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
