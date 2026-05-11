from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, GoogleAuthRequest, TokenResponse, UserProfile
from app.schemas.user import UserCreate
from app.services.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_google_token,
    verify_password,
)

router = APIRouter()


@router.post("/google", response_model=TokenResponse)
async def google_auth(data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Authentification via Google OAuth2.
    Reçoit un ID token Google, le vérifie, trouve ou crée l'utilisateur, retourne un JWT.
    """
    user_info = await verify_google_token(data.id_token)
    if user_info is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Google invalide.",
        )

    stmt = select(User).where(User.auth_sub == user_info["sub"])
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        stmt = select(User).where(User.email == user_info["email"])
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

    if user is None:
        user = User(
            id=uuid4(),
            email=user_info["email"],
            display_name=user_info["name"],
            avatar_url=user_info.get("picture"),
            role="learner",
            auth_provider="google",
            auth_sub=user_info["sub"],
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserProfile.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Inscription par email/mot de passe (pour les tests, pas l'auth principale).
    """
    stmt = select(User).where(User.email == data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte avec cet email existe déjà.",
        )

    user = User(
        id=uuid4(),
        email=data.email,
        display_name=data.display_name,
        role="learner",
        auth_provider="email",
        auth_sub=data.email,
        is_active=True,
    )
    user.password_hash = get_password_hash(data.password)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserProfile.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Connexion par email/mot de passe (pour les tests).
    """
    stmt = select(User).where(User.email == data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None or not verify_password(data.password, user.password_hash or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé.",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserProfile.model_validate(user),
    )


@router.get("/me", response_model=UserProfile)
async def get_profile(
    current_user: User = Depends(get_current_user),
):
    """Récupère le profil de l'utilisateur connecté."""
    return UserProfile.model_validate(current_user)
