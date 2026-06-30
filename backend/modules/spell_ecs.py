import os

import requests

SPELL_ECS_URL = os.environ.get("SPELL_ECS_URL", "http://spell-ecs:8082")
DECOMPOSE_TIMEOUT_SECONDS = int(os.environ.get("SPELL_ECS_TIMEOUT", "300"))


def decompose_spell(spell_idea: str) -> dict:
    if not spell_idea or not spell_idea.strip():
        raise ValueError("spell_idea is required")

    response = requests.post(
        f"{SPELL_ECS_URL.rstrip('/')}/api/decompose/",
        json={"spell_idea": spell_idea.strip()},
        timeout=DECOMPOSE_TIMEOUT_SECONDS,
    )

    try:
        payload = response.json()
    except ValueError as exc:
        raise RuntimeError("Spell ECS service returned invalid JSON") from exc

    if response.status_code >= 400:
        error_message = payload.get("error", "Spell ECS service error")
        raise RuntimeError(error_message)

    return payload
