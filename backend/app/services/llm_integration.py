import asyncio
import logging
from typing import List, Union, Tuple
from app.utils.prompts import (
    NEXT_ACTIONS_PROMPT_TEMPLATE,
    SUMMARY_PROMPT_TEMPLATE,
    is_unsatisfactory,
)
from google import genai

logger = logging.getLogger(__name__)

class LLMClient:
    """
    Google Gemini Generative Language API client with retry/backoff, error handling,
    and integration-ready methods for response, summary and next-action generation.
    """

    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash", max_retries: int = 3, retry_delay: float = 2.0):
        print("[LLMClient] Initialized with model:", model_name)
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name
        self.max_retries = max_retries
        self.retry_delay = retry_delay

    def _format_conversation(self, user_query: str, conversation_history: List[Union[str, dict, Tuple[str, str]]]) -> str:
        print("[LLMClient] Formatting conversation")
        parts = []

        if conversation_history:
            for entry in conversation_history:
                if isinstance(entry, dict):
                    role = entry.get('role', 'user')
                    content = entry.get('content', '')
                elif isinstance(entry, (list, tuple)) and len(entry) == 2:
                    role, content = entry
                else:
                    role = 'user'
                    content = str(entry)
                parts.append(f"{role.capitalize()}: {content}")

        parts.append(f"User: {user_query}")

        formatted = "\n".join(parts)
        print("[LLMClient] Formatted prompt:", formatted[:200], "...")
        return formatted

    async def _retry_api_call(self, func, *args, **kwargs):
        print("[LLMClient] Starting API call with retry")
        delay = self.retry_delay
        for attempt in range(1, self.max_retries + 1):
            try:
                print(f"[LLMClient] Attempt {attempt} calling API")
                result = await func(*args, **kwargs)
                print(f"[LLMClient] API call succeeded on attempt {attempt}")
                return result
            except Exception as e:
                logger.error(f"LLM API call failed (attempt {attempt}): {str(e)}")
                print(f"[LLMClient] API call failed (attempt {attempt}): {str(e)}")
                if attempt < self.max_retries:
                    logger.info(f"Retrying after {delay} seconds...")
                    print(f"[LLMClient] Retrying after {delay} seconds...")
                    await asyncio.sleep(delay)
                    delay *= 2
                else:
                    logger.error("Max retries reached for Gemini API call.")
                    print("[LLMClient] Max retries reached. Raising Exception.")
                    raise

    async def generate_response(self, user_query: str, conversation_history: List):
        print("[LLMClient] generate_response called")
        prompt = self._format_conversation(user_query, conversation_history)

        async def call():
            print("[LLMClient] Inside call function to Gemini API")
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            print("[LLMClient] Gemini API call returned")
            return response.text

        try:
            print("Before calling Gemini API")
            response_text = await self._retry_api_call(call)
            print("Received response_text:", repr(response_text))
            logger.info(f"LLM raw response text: {repr(response_text)}")

            if is_unsatisfactory(response_text):
                logger.info("Escalation triggered due to unhelpful response.")
                print("[LLMClient] Escalation detected")
                return {
                    "text": "Your query has been escalated to a human agent for assistance.",
                    "escalated": True,
                }
            print("[LLMClient] No escalation triggered")
            return {
                "text": response_text,
                "escalated": False,
            }

        except Exception as ex:
            logger.exception("Failed to generate response from Gemini.")
            print("[LLMClient] Exception during generate_response:", ex)
            return {
                "text": "Sorry, I'm having trouble processing your request at the moment.",
                "escalated": False,
            }

    async def summarize_session(self, conversation: str) -> str:
        print("[LLMClient] summarize_session called")
        prompt = SUMMARY_PROMPT_TEMPLATE.format(conversation=conversation)

        async def call():
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            return response.text or "No summary available."

        try:
            return await self._retry_api_call(call)
        except Exception:
            logger.exception("Failed to get summary from Gemini.")
            print("[LLMClient] Exception during summarize_session")
            return "Unable to generate summary at this time."

    async def get_suggestions(self, latest_response: str) -> List[str]:
        print("[LLMClient] get_suggestions called")
        prompt = NEXT_ACTIONS_PROMPT_TEMPLATE.format(response=latest_response)

        async def call():
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            raw = response.text or ""
            return [line.strip() for line in raw.split("\n") if line.strip()]

        try:
            return await self._retry_api_call(call)
        except Exception:
            logger.exception("Failed to get next actions from Gemini.")
            print("[LLMClient] Exception during get_suggestions")
            return []
