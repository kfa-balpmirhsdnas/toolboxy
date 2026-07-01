import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)

// Firestore & Storage are accessed only server-side (firebase-admin), so the client SDKs for them
// are intentionally NOT initialized here — that keeps them out of the client bundle.

// Firebase Analytics is initialized lazily (only in the browser, when supported) so it doesn't add
// a synchronous init to every page load. Awaited by callers that need it.
export const analytics =
  typeof window === 'undefined' ? Promise.resolve(null) : isSupported().then((yes) => (yes ? getAnalytics(app) : null))

export default app
