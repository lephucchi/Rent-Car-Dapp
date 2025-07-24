from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Car Rental DApp API"
    VERSION: str = "1.0.0"
    
    # Environment
    NODE_ENV: str = "development"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
    # Frontend URL
    WEB_URL: str = "http://localhost:5173"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database Settings
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    DATABASE_URL: str

    # JWT Settings
    JWT_SECRET_KEY: str
    SECRET_KEY: str  # Alias for JWT_SECRET_KEY
    JWT_ALGORITHM: str = "HS256"
    ALGORITHM: str = "HS256"  # Alias for JWT_ALGORITHM
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Blockchain Settings
    WEB3_PROVIDER_URL: str = "http://localhost:8545"
    BLOCKCHAIN_RPC_URL: str = "http://localhost:8545"  # Alias for WEB3_PROVIDER_URL
    HARDHAT_NETWORK_ID: int = 31337
    CONTRACT_ADDRESS: Optional[str] = None

    # Logging
    LOG_LEVEL: str = "INFO"
    
    @validator("SECRET_KEY", pre=True, always=True)
    def set_secret_key(cls, v, values):
        if v:
            return v
        return values.get("JWT_SECRET_KEY")
    
    @validator("BLOCKCHAIN_RPC_URL", pre=True, always=True)
    def set_blockchain_rpc_url(cls, v, values):
        if v and v != "http://localhost:8545":
            return v
        return values.get("WEB3_PROVIDER_URL", "http://localhost:8545")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
