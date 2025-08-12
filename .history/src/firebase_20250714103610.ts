// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// src/firebase.js
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: 'AIzaSyA7jEWAamxdNKPG0Ec9SHPqJ0C-TkKBdEM',
//   authDomain: 'calendrette.firebaseapp.com',
//   projectId: 'calendrette',
//   storageBucket: 'calendrette.firebasestorage.app',
//   messagingSenderId: '869108711080',
//   appId: '1:869108711080:web:2cbfd381a6e8eb67de4c9d',
// }
const firebaseConfig = {
  apiKey: 'AIzaSyB3FGNJUT6AinTzE6nny-yw0_YjCMiD5wQ',
  authDomain: 'app-d-day.firebaseapp.com',
  projectId: 'app-d-day',
  storageBucket: 'app-d-day.firebasestorage.app',
  messagingSenderId: '181214535063',
  appId: '1:181214535063:web:b7787c9cdec02fb21cb8d2',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
