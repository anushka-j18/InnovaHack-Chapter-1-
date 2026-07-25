from langgraph.graph import StateGraph, START, END

from src.state import ClaimState, OverallState
from src.nodes import (
    research_topic,
    fan_out_to_claims,
    verify_claim,
    detect_contradiction,
    route_after_detect,
    reresearch_claim,
    finalize_claim,
    synthesize_report,
)

# =========================================================
# Per-claim subgraph — Agent 2 (verify) -> Agent 3 (detect) -> decision point
# -> Agent 1 loop-back (reresearch, max 2 attempts) -> finalize
# This is the self-correction loop described in the briefing doc.
# =========================================================

claim_builder = StateGraph(ClaimState)
claim_builder.add_node("verify", verify_claim)
claim_builder.add_node("detect", detect_contradiction)
claim_builder.add_node("reresearch", reresearch_claim)
claim_builder.add_node("finalize", finalize_claim)

claim_builder.add_edge(START, "verify")
claim_builder.add_edge("verify", "detect")
claim_builder.add_conditional_edges(
    "detect",
    route_after_detect,
    {"reresearch": "reresearch", "finalize": "finalize"},
)
claim_builder.add_edge("reresearch", "verify")  # <-- the feedback loop
claim_builder.add_edge("finalize", END)

claim_app = claim_builder.compile()


def process_claim(state: ClaimState) -> dict:
    """Runs one claim through the full verify -> detect -> (loop) -> finalize
    subgraph, then reports the resolved claim back into the main graph's
    resolved_claims list (reduce step)."""
    result = claim_app.invoke(state)
    return {"resolved_claims": [result]}


# =========================================================
# Main graph — Agent 1 (research/decompose) -> fan out one branch per claim
# -> Agent 4 (synthesize)
# =========================================================

main_builder = StateGraph(OverallState)
main_builder.add_node("research", research_topic)
main_builder.add_node("process_claim", process_claim)
main_builder.add_node("synthesize", synthesize_report)

main_builder.add_edge(START, "research")
main_builder.add_conditional_edges("research", fan_out_to_claims, ["process_claim"])
main_builder.add_edge("process_claim", "synthesize")
main_builder.add_edge("synthesize", END)

app = main_builder.compile()
