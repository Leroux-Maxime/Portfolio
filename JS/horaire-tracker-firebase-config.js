/**
 * Firebase Configuration
 * Initialise Firebase avec votre projet
 */

// Firebase config - remplacer par votre propre config
const firebaseConfig = {
  apiKey: "AIzaSyDbK8gotsCYjsrcfgcs8dogL8wgdaRVXGA",
  authDomain: "horaires-f3862.firebaseapp.com",
  projectId: "horaires-f3862",
  storageBucket: "horaires-f3862.firebasestorage.app",
  messagingSenderId: "754448183874",
  appId: "1:754448183874:web:7dc1b4094ecb209fc633db",
  measurementId: "G-553GGPH96H"
};

// Initialiser Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

// Récupérer les services
const firebaseAuth = firebase.auth();
const firestore = firebase.firestore();

// Configuration de Google Auth
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
