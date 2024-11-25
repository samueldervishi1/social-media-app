import pyotp
import qrcode
import io
import base64
from typing import Dict, Any
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError


class TOTPAuthenticator:
    def __init__(self, db_url: str, db_name: str):
        self.client = MongoClient(db_url)
        self.db = self.client[db_name]
        self.collection = self.db["totp_secrets"]

    def generate_secret(self, user_id: str) -> str:
        """
        Generate a TOTP secret for a user and store it in MongoDB.
        """
        secret = pyotp.random_base32()
        try:
            self.collection.insert_one({"user_id": user_id, "secret": secret})
        except DuplicateKeyError:
            self.collection.update_one({"user_id": user_id}, {"$set": {"secret": secret}})
        return secret

    def generate_qr_code(self, user_id: str) -> str:
        """
        Generate a QR code with a TOTP URI for the user and return it as a Base64 string.
        """
        secret = self._get_secret_from_db(user_id)
        if not secret:
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

        return qr_code_base64

    def verify_code(self, user_id: str, code: str) -> bool:
        """
        Verify a TOTP code for the given user by checking the secret stored in MongoDB.
        """
        secret = self._get_secret_from_db(user_id)
        if not secret:
            raise ValueError("TOTP secret not found for the user.")

        totp = pyotp.TOTP(secret)
        return totp.verify(code)

    def _get_secret_from_db(self, user_id: str) -> Any | None:
        """
        Retrieve the TOTP secret for a user from MongoDB.
        """
        user = self.collection.find_one({"user_id": user_id})
        if user:
            return user["secret"]
        return None
