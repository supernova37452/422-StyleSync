import { createRouter, createWebHistory } from "vue-router";
import Login from "./Login.vue";
import Closet from "./Closet.vue";
import uploadItems from "./Upload.vue";
import OutfitBuilder from "./OutfitBuilder.vue";
import FavFits from "./FavFits.vue";

//all route definitions go here for everything
const routes = [
  { path: "/", component: Login },
  { path: "/closet", component: Closet },
  { path: "/upload", component: uploadItems },
  { path: "/outfitbuilder", component: OutfitBuilder },
  { path: "/favfits", component: FavFits },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;


