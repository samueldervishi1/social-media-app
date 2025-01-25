from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from totp_authentication import TOTPAuthenticator
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DB_URL")
DB_NAME = os.getenv("DB_NAME")

router = APIRouter()
authenticator = TOTPAuthenticator(DB_URL, DB_NAME)


class VerifyRequest(BaseModel):
    code: str


@router.get("/totp/generate/{user_id}")
def generate_totp(user_id: str):
    """
    Generate and return a new TOTP QR code for the user.
    """
    secret = authenticator.generate_secret(user_id)
    qr_code_base64 = authenticator.generate_qr_code(user_id)
    return {"secret": secret, "qr_code_base64": qr_code_base64}


@router.post("/totp/verify/{user_id}")
def verify_totp(user_id: str, request: VerifyRequest):
    """
    Verify a TOTP code for the user.
    """
    try:
        is_valid = authenticator.verify_code(user_id, request.code)
        return {"valid": is_valid}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))