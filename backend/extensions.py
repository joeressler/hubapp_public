"""Shared Flask extensions initialized in the app factory."""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=['300 per hour'],
    storage_uri='memory://',
)
