from typing import List, Literal
from pydantic import BaseModel, Field
from langgraph.types import Send

from src.state import ClaimState, OverallState
from src.llm import llm
from src.tools import web_search, get_reliability_tier

MAX_ATTEMPTS = 2  # per briefing doc: max 2 re-research attempts per claim


# =========================================================
# Agent 1 — Research (topic-level: breaks topic into claims)
# =========================================================

class ClaimsExtraction(BaseModel):
    claims: List[str] = Field(
        description="4-8 atomic, independently verifiable factual claims about the topic. "
                    "Each must be a single, specific, checkable statement — no compound claims."
    )


def research_topic(state: OverallState) -> dict:
    topic = state["topic"]
    results = web_search(topic, max_results=4)
    context = "\n\n".join(f"- {r['content'][:400]}" for r in results if r.get("content"))

    structured_llm = llm.with_structured_output(ClaimsExtraction)
    extraction = structured_llm.invoke(
        f"Topic: {topic}\n\nSearch context:\n{context}\n\n"
        "Break this topic into atomic, independently verifiable factual claims."
    )
    return {"initial_claims": extraction.claims}


def fan_out_to_claims(state: OverallState):
    """Conditional edge: dispatch one parallel branch per claim (map step)."""
    return [
        Send("process_claim", ClaimState(
            claim=c,
            sources=[],
            verification_status="unverifiable",
            severity="none",
            hallucination_flag=False,
            confidence_score=0,
            confidence_reasoning="",
            attempt_count=0,
            history=[],
        ))
        for c in state["initial_claims"]
    ]


# =========================================================
# Agent 2 — Verification (per-claim subgraph)
# =========================================================

class VerificationResult(BaseModel):
    verification_status: Literal["confirmed", "partially_confirmed", "contradicted", "unverifiable"]
    reasoning: str = Field(description="Brief explanation grounded only in the evidence provided.")


def verify_claim(state: ClaimState) -> dict:
    claim = state["claim"]
    results = web_search(f"verify claim: {claim}", max_results=3)
    sources = [
        {"url": r["url"], "reliability": get_reliability_tier(r["url"])}
        for r in results if r.get("url")
    ]
    evidence_text = "\n\n".join(
        f"Source: {r['url']}\n{r['content'][:500]}" for r in results if r.get("content")
    )

    structured_llm = llm.with_structured_output(VerificationResult)
    result = structured_llm.invoke(
        f"Claim: {claim}\n\nEvidence from independent sources:\n{evidence_text}\n\n"
        "Classify this claim as confirmed, partially_confirmed, contradicted, or unverifiable, "
        "based ONLY on the evidence above."
    )
    return {
        "sources": sources,
        "verification_status": result.verification_status,
        "confidence_reasoning": result.reasoning,
    }


# =========================================================
# Agent 3 — Contradiction & Hallucination Detector
# =========================================================

class ContradictionResult(BaseModel):
    severity: Literal["high", "medium", "low", "none"]
    hallucination_flag: bool = Field(
        description="True if the claim is not actually supported by the evidence."
    )
    reasoning: str


def detect_contradiction(state: ClaimState) -> dict:
    structured_llm = llm.with_structured_output(ContradictionResult)
    result = structured_llm.invoke(
        f"Claim: {state['claim']}\n"
        f"Verification status: {state['verification_status']}\n"
        f"Verifier's reasoning: {state.get('confidence_reasoning', '')}\n\n"
        "Check internal consistency and any mismatch between the claim and the evidence. "
        "Assign severity (high/medium/low/none) and flag possible hallucination."
    )
    return {
        "severity": result.severity,
        "hallucination_flag": result.hallucination_flag,
    }


def route_after_detect(state: ClaimState) -> str:
    """Decision point from the briefing doc: high severity + attempts left -> loop back."""
    if state["severity"] == "high" and state["attempt_count"] < MAX_ATTEMPTS:
        return "reresearch"
    return "finalize"


# =========================================================
# Feedback loop — re-research this specific claim (back to Agent 1, scoped)
# =========================================================

def reresearch_claim(state: ClaimState) -> dict:
    history_entry = {
        "attempt_count": state["attempt_count"],
        "verification_status": state["verification_status"],
        "severity": state["severity"],
        "notes": state.get("confidence_reasoning", ""),
    }
    # More targeted query since the first pass looked shaky
    results = web_search(f"fact check evidence: {state['claim']}", max_results=3)
    sources = [
        {"url": r["url"], "reliability": get_reliability_tier(r["url"])}
        for r in results if r.get("url")
    ]
    return {
        "sources": sources,
        "attempt_count": state["attempt_count"] + 1,
        "history": state.get("history", []) + [history_entry],
    }


# =========================================================
# Finalize a single claim — deterministic confidence score + one-line reasoning
# =========================================================

def finalize_claim(state: ClaimState) -> dict:
    tier_weight = {"high": 1.0, "medium": 0.7, "low": 0.4}
    status_base = {
        "confirmed": 90,
        "partially_confirmed": 65,
        "contradicted": 15,
        "unverifiable": 40,
    }
    score = status_base.get(state["verification_status"], 40)

    if state["sources"]:
        avg_reliability = sum(
            tier_weight.get(s["reliability"], 0.4) for s in state["sources"]
        ) / len(state["sources"])
        score = int(score * (0.7 + 0.3 * avg_reliability))

    if state["severity"] == "high":
        score = min(score, 35)
    elif state["severity"] == "medium":
        score = int(score * 0.85)

    unresolved_note = ""
    if state["severity"] == "high" and state["attempt_count"] >= MAX_ATTEMPTS:
        unresolved_note = f" Unresolved after {MAX_ATTEMPTS} verification attempts — confidence lowered."
        score = min(score, 30)

    n_sources = len(state["sources"])
    tiers_used = ", ".join(s["reliability"] for s in state["sources"]) or "no sources found"
    reasoning = (
        f"{state['verification_status'].replace('_', ' ').title()} by {n_sources} source(s) "
        f"({tiers_used}).{unresolved_note}"
    )

    return {
        "confidence_score": max(0, min(100, score)),
        "confidence_reasoning": reasoning,
    }


# =========================================================
# Agent 4 — Synthesis (final citation-backed markdown report)
# =========================================================

def synthesize_report(state: OverallState) -> dict:
    claims = state["resolved_claims"]
    avg_conf = int(sum(c["confidence_score"] for c in claims) / len(claims)) if claims else 0
    unresolved = [
        c for c in claims if c["severity"] == "high" and c["attempt_count"] >= MAX_ATTEMPTS
    ]

    lines = [f"# Fact-Check Report: {state['topic']}", "", "## Executive Summary", ""]
    lines.append(
        f"{len(claims)} claim(s) checked. Average confidence: {avg_conf}%. "
        f"{len(unresolved)} claim(s) remained unresolved after {MAX_ATTEMPTS} re-research attempts."
    )
    lines.append("")
    lines.append("## Per-Claim Confidence Matrix")
    lines.append("")
    lines.append("| Claim | Status | Severity | Confidence | Why |")
    lines.append("|---|---|---|---|---|")
    for c in claims:
        lines.append(
            f"| {c['claim']} | {c['verification_status']} | {c['severity']} | "
            f"{c['confidence_score']}% | {c['confidence_reasoning']} |"
        )

    lines.append("")
    lines.append("## Sources")
    lines.append("")
    for c in claims:
        lines.append(f"**{c['claim']}**")
        for s in c["sources"]:
            lines.append(f"- [{s['reliability']}] {s['url']}")
        if c["history"]:
            lines.append(f"- _Re-research history: {len(c['history'])} prior attempt(s) before this result._")
        lines.append("")

    return {"final_report": "\n".join(lines)}
