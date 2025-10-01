from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class OAuthProvider(str, Enum):
    GOOGLE = "google"
    GITHUB = "github"


class OAuthUserInfo(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    provider: OAuthProvider


class OAuthCallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None
    provider: OAuthProvider


class OAuthCallbackResponse(BaseModel):
    success: bool
    message: str
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    user: Optional[dict] = None


class OAuthAuthorizeResponse(BaseModel):
    authorize_url: str
    state: str
