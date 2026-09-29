import json

import httpx
from google import genai
from google.genai import errors, types

from app.config import GEMINI_API_KEY, LLM_MODEL


class LLMError(Exception):
    """Raised with an HTTP status code the route can return to the frontend."""

    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message


SYSTEM_PROMPT = (
    "You break a to-do task into small, concrete subtasks. "
    'Reply with ONLY a JSON object of the form {"subtasks": ["...", "..."]} '
    "containing 3 to 5 short subtasks, each under 12 words. No other text."
)


def generate_subtasks(title: str, description: str) -> list[str]:
    if not GEMINI_API_KEY:
        raise LLMError(503, "AI feature is not configured on the server.")

    # timeout is in milliseconds for this SDK: 20 seconds
    client = genai.Client(api_key=GEMINI_API_KEY, http_options=types.HttpOptions(timeout=20_000))
    try:
        response = client.models.generate_content(
            model=LLM_MODEL,
            contents=f"Task: {title}\nDetails: {description or 'none'}",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",  # asks Gemini for JSON only
            ),
        )
    except httpx.TimeoutException:
        raise LLMError(504, "The AI service took too long to respond. Please try again.")
    except httpx.TransportError:
        raise LLMError(502, "Could not reach the AI service.")
    except errors.ClientError as e:  # 4xx from Gemini
        if e.code == 429:
            raise LLMError(429, "The AI service is busy right now. Please wait a moment and retry.")
        raise LLMError(502, f"The AI service rejected the request ({e.code}).")
    except errors.APIError as e:  # 5xx and anything else from Gemini
        raise LLMError(502, f"The AI service returned an error ({e.code}).")

    return parse_subtasks(response.text or "")


def parse_subtasks(text: str) -> list[str]:
    """Pull the JSON object out of the model's reply and validate it."""
    start, end = text.find("{"), text.rfind("}")
    try:
        data = json.loads(text[start : end + 1])
        items = [str(s).strip() for s in data["subtasks"] if str(s).strip()]
    except (ValueError, KeyError, TypeError):
        raise LLMError(502, "The AI returned an unexpected format. Please try again.")
    if not 3 <= len(items) <= 5:
        items = items[:5]
        if len(items) < 3:
            raise LLMError(502, "The AI returned too few subtasks. Please try again.")
    return items
