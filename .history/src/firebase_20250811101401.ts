// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// src/firebase.js
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

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
