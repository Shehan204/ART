# Knight Quest AR

A production-ready WebXR/WebAR application for shared real-world digital anchors.

## Features
- Shared AR Coordinate System
- Admin Dashboard for Placing Objects
- Real-time Sync via Firestore
- Firebase Authentication for Secure Access
- Extensible Anchor/Object Systems

## Core Technologies
- React 19 + Vite
- Tailwind CSS
- Three.js + WebXR API
- Firebase (Auth, Firestore)

## Local Development
1. Run `npm install`
2. Create `.env.local` and add your Firebase configurations:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
3. Run `npm run dev`

## Deployment (Vercel)
The project includes a `vercel.json` file for proper Single-Page App (SPA) routing. Push the repository to GitHub and import it into Vercel. Ensure you add the environment variables in the Vercel dashboard.

## Firebase Setup
1. Enable **Authentication** in Firebase Console (Google Provider).
2. Enable **Firestore**. Look at `firestore.rules` for security rules. deployed via Firebase CLI.
3. Configure **Authorized domains** for Authentication if hosting on a custom domain.
