// src/authService.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Registrar nuevo usuario
export const registerUser = async (email, password, role) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  // Guardar el rol en Firestore
  await setDoc(doc(db, "users", uid), { email, role });
};

// Login usuario existente
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Obtener el rol del usuario
export const getUserRole = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) return docSnap.data().role;
  else return null;
};
