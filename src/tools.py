import os
from urllib.parse import urlparse

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# ---- Search grounding ----
# Returns a unified List[{"url": str, "content": str}] regardless of provider,
# so downstream nodes never need to know which backend answered.

if TAVILY_API_KEY:
    from tavily import TavilyClient

    _client = TavilyClient(api_key=TAVILY_API_KEY)

    def web_search(query: str, max_results: int = 3):
        resp = _client.search(query=query, max_results=max_results)
        return [
            {"url": r.get("url", ""), "content": r.get("content", "")}
            for r in resp.get("results", [])
        ]
else:
    from duckduckgo_search import DDGS

    print(
        "⚠️  TAVILY_API_KEY not found — falling back to DuckDuckGo search. "
        "This works but rate-limits more easily during a multi-claim, multi-loop run. "
        "Get a free Tavily key at https://tavily.com and add it to .env for the demo."
    )

    def web_search(query: str, max_results: int = 3):
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        return [
            {"url": r.get("href", ""), "content": r.get("body", "")}
            for r in results
        ]


# ---- Source reliability tiering ----
# Simple, transparent domain heuristic — matches "Source reliability tiering"
# in the briefing doc's win-features list. Extend these lists freely; the
# judges specifically want this to be visible/explainable, not a black box.

RELIABILITY_TIERS = {
    "high": [
        ".gov", ".edu", "who.int", "un.org", "nature.com", "science.org",
        "nih.gov", "ncbi.nlm.nih.gov", "reuters.com", "apnews.com",
    ],
    "medium": [
        "wikipedia.org", "bbc.com", "bbc.co.uk", "npr.org",
        "theguardian.com", "nytimes.com", "washingtonpost.com",
    ],
}


def get_reliability_tier(url: str) -> str:
    if not url:
        return "low"
    domain = urlparse(url).netloc.lower()
    for tier, domains in RELIABILITY_TIERS.items():
        if any(d in domain for d in domains):
            return tier
    return "low"
