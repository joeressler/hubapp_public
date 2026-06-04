import logging
import time
from urllib.parse import urlencode

import httpx

logger = logging.getLogger(__name__)

GOOGLE_TTS_URL = "https://translate.google.com/translate_tts"
CHUNK_SIZE = 200


def generate_speech(text: str, output_path: str) -> None:
    """Fetch MP3 audio from Google Translate TTS and write it to output_path."""
    text_runes = list(text)
    audio_chunks: list[bytes] = []

    with httpx.Client(
        headers={
            "User-Agent": "Mozilla/5.0",
            "Referer": "http://translate.google.com/",
        },
        timeout=30.0,
    ) as client:
        for i in range(0, len(text_runes), CHUNK_SIZE):
            chunk = "".join(text_runes[i : i + CHUNK_SIZE])
            params = urlencode(
                {"ie": "UTF-8", "tl": "en", "client": "tw-ob", "q": chunk}
            )
            response = client.get(f"{GOOGLE_TTS_URL}?{params}")
            response.raise_for_status()
            audio_chunks.append(response.content)
            time.sleep(0.1)

    with open(output_path, "wb") as output_file:
        for chunk in audio_chunks:
            output_file.write(chunk)
