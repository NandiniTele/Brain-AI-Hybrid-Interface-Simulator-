from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from .. import schemas, models, config, utils
from ..utils.security import verify_password, get_password_hash, create_access_token

router = APIRouter()

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(utils.get_db)):
    stmt = select(models.User).where(models.User.email == user.email)
    if db.exec(stmt).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        created_at=utils.utcnow(),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=utils.timedelta(minutes=config.settings.access_token_expire_minutes),
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(utils.get_db)):
    stmt = select(models.User).where(models.User.email == form.username)
    user = db.exec(stmt).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=utils.timedelta(minutes=config.settings.access_token_expire_minutes),
    )
    return {"access_token": access_token, "token_type": "bearer"}
