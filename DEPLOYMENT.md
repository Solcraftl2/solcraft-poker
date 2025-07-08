# Deployment Guide

This document explains how to configure environment variables on **Vercel** for both the Next.js frontend and the Python backend. It also summarizes the blockchain integration points.

## 1. Firebase Service Account

The frontend uses Firebase for authentication and other features. When deploying to Vercel, you must provide the Firebase service account JSON directly in the environment variables.

From the `frontend/README.md`:

```
GOOGLE_APPLICATION_CREDENTIALS=
FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Copy the entire content of the downloaded Firebase service account file into `GOOGLE_APPLICATION_CREDENTIALS` in the Vercel dashboard. Do **not** commit this JSON to the repository. These lines are referenced in the project's documentation【F:frontend/README.md†L76-L103】【F:frontend/README.md†L122-L139】.

## 2. Supabase Keys and Database URLs

The backend requires Supabase connection details. The `backend/README.md` lists all required secrets:

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
POSTGRES_URL
DATABASE_URL
SUPABASE_URL
SUPABASE_KEY
JWT_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
```

Set these variables in Vercel or in your GitHub repository secrets when using the deployment workflow. Instructions for obtaining `SUPABASE_URL` and `SUPABASE_KEY` are provided in the README【F:backend/README.md†L11-L45】.

## 3. Blockchain / Smart‑Contract Integration

SolCraft Poker integrates with the Solana blockchain. The frontend mentions wallet connections and secure multi‑signature escrow contracts for tournament funds【F:README.md†L23-L27】【F:frontend/src/components/tournaments/tournament-detail-client.tsx†L292-L311】. If your deployment requires network configuration, add variables such as `NEXT_PUBLIC_SOLANA_NETWORK` and `NEXT_PUBLIC_SOLANA_RPC_URL` to Vercel. These variables are optional but may be needed when connecting to custom Solana nodes.

## 4. Steps to Configure on Vercel

1. **Import the repository** into Vercel.
2. **Add the environment variables** listed above in *Project Settings → Environment Variables*.
3. **Trigger a deployment**. Vercel will build the Next.js frontend and deploy the backend API using the provided configuration.

Ensure secret values remain private. After deployment, wallet and smart‑contract features will operate using the configured Firebase project and Supabase database.
