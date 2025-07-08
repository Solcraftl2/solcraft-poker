# SolCraft Poker - Monorepo

Questo repository contiene l'intera piattaforma SolCraft Poker, organizzata come monorepo con frontend e backend separati.

## Struttura del Progetto

```
solcraft-poker/
├── frontend/          # Applicazione Next.js (React + TypeScript)
├── backend/           # API Python (FastAPI)
├── README.md          # Questo file
├── package.json       # Configurazione workspace
└── .gitignore         # File da ignorare
```

## Componenti

### Frontend (`/frontend`)
- **Framework**: Next.js 14+ con TypeScript
- **UI**: Tailwind CSS + ShadCN UI
- **Funzionalità**: 
  - Dashboard utente
  - Sistema di swap token
  - Gestione tornei poker
  - Integrazione wallet Solana
  - Sistema di autenticazione

### Backend (`/backend`)
- **Framework**: Python con FastAPI
- **Database**: PostgreSQL/MongoDB
- **Funzionalità**:
  - API REST per frontend
  - Gestione utenti e autenticazione
  - Logica business tornei
  - Integrazione blockchain

## Quick Start

### Prerequisiti
- Node.js 18+
- Python 3.9+
- Git

### Installazione

1. **Clona il repository**
```bash
git clone <repository-url>
cd solcraft-poker
```

2. **Installa dipendenze**
```bash
# Installa dipendenze workspace
npm install

# Installa dipendenze frontend
cd frontend && npm install && cd ..

# Installa dipendenze backend
cd backend && pip install -r requirements.txt && cd ..
```

3. **Configurazione ambiente**
```bash
# Copia e configura variabili d'ambiente
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

4. **Avvia i servizi**
```bash
# Avvia frontend (porta 3000)
npm run dev:frontend

# Avvia backend (porta 8000)
npm run dev:backend

# Avvia entrambi
npm run dev
```

## Scripts Disponibili

- `npm run dev` - Avvia frontend e backend in parallelo
- `npm run dev:frontend` - Avvia solo il frontend
- `npm run dev:backend` - Avvia solo il backend
- `npm run build` - Build di produzione per entrambi
- `npm run test` - Esegue tutti i test
- `npm run lint` - Linting del codice

## Deployment

### Frontend (Vercel)
Il frontend è configurato per il deploy automatico su Vercel.

### Backend (Railway/Heroku)
Il backend può essere deployato su Railway, Heroku o servizi simili.

## Contribuire

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/nome-feature`)
3. Commit delle modifiche (`git commit -am 'Aggiunge nuova feature'`)
4. Push del branch (`git push origin feature/nome-feature`)
5. Crea una Pull Request

## Licenza

Questo progetto è proprietario di SolCraft Team.

## Contatti

- Email: info@solcraftl2.com
- Website: https://solcraftl2.com

