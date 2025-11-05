import { reactive } from "vue";

export const userStore = reactive({
  username: "" as string | null,
});

export function setUsername(name: string) {
  userStore.username = name.trim();
  localStorage.setItem("stylesync_username", userStore.username || "");
}

export function hydrateUsername() {
  const saved = localStorage.getItem("stylesync_username");
  if (saved) userStore.username = saved;
}
