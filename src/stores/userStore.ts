import { reactive } from "vue";

export const userStore = reactive<{
  uid: string | null;
  username: string | null;
}>({
  uid: null,
  username: null,
});

export function setUser(uid: string | null, username: string | null) {
  userStore.uid = uid;
  userStore.username = username;
  if (uid && username) {
    localStorage.setItem("stylesync_user", JSON.stringify({ uid, username }));
  } else {
    localStorage.removeItem("stylesync_user");
  }
}

export function hydrateUser() {
  const raw = localStorage.getItem("stylesync_user");
  if (!raw) return;
  try {
    const { uid, username } = JSON.parse(raw);
    setUser(uid, username);
  } catch {
    /* ignore */
  }
}
