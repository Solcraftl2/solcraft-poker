# main.py
# Entry point per l'applicazione FastAPI di SolCraft L2

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from dotenv import load_dotenv

# Carica variabili ambiente
load_dotenv()

# Importa i router
from api.routers.tournaments import router as tournaments_router
from api.routers.players import router as players_router
from api.routers.fees import router as fees_router
from api.routers.guarantees import router as guarantees_router
from api.config.database import db_config

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inizializza FastAPI
app = FastAPI(
    title="SolCraft L2 API",
    description="API per la piattaforma di tokenizzazione dei tornei SolCraft L2",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurazione CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione, specificare domini specifici
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra i router
app.include_router(tournaments_router, prefix="/api")
app.include_router(players_router, prefix="/api")
app.include_router(fees_router, prefix="/api")
app.include_router(guarantees_router, prefix="/api")

@app.get("/")
async def root():
    """Endpoint di salute dell'API."""
    return {
        "message": "SolCraft L2 API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Controllo di salute dell'API e del database."""
    try:
        # Test connessione database
        db_healthy = db_config.test_connection()
        
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "database": "connected" if db_healthy else "disconnected",
            "api": "running"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Health check failed")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Gestore globale delle eccezioni."""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting SolCraft L2 API on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )

