import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";

export async function addClosetItem(
  uid: string,
  data: {
    name: string;
    category?: string;
    imageURL?: string;
    storagePath?: string;
    color?: string;
    tags?: string[];
  }
) {
  const id = crypto.randomUUID();
  await setDoc(doc(db, "users", uid, "closet", id), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function ensureUserArea(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists())
    await setDoc(ref, { createdAt: serverTimestamp() }, { merge: true });
}

export async function listClosetItems(uid: string) {
  const ref = collection(db, "users", uid, "closet");
  const qs = await getDocs(ref);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
}
