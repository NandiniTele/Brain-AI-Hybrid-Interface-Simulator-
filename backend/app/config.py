from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    # Core settings
    project_name: str = "Brain–AI Hybrid Interface Simulator"
    version: str = "0.1.0"
    # Security
    jwt_secret_key: str = Field(default="supersecretjwtkey", env="JWT_SECRET_KEY")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    # CORS
    frontend_origin: str = "http://localhost:5173"
    # Model paths
    model_path: str = "models/decoder.pt"
    # Data sampling
    eeg_sampling_rate: int = 256  # Hz
    eeg_channel_count: int = 8

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
