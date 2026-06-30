import json
import logging
import re
import threading
from typing import Any

from django.conf import settings
from llama_cpp import Llama

from decomposer.services.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)

_model_lock = threading.Lock()
_model: Llama | None = None


def _build_granite_prompt(system_prompt: str, user_prompt: str) -> str:
    return (
        f"<|start_of_role|>system<|end_of_role|>{system_prompt}<|end_of_text|>"
        f"<|start_of_role|>user<|end_of_role|>{user_prompt}<|end_of_text|>"
        f"<|start_of_role|>assistant<|end_of_role|>"
    )


def _load_model() -> Llama:
    global _model

    with _model_lock:
        if _model is not None:
            return _model

        logger.info("Loading Granite 4.1 3B model (this may take a while on first run)")

        llama_kwargs = {
            "n_ctx": settings.GRANITE_N_CTX,
            "n_gpu_layers": settings.GRANITE_N_GPU_LAYERS,
            "n_threads": settings.GRANITE_N_THREADS,
            "verbose": False,
        }

        if settings.GRANITE_MODEL_PATH:
            _model = Llama(model_path=settings.GRANITE_MODEL_PATH, **llama_kwargs)
        else:
            _model = Llama.from_pretrained(
                repo_id=settings.GRANITE_MODEL_REPO,
                filename=settings.GRANITE_MODEL_FILE,
                **llama_kwargs,
            )

        logger.info("Granite model loaded successfully")
        return _model


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        return json.loads(match.group(0))

    raise ValueError("Model response did not contain valid JSON")


def _normalize_ecs_payload(raw: dict[str, Any], spell_idea: str) -> dict[str, Any]:
    entities = raw.get("entities", [])
    components = raw.get("components", [])
    systems = raw.get("systems", [])

    if not isinstance(entities, list) or not isinstance(components, list) or not isinstance(systems, list):
        raise ValueError("ECS payload must contain entities, components, and systems arrays")

    return {
        "spell_idea": spell_idea,
        "entities": entities,
        "components": components,
        "systems": systems,
    }


def decompose_spell(spell_idea: str) -> dict[str, Any]:
    if not spell_idea or not spell_idea.strip():
        raise ValueError("spell_idea is required")

    model = _load_model()
    user_prompt = USER_PROMPT_TEMPLATE.format(spell_idea=spell_idea.strip())
    prompt = _build_granite_prompt(SYSTEM_PROMPT, user_prompt)

    logger.info("Generating ECS decomposition for spell idea: %s", spell_idea[:80])

    response = model(
        prompt,
        max_tokens=settings.GRANITE_MAX_TOKENS,
        temperature=0.2,
        top_p=0.9,
        stop=["<|end_of_text|>", "<|start_of_role|>"],
    )

    completion = response["choices"][0]["text"]
    logger.debug("Raw model output: %s", completion[:500])

    parsed = _extract_json(completion)
    return _normalize_ecs_payload(parsed, spell_idea.strip())


def preload_model() -> None:
    _load_model()
