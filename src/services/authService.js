// src/services/authService.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase"

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user; // si todo sale bien
    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        throw error; // lo manejamos desde el componente
    }
};


export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error.message);
    }
};
