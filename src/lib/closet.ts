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
  deleteDoc,
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

// favoriting outfit helpers
export type FavoriteFitPayload = {
  topURL?: string | null;
  bottomURL?: string | null;
  shoesURL?: string | null;
  jacketURL?: string | null;
  accessoryURL?: string | null;
  accessory2URL?: string | null;
  category: string | null;
  key: string; // unique signature for this combo
  outfitName?: string | null;
};

// create a new fav fit doc under usernames/{name}/favFits
export async function addFavoriteFitByName(
  name: string,
  data: FavoriteFitPayload
) {
  const id = crypto.randomUUID();
  await setDoc(doc(db, "usernames", name, "favFits", id), {
    ...data,
    username: name,
    createdAt: serverTimestamp(),
  });
  return id;
}

// list all fav fits for a user
export async function listFavoriteFitsByName(name: string) {
  const ref = collection(db, "usernames", name, "favFits");
  const qs = await getDocs(ref);
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// delete a single fav fit (for un-starring)
export async function deleteFavoriteFitById(name: string, fitId: string) {
  await deleteDoc(doc(db, "usernames", name, "favFits", fitId));
}

// live subscribe to all fav fits for a user
export function subscribeFavoriteFitsByName(
  name: string,
  cb: (items: any[]) => void
) {
  const ref = collection(db, "usernames", name, "favFits");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}
