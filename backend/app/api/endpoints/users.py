from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.user import UserResponse
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter()


@router.get("/", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(user) for user in users]
