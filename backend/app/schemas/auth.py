from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class GoogleAuthRequest(BaseModel):
    id_token: str


class UserProfile(BaseModel):
    id: str
    email: str
    display_name: str
    avatar_url: str | None = None
    role: str

    model_config = {"from_attributes": True}
