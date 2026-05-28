from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uvicorn

from . import config, database, routers
from .services.auth_service import create_access_token, get_current_user

app = FastAPI(title="Brain–AI Hybrid Interface Simulator", version="0.1.0")

from sqlmodel import SQLModel

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(database.engine)

# CORS setup (allow frontend origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(routers.auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(routers.eeg.router, prefix="/api/eeg", tags=["eeg"])
app.include_router(routers.prediction.router, prefix="/api/predict", tags=["prediction"])
app.include_router(routers.analytics.router, prefix="/api/analytics", tags=["analytics"])

# WebSocket endpoint for live EEG streaming
from .routers.websocket import router as ws_router
app.include_router(ws_router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Brain–AI Hybrid Interface Simulator is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
