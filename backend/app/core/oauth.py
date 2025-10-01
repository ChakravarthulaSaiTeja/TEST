"""
OAuth configuration for Google and GitHub authentication
"""

from app.core.config import settings

# OAuth providers configuration
OAUTH_PROVIDERS = {
    "google": {
        "name": "Google",
        "client_id": settings.GOOGLE_CLIENT_ID,
        "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "userinfo_url": "https://www.googleapis.com/oauth2/v2/userinfo",
        "scope": "openid email profile",
    },
    "github": {
        "name": "GitHub",
        "client_id": settings.GITHUB_CLIENT_ID,
        "authorize_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "userinfo_url": "https://api.github.com/user",
        "scope": "user:email",
    },
}
