// src/lib/storage.ts
import { storage } from "./firebase";
import { ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadClosetImage(uid: string, file: File) {
  const id = crypto.randomUUID();
  const path = `users/${uid}/closet/${id}-${file.name}`;
  const r = sref(storage, path);
  await uploadBytes(r, file, { contentType: file.type || "image/png" });
  const url = await getDownloadURL(r);
  return { url, path };
}
