// src/lib/storage.ts
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadClosetImageByName(
  name: string,
  file: File | Blob
): Promise<{ url: string; path: string }> {
  const id = crypto.randomUUID();
  const path = `usernames/${name}/closet/${id}-${(file as any).name ?? "item"}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  return { url, path };
}
