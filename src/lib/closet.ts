// src/lib/closet.ts
import { db } from "./firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export type ClosetType =
  | "tops"
  | "bottoms"
  | "shoes"
  | "jackets"
  | "accessories";

export async function ensureUserAreaByName(name: string) {
  const ref = doc(db, "usernames", name);
  await setDoc(ref, { createdAt: serverTimestamp() }, { merge: true });
}

export async function addClosetItemByName(
  name: string,
  data: {
    name: string;
    type: ClosetType;
    imageURL: string;
    storagePath: string;
    color?: string;
    season?: string;
  }
) {
  const id = crypto.randomUUID();
  await setDoc(doc(db, "usernames", name, "closet", id), {
    ...data,
    username: name, // used by rule check
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function listClosetItemsByName(name: string) {
  const ref = collection(db, "usernames", name, "closet");
  const qs = await getDocs(ref);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeClosetItemsByName(
  name: string,
  cb: (items: any[]) => void
) {
  const ref = collection(db, "usernames", name, "closet");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}
