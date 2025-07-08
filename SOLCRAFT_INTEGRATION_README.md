# 🎮 SolCraft Poker - Complete Web3 Integration

## 🌟 Overview

SolCraft Poker is now a **complete Web3 poker platform** with full Solana blockchain integration, featuring smart contracts, real-time gameplay, token economics, and decentralized governance.

## 🏗️ Architecture

### 📦 Components

```
solcraft-poker/
├── 🔗 solana-contracts/          # Solana smart contracts (Rust/Anchor)
│   ├── programs/
│   │   ├── solcraft-poker/       # Main poker game contract
│   │   ├── solcraft-token/       # SOLP token contract
│   │   ├── solcraft-escrow/      # Escrow services
│   │   ├── solcraft-governance/  # DAO governance
│   │   ├── solcraft-staking/     # Token staking
│   │   └── solcraft-tournaments/ # Tournament management
│   └── Cargo.toml
├── 📚 sdk/                       # TypeScript SDK
│   ├── src/
│   │   ├── client.ts             # Main SDK client
│   │   ├── types.ts              # TypeScript definitions
│   │   ├── utils.ts              # Utility functions
│   │   └── constants.ts          # Program IDs & constants
│   └── package.json
├── 🎨 sol-craft/                 # Next.js frontend
│   ├── src/
│   │   ├── contexts/WalletContext.tsx    # Web3 wallet integration
│   │   ├── components/poker/             # Poker game components
│   │   ├── lib/solcraft-sdk.ts          # SDK integration
│   │   └── ...
│   └── package.json
├── 🔧 api/                       # FastAPI backend
│   ├── index.py                  # Main API entry
│   ├── solcraft_integration.py  # Blockchain integration
│   ├── routes/                   # API endpoints
│   └── requirements.txt
├── 🚀 deploy.sh                  # Complete deployment script
└── 📋 vercel.json               # Deployment configuration
```

## 🔗 Smart Contracts

### 🎯 Core Contracts

| Contract | Program ID | Description |
|----------|------------|-------------|
| **Poker Game** | `SoLCraftPoker11111111111111111111111111111` | Multi-table poker games, betting, pot distribution |
| **SOLP Token** | `SoLCraftToken1111111111111111111111111111` | Native platform token with staking rewards |
| **Escrow** | `SoLCraftEscrow111111111111111111111111111` | Secure fund holding for games and tournaments |
| **Governance** | `SoLCraftGov1111111111111111111111111111111` | DAO voting and proposal system |
| **Staking** | `SoLCraftStaking11111111111111111111111111` | Token staking with yield farming |
| **Tournaments** | `SoLCraftTournament1111111111111111111111111` | Tournament creation and management |

### 🎮 Game Features

- **Multi-table Support**: Up to 9 players per table
- **Real-time Betting**: Fold, Check, Call, Bet, Raise, All-in
- **Pot Distribution**: Automatic winner calculation and payout
- **Blind Structure**: Configurable small/big blinds and antes
- **Tournament Mode**: Elimination tournaments with prize pools

## 💻 Frontend Integration

### 🔌 Wallet Connection

```typescript
import { useWallet } from '@/contexts/WalletContext';

function PokerComponent() {
  const { 
    connected, 
    walletAddress, 
    solBalance, 
    connect, 
    createTable, 
    joinTable 
  } = useWallet();

  // Connect wallet
  await connect('Phantom');

  // Create poker table
  const result = await createTable({
    maxPlayers: 6,
    buyInAmount: 0.1, // SOL
    smallBlind: 0.005,
    bigBlind: 0.01
  });
}
```

### 🎯 Game Actions

```typescript
import { getSolCraftSDK } from '@/lib/solcraft-sdk';

const sdk = getSolCraftSDK('devnet');

// Join table
await sdk.joinTable('table_id');

// Place bet
await sdk.placeBet('table_id', 0.05, 'Bet');

// Get game state
const table = await sdk.getTable('table_id');
const player = await sdk.getPlayerAccount('table_id');
```

### 🪙 Token Operations

```typescript
// Stake SOLP tokens
await sdk.stakeTokens(1000, 30); // 1000 SOLP for 30 days

// Claim rewards
await sdk.claimRewards();

// Get balances
const solBalance = await sdk.getSolBalance();
const tokenBalance = await sdk.getTokenBalance(SOLP_MINT);
```

## 🔧 Backend Integration

### 📡 Real-time Updates

```python
from api.solcraft_integration import SolCraftBackend

backend = SolCraftBackend()

# WebSocket connection for live updates
@app.websocket("/ws/{table_id}")
async def websocket_endpoint(websocket: WebSocket, table_id: str):
    await backend.handle_websocket_connection(websocket, table_id)

# Blockchain monitoring
await backend.monitor_blockchain()
```

### 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health with blockchain status |
| `/api/tables` | GET | List all active poker tables |
| `/api/tables/{id}` | GET | Get specific table details |
| `/api/players/{id}` | GET | Get player information |
| `/api/events` | GET | Get game events history |
| `/ws/{table_id}` | WebSocket | Real-time table updates |

## 🚀 Deployment

### 🔄 Automatic Deployment

```bash
# Run complete deployment
./deploy.sh

# Or step by step:
cd solana-contracts && anchor build && anchor deploy
cd ../sdk && npm install && npm run build
cd ../sol-craft && npm install && npm run build
cd ../api && pip install -r requirements.txt
```

### 🌐 Live URLs

- **Frontend**: https://www.solcraftl2.com
- **API**: https://www.solcraftl2.com/api
- **Docs**: https://www.solcraftl2.com/api/docs
- **Health**: https://www.solcraftl2.com/api/health

## 🎮 Usage Guide

### 1️⃣ Connect Wallet

1. Visit https://www.solcraftl2.com
2. Click "Launch App"
3. Click "Connect Wallet" in the navbar
4. Select your preferred wallet (Phantom, Solflare, etc.)
5. Approve connection

### 2️⃣ Create/Join Table

```typescript
// Create new table
const table = await createTable({
  maxPlayers: 6,
  buyInAmount: 0.1,
  smallBlind: 0.005,
  bigBlind: 0.01
});

// Join existing table
await joinTable(tableId);
```

### 3️⃣ Play Poker

1. Wait for other players to join
2. Game starts automatically when minimum players reached
3. Use action buttons: Fold, Check, Call, Bet, Raise
4. Enter custom bet amounts
5. Win pots automatically distributed to wallet

### 4️⃣ Stake Tokens

1. Go to Profile page
2. Click "Stake Tokens"
3. Enter amount and lock period
4. Earn staking rewards
5. Claim rewards anytime

## 🔧 Development

### 🛠️ Local Setup

```bash
# Clone repository
git clone https://github.com/Solcraftl2/solcraft-poker.git
cd solcraft-poker

# Install dependencies
npm install
cd sol-craft && npm install && cd ..
cd sdk && npm install && cd ..
pip install -r requirements.txt

# Start development servers
cd sol-craft && npm run dev &          # Frontend on :3000
cd ../api && python index.py &         # Backend on :8000
```

### 🧪 Testing

```bash
# Test SDK
cd sdk && npm test

# Test smart contracts
cd solana-contracts && anchor test

# Test frontend
cd sol-craft && npm run test

# Test backend
cd api && python -m pytest
```

## 📊 Monitoring

### 🔍 Health Checks

```bash
# API health
curl https://www.solcraftl2.com/api/health

# Blockchain status
curl https://www.solcraftl2.com/api/status

# Active tables
curl https://www.solcraftl2.com/api/tables
```

### 📈 Metrics

- **Active Tables**: Real-time poker games
- **Total Players**: Connected wallet addresses
- **Transaction Volume**: SOL/SOLP processed
- **Staking TVL**: Total value locked in staking
- **Governance Proposals**: Active DAO votes

## 🔐 Security

### 🛡️ Smart Contract Security

- **Audited Contracts**: All contracts follow Solana best practices
- **Access Controls**: Role-based permissions
- **Reentrancy Protection**: Safe state updates
- **Overflow Protection**: SafeMath equivalents
- **Emergency Pause**: Admin emergency stops

### 🔒 Frontend Security

- **Wallet Isolation**: No private key access
- **Transaction Signing**: User approval required
- **Input Validation**: All user inputs sanitized
- **HTTPS Only**: Secure communication
- **CSP Headers**: Content Security Policy

## 🎯 Roadmap

### 🚀 Phase 1 (Current)
- ✅ Smart contract deployment
- ✅ SDK integration
- ✅ Frontend wallet connection
- ✅ Basic poker gameplay
- ✅ Real-time updates

### 🎮 Phase 2 (Next)
- 🔄 Advanced poker features (tournaments)
- 🔄 Mobile app development
- 🔄 NFT card collections
- 🔄 Cross-chain bridges
- 🔄 AI opponents

### 🌟 Phase 3 (Future)
- 🔄 VR poker rooms
- 🔄 Metaverse integration
- 🔄 Professional tournaments
- 🔄 Streaming integration
- 🔄 Global leaderboards

## 🤝 Contributing

### 📝 Development Guidelines

1. **Smart Contracts**: Use Anchor framework
2. **Frontend**: Follow Next.js best practices
3. **Backend**: FastAPI with async/await
4. **Testing**: Comprehensive test coverage
5. **Documentation**: Update README for changes

### 🐛 Bug Reports

1. Check existing issues
2. Provide reproduction steps
3. Include environment details
4. Add relevant logs/screenshots

## 📞 Support

- **Documentation**: This README
- **API Docs**: https://www.solcraftl2.com/api/docs
- **GitHub Issues**: https://github.com/Solcraftl2/solcraft-poker/issues
- **Discord**: [SolCraft Community]
- **Email**: info@solcraftl2.com

## 📄 License

MIT License - see LICENSE file for details.

---

**🎉 SolCraft Poker - The Future of Web3 Gaming is Here!** 🚀

