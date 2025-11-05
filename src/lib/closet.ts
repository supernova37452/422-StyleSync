// typescript to handle closet-related firestore operations
import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";

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
