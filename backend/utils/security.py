import os
import re
from typing import Optional

import requests

EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]{3,30}$")

MAX_CHAT_MESSAGE_LENGTH = 2000
MAX_AUDIO_BYTES = 10 * 1024 * 1024
MAX_TTS_TEXT_LENGTH = 5000


def is_production() -> bool:
    return os.environ.get("FLASK_ENV", "").lower() == "production"


def safe_error_message() -> str:
    return "An internal error occurred. Please try again later."


def validate_email(email: str) -> bool:
    return bool(email and EMAIL_PATTERN.match(email.strip()))


def validate_username(username: str) -> bool:
    return bool(username and USERNAME_PATTERN.match(username.strip()))


def validate_rating(rating) -> Optional[int]:
    try:
        value = int(rating)
    except (TypeError, ValueError):
        return None
    if 1 <= value <= 10:
        return value
    return None


def validate_chat_message(message: str) -> Optional[str]:
    if not message or not message.strip():
        return None
    trimmed = message.strip()
    if len(trimmed) > MAX_CHAT_MESSAGE_LENGTH:
        return None
    return trimmed


def verify_recaptcha(token: Optional[str]) -> bool:
    secret = os.environ.get("RECAPTCHA_PRIVATE_KEY")
    if not secret:
        return True

    if not token:
        return False

    verify_url = os.environ.get(
        "VERIFY_URL", "https://www.google.com/recaptcha/api/siteverify"
    )
    try:
        response = requests.post(
            verify_url,
            data={"secret": secret, "response": token},
            timeout=10,
        )
        response.raise_for_status()
        return response.json().get("success", False)
    except requests.RequestException:
        return False
