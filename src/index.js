import { createRouter, createWebHistory } from "vue-router";
import Login from "./Login.vue";
import Closet from "./Closet.vue";
import uploadItems from "./Upload.vue"

//all route definitions go here for everything
const routes = [
  { path: "/", component: Login },
  { path: "/closet", component: Closet },
  { path: "/upload", component: uploadItems}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
