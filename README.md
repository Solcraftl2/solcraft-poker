# 🎮 SolCraft Poker - Web3 Poker Platform

**Professional poker platform built with Next.js, FastAPI, and Firebase, featuring Web3 integration and Solana wallet support.**

## 🚀 Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: Firebase Auth
- **State Management**: React Context + Hooks
- **Deployment**: Vercel

### Backend (FastAPI)
- **Framework**: FastAPI (Python 3.9+)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Admin SDK
- **Deployment**: Vercel Serverless Functions

### Infrastructure
- **Hosting**: Vercel (Frontend + Backend)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **CDN**: Vercel Edge Network
- **Domain**: solcraftl2.com

## 📁 Project Structure

```
solcraft-poker/
├── sol-craft/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities & Firebase config
│   │   └── styles/           # Global styles
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   └── .env.example          # Frontend environment template
├── api/                      # FastAPI Backend
│   ├── routes/               # API endpoints
│   │   ├── players.py        # Player management
│   │   ├── tournaments.py    # Tournament system
│   │   ├── fees.py          # Fee management
│   │   ├── guarantees.py    # Guarantee system
│   │   └── auth.py          # Authentication
│   ├── models/              # Pydantic models
│   ├── services/            # Business logic
│   └── index.py             # FastAPI main app
├── requirements.txt         # Python dependencies
├── vercel.json             # Vercel configuration
├── .env.example            # Environment template
└── README.md               # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Firebase project
- Vercel account (for deployment)

### 1. Clone Repository
```bash
git clone https://github.com/Solcraftl2/solcraft-poker.git
cd solcraft-poker
```

### 2. Environment Configuration

#### Frontend Environment
```bash
cd sol-craft
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Backend Environment
```bash
cd ..
cp .env.example .env
```

Edit `.env` with your Firebase service account:
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

### 3. Install Dependencies

#### Frontend
```bash
cd sol-craft
npm install
```

#### Backend
```bash
cd ..
pip install -r requirements.txt
```

### 4. Development

#### Start Frontend (Development)
```bash
cd sol-craft
npm run dev
```
Frontend available at: http://localhost:3000

#### Start Backend (Development)
```bash
cd api
uvicorn index:app --reload --port 8000
```
API available at: http://localhost:8000

### 5. Production Deployment

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

The project is configured for automatic deployment:
- **Frontend**: Deployed to Vercel Edge Network
- **Backend**: Deployed as Vercel Serverless Functions
- **Domain**: Automatically configured for solcraftl2.com

## 🔥 Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: `solcraft-poker-vercel`
3. Enable Authentication with Email/Password
4. Enable Firestore Database

### 2. Configure Authentication
- Enable Email/Password provider
- Add authorized domains:
  - `solcraft-poker-frontend.vercel.app`
  - `solcraftl2.com`

### 3. Generate Service Account
1. Go to Project Settings → Service Accounts
2. Generate new private key
3. Use credentials in backend `.env` file

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/verify-token` - Verify Firebase token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh session

### Players
- `GET /api/players` - List players
- `GET /api/players/{id}` - Get player details
- `POST /api/players` - Create player profile
- `PUT /api/players/{id}` - Update player
- `GET /api/players/{id}/stats` - Player statistics

### Tournaments
- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament
- `POST /api/tournaments/{id}/register` - Register for tournament
- `GET /api/tournaments/{id}/players` - Tournament players

### Fees & Guarantees
- `GET /api/fees` - Fee management
- `GET /api/guarantees` - Guarantee system
- `POST /api/fees/calculate` - Calculate fees
- `GET /api/guarantees/analytics` - Guarantee analytics

## 🎮 Features

### ✅ Implemented
- **Authentication**: Firebase Auth with email/password
- **Player Management**: Complete CRUD operations
- **Tournament System**: Registration, management, results
- **Fee System**: Calculation and tracking
- **Guarantee System**: Tournament guarantees
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Firebase real-time listeners

### 🚧 In Development
- **Poker Engine**: Texas Hold'em game logic
- **Web3 Integration**: Solana wallet connection
- **Live Games**: Real-time multiplayer poker
- **Payment System**: Crypto payments
- **Advanced Analytics**: Player insights

### 🔮 Planned
- **Mobile App**: React Native version
- **Tournament Streaming**: Live tournament broadcasts
- **NFT Integration**: Collectible poker assets
- **DAO Governance**: Community-driven platform

## 🔧 Development Scripts

### Frontend
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

### Backend
```bash
uvicorn index:app --reload    # Development server
python -m pytest             # Run tests
black .                       # Code formatting
flake8 .                     # Linting
```

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **Core Web Vitals**: All metrics in green
- **API Response Time**: <100ms average
- **Global CDN**: Sub-200ms worldwide

## 🛡️ Security

- **Authentication**: Firebase Auth with secure tokens
- **Authorization**: Role-based access control
- **Data Validation**: Pydantic models + client validation
- **Rate Limiting**: API endpoint protection
- **CORS**: Properly configured cross-origin requests

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Site**: [solcraftl2.com](https://solcraftl2.com)
- **API Documentation**: [solcraftl2.com/api/docs](https://solcraftl2.com/api/docs)
- **GitHub**: [github.com/Solcraftl2/solcraft-poker](https://github.com/Solcraftl2/solcraft-poker)
- **Discord**: [Join our community](https://discord.gg/solcraft)

## 📞 Support

For support, email info@solcraftl2.com or join our Discord community.

---

**Built with ❤️ by the SolCraft Team**

