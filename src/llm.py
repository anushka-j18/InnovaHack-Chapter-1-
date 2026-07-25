import os
from langchain_google_genai import ChatGoogleGenerativeAI

if not os.getenv("GEMINI_API_KEY"):
    raise EnvironmentError(
        "GEMINI_API_KEY not set. Add it to your .env file before running the pipeline."
    )

# NOTE: verify this model id in Google AI Studio before the demo — Google
# renames/retires Gemini Flash versions fairly often (this is the current
# Flash-tier model as of July 2026).
llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.2,
)
