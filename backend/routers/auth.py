"""
Auth Router — Supabase-based authentication.
Google OAuth + magic link. JWT returned for API calls.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_ANON_KEY"])


class MagicLinkRequest(BaseModel):
    email: EmailStr


class TokenRequest(BaseModel):
    access_token: str
    refresh_token: str


@router.post("/magic-link")
async def send_magic_link(body: MagicLinkRequest):
    """Send magic link to email for passwordless login."""
    try:
        supabase.auth.sign_in_with_otp({"email": body.email})
        return {"message": "Magic link sent", "email": body.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify")
async def verify_token(body: TokenRequest):
    """Verify token from magic link / OAuth callback."""
    try:
        session = supabase.auth.set_session(body.access_token, body.refresh_token)
        return {
            "user": session.user,
            "access_token": body.access_token,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/refresh")
async def refresh_token(body: TokenRequest):
    """Refresh expired access token."""
    try:
        session = supabase.auth.refresh_session(body.refresh_token)
        return {
            "access_token": session.session.access_token,
            "refresh_token": session.session.refresh_token,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token refresh failed")


@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT."""
    if not credentials:
        return {"user": None}
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return {"user": user.user}
    except Exception:
        return {"user": None}
