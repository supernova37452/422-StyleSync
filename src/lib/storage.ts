import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadClosetImage(uid: string, file: File) {
  const id = crypto.randomUUID();
  const path = `users/${uid}/closet/${id}-${file.name}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type });
  const url = await getDownloadURL(r);
  return { url, path };
}
