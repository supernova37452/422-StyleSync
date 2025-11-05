// typescript to handle username normalization and claiming in Firestore
import { db } from "./firebase";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

export const norm = (u: string) => u.trim().toLowerCase().replace(/\s+/g, "_");

export async function usernameToUid(username: string) {
  const ref = doc(db, "usernames", norm(username));
  const snap = await getDoc(ref);
  return snap.exists() ? ((snap.data() as any).uid as string) : null;
}

export async function claimUsernameOrThrow(uid: string, username: string) {
  const key = norm(username);
  const ref = doc(db, "usernames", key);
  await runTransaction(db, async (tx) => {
    const s = await tx.get(ref);
    if (s.exists()) throw new Error("Username is taken");
    tx.set(ref, { uid, createdAt: serverTimestamp() });
    tx.set(
      doc(db, "users", uid),
      { username: key, createdAt: serverTimestamp() },
      { merge: true }
    );
  });
  return key;
}
