import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Fetch system prompt with a default fallback
SYSTEM_PROMPT = os.getenv("SYSTEM_PROMPT", "").strip()

# Ensure SYSTEM_PROMPT is not empty
if not SYSTEM_PROMPT:
    raise ValueError("SYSTEM_PROMPT is not set in the .env file.")

# Define formatted system prompt
system_prompt = f"{SYSTEM_PROMPT} CONTEXT: {{context}} LANGUAGE: {{language}}"

