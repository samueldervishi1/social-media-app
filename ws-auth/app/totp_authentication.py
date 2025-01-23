import logging
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import pyotp
import qrcode
import io
import base64
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class TOTPAuthenticator:
    def __init__(self, db_url: str, db_name: str):
        self.client = MongoClient(db_url)
        self.db = self.client[db_name]
        self.collection = self.db["totp_secrets"]

    def generate_secret(self, user_id: str) -> str:
        logger.info(f"Generating TOTP secret for user_id: {user_id}")
        secret = pyotp.random_base32()
        try:
            self.collection.insert_one({"user_id": user_id, "secret": secret})
            logger.info(f"TOTP secret successfully created for user_id: {user_id}")
        except DuplicateKeyError:
            logger.warning(f"Duplicate key for user_id: {user_id}. Updating secret.")
            self.collection.update_one({"user_id": user_id}, {"$set": {"secret": secret}})
        return secret

    def generate_qr_code(self, user_id: str) -> str:
        logger.info(f"Generating QR code for user_id: {user_id}")
        secret = self._get_secret_from_db(user_id)
        if not secret:
            logger.error(f"TOTP secret not found for user_id: {user_id}")
            raise ValueError("TOTP secret not found for the user.")

        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(name=f"user-{user_id}", issuer_name="MyApp")

        qr = qrcode.QRCode(box_size=10, border=4)
        qr.add_data(uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()

        logger.info(f"QR code successfully generated for user_id: {user_id}")
        return qr_code_base64

    def verify_code(self, user_id: str, code: str) -> bool:
        logger.info(f"Verifying code for user_id: {user_id}")
        secret = self._get_secret_from_db(user_id)
        if not secret:
            logger.error(f"TOTP secret not found for user_id: {user_id}")
            raise ValueError("TOTP secret not found for the user.")

        totp = pyotp.TOTP(secret)
        result = totp.verify(code)
        logger.info(f"Verification result for user_id {user_id}: {result}")
        return result

    def _get_secret_from_db(self, user_id: str) -> Any | None:
        logger.info(f"Retrieving TOTP secret from database for user_id: {user_id}")
        user = self.collection.find_one({"user_id": user_id})
        if user:
            logger.info(f"TOTP secret retrieved for user_id: {user_id}")
            return user["secret"]
        logger.warning(f"No TOTP secret found for user_id: {user_id}")
        return None