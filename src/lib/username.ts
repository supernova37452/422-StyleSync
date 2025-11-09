// src/lib/username.ts
import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/** One canonical normalization: trim, lowercase, replace spaces with underscores */
export const norm = (u: string) => u.trim().toLowerCase().replace(/\s+/g, "_");

/** Look up a uid by normalized username. */
export async function usernameToUid(username: string): Promise<string | null> {
  const key = norm(username);
  const ref = doc(db, "usernames", key);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as { uid?: string };
  return data?.uid ?? null;
}

/** Claim a username for a given uid (idempotent for same uid). */
export async function claimUsernameOrThrow(uid: string, username: string) {
  const key = norm(username);

  // if exists and belongs to someone else -> error
  const mapRef = doc(db, "usernames", key);
  const mapSnap = await getDoc(mapRef);
  if (mapSnap.exists()) {
    const data = mapSnap.data() as { uid?: string };
    if (data?.uid && data.uid !== uid) {
      throw new Error("That username is already taken.");
    }
  }

  await setDoc(mapRef, { uid, createdAt: serverTimestamp() }, { merge: true });

  // also write a lightweight profile (optional)
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    { username: key, createdAt: serverTimestamp() },
    { merge: true }
  );
}
