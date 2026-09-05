from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLogin, UserMeResponse
from app.utils.auth import create_access_token, verify_password
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == payload.identifier).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
            "role": user.role.value,
        },
    )


@router.get("/me", response_model=UserMeResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user
