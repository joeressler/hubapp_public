import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "spell-ecs-dev-only-change-in-production")

DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")
    if host.strip()
]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "decomposer",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES: list[dict] = []

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

GRANITE_MODEL_REPO = os.environ.get(
    "GRANITE_MODEL_REPO", "ibm-granite/granite-4.1-3b-GGUF"
)
GRANITE_MODEL_FILE = os.environ.get("GRANITE_MODEL_FILE", "*Q4_K_M.gguf")
GRANITE_MODEL_PATH = os.environ.get("GRANITE_MODEL_PATH", "")
GRANITE_N_CTX = int(os.environ.get("GRANITE_N_CTX", "4096"))
GRANITE_N_GPU_LAYERS = int(os.environ.get("GRANITE_N_GPU_LAYERS", "0"))
GRANITE_MAX_TOKENS = int(os.environ.get("GRANITE_MAX_TOKENS", "1024"))
GRANITE_N_THREADS = int(os.environ.get("GRANITE_N_THREADS", "4"))

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "[%(asctime)s] %(levelname)s %(name)s: %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": os.environ.get("LOG_LEVEL", "INFO"),
    },
}
