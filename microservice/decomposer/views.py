import json
import logging

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from decomposer.services.llm import decompose_spell

logger = logging.getLogger(__name__)


@require_GET
def health(_: HttpRequest) -> JsonResponse:
    return JsonResponse({"status": "healthy", "service": "spell-ecs-decomposer"})


@csrf_exempt
@require_POST
def decompose(request: HttpRequest) -> JsonResponse:
    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    spell_idea = body.get("spell_idea", "")
    if not isinstance(spell_idea, str) or not spell_idea.strip():
        return JsonResponse(
            {"error": "spell_idea is required and must be a non-empty string"},
            status=400,
        )

    try:
        result = decompose_spell(spell_idea)
        return JsonResponse(result)
    except ValueError as exc:
        logger.warning("Validation error during decomposition: %s", exc)
        return JsonResponse({"error": str(exc)}, status=400)
    except Exception as exc:
        logger.exception("Failed to decompose spell idea")
        return JsonResponse(
            {"error": "Failed to decompose spell idea", "detail": str(exc)},
            status=500,
        )
