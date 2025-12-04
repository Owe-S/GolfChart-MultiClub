import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDotsYz6L5sCwR1iIrxtmOfZ90qI-xsxF4",
  authDomain: "golfbilkontroll-skigk.firebaseapp.com",
  projectId: "golfbilkontroll-skigk",
  storageBucket: "golfbilkontroll-skigk.firebasestorage.app",
  messagingSenderId: "793476088060",
  appId: "1:793476088060:web:d3f021f3ab98d2d8529779",
  measurementId: "G-ZQE9F3B8EE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'europe-west3');

export default app;
