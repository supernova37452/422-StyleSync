import { auth, db } from "./lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Attach a test function to window so you can call it from the browser console.
async function smoke(email: string, password: string) {
  // 1) sign in (use a test user you created in Firebase Auth → Users)
  const cred = await signInWithEmailAndPassword(auth, email, password);

  // 2) write a doc under your user
  const uid = cred.user.uid;
  const itemRef = doc(db, "users", uid, "closet", "smokeItem");
  await setDoc(
    itemRef,
    {
      name: "Smoke Test Tee",
      category: "tops",
      imageUrl: "https://i.imgur.com/example.jpg",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // 3) read it back
  const snap = await getDoc(itemRef);
  return { uid, data: snap.data() };
}

// @ts-ignore
(window as any).smoke = smoke;
console.log("✅ smoke(email, password) is ready.");
