from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import httpx
import secrets
import logging

from app.core.database import get_db
from app.core.config import settings
from app.core.oauth import OAUTH_PROVIDERS
from app.models.user import User
from app.schemas.oauth import (
    OAuthProvider,
    OAuthUserInfo,
    OAuthCallbackRequest,
    OAuthCallbackResponse,
    OAuthAuthorizeResponse,
)
from app.api.v1.endpoints.auth import create_access_token, get_password_hash
from app.schemas.user import UserResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# Store OAuth states temporarily (in production, use Redis)
oauth_states = {}


async def get_oauth_user_info(
    provider: OAuthProvider, access_token: str
) -> OAuthUserInfo:
    """Get user information from OAuth provider"""
    provider_config = OAUTH_PROVIDERS[provider.value]

    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {access_token}"}

        if provider == OAuthProvider.GOOGLE:
            response = await client.get(
                provider_config["userinfo_url"], headers=headers
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400, detail="Failed to get Google user info"
                )

            data = response.json()
            return OAuthUserInfo(
                id=data["id"],
                email=data["email"],
                name=data.get("name"),
                username=data.get("email").split("@")[
                    0
                ],  # Use email prefix as username
                avatar_url=data.get("picture"),
                provider=provider,
            )

        elif provider == OAuthProvider.GITHUB:
            response = await client.get(
                provider_config["userinfo_url"], headers=headers
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400, detail="Failed to get GitHub user info"
                )

            data = response.json()

            # Get email from GitHub (might need separate API call)
            email_response = await client.get(
                "https://api.github.com/user/emails", headers=headers
            )
            email = data.get("email")
            if not email and email_response.status_code == 200:
                emails = email_response.json()
                primary_email = next((e for e in emails if e.get("primary")), None)
                if primary_email:
                    email = primary_email["email"]

            return OAuthUserInfo(
                id=str(data["id"]),
                email=email or f"{data['login']}@github.local",  # Fallback email
                name=data.get("name") or data.get("login"),
                username=data["login"],
                avatar_url=data.get("avatar_url"),
                provider=provider,
            )


async def get_or_create_oauth_user(oauth_user: OAuthUserInfo, db: Session) -> User:
    """Get existing user or create new user from OAuth info"""
    # Try to find existing user by email
    user = db.query(User).filter(User.email == oauth_user.email).first()

    if user:
        # Update OAuth info if needed
        if not user.avatar_url and oauth_user.avatar_url:
            user.avatar_url = oauth_user.avatar_url
        db.commit()
        return user

    # Create new user
    # Generate a random password since OAuth users don't have passwords
    random_password = secrets.token_urlsafe(32)

    new_user = User(
        email=oauth_user.email,
        username=oauth_user.username or oauth_user.email.split("@")[0],
        full_name=oauth_user.name,
        hashed_password=get_password_hash(random_password),
        is_active=True,
        is_verified=True,  # OAuth users are considered verified
        avatar_url=oauth_user.avatar_url,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"Created new OAuth user: {oauth_user.email} via {oauth_user.provider}")
    return new_user


@router.get("/authorize/{provider}", response_model=OAuthAuthorizeResponse)
async def authorize_oauth(provider: OAuthProvider):
    """Get OAuth authorization URL"""
    if provider.value not in OAUTH_PROVIDERS:
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")

    provider_config = OAUTH_PROVIDERS[provider.value]

    # Generate state parameter for security
    state = secrets.token_urlsafe(32)
    oauth_states[state] = {"provider": provider.value, "timestamp": datetime.utcnow()}

    # Build authorization URL
    params = {
        "client_id": provider_config["client_id"],
        "redirect_uri": f"{settings.ALLOWED_ORIGINS[0]}/auth/callback/{provider.value}",
        "scope": provider_config["scope"],
        "state": state,
        "response_type": "code",
    }

    if provider == OAuthProvider.GOOGLE:
        params["access_type"] = "offline"
        params["prompt"] = "consent"

    # Build query string
    query_params = "&".join([f"{k}={v}" for k, v in params.items()])
    authorize_url = f"{provider_config['authorize_url']}?{query_params}"

    return OAuthAuthorizeResponse(authorize_url=authorize_url, state=state)


@router.post("/callback/{provider}", response_model=OAuthCallbackResponse)
async def oauth_callback(
    provider: OAuthProvider, request: Request, db: Session = Depends(get_db)
):
    """Handle OAuth callback"""
    try:
        # Get query parameters
        code = request.query_params.get("code")
        state = request.query_params.get("state")
        error = request.query_params.get("error")

        if error:
            raise HTTPException(status_code=400, detail=f"OAuth error: {error}")

        if not code or not state:
            raise HTTPException(
                status_code=400, detail="Missing code or state parameter"
            )

        # Verify state parameter
        if state not in oauth_states:
            raise HTTPException(status_code=400, detail="Invalid state parameter")

        stored_state = oauth_states[state]
        if stored_state["provider"] != provider.value:
            raise HTTPException(status_code=400, detail="State provider mismatch")

        # Clean up state
        del oauth_states[state]

        # Exchange code for access token
        provider_config = OAUTH_PROVIDERS[provider.value]

        token_data = {
            "client_id": provider_config["client_id"],
            "client_secret": provider_config["client_secret"],
            "code": code,
            "redirect_uri": f"{settings.ALLOWED_ORIGINS[0]}/auth/callback/{provider.value}",
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                provider_config["token_url"],
                data=token_data,
                headers={"Accept": "application/json"},
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=400, detail="Failed to exchange code for token"
                )

            token_response = response.json()
            access_token = token_response.get("access_token")

            if not access_token:
                raise HTTPException(status_code=400, detail="No access token received")

        # Get user info from OAuth provider
        oauth_user = await get_oauth_user_info(provider, access_token)

        # Get or create user in our database
        user = await get_or_create_oauth_user(oauth_user, db)

        # Create JWT token for our application
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        return OAuthCallbackResponse(
            success=True,
            message=f"Successfully authenticated with {provider.value.title()}",
            access_token=jwt_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                full_name=user.full_name,
                is_active=user.is_active,
                created_at=user.created_at,
            ).dict(),
        )

    except Exception as e:
        logger.error(f"OAuth callback error: {str(e)}")
        raise HTTPException(status_code=500, detail="OAuth authentication failed")


@router.get("/providers")
async def get_oauth_providers():
    """Get available OAuth providers"""
    return {
        "providers": [
            {
                "name": provider["name"],
                "provider": provider_name,
                "enabled": bool(
                    (provider_name == "google" and settings.GOOGLE_CLIENT_ID)
                    or (provider_name == "github" and settings.GITHUB_CLIENT_ID)
                ),
            }
            for provider_name, provider in OAUTH_PROVIDERS.items()
        ]
    }


@router.get("/")
async def oauth_root():
    return {"message": "OAuth authentication endpoints available"}
