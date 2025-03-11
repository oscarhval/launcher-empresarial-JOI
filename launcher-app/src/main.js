// main.js
import App from './App.svelte';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
	apiKey: "",
	authDomain: "launcher-app-1d83c.firebaseapp.com",
	projectId: "launcher-app-1d83c",
	storageBucket: "launcher-app-1d83c.firebasestorage.app",
	messagingSenderId: "92909743582",
	appId: "1:92909743582:web:baf23d7a958c8e55da014f"
  };

const appFirebase = initializeApp(firebaseConfig);

export const auth = getAuth(appFirebase);
export const googleProvider = new GoogleAuthProvider();

const app = new App({
  target: document.body
});

export default app;
