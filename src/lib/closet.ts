// src/lib/closet.ts
import { db } from "./firebase";
import {
  doc,
  getDoc,
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

export async function addClosetItem(
  uid: string,
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
  await setDoc(doc(db, "users", uid, "closet", id), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function ensureUserArea(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { createdAt: serverTimestamp() }, { merge: true });
  }
}

export async function listClosetItems(uid: string) {
  const ref = collection(db, "users", uid, "closet");
  const qs = await getDocs(ref);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// live updates ordered by createdAt
export function subscribeClosetItems(uid: string, cb: (items: any[]) => void) {
  const ref = collection(db, "users", uid, "closet");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
