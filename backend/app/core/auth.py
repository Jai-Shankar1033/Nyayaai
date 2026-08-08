"""
NyayaAI Auth Dependency
Verifies the caller's Supabase session server-side instead of trusting a
client-supplied `user_id` string.

Every route that previously accepted `user_id` as a Form/Query param taken
at face value was effectively unauthenticated: any caller could pass any
other user's id and read/write/delete their data. This dependency reads the
`Authorization: Bearer <access_token>` header, asks Supabase Auth to
validate it, and returns the authenticated user's id — which routes should
use instead of a client-supplied value.
"""
from __future__ import annotations
from fastapi import Header, HTTPException
from app.core.supabase import get_supabase


async def get_current_user_id(authorization: str | None = Header(default=None)) -> str:
    """FastAPI dependency: validates the bearer token and returns the user id.

    Raises 401 if the header is missing or the token is invalid/expired.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing or malformed Authorization header. Expected 'Bearer <token>'.")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(401, "Missing bearer token.")

    supabase = get_supabase()
    try:
        result = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(401, "Invalid or expired session token.")

    user = getattr(result, "user", None)
    if not user or not getattr(user, "id", None):
        raise HTTPException(401, "Invalid or expired session token.")

    return user.id
