from typing import List, Dict
import re

# Expanded list of fallback phrases and key indicators
ESCALATION_TRIGGER_PHRASES = [
    "i'm unable to answer",
    "i don't know",
    "please contact support",
    "escalate",
    "sorry, i cannot assist with that",
    "not sure",
    "could you please clarify",
    "unable to help",
    "can't help",
    "try to help",
    "Clarify or Rephrase Your Question:"
    "do not have that information",
    "i'm here to assist specifically with questions related to our company and services",
    "i'm here to assist specifically with questions related to our company and services. for other topics, i can try to help, but my expertise is limited to company-related info",
    "please clarify or ask about our company or products",
]

ESCALATION_TRIGGER_PATTERNS = [
    re.compile(pattern, re.IGNORECASE) for pattern in ESCALATION_TRIGGER_PHRASES
]

# Summary prompt template with placeholder for full conversation text
SUMMARY_PROMPT_TEMPLATE = (
    "Please provide a concise and clear summary of the following customer support conversation:\n"
    "{conversation}"
)

# Next actions prompt template requesting 3 actionable suggestions based on response
NEXT_ACTIONS_PROMPT_TEMPLATE = (
    "You are a helpful assistant representing Unthinkable Company. "
    "Based on the following support response, suggest 3 helpful and relevant next actions or recommendations for the customer "
    "that align with Unthinkable Company's tone, policies, and services (dont mention this while responding):\n"
    
    "{response}"
)

def is_unsatisfactory(response_text: str) -> bool:
    """
    Checks if the AI response contains phrases that trigger escalation.
    Uses regex patterns for case-insensitive, partial matching.
    """
    # Check each pattern for match
    for pattern in ESCALATION_TRIGGER_PATTERNS:
        if pattern.search(response_text):
            return True

    # Optional: Log un-matched fallback parts to refine trigger list
    lowered = response_text.lower()
    fallback_indicators = ["sorry", "unable to help", "expertise is limited", "please clarify"]
    if any(indicator in lowered for indicator in fallback_indicators):
        # Log or print for debugging
        print(f"Potential fallback fallback response not matched for escalation: {response_text}")

    return False

def build_conversational_prompt(user_query: str, conversation_history: List[str]) -> List[Dict]:
    """
    Constructs the messages list for OpenAI or Gemini calls with proper roles and context.
    """
    messages = [
        {"role": "system", "content": "You are an AI customer support agent. Provide clear, concise, and relevant answers."}
    ]

    # Add conversation history
    for i in range(0, len(conversation_history), 2):
        user_msg = conversation_history[i]
        if i + 1 < len(conversation_history):
            bot_msg = conversation_history[i + 1]
            messages.append({"role": "user", "content": user_msg})
            messages.append({"role": "assistant", "content": bot_msg})
        else:
            # Last message without reply
            messages.append({"role": "user", "content": user_msg})

    # Add the latest user query
    messages.append({"role": "user", "content": user_query})
    return messages

def build_summary_prompt(conversation: str) -> str:
    """
    Formats the summary prompt with the full conversation.
    """
    return SUMMARY_PROMPT_TEMPLATE.format(conversation=conversation)

def build_next_actions_prompt(response: str) -> str:
    """
    Formats the next actions prompt based on latest response.
    """
    return NEXT_ACTIONS_PROMPT_TEMPLATE.format(response=response)
