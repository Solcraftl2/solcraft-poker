# SolCraft Poker - Istruzioni di Setup

## ✅ Completato

Il repository **solcraft-poker** è stato creato con successo! 

### Struttura Creata

```
solcraft-poker/
├── frontend/              # Codice da solcraft-frontend
│   ├── src/              # Codice sorgente React/Next.js
│   ├── public/           # Asset statici
│   ├── package.json      # Dipendenze frontend
│   └── ...
├── backend/              # Codice da solcraft-backend  
│   ├── api/              # API Python
│   ├── main.py           # Entry point backend
│   ├── requirements.txt  # Dipendenze Python
│   └── ...
├── README.md             # Documentazione principale
├── package.json          # Configurazione workspace
├── .gitignore           # File da ignorare
└── SETUP_INSTRUCTIONS.md # Questo file
```

## 🚀 Prossimi Passi

### 1. Crea il Repository su GitHub

```bash
# Il repository locale è già pronto con commit iniziale
# Ora devi creare il repository su GitHub:

# 1. Vai su https://github.com/Solcraftl2
# 2. Clicca "New repository"
# 3. Nome: "solcraft-poker"
# 4. Descrizione: "SolCraft Poker - Monorepo con frontend e backend"
# 5. Seleziona "Private" se necessario
# 6. NON inizializzare con README (già presente)
# 7. Clicca "Create repository"
```

### 2. Collega e Pusha il Repository

```bash
# Dalla cartella solcraft-poker, esegui:
git remote add origin https://github.com/Solcraftl2/solcraft-poker.git
git branch -M main
git push -u origin main
```

### 3. Installa le Dipendenze

```bash
# Installa concurrently per gestire frontend e backend insieme
npm install

# Installa dipendenze frontend
cd frontend && npm install && cd ..

# Installa dipendenze backend
cd backend && pip install -r requirements.txt && cd ..
```

### 4. Configura le Variabili d'Ambiente

```bash
# Frontend
cp frontend/.env.example frontend/.env.local
# Modifica frontend/.env.local con le tue configurazioni

# Backend
cp backend/.env.example backend/.env
# Modifica backend/.env con le tue configurazioni
# I file `.env.example` contengono tutte le variabili necessarie
# riportate nei README (ad es. `NEXT_PUBLIC_FIREBASE_API_KEY`, `SUPABASE_URL`).
```

### 5. Testa il Setup

```bash
# Avvia entrambi i servizi
npm run dev

# Oppure separatamente:
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:8000
```

## 📋 Scripts Disponibili

- `npm run dev` - Avvia frontend e backend insieme
- `npm run dev:frontend` - Solo frontend
- `npm run dev:backend` - Solo backend  
- `npm run build` - Build di produzione
- `npm run test` - Esegue tutti i test
- `npm run lint` - Linting del codice
- `npm run clean` - Pulisce cache e build

## 🔧 Configurazione Deployment

### Frontend (Vercel)
- Il frontend è già configurato per Vercel
- File `vercel.json` presente in `/frontend`
- Collega il repository GitHub a Vercel

### Backend (Railway/Heroku)
- Configurazione Python pronta
- File `requirements.txt` presente
- Configura le variabili d'ambiente sul servizio scelto

## ⚠️ Note Importanti

1. **Sicurezza**: Non committare mai file `.env` con credenziali reali
2. **Dipendenze**: Assicurati di avere Node.js 18+ e Python 3.9+
3. **Database**: Configura il database prima di avviare il backend
4. **CORS**: Il backend deve essere configurato per accettare richieste dal frontend

## 🆘 Risoluzione Problemi

### Errore "concurrently not found"
```bash
npm install concurrently --save-dev
```

### Errore dipendenze Python
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

### Errore porta già in uso
```bash
# Cambia porta in package.json o termina processo esistente
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
```

## 📞 Supporto

Per problemi o domande:
- Email: info@solcraftl2.com
- Repository: https://github.com/Solcraftl2/solcraft-poker

---

**Repository creato con successo! 🎉**

