import secrets

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    database_url: str = "sqlite:///./overhang.db"
    secret_key: str = ""
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    environment: str = "development"
    allowed_origins: str = (
        "http://localhost:8000,http://127.0.0.1:8000,http://localhost:3000"
    )
    _cached_secret_key: str | None = None

    def get_allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    def get_secret_key(self) -> str:
        if self._cached_secret_key:
            return self._cached_secret_key

        if not self.secret_key and self.environment == "development":
            self._cached_secret_key = secrets.token_urlsafe(32)
            return self._cached_secret_key
        if not self.secret_key:
            raise ValueError("SECRET_KEY must be set in production environment")
        return self.secret_key

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
