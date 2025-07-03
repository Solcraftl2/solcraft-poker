
![SolCraft Logo](https://i.postimg.cc/MKnpn5n5/1.jpg)

# SolCraft - Trading Infrastructure for the Next Era of Solana

SolCraft is a Next.js web application designed to provide a comprehensive platform for interacting with the Solana blockchain, focusing on trading, token launches, staking, and community engagement. It leverages Layer 2 solutions for enhanced scalability and security.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Firebase Setup](#firebase-setup)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [Deployment to Vercel](#deployment-to-vercel)
- [Key Features](#key-features)
- [Folder Structure](#folder-structure)
- [Styling](#styling)
- [AI Integration (Genkit)](#ai-integration-genkit)
- [Firebase Integration](#firebase-integration)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

SolCraft aims to be a user-friendly yet powerful platform for both new and experienced users in the Solana ecosystem. It offers tools for:

*   **Dashboard:** A central hub to view portfolio performance, key metrics, and recent activity.
*   **Token Swapping:** Seamlessly exchange cryptocurrencies.
*   **Deposit & Send:** Manage crypto assets securely.
*   **Launchpad:** Discover and participate in new token launches.
*   **Staking:** Grow crypto assets by staking in various pools.
*   **Profile Management:** Customize user profiles and connect wallets.
*   **Community Hub:** Connect with other investors and follow top players.
*   **Tournament Investment:** A unique feature allowing investment in poker tournament participation, with AI-powered risk assessment.

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **AI Integration:** Genkit (for Google AI models like Gemini)
*   **Backend/Database:** Firebase (Authentication, Firestore, Storage)
*   **State Management:** React Context API, `useState`, `useEffect`
*   **Forms:** React Hook Form with Zod for validation
*   **Charting:** Recharts (via ShadCN Charts)
*   **Icons:** Lucide React

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   Firebase Account & Project

### Firebase Setup

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Register Web App:** In your Firebase project, add a new Web app. Copy the Firebase configuration object provided during setup.
3.  **Enable Firebase Services:**
    *   **Authentication:** Enable Email/Password sign-in method.
    *   **Firestore:** Create a Firestore database in Native mode. Set up security rules.
    *   **Storage:** Enable Firebase Storage.
4.  **Generate Service Account Key (for Admin SDK):**
    *   In Firebase Console: Project settings > Service accounts.
    *   Generate a new private key and download the JSON file. You will need the content of this file for your environment variables.

### Environment Variables

Create a `.env` file in the root of the project by copying `.env.example` or creating it from scratch. This file is ignored by Git and should contain your secret keys.

```env
# .env

# --- Server-Side Firebase Admin Configuration ---
# Required for Firebase Admin SDK (server actions, Genkit, etc.)

# For local development, you can provide the path to your service account key file.
# Example: GOOGLE_APPLICATION_CREDENTIALS=./path-to-your-service-account-key.json
#
# For Vercel deployment, PASTE THE ENTIRE JSON CONTENT of the service account file here.
GOOGLE_APPLICATION_CREDENTIALS=
FIREBASE_PROJECT_ID=your-firebase-project-id

# --- Client-Side Firebase Configuration ---
# Required for Firebase Client SDK. Copy these values from your Firebase project settings.
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

**Note:** Service account keys are highly sensitive and **must not be committed to version control.**

### Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd solcraft-project
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment to Vercel

This project is optimized for deployment on Vercel.

1.  **Push to Git:** Push your project to a GitHub, GitLab, or Bitbucket repository.
2.  **Import Project in Vercel:** In your Vercel dashboard, import the repository. Vercel will automatically detect that it's a Next.js project.
3.  **Configure Environment Variables:** This is the most important step. In your Vercel project's settings (Settings > Environment Variables), add the following variables:

    *   `FIREBASE_PROJECT_ID`: Your Firebase project ID.
    *   `GOOGLE_APPLICATION_CREDENTIALS`: **Important:** Copy the *entire contents* of your downloaded service account JSON file and paste it into the value field. It will be a long, single line of text starting with `{ "type": "service_account", ... }`.
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API Key.
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase Auth Domain.
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase Project ID (can be the same as `FIREBASE_PROJECT_ID`).
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase Storage Bucket URL.
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Messaging Sender ID.
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`: Your App ID.
    *   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Your Measurement ID (optional).

4.  **Deploy:** Trigger a deployment. Vercel will build and deploy your application.

## Key Features

*   **User Authentication:** Email/password signup and login using Firebase Auth.
*   **Profile Management:** Editable user profiles, avatar uploads, wallet connection status.
*   **Dashboard:** Overview of key metrics, balance, portfolio allocation, recent activity.
*   **Token Swapping:** UI for swapping tokens.
*   **Deposit/Send:** UI for depositing and sending crypto.
*   **Launchpad:** Discover new token launches.
*   **Staking:** View staking summary and available staking pools.
*   **Tournament Investment:** Browse poker tournaments and view details, including AI-powered risk assessment.

## Folder Structure

A brief overview of the main directories:

```
/
├── public/                 # Static assets
├── src/
│   ├── ai/                 # Genkit AI flows and configuration
│   ├── app/                # Next.js App Router (pages, layouts)
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions, Firebase config, types
├── .env                    # Environment variables
├── next.config.ts
├── package.json
└── ...
```

## Styling

*   **Tailwind CSS:** Used for utility-first styling.
*   **ShadCN UI:** Provides a set of accessible components. Theme variables are in `src/app/globals.css`.
*   **CSS Variables:** Used for theming (light/dark mode).
*   **Fonts:** Inter and Poppins from Google Fonts.

## AI Integration (Genkit)

Genkit is used for integrating AI capabilities, such as the tournament risk assessment feature. Flows are defined in `src/ai/flows/`.

## Firebase Integration

Firebase is used for backend services: Authentication, Firestore database, and Storage for file uploads.

## Available Scripts

*   `npm run dev`: Runs the Next.js app in development mode.
*   `npm run build`: Builds the Next.js app for production.
*   `npm run start`: Starts the Next.js production server.
*   `npm run lint`: Lints the project.

## Contributing

(Placeholder) Contributions are welcome!

## License

(Placeholder) This project is licensed under the MIT License.
# soulcraft
